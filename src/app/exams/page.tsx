"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FileCheck2, Clock, CheckCircle, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function ExamsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchExams = async () => {
      try {
        const res = await fetch("/api/exams");
        if (res.ok) {
          const data = await res.json();
          setExams(data.exams);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchExams();
    }
  }, [user, authLoading, router]);

  const handleStartExam = async (examId: string) => {
    setStartingId(examId);
    setError("");

    try {
      const res = await fetch(`/api/exams/${examId}/start`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể bắt đầu đề thi.");
        setStartingId(null);
      } else {
        router.push(`/exams/${examId}`);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ.");
      setStartingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-44 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileCheck2 className="w-7 h-7 text-blue-600" />
          <span>Phòng thi thử THPT Quốc Gia môn Toán</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Hệ thống đề thi mô phỏng chuẩn ma trận đề thi tốt nghiệp THPT, có đồng hồ đếm ngược và chấm điểm tự động.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                  Đề chính thức
                </span>
                <span className="text-xs text-slate-400">
                  {exam.questionCount} câu trắc nghiệm
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900">{exam.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {exam.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Thời gian làm bài: <strong className="text-slate-800">{exam.durationMinutes} phút</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tự động nộp khi hết giờ</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => handleStartExam(exam.id)}
                disabled={startingId === exam.id}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
              >
                {startingId === exam.id ? "Đang chuẩn bị đề..." : "Bắt đầu làm bài thi"}
                {startingId !== exam.id && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
