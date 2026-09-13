"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  ArrowLeft,
  Calendar,
  Mail,
  Award,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

interface StudentDetailData {
  student: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  stats: {
    totalAttempts: number;
    avgScore: number;
    maxScore: number;
    totalQuestions: number;
    totalCorrect: number;
    overallAccuracy: number;
    weakestTopic: { name: string; accuracy: number } | null;
  };
  topicStats: Array<{
    topicId: string;
    topicName: string;
    total: number;
    correct: number;
    accuracy: number;
  }>;
  history: Array<{
    id: string;
    mode: string;
    title: string;
    status: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    startedAt: string;
    submittedAt: string | null;
    durationSeconds: number;
  }>;
}

export default function AdminStudentDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<StudentDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/admin/students/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          router.push("/admin/students");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "ADMIN" && id) {
      fetchDetail();
    }
  }, [user, authLoading, id, router]);

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { student, stats, topicStats, history } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách học sinh</span>
        </Link>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-2xl border border-purple-200 shadow-sm">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {student.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Học sinh 12
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{student.email}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ngày tham gia: {new Date(student.createdAt).toLocaleDateString("vi-VN")}</span>
                </span>
              </div>
            </div>
          </div>

          {stats.weakestTopic && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 max-w-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Chuyên đề yếu nhất:</span>
              </div>
              <p className="font-semibold">{stats.weakestTopic.name}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Độ chính xác hiện tại: {stats.weakestTopic.accuracy}%
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Tổng bài đã làm</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalAttempts}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Đã nộp bài hoàn tất</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Điểm trung bình</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.avgScore}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Thang điểm 10</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Điểm cao nhất</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.maxScore}đ</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Thành tích cao nhất</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium">Tỷ lệ làm đúng</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{stats.overallAccuracy}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{stats.totalCorrect}/{stats.totalQuestions} câu</p>
          </div>
        </div>
      </div>

      {/* Topic Accuracy Breakdown */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <span>Tỷ lệ chính xác theo chuyên đề môn Toán</span>
        </h2>

        {topicStats.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Học sinh chưa hoàn thành câu hỏi nào để phân tích chuyên đề.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topicStats.map((topic) => (
              <div key={topic.topicId} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs sm:text-sm text-slate-800">
                    {topic.topicName}
                  </span>
                  <span className="font-bold text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                    {topic.accuracy}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      topic.accuracy >= 75
                        ? "bg-emerald-500"
                        : topic.accuracy >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${topic.accuracy}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>Tổng số câu đã làm: {topic.total}</span>
                  <span>Đúng: {topic.correct} câu</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attempts History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span>Lịch sử các bài thi & bài luyện tập</span>
        </h2>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            Học sinh chưa thực hiện bài làm nào.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="pb-3 font-semibold">Tên bài thi / chuyên đề</th>
                  <th className="pb-3 font-semibold">Hình thức</th>
                  <th className="pb-3 font-semibold">Thời gian nộp</th>
                  <th className="pb-3 font-semibold text-center">Kết quả</th>
                  <th className="pb-3 font-semibold text-center">Điểm số</th>
                  <th className="pb-3 font-semibold text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-800">
                      {att.title}
                    </td>
                    <td className="py-3.5">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {att.mode === "EXAM" ? "Thi thử" : "Luyện tập"}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {att.submittedAt
                        ? new Date(att.submittedAt).toLocaleString("vi-VN")
                        : "Đang làm"}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="font-semibold text-slate-700">
                        {att.correctCount}/{att.totalQuestions}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="font-black text-amber-600 text-sm">
                        {att.score}đ
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {att.status === "SUBMITTED" || att.status === "EXPIRED" ? (
                        <Link
                          href={`/attempts/${att.id}/result`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors"
                          title="Xem kết quả bài làm ở chế độ chỉ đọc"
                        >
                          <span>Xem bài (Chỉ đọc)</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa nộp</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
