"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldAlert,
  Users,
  Award,
  CheckCircle2,
  FileCheck2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Lock,
  Layers,
  Search,
} from "lucide-react";

interface OverviewData {
  overview: {
    totalStudents: number;
    activeStudents: number;
    totalCompletedAttempts: number;
    averageSystemScore: number;
    totalQuestions: number;
    totalTopics: number;
    totalExams: number;
  };
  recentStudents: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
    _count: { attempts: number };
  }>;
  recentAttempts: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    mode: string;
    examTitle: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    submittedAt: string;
  }>;
  topicStats: Array<{
    id: string;
    name: string;
    questionCount: number;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
  }>;
}

export default function AdminOverviewDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    const fetchOverview = async () => {
      try {
        const res = await fetch("/api/admin/overview");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchOverview();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 text-center shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Truy cập bị từ chối</h2>
        <p className="text-xs text-slate-500 mt-1">
          Khu vực này chỉ dành cho tài khoản Quản trị viên (ADMIN).
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Về Dashboard cá nhân
        </Link>
      </div>
    );
  }

  const { overview, recentStudents, recentAttempts, topicStats } = data || {
    overview: {
      totalStudents: 0,
      activeStudents: 0,
      totalCompletedAttempts: 0,
      averageSystemScore: 0,
      totalQuestions: 0,
      totalTopics: 0,
      totalExams: 0,
    },
    recentStudents: [],
    recentAttempts: [],
    topicStats: [],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Trung tâm Quản trị Toàn Hệ thống</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            System Overview Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi thời gian thực quy mô người học, mức độ hoạt động và chất lượng ôn thi THPT
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Học sinh</span>
          </Link>
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Ngân hàng Câu hỏi</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng số học sinh
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {overview.totalStudents}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">
              {overview.activeStudents} học sinh đã có bài làm
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Lượt thi hoàn thành
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {overview.totalCompletedAttempts}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Bao gồm thi thử & luyện tập
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Điểm TB toàn hệ thống
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-500 mt-1">
              {overview.averageSystemScore}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Thang điểm 10 chuẩn THPT</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Học liệu & Đề thi
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
              {overview.totalQuestions}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              {overview.totalTopics} chuyên đề • {overview.totalExams} đề thi
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Topic Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Left: Thống kê theo Chuyên đề */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Thống kê kết quả theo chuyên đề
              </h2>
            </div>
            <span className="text-xs text-slate-400">Dữ liệu từ DB</span>
          </div>

          <div className="space-y-4">
            {topicStats.map((topic) => (
              <div key={topic.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs sm:text-sm text-slate-800">
                    {topic.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {topic.questionCount} câu hỏi
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {topic.accuracy}% đúng
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      topic.accuracy >= 70
                        ? "bg-emerald-500"
                        : topic.accuracy >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${topic.accuracy}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Tổng trả lời: {topic.totalAnswers} lượt</span>
                  <span>Đúng: {topic.correctAnswers} lượt</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 5 lượt làm bài gần nhất toàn hệ thống */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">
                5 lượt làm bài gần nhất toàn hệ thống
              </h2>
            </div>
            <Link
              href="/admin/students"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Xem học sinh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAttempts.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">
                Chưa có lượt làm bài nào hoàn thành.
              </p>
            ) : (
              recentAttempts.map((att) => (
                <div
                  key={att.id}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between gap-3 bg-white"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                        {att.studentName}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {att.mode === "EXAM" ? "Thi thử" : "Luyện tập"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {att.examTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {att.submittedAt ? new Date(att.submittedAt).toLocaleString("vi-VN") : "Gần đây"}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0 flex items-center gap-3">
                    <div>
                      <span className="text-base font-black text-amber-600 block">
                        {att.score}đ
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {att.correctCount}/{att.totalQuestions} đúng
                      </span>
                    </div>
                    <Link
                      href={`/attempts/${att.id}/result`}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 text-xs font-semibold transition-colors"
                      title="Xem kết quả bài làm ở chế độ chỉ đọc"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5 Học sinh mới đăng ký gần nhất */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">
              5 học sinh mới đăng ký gần nhất
            </h2>
          </div>
          <Link
            href="/admin/students"
            className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <span>Xem toàn bộ học sinh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Học sinh</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Ngày đăng ký</th>
                <th className="pb-3 font-semibold text-center">Số bài đã làm</th>
                <th className="pb-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 font-semibold text-slate-800">{st.name}</td>
                  <td className="py-3 text-slate-600">{st.email}</td>
                  <td className="py-3 text-slate-500">
                    {new Date(st.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {st._count.attempts}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/students/${st.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-800"
                    >
                      <span>Hồ sơ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
