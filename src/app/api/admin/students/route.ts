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

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10)));
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const performance = (searchParams.get("performance") || "all").trim();

    // 1. Tìm kiếm học sinh theo query (tên hoặc email)
    const baseWhere: any = {
      role: "STUDENT",
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    };

    // Lấy toàn bộ học sinh khớp query kèm các attempt đã hoàn thành để tính toán thống kê
    const studentsWithAttempts = await prisma.user.findMany({
      where: baseWhere,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        attempts: {
          where: {
            status: { in: ["SUBMITTED", "EXPIRED"] },
          },
          select: {
            id: true,
            score: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Tính toán thống kê từng học sinh
    const mappedStudents = studentsWithAttempts.map((s) => {
      const attemptsCount = s.attempts.length;
      let avgScore: number | null = null;
      let maxScore: number | null = null;
      let lastActive: Date | null = null;

      if (attemptsCount > 0) {
        const totalScore = s.attempts.reduce((sum, a) => sum + a.score, 0);
        avgScore = Math.round((totalScore / attemptsCount) * 100) / 100;
        maxScore = Math.max(...s.attempts.map((a) => a.score));
        lastActive = s.attempts[0]?.submittedAt || null;
      }

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        createdAt: s.createdAt,
        attemptsCount,
        avgScore,
        maxScore,
        lastActive,
      };
    });

    // 3. Lọc theo nhóm năng lực (performance)
    let filteredStudents = mappedStudents;
    if (performance === "none") {
      filteredStudents = mappedStudents.filter((s) => s.attemptsCount === 0);
    } else if (performance === "done") {
      filteredStudents = mappedStudents.filter((s) => s.attemptsCount > 0);
    } else if (performance === "under5") {
      filteredStudents = mappedStudents.filter(
        (s) => s.attemptsCount > 0 && s.avgScore !== null && s.avgScore < 5
      );
    } else if (performance === "5to8") {
      filteredStudents = mappedStudents.filter(
        (s) => s.attemptsCount > 0 && s.avgScore !== null && s.avgScore >= 5 && s.avgScore < 8
      );
    } else if (performance === "above8") {
      filteredStudents = mappedStudents.filter(
        (s) => s.attemptsCount > 0 && s.avgScore !== null && s.avgScore >= 8
      );
    }

    const totalCount = filteredStudents.length;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      students: paginatedStudents,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Admin students error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách học sinh." }, { status: 500 });
  }
}
