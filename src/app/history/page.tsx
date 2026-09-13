"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { History, FileCheck2, BookOpen, Clock, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          setAttempts(data.attempts);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
          <div className="h-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-600" />
            <span>Lịch sử ôn luyện & thi thử</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Toàn bộ các phiên làm bài của bạn được lưu trữ đầy đủ để tiện đối chiếu và ôn tập
          </p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-700">Chưa có bài thi nào</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Bạn chưa thực hiện bài luyện tập hoặc đề thi thử nào. Hãy chọn một chuyên đề để bắt đầu ngay nhé!
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/practice"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Luyện chuyên đề
            </Link>
            <Link
              href="/exams"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Thi thử ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {attempts.map((att) => {
            const isCompleted = att.status === "SUBMITTED" || att.status === "EXPIRED";
            return (
              <Link
                key={att.id}
                href={isCompleted ? `/attempts/${att.id}/result` : att.mode === "EXAM" ? `/exams/${att.id}` : `/practice/${att.id}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 block"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      att.mode === "EXAM"
                        ? "bg-purple-100 text-purple-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {att.mode === "EXAM" ? <FileCheck2 className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          att.mode === "EXAM"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {att.mode === "EXAM" ? "Đề thi thử" : "Luyện tập"}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(att.startedAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-slate-900 mt-1">{att.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Số câu: {att.totalQuestions} câu</span>
                      <span>•</span>
                      <span>Thời gian: {Math.floor(att.durationSeconds / 60)} phút {att.durationSeconds % 60}s</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    {isCompleted ? (
                      <div>
                        <span className="text-2xl font-black text-blue-600">{att.score}</span>
                        <span className="text-xs font-semibold text-slate-400"> / 10đ</span>
                        <p className="text-[11px] text-emerald-600 font-medium">
                          {att.correctCount}/{att.totalQuestions} câu đúng
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        Đang làm dở
                      </span>
                    )}
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
