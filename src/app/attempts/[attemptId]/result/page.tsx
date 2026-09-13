"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import MathRenderer from "@/components/MathRenderer";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Bot,
  RotateCcw,
  LayoutDashboard,
  Sparkles,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";

function AttemptResultContent() {
  const { attemptId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";
  const { user, loading: authLoading } = useAuth();

  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/attempts/${attemptId}`);
        if (!res.ok) {
          router.push("/dashboard");
          return;
        }
        const data = await res.json();
        setAttempt(data.attempt);
        setAnswers(data.answers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && attemptId) {
      fetchResult();
    }
  }, [user, authLoading, attemptId, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-44 bg-slate-200 rounded-3xl" />
          <div className="h-28 bg-slate-200 rounded-2xl" />
          <div className="h-44 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const wrongCount = (attempt?.totalQuestions || 0) - (attempt?.correctCount || 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Alert if viewed by Admin */}
      {user?.role === "ADMIN" && (
        <div className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="font-bold uppercase tracking-wider bg-purple-200 text-purple-800 px-2 py-0.5 rounded text-[10px]">
              Chế độ Quản trị viên (Chỉ đọc)
            </span>
            <span>Bạn đang xem chi tiết kết quả bài làm của học sinh.</span>
          </div>
          <Link
            href="/admin/students"
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
          >
            Quay lại DS học sinh
          </Link>
        </div>
      )}

      {/* Alert if auto-submitted due to time expiration */}
      {isExpired && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>Thời gian làm bài đã kết thúc! Hệ thống đã tự động nộp bài và chấm điểm các câu bạn đã chọn.</span>
        </div>
      )}

      {/* Hero Score Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold mb-2.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Kết quả hoàn thành bài làm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {attempt?.examTitle || (attempt?.mode === "EXAM" ? "Đề thi thử THPT Quốc Gia" : "Luyện tập theo chuyên đề")}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Thời gian nộp: {attempt?.submittedAt ? new Date(attempt.submittedAt).toLocaleString("vi-VN") : "Vừa xong"}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/10 backdrop-blur border border-white/15 px-6 py-4 rounded-2xl">
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-black text-amber-400">{attempt?.score}</span>
              <span className="text-sm font-semibold text-slate-300 block">Thang điểm 10</span>
            </div>
            <div className="h-12 w-px bg-white/20" />
            <div className="space-y-1 text-xs">
              <p className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Đúng: {attempt?.correctCount} câu
              </p>
              <p className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <XCircle className="w-4 h-4" /> Sai: {wrongCount} câu
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4" /> {Math.floor((attempt?.durationSeconds || 0) / 60)}p {(attempt?.durationSeconds || 0) % 60}s
              </p>
            </div>
          </div>
        </div>

        {/* Quick Nav actions */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Về Dashboard</span>
          </Link>
          <Link
            href={attempt?.mode === "EXAM" ? "/exams" : "/practice"}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm đề khác</span>
          </Link>
          <Link
            href="/tutor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all ml-auto"
          >
            <Bot className="w-4 h-4" />
            <span>Mở phòng Gia sư AI</span>
          </Link>
        </div>
      </div>

      {/* Question Details List */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">Chi tiết từng câu hỏi & Lời giải</h2>
        <p className="text-xs text-slate-500">
          Đối chiếu phương án đã chọn với đáp án chuẩn và lời giải KaTeX. Bạn có thể bấm <strong>"Hỏi AI về câu này"</strong> để được giải thích cặn kẽ.
        </p>
      </div>

      <div className="space-y-6">
        {answers.map((ans, idx) => {
          const q = ans.question;
          const isCorrect = ans.isCorrect;
          const selected = ans.selectedOption;
          const correct = q.correctOption;

          return (
            <div
              key={ans.id}
              className={`bg-white rounded-3xl border-2 p-6 sm:p-7 shadow-sm transition-all ${
                isCorrect ? "border-emerald-200" : "border-rose-200"
              }`}
            >
              {/* Question Index & Badges */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-700">
                    Chuyên đề: {q.topicName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isCorrect
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Chính xác
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Question Statement */}
              <div className="text-sm sm:text-base font-medium text-slate-900 mb-5 leading-relaxed">
                <MathRenderer content={q.content} />
              </div>

              {/* 4 Choices with visual highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                {[
                  { key: "A", text: q.optionA },
                  { key: "B", text: q.optionB },
                  { key: "C", text: q.optionC },
                  { key: "D", text: q.optionD },
                ].map((opt) => {
                  const isUserChoice = selected === opt.key;
                  const isCorrectChoice = correct === opt.key;

                  let styleClass = "border-slate-200 bg-white text-slate-700";
                  if (isCorrectChoice) {
                    styleClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                  } else if (isUserChoice && !isCorrect) {
                    styleClass = "border-rose-500 bg-rose-50 text-rose-900";
                  }

                  return (
                    <div
                      key={opt.key}
                      className={`p-3 rounded-xl border-2 flex items-start gap-2.5 text-xs sm:text-sm ${styleClass}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isCorrectChoice
                            ? "bg-emerald-600 text-white"
                            : isUserChoice
                            ? "bg-rose-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <div className="pt-0.5 flex-1">
                        <MathRenderer content={opt.text} />
                      </div>
                      {isUserChoice && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/80 text-slate-700 border border-slate-300">
                          Bạn chọn
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lời giải chi tiết:</span>
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <MathRenderer content={q.explanation} />
                </div>
              </div>

              {/* Ask AI Button for this question */}
              <div className="flex justify-end">
                <Link
                  href={`/tutor?questionId=${q.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
                >
                  <Bot className="w-4 h-4 text-blue-600" />
                  <span>Hỏi AI về câu này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AttemptResultPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-400 text-xs">
          Đang tải kết quả bài làm...
        </div>
      }
    >
      <AttemptResultContent />
    </Suspense>
  );
}
