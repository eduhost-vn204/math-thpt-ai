import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { gradeAndFinalizeAttempt } from "@/lib/grading";

export async function POST(
  req: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để thi thử." }, { status: 401 });
    }

    const { examId } = params;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examQuestions: {
          orderBy: { position: "asc" },
          include: { question: true },
        },
      },
    });

    if (!exam || !exam.isPublished) {
      return NextResponse.json({ error: "Đề thi không tồn tại hoặc chưa được công bố." }, { status: 404 });
    }

    // Kiểm tra xem học sinh có attempt đang làm dở (IN_PROGRESS) cho đề này không
    const existingAttempt = await prisma.attempt.findFirst({
      where: {
        userId: user.id,
        examId: exam.id,
        status: "IN_PROGRESS",
      },
      include: {
        answers: true,
      },
    });

    if (existingAttempt) {
      // Kiểm tra xem đã hết giờ chưa
      const elapsedSeconds = Math.floor((Date.now() - new Date(existingAttempt.startedAt).getTime()) / 1000);
      const totalAllowedSeconds = exam.durationMinutes * 60;

      if (elapsedSeconds < totalAllowedSeconds) {
        return NextResponse.json({
          success: true,
          attemptId: existingAttempt.id,
          isResumed: true,
          durationMinutes: exam.durationMinutes,
        });
      }
      // Nếu đã quá giờ, tự động chấm điểm và chuyển trạng thái EXPIRED cho attempt cũ
      await gradeAndFinalizeAttempt(existingAttempt.id, true);
    }

    // Tạo Attempt mới
    const newAttempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        examId: exam.id,
        mode: "EXAM",
        totalQuestions: exam.examQuestions.length,
        status: "IN_PROGRESS",
      },
    });

    for (const eq of exam.examQuestions) {
      await prisma.attemptAnswer.create({
        data: {
          attemptId: newAttempt.id,
          questionId: eq.questionId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      attemptId: newAttempt.id,
      isResumed: false,
      durationMinutes: exam.durationMinutes,
    });
  } catch (error: any) {
    console.error("Start exam error:", error);
    return NextResponse.json({ error: "Lỗi khi bắt đầu đề thi." }, { status: 500 });
  }
}
