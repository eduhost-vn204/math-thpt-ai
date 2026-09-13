"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MathRenderer from "@/components/MathRenderer";
import { ChevronLeft, Edit2, Sparkles, AlertCircle } from "lucide-react";

export default function EditQuestionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [topics, setTopics] = useState<any[]>([]);
  const [topicId, setTopicId] = useState("");
  const [difficulty, setDifficulty] = useState("UNDERSTANDING");
  const [content, setContent] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");
  const [explanation, setExplanation] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    const loadQuestionData = async () => {
      try {
        const [qRes, tRes] = await Promise.all([
          fetch(`/api/admin/questions/${id}`),
          fetch("/api/topics"),
        ]);

        if (tRes.ok) {
          const tData = await tRes.json();
          setTopics(tData.topics || []);
        }

        if (qRes.ok) {
          const qData = await qRes.json();
          const q = qData.question;
          setTopicId(q.topicId);
          setDifficulty(q.difficulty);
          setContent(q.content);
          setOptionA(q.optionA);
          setOptionB(q.optionB);
          setOptionC(q.optionC);
          setOptionD(q.optionD);
          setCorrectOption(q.correctOption);
          setExplanation(q.explanation);
        } else {
          setError("Không tìm thấy câu hỏi.");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "ADMIN" && id) {
      loadQuestionData();
    }
  }, [user, authLoading, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          difficulty,
          content,
          optionA,
          optionB,
          optionC,
          optionD,
          correctOption,
          explanation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể cập nhật câu hỏi.");
        setSubmitting(false);
      } else {
        router.push("/admin/questions");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi máy chủ.");
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="p-12 text-center text-slate-400">Đang tải dữ liệu câu hỏi...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link
          href="/admin/questions"
          className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-semibold mb-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách câu hỏi</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Edit2 className="w-6 h-6 text-purple-600" />
          <span>Chỉnh sửa câu hỏi ID: {id}</span>
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Chuyên đề Toán học
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mức độ nhận thức
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="RECOGNITION">Nhận biết</option>
              <option value="UNDERSTANDING">Thông hiểu</option>
              <option value="APPLICATION">Vận dụng</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nội dung câu hỏi
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {content && (
            <div className="mt-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-purple-700 block mb-1">
                Xem trước hiển thị:
              </span>
              <MathRenderer content={content} className="text-xs sm:text-sm" />
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Bốn lựa chọn đáp án
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "A", val: optionA, setVal: setOptionA },
              { key: "B", val: optionB, setVal: setOptionB },
              { key: "C", val: optionC, setVal: setOptionC },
              { key: "D", val: optionD, setVal: setOptionD },
            ].map((opt) => (
              <div key={opt.key} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Lựa chọn {opt.key}:</label>
                <input
                  type="text"
                  value={opt.val}
                  onChange={(e) => opt.setVal(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {opt.val && (
                  <div className="p-2 bg-slate-50 rounded-lg text-xs">
                    <MathRenderer content={opt.val} />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1.5">
              Phương án chính xác:
            </label>
            <div className="flex items-center gap-4">
              {["A", "B", "C", "D"].map((opt) => (
                <label key={opt} className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="correctOption"
                    value={opt}
                    checked={correctOption === opt}
                    onChange={(e) => setCorrectOption(e.target.value)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span>Đáp án {opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Lời giải chi tiết từng bước
          </label>
          <textarea
            rows={4}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          {explanation && (
            <div className="mt-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
              <span className="text-[10px] uppercase font-bold text-purple-700 block mb-1">
                Xem trước lời giải:
              </span>
              <MathRenderer content={explanation} className="text-xs sm:text-sm" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/questions"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50"
          >
            {submitting ? "Đang lưu thay đổi..." : "Cập nhật câu hỏi"}
          </button>
        </div>
      </form>
    </div>
  );
}
