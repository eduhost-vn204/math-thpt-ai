"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MathRenderer from "@/components/MathRenderer";
import {
  Clock,
  Send,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

export default function ExamTakingPage() {
  const { examId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [examTitle, setExamTitle] = useState("");
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo hoặc lấy attempt của đề thi
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const initExam = async () => {
      try {
        // Gọi start API để lấy attemptId
        const startRes = await fetch(`/api/exams/${examId}/start`, { method: "POST" });
        if (!startRes.ok) {
          router.push("/exams");
          return;
        }
        const startData = await startRes.json();
        const currentAttemptId = startData.attemptId;
        setAttemptId(currentAttemptId);

        // Lấy thông tin chi tiết bài làm
        const attRes = await fetch(`/api/attempts/${currentAttemptId}`);
        if (!attRes.ok) {
          router.push("/exams");
          return;
        }
        const attData = await attRes.json();

        if (attData.attempt.status === "SUBMITTED" || attData.attempt.status === "EXPIRED") {
          router.push(`/attempts/${currentAttemptId}/result`);
          return;
        }

        setExamTitle(attData.attempt.examTitle || "Đề thi thử THPT Quốc gia");
        setAnswers(attData.answers);
        setTimeLeft(attData.attempt.remainingSeconds || 30 * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && examId) {
      initExam();
    }
  }, [user, authLoading, examId]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (loading || !attemptId) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, attemptId]);

  const handleAutoSubmit = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isExpired: true }),
      });
      router.push(`/attempts/${attemptId}/result?expired=true`);
    } catch (err) {
      console.error(err);
      router.push(`/attempts/${attemptId}/result`);
    }
  };

  const handleSelectOption = async (option: string) => {
    if (!attemptId) return;
    const currentAnswer = answers[currentIndex];
    const previousOption = currentAnswer.selectedOption;

    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = {
      ...currentAnswer,
      selectedOption: option,
    };
    setAnswers(updatedAnswers);

    try {
      await fetch(`/api/attempts/${attemptId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentAnswer.questionId,
          selectedOption: option,
        }),
      });
    } catch (err) {
      console.error(err);
      const reverted = [...answers];
      reverted[currentIndex].selectedOption = previousOption;
      setAnswers(reverted);
    }
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, { method: "POST" });
      if (res.ok) {
        router.push(`/attempts/${attemptId}/result`);
      } else {
        alert("Lỗi khi nộp bài. Vui lòng thử lại.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const currentAnswer = answers[currentIndex];
  const question = currentAnswer?.question;
  const answeredCount = answers.filter((a) => a.selectedOption).length;
  const isTimeUrgent = timeLeft < 300; // Còn dưới 5 phút

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
      {/* Sticky Exam Top Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur border border-slate-200 shadow-md rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
              {examTitle}
            </h1>
            <p className="text-[11px] text-slate-500">
              Tiến độ: <strong className="text-blue-600">{answeredCount}/{answers.length}</strong> câu
            </p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm sm:text-base border ${
              isTimeUrgent
                ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                : "bg-slate-100 text-slate-800 border-slate-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Nộp bài thi</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Main Question Board */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <span className="font-extrabold text-blue-600 text-sm tracking-wide">
                CÂU {currentIndex + 1} / {answers.length}
              </span>
              <span className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold">
                Chuyên đề: {question?.topicName}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-slate-900 mb-8 leading-relaxed">
              <MathRenderer content={question?.content} />
            </div>

            {/* 4 Choices */}
            <div className="space-y-3 mb-8 flex-1">
              {[
                { key: "A", text: question?.optionA },
                { key: "B", text: question?.optionB },
                { key: "C", text: question?.optionC },
                { key: "D", text: question?.optionD },
              ].map((opt) => {
                const isSelected = currentAnswer?.selectedOption === opt.key;
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 group ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                      }`}
                    >
                      {opt.key}
                    </div>
                    <div className="text-sm sm:text-base text-slate-800 pt-1 flex-1">
                      <MathRenderer content={opt.text} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Câu trước</span>
              </button>

              <span className="text-xs text-slate-400 font-medium">
                {currentAnswer?.selectedOption ? "✓ Đã ghi nhận" : "Chưa chọn đáp án"}
              </span>

              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(answers.length - 1, prev + 1))}
                disabled={currentIndex === answers.length - 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Câu tiếp theo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: 20 Question Grid Palette */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm sticky top-36">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
              Bảng câu hỏi đề thi ({answers.length} câu)
            </h3>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {answers.map((ans, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!ans.selectedOption;
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                      isCurrent
                        ? "ring-2 ring-blue-600 ring-offset-2 bg-blue-600 text-white"
                        : isAnswered
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-blue-600" />
                <span>Câu đang làm ({currentIndex + 1})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-300" />
                <span>Đã làm ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-100" />
                <span>Chưa làm ({answers.length - answeredCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">
              Xác nhận nộp bài thi?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Bạn đã trả lời <strong className="text-blue-600 font-bold">{answeredCount}/{answers.length}</strong> câu hỏi. Thời gian còn lại là <strong className="text-slate-800 font-bold">{formatTime(timeLeft)}</strong>. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Làm bài tiếp
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                {submitting ? "Đang chấm điểm..." : "Nộp bài ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
