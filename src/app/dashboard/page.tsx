"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Trophy,
  Target,
  Clock,
  BookOpen,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BarChart,
  Bot,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-slate-200 rounded-2xl w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-slate-200 rounded-xl" />
            <div className="h-28 bg-slate-200 rounded-xl" />
            <div className="h-28 bg-slate-200 rounded-xl" />
            <div className="h-28 bg-slate-200 rounded-xl" />
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Tiến độ ôn thi THPT Quốc Gia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, {user?.name}! 👋
            </h1>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              Hôm nay bạn đã sẵn sàng bứt phá điểm môn Toán chưa? Hãy làm một đề thi thử hoặc chọn luyện tập chuyên đề còn yếu nhé!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm shadow-md transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Thi thử 30 phút</span>
            </Link>
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500/40 hover:bg-blue-500/60 text-white font-semibold text-sm backdrop-blur border border-white/20 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Luyện chuyên đề</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng lượt làm bài</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.totalAttempts || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Điểm cao nhất</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">
              {stats?.maxScore !== undefined ? `${stats.maxScore}đ` : "0đ"}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <BarChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Điểm trung bình</p>
            <p className="text-2xl font-bold text-indigo-600 mt-0.5">
              {stats?.averageScore !== undefined ? `${stats.averageScore}đ` : "0đ"}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Tổng số câu đã giải</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{stats?.totalQuestionsAnswered || 0}</p>
          </div>
        </div>
      </div>

      {/* Weakest Topic Alert */}
      {stats?.weakestTopic && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-900">
                Chuyên đề cần cải thiện: {stats.weakestTopic.name}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Tỷ lệ trả lời chính xác hiện tại là{" "}
                <span className="font-bold">{stats.weakestTopic.accuracy}%</span> ({stats.weakestTopic.correct}/{stats.weakestTopic.total} câu). Hệ thống khuyến nghị bạn nên ôn luyện thêm chuyên đề này.
              </p>
            </div>
          </div>
          <Link
            href="/practice"
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap transition-colors"
          >
            <span>Ôn luyện ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Two Column Layout: Topic Accuracies & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Tỷ lệ đúng theo chuyên đề */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-blue-600" />
            <span>Tỷ lệ chính xác theo 5 chuyên đề</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">Thống kê tự động từ toàn bộ kết quả làm bài của bạn</p>

          <div className="space-y-4">
            {stats?.topicStats?.map((t: any, index: number) => (
              <div key={index} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 truncate max-w-[280px]">{t.name}</span>
                  <span className="font-semibold text-slate-700">
                    {t.accuracy}% ({t.correct}/{t.total} câu)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      t.accuracy >= 80
                        ? "bg-emerald-500"
                        : t.accuracy >= 50
                        ? "bg-blue-500"
                        : t.total > 0
                        ? "bg-amber-500"
                        : "bg-slate-300"
                    }`}
                    style={{ width: `${Math.max(t.accuracy, t.total > 0 ? 5 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 5 Kết quả gần nhất */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span>5 Kết quả làm bài gần nhất</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Nhấp vào từng bài để xem lại bảng điểm và lời giải</p>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 flex-1">
            {stats?.recentAttempts && stats.recentAttempts.length > 0 ? (
              stats.recentAttempts.map((att: any) => (
                <Link
                  key={att.id}
                  href={`/attempts/${att.id}/result`}
                  className="block p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          att.mode === "EXAM"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {att.mode === "EXAM" ? "Thi thử" : "Luyện tập"}
                      </span>
                      <h4 className="font-semibold text-xs text-slate-800 mt-1 line-clamp-1">
                        {att.examTitle}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {att.submittedAt ? new Date(att.submittedAt).toLocaleString("vi-VN") : "Chưa hoàn thành"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{att.score}đ</p>
                      <p className="text-[11px] text-slate-500">
                        {att.correctCount}/{att.totalQuestions} đúng
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Chưa có bài thi nào được hoàn thành. Hãy bắt đầu ngay bài đầu tiên!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
