import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { gradeAndFinalizeAttempt } from "@/lib/grading";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để nộp bài." }, { status: 401 });
    }

    const { attemptId } = params;

    const attempt = await prisma.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Không tìm thấy bài làm." }, { status: 404 });
    }

    if (attempt.userId !== user.id) {
      return NextResponse.json({ error: "Bạn không có quyền nộp bài làm này." }, { status: 403 });
    }

    // Đọc body (nếu có cờ isExpired từ client)
    let isExpiredFlag = false;
    try {
      const body = await req.json();
      if (body?.isExpired) isExpiredFlag = true;
    } catch {
      // Body rỗng thì bỏ qua
    }

    // Chấm điểm và kết thúc bài làm qua grading service dùng chung
    const result = await gradeAndFinalizeAttempt(attemptId, isExpiredFlag);

    return NextResponse.json({
      success: true,
      status: result.status,
      score: result.score,
      correctCount: result.correctCount,
      totalQuestions: result.totalQuestions,
      durationSeconds: result.durationSeconds,
      alreadySubmitted: result.alreadySubmitted || false,
    });
  } catch (error: any) {
    console.error("Submit attempt error:", error);
    return NextResponse.json({ error: "Lỗi khi chấm điểm bài làm." }, { status: 500 });
  }
}
