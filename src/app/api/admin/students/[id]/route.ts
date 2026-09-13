import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Truy cập bị từ chối. Chỉ dành cho Quản trị viên." }, { status: 403 });
    }

    const { id: studentId } = params;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ error: "Không tìm thấy học sinh." }, { status: 404 });
    }

    // Lấy toàn bộ các attempt của học sinh
    const attempts = await prisma.attempt.findMany({
      where: { userId: studentId },
      orderBy: { startedAt: "desc" },
      include: {
        exam: {
          select: { title: true, durationMinutes: true },
        },
        answers: {
          include: {
            question: {
              select: {
                topicId: true,
                topic: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    const completedAttempts = attempts.filter(
      (a) => a.status === "SUBMITTED" || a.status === "EXPIRED"
    );

    const totalAttempts = completedAttempts.length;
    let avgScore = 0;
    let maxScore = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;

    if (totalAttempts > 0) {
      const sumScore = completedAttempts.reduce((s, a) => s + a.score, 0);
      avgScore = Math.round((sumScore / totalAttempts) * 100) / 100;
      maxScore = Math.max(...completedAttempts.map((a) => a.score));

      totalQuestions = completedAttempts.reduce((s, a) => s + a.totalQuestions, 0);
      totalCorrect = completedAttempts.reduce((s, a) => s + a.correctCount, 0);
    }

    const overallAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Tính thống kê theo chuyên đề cho học sinh này
    const topicMap: Record<
      string,
      { name: string; total: number; correct: number }
    > = {};

    for (const att of completedAttempts) {
      for (const ans of att.answers) {
        const topicId = ans.question.topic.id;
        const topicName = ans.question.topic.name;
        if (!topicMap[topicId]) {
          topicMap[topicId] = { name: topicName, total: 0, correct: 0 };
        }
        topicMap[topicId].total += 1;
        if (ans.isCorrect) {
          topicMap[topicId].correct += 1;
        }
      }
    }

    const topicStats = Object.keys(topicMap).map((topicId) => {
      const item = topicMap[topicId];
      const acc = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      return {
        topicId,
        topicName: item.name,
        total: item.total,
        correct: item.correct,
        accuracy: acc,
      };
    });

    // Xác định chuyên đề yếu nhất (có ít nhất 3 câu đã làm và độ chính xác thấp nhất)
    let weakestTopic: { name: string; accuracy: number } | null = null;
    if (topicStats.length > 0) {
      const sorted = [...topicStats].sort((a, b) => a.accuracy - b.accuracy);
      weakestTopic = {
        name: sorted[0].topicName,
        accuracy: sorted[0].accuracy,
      };
    }

    // Danh sách lịch sử bài làm cho Admin xem
    const history = attempts.map((att) => ({
      id: att.id,
      mode: att.mode,
      title: att.exam?.title || "Luyện tập chuyên đề",
      status: att.status,
      score: att.score,
      correctCount: att.correctCount,
      totalQuestions: att.totalQuestions,
      startedAt: att.startedAt,
      submittedAt: att.submittedAt,
      durationSeconds: att.durationSeconds,
    }));

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
      },
      stats: {
        totalAttempts,
        avgScore,
        maxScore,
        totalQuestions,
        totalCorrect,
        overallAccuracy,
        weakestTopic,
      },
      topicStats,
      history,
    });
  } catch (error: any) {
    console.error("Admin student detail error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy chi tiết học sinh." }, { status: 500 });
  }
}
