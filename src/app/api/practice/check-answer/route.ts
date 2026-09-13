import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
    }

    const { attemptId, questionId, selectedOption } = await req.json();

    if (!attemptId || !questionId || !selectedOption) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp attemptId, questionId và selectedOption." },
        { status: 400 }
      );
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Không tìm thấy phiên luyện tập." }, { status: 404 });
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: "Bạn không có quyền thao tác trên bài làm này." }, { status: 403 });
    }

    if (attempt.mode !== "PRACTICE") {
      return NextResponse.json(
        { error: "Chức năng kiểm tra đáp án ngay chỉ hỗ trợ trong chế độ Luyện tập (PRACTICE)." },
        { status: 400 }
      );
    }

    // Lấy câu hỏi từ database để lấy đáp án đúng và lời giải
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Không tìm thấy câu hỏi." }, { status: 404 });
    }

    const isCorrect = selectedOption === question.correctOption;

    // Lưu vào AttemptAnswer
    await prisma.attemptAnswer.update({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      data: {
        selectedOption,
        isCorrect,
      },
    });

    return NextResponse.json({
      success: true,
      isCorrect,
      correctOption: question.correctOption,
      explanation: question.explanation,
    });
  } catch (error: any) {
    console.error("Check answer error:", error);
    return NextResponse.json({ error: "Lỗi khi kiểm tra đáp án." }, { status: 500 });
  }
}
