import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
      },
      include: {
        exam: true,
      },
      orderBy: { startedAt: "desc" },
    });

    const formatted = attempts.map((att) => ({
      id: att.id,
      mode: att.mode,
      status: att.status,
      title: att.exam?.title || "Luyện tập theo chuyên đề",
      startedAt: att.startedAt,
      submittedAt: att.submittedAt,
      durationSeconds: att.durationSeconds,
      score: att.score,
      correctCount: att.correctCount,
      totalQuestions: att.totalQuestions,
    }));

    return NextResponse.json({ attempts: formatted });
  } catch (error: any) {
    console.error("Fetch history error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy lịch sử làm bài." }, { status: 500 });
  }
}
