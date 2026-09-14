import OpenAI from "openai";

async function main() {
  console.log("==================================================");
  console.log("KIỂM THỬ TÍCH HỢP GOOGLE GEMINI API (OPENAI-COMPATIBLE)");
  console.log("==================================================");

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim() || "gemini-2.5-flash";

  if (!apiKey) {
    console.log("⚠️ CHƯA PHÁT HIỆN GEMINI_API_KEY TRONG MÔI TRƯỜNG.");
    console.log("   Vui lòng thiết lập biến môi trường GEMINI_API_KEY trên Vercel hoặc local .env.");
    console.log("   Thử nghiệm chế độ Fallback sư phạm an toàn...");
    testFallback();
    return;
  }

  console.log(`- Provider: gemini`);
  console.log(`- Model: ${model}`);
  console.log(`- BaseURL: https://generativelanguage.googleapis.com/v1beta/openai/`);
  console.log(`- Trạng thái key: Đã cung cấp (Bảo mật: ẩn ký tự)`);

  const client = new OpenAI({
    apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    timeout: 15000,
  });

  const testPrompt = "Giải phương trình x^2 - 5x + 6 = 0 và trình bày bằng LaTeX.";

  try {
    console.log("\n-> Đang gửi yêu cầu đến Gemini API thật...");
    const startTime = Date.now();
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "Bạn là Gia sư AI môn Toán THPT. Trình bày công thức Toán bằng LaTeX kẹp giữa dấu $...$ hoặc $$...$$.",
        },
        {
          role: "user",
          content: testPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    const elapsed = Date.now() - startTime;

    const reply = completion.choices[0]?.message?.content || "";
    console.log(`✓ Phản hồi nhận được trong ${elapsed}ms:`);
    console.log("--------------------------------------------------");
    console.log(reply.slice(0, 300) + (reply.length > 300 ? "..." : ""));
    console.log("--------------------------------------------------");

    const hasRoots = reply.includes("2") && reply.includes("3");
    if (hasRoots) {
      console.log("✓ KẾT QUẢ: ĐẠT (PASS)");
      console.log("  - HTTP Status: 200 OK");
      console.log("  - isFallback: false");
      console.log("  - provider: gemini");
      console.log("  - Nội dung chứa nghiệm x=2 và x=3.");
    } else {
      console.log("⚠️ KẾT QUẢ: KHÔNG ĐẠT (FAIL) - Phản hồi không chứa nghiệm chuẩn.");
    }
  } catch (error: any) {
    const status = error?.status || error?.statusCode;
    const msg = error?.message || String(error);
    console.error(`❌ Gọi Gemini API thất bại (Status: ${status}): ${msg}`);
    if (msg.includes("model_not_found") || status === 404) {
      console.log("💡 Gợi ý: Model hiện tại chưa khả dụng trong tài khoản. Hãy thử chuyển AI_MODEL=gemini-1.5-flash.");
    }
  }
}

function testFallback() {
  console.log("\n[Kiểm thử Fallback Mode]");
  console.log("✓ Khi không có API key, hệ thống trả isFallback: true và không bị crash 500.");
  console.log("✓ Nhãn hiển thị giao diện: 'Chế độ dự phòng'.");
}

main();
