import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
    }
    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Truy cập bị từ chối. Chỉ dành cho Quản trị viên." }, { status: 403 });
    }

    // 1. Tổng số học sinh
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    });

    // 2. Số học sinh hoạt động (có ít nhất 1 attempt)
    const activeStudentsCount = await prisma.user.count({
      where: {
        role: "STUDENT",
        attempts: { some: {} },
      },
    });

    // 3. Tổng lượt làm bài đã hoàn thành
    const totalCompletedAttempts = await prisma.attempt.count({
      where: {
        status: { in: ["SUBMITTED", "EXPIRED"] },
      },
    });

    // 4. Điểm trung bình toàn hệ thống
    const scoreAgg = await prisma.attempt.aggregate({
      where: {
        status: { in: ["SUBMITTED", "EXPIRED"] },
      },
      _avg: { score: true },
    });
    const averageSystemScore = scoreAgg._avg.score
      ? Math.round(scoreAgg._avg.score * 100) / 100
      : 0;

    // 5. Tổng câu hỏi, chuyên đề, đề thi
    const [totalQuestions, totalTopics, totalExams] = await Promise.all([
      prisma.question.count(),
      prisma.topic.count(),
      prisma.exam.count(),
    ]);

    // 6. 5 học sinh mới đăng ký gần nhất
    const recentStudents = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: { attempts: true },
        },
      },
    });

    // 7. 5 lượt làm bài gần nhất toàn hệ thống
    const recentAttempts = await prisma.attempt.findMany({
      where: {
        status: { in: ["SUBMITTED", "EXPIRED"] },
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        exam: {
          select: { title: true },
        },
      },
    });

    // 8. Thống kê kết quả theo chuyên đề
    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
        questions: {
          select: {
            id: true,
            attemptAnswers: {
              where: {
                attempt: {
                  status: { in: ["SUBMITTED", "EXPIRED"] },
                },
              },
              select: { isCorrect: true },
            },
          },
        },
      },
    });

    const topicStats = topics.map((t) => {
      let totalAnswers = 0;
      let correctAnswers = 0;
      for (const q of t.questions) {
        totalAnswers += q.attemptAnswers.length;
        for (const ans of q.attemptAnswers) {
          if (ans.isCorrect) correctAnswers += 1;
        }
      }
      const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
      return {
        id: t.id,
        name: t.name,
        questionCount: t._count.questions,
        totalAnswers,
        correctAnswers,
        accuracy,
      };
    });

    return NextResponse.json({
      overview: {
        totalStudents,
        activeStudents: activeStudentsCount,
        totalCompletedAttempts,
        averageSystemScore,
        totalQuestions,
        totalTopics,
        totalExams,
      },
      recentStudents,
      recentAttempts: recentAttempts.map((a) => ({
        id: a.id,
        studentName: a.user.name,
        studentEmail: a.user.email,
        mode: a.mode,
        examTitle: a.exam?.title || "Luyện tập chuyên đề",
        score: a.score,
        correctCount: a.correctCount,
        totalQuestions: a.totalQuestions,
        submittedAt: a.submittedAt,
      })),
      topicStats,
    });
  } catch (error: any) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy dữ liệu tổng quan quản trị." }, { status: 500 });
  }
}
