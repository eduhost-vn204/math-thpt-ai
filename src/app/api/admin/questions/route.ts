import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");
    const search = searchParams.get("search");

    const where: any = {};
    if (topicId) where.topicId = topicId;
    if (search) {
      where.content = { contains: search };
    }

    const questions = await prisma.question.findMany({
      where,
      include: { topic: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Admin fetch questions error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách câu hỏi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const body = await req.json();
    const {
      content,
      optionA,
      optionB,
      optionC,
      optionD,
      correctOption,
      explanation,
      difficulty,
      topicId,
    } = body;

    if (
      !content ||
      !optionA ||
      !optionB ||
      !optionC ||
      !optionD ||
      !correctOption ||
      !explanation ||
      !difficulty ||
      !topicId
    ) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tất cả các trường dữ liệu câu hỏi." },
        { status: 400 }
      );
    }

    if (!["A", "B", "C", "D"].includes(correctOption)) {
      return NextResponse.json(
        { error: "Đáp án đúng phải là một trong bốn lựa chọn A, B, C, D." },
        { status: 400 }
      );
    }

    const newQuestion = await prisma.question.create({
      data: {
        content: content.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctOption,
        explanation: explanation.trim(),
        difficulty,
        topicId,
      },
      include: { topic: true },
    });

    return NextResponse.json({ success: true, question: newQuestion }, { status: 201 });
  } catch (error: any) {
    console.error("Admin create question error:", error);
    return NextResponse.json({ error: "Lỗi khi tạo mới câu hỏi." }, { status: 500 });
  }
}
