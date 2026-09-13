import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { examQuestions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = exams.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      durationMinutes: e.durationMinutes,
      questionCount: e._count.examQuestions,
      createdAt: e.createdAt,
    }));

    return NextResponse.json({ exams: formatted });
  } catch (error: any) {
    console.error("Fetch exams error:", error);
    return NextResponse.json({ error: "Lỗi khi tải danh sách đề thi." }, { status: 500 });
  }
}
