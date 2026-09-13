import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
    }

    const { attemptId } = params;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: true,
        answers: {
          include: {
            question: {
              include: { topic: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Không tìm thấy bài làm." }, { status: 404 });
    }

    // Bảo mật: Chỉ chủ sở hữu bài làm hoặc ADMIN mới có quyền truy cập
    if (attempt.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Bạn không có quyền xem bài làm này." }, { status: 403 });
    }

    const isSubmitted = attempt.status === "SUBMITTED" || attempt.status === "EXPIRED";

    // Tính thời gian còn lại nếu là bài thi đang làm
    let remainingSeconds = 0;
    if (attempt.mode === "EXAM" && attempt.exam && !isSubmitted) {
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
      );
      const totalAllowedSeconds = attempt.exam.durationMinutes * 60;
      remainingSeconds = Math.max(0, totalAllowedSeconds - elapsedSeconds);
    }

    // RÀNG BUỘC BẢO MẬT: Chưa nộp thì TUYỆT ĐỐI KHÔNG trả về correctOption và explanation
    const formattedAnswers = attempt.answers.map((ans) => {
      const baseQuestion = {
        id: ans.question.id,
        content: ans.question.content,
        optionA: ans.question.optionA,
        optionB: ans.question.optionB,
        optionC: ans.question.optionC,
        optionD: ans.question.optionD,
        difficulty: ans.question.difficulty,
        topicName: ans.question.topic.name,
      };

      if (!isSubmitted) {
        return {
          id: ans.id,
          questionId: ans.questionId,
          selectedOption: ans.selectedOption,
          question: baseQuestion,
        };
      }

      // Đã nộp bài: trả về đầy đủ đáp án đúng và lời giải
      return {
        id: ans.id,
        questionId: ans.questionId,
        selectedOption: ans.selectedOption,
        isCorrect: ans.isCorrect,
        question: {
          ...baseQuestion,
          correctOption: ans.question.correctOption,
          explanation: ans.question.explanation,
        },
      };
    });

    return NextResponse.json({
      attempt: {
        id: attempt.id,
        mode: attempt.mode,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        durationSeconds: attempt.durationSeconds,
        totalQuestions: attempt.totalQuestions,
        correctCount: attempt.correctCount,
        score: attempt.score,
        examTitle: attempt.exam?.title || null,
        durationMinutes: attempt.exam?.durationMinutes || 0,
        remainingSeconds,
      },
      answers: formattedAnswers,
    });
  } catch (error: any) {
    console.error("Get attempt error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy thông tin bài làm." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
    }

    const { attemptId } = params;
    const { questionId, selectedOption } = await req.json();

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { exam: true },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Bài làm không tồn tại." }, { status: 404 });
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: "Bạn không có quyền sửa bài làm này." }, { status: 403 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Bài làm này đã kết thúc, không thể thay đổi." }, { status: 400 });
    }

    // Kiểm tra hết giờ đối với bài thi EXAM
    if (attempt.mode === "EXAM" && attempt.exam) {
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(attempt.startedAt).getTime()) / 1000
      );
      const totalAllowedSeconds = attempt.exam.durationMinutes * 60;
      if (elapsedSeconds > totalAllowedSeconds) {
        return NextResponse.json({ error: "Đã hết thời gian làm bài thi." }, { status: 400 });
      }
    }

    // Cập nhật câu trả lời đã chọn
    await prisma.attemptAnswer.update({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId,
        },
      },
      data: {
        selectedOption: selectedOption || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update answer error:", error);
    return NextResponse.json({ error: "Lỗi khi lưu đáp án." }, { status: 500 });
  }
}
