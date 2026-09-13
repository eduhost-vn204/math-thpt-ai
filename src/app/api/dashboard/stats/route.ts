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

    // Lấy tất cả các attempt đã hoàn thành của user
    const completedAttempts = await prisma.attempt.findMany({
      where: {
        userId: user.id,
        status: { in: ["SUBMITTED", "EXPIRED"] },
      },
      include: {
        exam: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    const totalAttempts = completedAttempts.length;

    let totalScore = 0;
    let maxScore = 0;
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;

    for (const att of completedAttempts) {
      totalScore += att.score;
      if (att.score > maxScore) maxScore = att.score;
      totalQuestionsAnswered += att.totalQuestions;
      totalCorrectAnswers += att.correctCount;
    }

    const averageScore =
      totalAttempts > 0 ? Math.round((totalScore / totalAttempts) * 100) / 100 : 0;

    // 5 lượt làm bài gần nhất
    const recentAttempts = completedAttempts.slice(0, 5).map((att) => ({
      id: att.id,
      mode: att.mode,
      examTitle: att.exam?.title || "Luyện tập theo chuyên đề",
      submittedAt: att.submittedAt,
      durationSeconds: att.durationSeconds,
      score: att.score,
      correctCount: att.correctCount,
      totalQuestions: att.totalQuestions,
    }));

    // Thống kê theo chuyên đề
    // Lấy toàn bộ AttemptAnswer đã hoàn thành của user kèm thông tin question & topic
    const answers = await prisma.attemptAnswer.findMany({
      where: {
        attempt: {
          userId: user.id,
          status: { in: ["SUBMITTED", "EXPIRED"] },
        },
      },
      include: {
        question: {
          include: { topic: true },
        },
      },
    });

    // Lấy danh sách tất cả chuyên đề
    const allTopics = await prisma.topic.findMany();

    const topicStatsMap: Record<
      string,
      { name: string; total: number; correct: number; accuracy: number }
    > = {};

    for (const t of allTopics) {
      topicStatsMap[t.id] = {
        name: t.name,
        total: 0,
        correct: 0,
        accuracy: 0,
      };
    }

    for (const ans of answers) {
      const topicId = ans.question.topicId;
      if (topicStatsMap[topicId]) {
        topicStatsMap[topicId].total++;
        if (ans.isCorrect) {
          topicStatsMap[topicId].correct++;
        }
      }
    }

    const topicStats = Object.values(topicStatsMap).map((t) => {
      const accuracy = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
      return {
        ...t,
        accuracy,
      };
    });

    // Xác định chuyên đề cần cải thiện: tỷ lệ đúng thấp nhất trong các chuyên đề ĐÃ CÓ ít nhất 1 câu trả lời
    const attemptedTopics = topicStats.filter((t) => t.total > 0);
    let weakestTopic = null;

    if (attemptedTopics.length > 0) {
      weakestTopic = attemptedTopics.reduce((prev, curr) =>
        curr.accuracy < prev.accuracy ? curr : prev
      );
    }

    return NextResponse.json({
      totalAttempts,
      averageScore,
      maxScore,
      totalQuestionsAnswered,
      totalCorrectAnswers,
      recentAttempts,
      topicStats,
      weakestTopic,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy dữ liệu thống kê." }, { status: 500 });
  }
}
