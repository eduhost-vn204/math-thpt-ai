import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

// In-memory rate limiting: lưu thời điểm request cuối của mỗi user
const userLastRequestMap = new Map<string, number>();

const SYSTEM_PROMPT = `Bạn là một Gia sư AI thông minh chuyên bồi dưỡng và ôn thi THPT Quốc gia môn Toán cho học sinh lớp 12 tại Việt Nam.
Nhiệm vụ và phong cách sư phạm của bạn:
1. Đóng vai gia sư môn Toán THPT tận tâm, khuyến khích học sinh tư duy tích cực.
2. Ưu tiên gợi ý phương pháp, định hướng từng bước giải trước khi đưa ra đáp án cuối cùng.
3. Luôn giải thích rõ bản chất toán học, công thức áp dụng và phân tích các bẫy/lỗi sai học sinh hay mắc phải.
4. Trình bày công thức toán học chuẩn xác bằng cú pháp LaTeX kẹp giữa cặp dấu $...$ (cho inline) hoặc $$...$$ (cho block riêng).
5. Tuyệt đối không bịa đặt dữ kiện đề bài.
6. Nếu câu hỏi nằm ngoài phạm vi Toán THPT, hãy từ chối khéo léo và giải thích ngắn gọn rằng hệ thống chỉ chuyên sâu hỗ trợ kiến thức Toán THPT.
7. Cuối câu trả lời, hãy nhắc học sinh kiểm tra lại các bước biến đổi đối với các bài toán có nhiều điều kiện ràng buộc.`;

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để trao đổi với Gia sư AI." },
        { status: 401 }
      );
    }

    // Kiểm tra tần suất request (tối thiểu cách nhau 1.5 giây để tránh lạm dụng chi phí)
    const now = Date.now();
    const lastRequest = userLastRequestMap.get(user.id) || 0;
    if (now - lastRequest < 1500) {
      return NextResponse.json(
        { error: "Bạn gửi câu hỏi hơi nhanh. Vui lòng đợi 2 giây trước khi gửi tiếp nhé!" },
        { status: 429 }
      );
    }
    userLastRequestMap.set(user.id, now);

    const body = await req.json();
    const { message, questionId } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Nội dung câu hỏi không được để trống." },
        { status: 400 }
      );
    }

    // Giới hạn độ dài message tối đa 1000 ký tự theo yêu cầu P0-03
    if (message.trim().length > 1000) {
      return NextResponse.json(
        { error: "Câu hỏi quá dài (tối đa 1000 ký tự). Vui lòng tóm tắt ngắn gọn trọng tâm nhé!" },
        { status: 400 }
      );
    }

    // 1. Lưu câu hỏi của học sinh vào DB
    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: "USER",
        content: message.trim(),
        questionId: questionId || null,
      },
    });

    // 2. Lấy thông tin ngữ cảnh câu hỏi nếu có (chỉ lấy dữ liệu toán học, không lấy dữ liệu PII)
    let questionContext = "";
    let targetQuestion = null;
    if (questionId) {
      targetQuestion = await prisma.question.findUnique({
        where: { id: questionId },
        include: { topic: true },
      });
      if (targetQuestion) {
        questionContext = `\n[NGỮ CẢNH BÀI TOÁN HIỆN TẠI]:
- Chuyên đề: ${targetQuestion.topic.name}
- Nội dung câu hỏi: ${targetQuestion.content}
- Lựa chọn A: ${targetQuestion.optionA}
- Lựa chọn B: ${targetQuestion.optionB}
- Lựa chọn C: ${targetQuestion.optionC}
- Lựa chọn D: ${targetQuestion.optionD}
- Đáp án chuẩn: ${targetQuestion.correctOption}
- Lời giải chi tiết: ${targetQuestion.explanation}
`;
      }
    }

    const provider = (process.env.AI_PROVIDER?.trim().toLowerCase() || "gemini") as "gemini" | "openai";
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const openaiKey = process.env.OPENAI_API_KEY?.trim();

    const isGemini = provider === "gemini";
    const apiKey = isGemini ? geminiKey : openaiKey;
    const defaultModel = isGemini ? "gemini-2.5-flash" : "gpt-4o-mini";
    const model = process.env.AI_MODEL?.trim() || (isGemini ? defaultModel : (process.env.OPENAI_MODEL?.trim() || defaultModel));

    // CHẾ ĐỘ 1: GỌI API AI THẬT (Gemini hoặc OpenAI theo AI_PROVIDER)
    if (apiKey) {
      try {
        const client = new OpenAI({
          apiKey,
          ...(isGemini
            ? { baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" }
            : {}),
          timeout: 15000, // Timeout an toàn 15 giây theo yêu cầu
        });

        const completion = await client.chat.completions.create({
          model,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT + (questionContext ? `\n\n${questionContext}` : ""),
            },
            {
              role: "user",
              content: message.trim(),
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        });

        const assistantReply =
          completion.choices[0]?.message?.content ||
          "Gia sư AI đã ghi nhận câu hỏi. Em hãy thử xem lại lý thuyết trọng tâm nhé!";

        // Lưu câu trả lời của AI thật vào DB
        await prisma.chatMessage.create({
          data: {
            userId: user.id,
            role: "ASSISTANT",
            content: assistantReply,
            questionId: questionId || null,
          },
        });

        return NextResponse.json({
          reply: assistantReply,
          isFallback: false,
          provider,
          model,
        });
      } catch (apiError: any) {
        // Xử lý các mã lỗi mà tuyệt đối không log API key hoặc credentials
        const statusCode = apiError?.status || apiError?.statusCode;
        console.warn(`[${provider.toUpperCase()} Call Handled] Mã lỗi: ${statusCode || "Network/Timeout"}. Chuyển sang Chế độ dự phòng an toàn.`);
      }
    }

    // CHẾ ĐỘ 2: DEMO FALLBACK MODE SƯ PHẠM (Khi chưa có API key hoặc API lỗi / hết quota)
    let fallbackReply = "";

    if (targetQuestion) {
      fallbackReply = `Chào em! Thầy AI đã tiếp nhận câu hỏi của em về bài toán này.\n\n` +
        `💡 **Phương pháp tiếp cận & Phân tích sư phạm:**\n` +
        `- Đây là dạng bài thuộc chuyên đề **${targetQuestion.topic.name}**.\n` +
        `- Để làm tốt câu hỏi này, em cần nắm vững kiến thức trọng tâm:\n` +
        `  * Đọc kỹ dữ kiện đề bài: ${targetQuestion.content}\n` +
        `  * Quan sát các phương án loại trừ trước khi tính toán chi tiết.\n\n` +
        `📌 **Hướng dẫn giải từng bước:**\n` +
        `${targetQuestion.explanation}\n\n` +
        `✅ **Kết luận:** Phương án đúng là **${targetQuestion.correctOption}**.\n\n` +
        `⚠️ **Lưu ý tránh bẫy:** Học sinh thường mắc lỗi nhầm dấu hoặc quên đặt điều kiện xác định. Em hãy kiểm tra lại từng bước tính toán nhé!`;
    } else {
      // Câu hỏi tự do không gắn với câu hỏi cụ thể
      const lower = message.toLowerCase();
      if (lower.includes("tiệm cận") || lower.includes("tiem can")) {
        fallbackReply = `Chào em! Về **Đường tiệm cận của đồ thị hàm số**:\n\n` +
          `1. **Tiệm cận đứng:** Là đường thẳng $x = x_0$ nếu ít nhất một trong các giới hạn một bên $\\lim_{x \\to x_0^\\pm} y = \\pm\\infty$.\n` +
          `2. **Tiệm cận ngang:** Là đường thẳng $y = y_0$ nếu $\\lim_{x \\to +\\infty} y = y_0$ hoặc $\\lim_{x \\to -\\infty} y = y_0$.\n` +
          `*Mẹo nhanh:* Với hàm phân thức bậc nhất trên bậc nhất $y = \\frac{ax + b}{cx + d}$ ($c \\neq 0$), tiệm cận đứng là $x = -\\frac{d}{c}$, tiệm cận ngang là $y = \\frac{a}{c}$.`;
      } else if (lower.includes("cực trị") || lower.includes("cuc tri") || lower.includes("đạo hàm")) {
        fallbackReply = `Chào em! Về **Cực trị hàm số**:\n\n` +
          `- Điểm cực trị là điểm mà tại đó đạo hàm $y'$ bằng 0 (hoặc không xác định) và **đổi dấu** khi đi qua điểm đó.\n` +
          `- Đổi dấu từ $(+)$ sang $(-)$: Điểm cực đại.\n` +
          `- Đổi dấu từ $(-)$ sang $(+)$: Điểm cực tiểu.\n` +
          `*Quy tắc 2:* Nếu $y'(x_0) = 0$ và $y''(x_0) > 0 \\implies x_0$ là cực tiểu; nếu $y''(x_0) < 0 \\implies x_0$ là cực đại.`;
      } else if (lower.includes("tích phân") || lower.includes("nguyên hàm")) {
        fallbackReply = `Chào em! Về **Nguyên hàm & Tích phân**:\n\n` +
          `1. **Công thức cơ bản:** $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ ($n \\neq -1$); $\\int e^x dx = e^x + C$.\n` +
          `2. **Tích phân từng phần:** $\\int u dv = uv - \\int v du$. Thường ưu tiên đặt $u$ theo thứ tự: *Nhất lô, nhì đa, tam lượng, tứ mũ*.\n` +
          `3. Luôn kiểm tra đổi cận khi sử dụng phương pháp đổi biến số $t = u(x)$.`;
      } else if (lower.includes("xác suất") || lower.includes("tổ hợp")) {
        fallbackReply = `Chào em! Về **Đại số tổ hợp và Xác suất**:\n\n` +
          `- Dùng **Tổ hợp** $C_n^k$: Khi chọn $k$ phần tử từ $n$ phần tử mà **không quan tâm thứ tự**.\n` +
          `- Dùng **Chỉnh hợp** $A_n^k$: Khi chọn $k$ phần tử và **có sắp xếp thứ tự**.\n` +
          `- Xác suất cổ điển: $P(A) = \\frac{n(A)}{n(\\Omega)}$. Với các bài toán 'có ít nhất một', hãy ưu tiên xét biến cố đối $\\bar{A}$.`;
      } else {
        fallbackReply = `Chào em! Thầy AI chuyên trách Toán THPT đã ghi nhận câu hỏi của em: *"${message.trim()}"*.\n\n` +
          `💡 **Định hướng ôn tập:** Trong kỳ thi THPT Quốc gia, em cần chú trọng 5 chuyên đề trọng tâm: Hàm số, Mũ - Logarit, Tích phân, Hình học Oxyz và Xác suất.\n` +
          `Em có thể bấm làm một đề thi thử hoặc chọn luyện tập theo chuyên đề, sau đó bấm nút **"Hỏi AI về câu này"** tại các câu em còn băn khoăn để Thầy hướng dẫn chi tiết từng bước nhé!`;
      }
    }

    // Lưu vào DB
    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        role: "ASSISTANT",
        content: fallbackReply,
        questionId: questionId || null,
      },
    });

    return NextResponse.json({
      reply: fallbackReply,
      isFallback: true,
      provider,
      model: "fallback",
      notice: "Phản hồi được tạo từ hệ thống Lời giải chuẩn (Chế độ dự phòng sư phạm).",
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Lỗi trong quá trình xử lý câu hỏi với AI." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    const messages = await prisma.chatMessage.findMany({
      where: {
        userId: user.id,
        ...(questionId ? { questionId } : {}),
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Fetch chat history error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy lịch sử chat." }, { status: 500 });
  }
}
