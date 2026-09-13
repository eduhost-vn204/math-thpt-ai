import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: { topic: true },
    });

    if (!question) {
      return NextResponse.json({ error: "Không tìm thấy câu hỏi." }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error: any) {
    console.error("Get question by id error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy thông tin câu hỏi." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updated = await prisma.question.update({
      where: { id: params.id },
      data: {
        content: content?.trim(),
        optionA: optionA?.trim(),
        optionB: optionB?.trim(),
        optionC: optionC?.trim(),
        optionD: optionD?.trim(),
        correctOption,
        explanation: explanation?.trim(),
        difficulty,
        topicId,
      },
      include: { topic: true },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: any) {
    console.error("Update question error:", error);
    return NextResponse.json({ error: "Lỗi khi cập nhật câu hỏi." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yêu cầu quyền Quản trị viên." }, { status: 403 });
    }

    await prisma.question.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa câu hỏi thành công." });
  } catch (error: any) {
    console.error("Delete question error:", error);
    return NextResponse.json({ error: "Lỗi khi xóa câu hỏi." }, { status: 500 });
  }
}
