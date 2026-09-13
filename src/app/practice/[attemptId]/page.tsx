"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MathRenderer from "@/components/MathRenderer";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Sparkles,
  Bot,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export default function PracticeSessionPage() {
  const { attemptId } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Lưu trạng thái đã kiểm tra đúng/sai cho từng câu trong phiên luyện tập:
  // key: questionId -> { isCorrect: boolean, correctOption: string, explanation: string }
  const [checkedFeedback, setCheckedFeedback] = useState<
    Record<string, { isCorrect: boolean; correctOption: string; explanation: string }>
  >({});

  const fetchAttemptData = async () => {
    try {
      const res = await fetch(`/api/attempts/${attemptId}`);
      if (!res.ok) {
        router.push("/practice");
        return;
      }
      const data = await res.json();
      if (data.attempt.status === "SUBMITTED" || data.attempt.status === "EXPIRED") {
        router.push(`/attempts/${attemptId}/result`);
        return;
      }
      setAttempt(data.attempt);
      setAnswers(data.answers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user && attemptId) {
      fetchAttemptData();
    }
  }, [user, authLoading, attemptId]);

  const handleSelectOption = async (option: string) => {
    const currentAnswer = answers[currentIndex];
    // Cập nhật UI lựa chọn
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = {
      ...currentAnswer,
      selectedOption: option,
    };
    setAnswers(updatedAnswers);

    // Lưu vào database qua PUT API
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
      console.error("Lỗi khi lưu đáp án:", err);
    }
  };

  // Hành động Kiểm tra đáp án ngay cho câu hiện tại (đáp ứng đúng tiêu chí P0-02)
  const handleCheckCurrentAnswer = async () => {
    const currentAnswer = answers[currentIndex];
    if (!currentAnswer?.selectedOption || checkingAnswer) return;

    setCheckingAnswer(true);
    try {
      const res = await fetch("/api/practice/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId: currentAnswer.questionId,
          selectedOption: currentAnswer.selectedOption,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCheckedFeedback((prev) => ({
          ...prev,
          [currentAnswer.questionId]: {
            isCorrect: data.isCorrect,
            correctOption: data.correctOption,
            explanation: data.explanation,
          },
        }));
      } else {
        alert(data.error || "Không thể kiểm tra đáp án lúc này.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingAnswer(false);
    }
  };

  const handleSubmitAttempt = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
      });
      if (res.ok) {
        router.push(`/attempts/${attemptId}/result`);
      } else {
        alert("Có lỗi khi nộp bài. Vui lòng thử lại.");
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded w-1/3" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const currentAnswer = answers[currentIndex];
  const question = currentAnswer?.question;
  const answeredCount = answers.filter((a) => a.selectedOption).length;
  const feedback = question ? checkedFeedback[question.id] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-900">
              Luyện tập chuyên đề: {question?.topicName}
            </h1>
            <p className="text-xs text-slate-500">
              Đã làm: <span className="font-bold text-blue-600">{answeredCount}/{answers.length}</span> câu • Xem lời giải trực tiếp sau mỗi câu
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Hoàn thành & Chấm điểm</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Main Question Card */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <span className="font-extrabold text-blue-600 text-sm tracking-wide">
                CÂU HỎI {currentIndex + 1} / {answers.length}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full font-semibold">
                  Độ khó: {question?.difficulty === "RECOGNITION" ? "Nhận biết" : question?.difficulty === "UNDERSTANDING" ? "Thông hiểu" : "Vận dụng"}
                </span>
                {feedback && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-bold ${
                      feedback.isCorrect
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {feedback.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Chính xác
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Question Content */}
            <div className="text-base sm:text-lg font-medium text-slate-900 mb-6 leading-relaxed">
              <MathRenderer content={question?.content} />
            </div>

            {/* 4 Options */}
            <div className="space-y-3 mb-6">
              {[
                { key: "A", text: question?.optionA },
                { key: "B", text: question?.optionB },
                { key: "C", text: question?.optionC },
                { key: "D", text: question?.optionD },
              ].map((opt) => {
                const isSelected = currentAnswer?.selectedOption === opt.key;
                const isCorrect = feedback?.correctOption === opt.key;
                const isWrongChoice = feedback && isSelected && !feedback.isCorrect;

                let borderStyle = "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white";
                if (feedback) {
                  if (isCorrect) {
                    borderStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium";
                  } else if (isWrongChoice) {
                    borderStyle = "border-rose-500 bg-rose-50 text-rose-950";
                  }
                } else if (isSelected) {
                  borderStyle = "border-blue-600 bg-blue-50/70 shadow-sm";
                }

                return (
                  <button
                    type="button"
                    key={opt.key}
                    data-testid={`option-${opt.key}`}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 group ${borderStyle}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                        feedback && isCorrect
                          ? "bg-emerald-600 text-white"
                          : feedback && isWrongChoice
                          ? "bg-rose-600 text-white"
                          : isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                      }`}
                    >
                      {opt.key}
                    </div>
                    <div className="text-sm sm:text-base text-slate-800 pt-1 flex-1">
                      <MathRenderer content={opt.text} />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        Đã chọn
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Check Answer Button & Instant Feedback Box (P0-02) */}
            <div className="mb-6">
              {!feedback ? (
                <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-xs text-slate-500">
                    {currentAnswer?.selectedOption
                      ? "Chọn xong? Bấm kiểm tra đáp án để xem đúng/sai và lời giải ngay:"
                      : "Hãy chọn một phương án trước khi kiểm tra đáp án."}
                  </span>
                  <button
                    type="button"
                    data-testid="check-answer-btn"
                    onClick={handleCheckCurrentAnswer}
                    disabled={!currentAnswer?.selectedOption || checkingAnswer}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{checkingAnswer ? "Đang kiểm tra..." : "Kiểm tra đáp án"}</span>
                  </button>
                </div>
              ) : (
                <div
                  data-testid="explanation-box"
                  className={`p-5 rounded-2xl border-2 space-y-3 transition-all ${
                    feedback.isCorrect
                      ? "bg-emerald-50/70 border-emerald-300"
                      : "bg-rose-50/70 border-rose-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {feedback.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {feedback.isCorrect
                          ? "Tuyệt vời! Bạn đã chọn đáp án chính xác."
                          : `Chưa chính xác! Phương án đúng là đáp án ${feedback.correctOption}.`}
                      </h4>
                    </div>

                    <Link
                      href={`/tutor?questionId=${question?.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-blue-700 font-semibold text-xs hover:bg-blue-50 shadow-sm transition-all"
                    >
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hỏi AI về câu này</span>
                    </Link>
                  </div>

                  {/* Lời giải chi tiết */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Lời giải chi tiết:</span>
                    </span>
                    <MathRenderer content={feedback.explanation} />
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
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
                {currentAnswer?.selectedOption ? "✓ Đã lưu lựa chọn" : "Chưa chọn đáp án"}
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

        {/* Sidebar: Question Palette */}
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3">
              Danh sách câu hỏi ({answers.length} câu)
            </h3>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {answers.map((ans, idx) => {
                const isCurrent = idx === currentIndex;
                const fb = checkedFeedback[ans.questionId];
                const isAnswered = !!ans.selectedOption;

                let colorStyle = "bg-slate-100 text-slate-600 hover:bg-slate-200";
                if (fb) {
                  colorStyle = fb.isCorrect
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
                    : "bg-rose-100 text-rose-800 border border-rose-300 font-bold";
                } else if (isAnswered) {
                  colorStyle = "bg-blue-100 text-blue-800 border border-blue-300 font-bold";
                }

                if (isCurrent) {
                  colorStyle += " ring-2 ring-blue-600 ring-offset-2";
                }

                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${colorStyle}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-blue-600 ring-2 ring-blue-600 ring-offset-1" />
                <span>Câu đang làm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300" />
                <span>Đã kiểm tra đúng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300" />
                <span>Đã kiểm tra sai</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-blue-100 border border-blue-300" />
                <span>Đã chọn (chưa kiểm tra)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Submit */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">
              Hoàn thành phiên luyện tập?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-2 leading-relaxed">
              Bạn đã trả lời <span className="font-bold text-blue-600">{answeredCount}/{answers.length}</span> câu hỏi. Kết quả sẽ được lưu vào lịch sử học tập và cập nhật tiến độ Dashboard.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Tiếp tục luyện tập
              </button>
              <button
                type="button"
                onClick={handleSubmitAttempt}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {submitting ? "Đang lưu..." : "Xác nhận hoàn thành"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
