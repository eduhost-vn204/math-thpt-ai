import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      include: {
        _count: {
          select: { questions: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = topics.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      questionCount: t._count.questions,
    }));

    return NextResponse.json({ topics: formatted });
  } catch (error: any) {
    console.error("Fetch topics error:", error);
    return NextResponse.json({ error: "Lỗi khi tải chuyên đề." }, { status: 500 });
  }
}
