import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để bắt đầu luyện tập." }, { status: 401 });
    }

    const { topicId, count = 5 } = await req.json();

    if (!topicId) {
      return NextResponse.json({ error: "Vui lòng chọn một chuyên đề để luyện tập." }, { status: 400 });
    }

    // Lấy danh sách câu hỏi thuộc chuyên đề
    const questions = await prisma.question.findMany({
      where: { topicId },
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: "Chuyên đề này hiện chưa có câu hỏi." }, { status: 400 });
    }

    // Xáo trộn ngẫu nhiên và lấy số lượng câu yêu cầu (tối đa bằng số câu hiện có)
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    // Tạo Attempt luyện tập
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        mode: "PRACTICE",
        totalQuestions: selectedQuestions.length,
        status: "IN_PROGRESS",
      },
    });

    // Tạo các bản ghi câu trả lời
    for (const q of selectedQuestions) {
      await prisma.attemptAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: q.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      totalQuestions: selectedQuestions.length,
    });
  } catch (error: any) {
    console.error("Start practice error:", error);
    return NextResponse.json({ error: "Lỗi khi khởi tạo phiên luyện tập." }, { status: 500 });
  }
}
