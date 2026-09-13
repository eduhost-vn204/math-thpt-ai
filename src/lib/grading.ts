import prisma from "./prisma";

export interface GradingResult {
  attemptId: string;
  status: "SUBMITTED" | "EXPIRED";
  score: number;
  correctCount: number;
  totalQuestions: number;
  durationSeconds: number;
  submittedAt: Date;
  alreadySubmitted?: boolean;
}

/**
 * Hàm dùng chung chấm điểm và kết thúc lượt làm bài (cả submit thủ công và tự nộp khi hết giờ)
 */
export async function gradeAndFinalizeAttempt(
  attemptId: string,
  forceExpired: boolean = false
): Promise<GradingResult> {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: true,
      answers: {
        include: { question: true },
      },
    },
  });

  if (!attempt) {
    throw new Error("Không tìm thấy bài làm.");
  }

  // Idempotent: Nếu đã kết thúc trước đó, trả về ngay kết quả đã lưu
  if (attempt.status === "SUBMITTED" || attempt.status === "EXPIRED") {
    return {
      attemptId: attempt.id,
      status: attempt.status as "SUBMITTED" | "EXPIRED",
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      durationSeconds: attempt.durationSeconds,
      submittedAt: attempt.submittedAt || new Date(),
      alreadySubmitted: true,
    };
  }

  const now = new Date();
  const elapsedSeconds = Math.max(
    1,
    Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
  );

  let finalStatus: "SUBMITTED" | "EXPIRED" = "SUBMITTED";
  let finalDuration = elapsedSeconds;

  // Kiểm tra thời lượng đối với bài thi EXAM
  if (attempt.mode === "EXAM" && attempt.exam) {
    const allowedSeconds = attempt.exam.durationMinutes * 60;
    // Nếu bị ép hết giờ (forceExpired) hoặc thời gian thực tế đã vượt quá thời lượng cho phép
    if (forceExpired || elapsedSeconds >= allowedSeconds) {
      finalStatus = "EXPIRED";
      finalDuration = allowedSeconds; // Giới hạn thời gian làm tối đa bằng thời lượng đề
    }
  } else if (forceExpired) {
    finalStatus = "EXPIRED";
  }

  // Chấm điểm từng câu hỏi
  let correctCount = 0;
  for (const ans of attempt.answers) {
    const isCorrect =
      ans.selectedOption !== null &&
      ans.selectedOption !== undefined &&
      ans.selectedOption === ans.question.correctOption;

    if (isCorrect) {
      correctCount++;
    }

    await prisma.attemptAnswer.update({
      where: { id: ans.id },
      data: { isCorrect },
    });
  }

  const totalQuestions = attempt.answers.length;
  const rawScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;
  const score = Math.round(rawScore * 100) / 100;

  const updatedAttempt = await prisma.attempt.update({
    where: { id: attempt.id },
    data: {
      status: finalStatus,
      submittedAt: now,
      durationSeconds: finalDuration,
      correctCount,
      totalQuestions,
      score,
    },
  });

  return {
    attemptId: updatedAttempt.id,
    status: updatedAttempt.status as "SUBMITTED" | "EXPIRED",
    score: updatedAttempt.score,
    correctCount: updatedAttempt.correctCount,
    totalQuestions: updatedAttempt.totalQuestions,
    durationSeconds: updatedAttempt.durationSeconds,
    submittedAt: updatedAttempt.submittedAt || now,
    alreadySubmitted: false,
  };
}
