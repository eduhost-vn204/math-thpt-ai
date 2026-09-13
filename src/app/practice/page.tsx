"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, CheckCircle, ArrowRight, Layers, Sparkles } from "lucide-react";

export default function PracticeSelectionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const fetchTopics = async () => {
      try {
        const res = await fetch("/api/topics");
        if (res.ok) {
          const data = await res.json();
          setTopics(data.topics);
          if (data.topics.length > 0) {
            setSelectedTopicId(data.topics[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTopics();
    }
  }, [user, authLoading, router]);

  const handleStartPractice = async () => {
    if (!selectedTopicId) {
      setError("Vui lòng chọn một chuyên đề.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/practice/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopicId,
          count: questionCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể khởi tạo bài luyện tập.");
        setSubmitting(false);
      } else {
        router.push(`/practice/${data.attemptId}`);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ.");
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-1 gap-4">
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
            <div className="h-24 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Luyện tập trọng tâm</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Ôn tập trắc nghiệm theo chuyên đề
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Chọn chuyên đề bạn muốn bồi dưỡng và số lượng câu hỏi. Hệ thống sẽ trích xuất ngẫu nhiên câu hỏi kèm đáp án và lời giải chi tiết.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Step 1: Chọn chuyên đề */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Bước 1: Chọn 1 trong 5 chuyên đề trọng tâm</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {topics.map((t) => {
            const isSelected = selectedTopicId === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setSelectedTopicId(t.id)}
                className={`p-4 rounded-xl text-left border-2 transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                      {t.name}
                    </h3>
                    {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Ngân hàng câu hỏi:</span>
                  <span className="font-semibold text-slate-600">{t.questionCount} câu</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Chọn số lượng câu */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Bước 2: Chọn số lượng câu hỏi luyện tập</span>
        </h2>

        <div className="grid grid-cols-4 gap-3">
          {[5, 10, 15, 20].map((num) => (
            <button
              type="button"
              key={num}
              onClick={() => setQuestionCount(num)}
              className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                questionCount === num
                  ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50"
              }`}
            >
              {num} câu
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleStartPractice}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          {submitting ? "Đang chuẩn bị đề..." : "Bắt đầu luyện tập ngay"}
          {!submitting && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
