"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import MathRenderer from "@/components/MathRenderer";
import {
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  Lock,
  Database,
} from "lucide-react";

export default function AdminQuestionsListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      let url = "/api/admin/questions";
      const params = new URLSearchParams();
      if (selectedTopicId) params.set("topicId", selectedTopicId);
      if (searchTerm) params.set("search", searchTerm);
      if (params.toString()) url += `?${params.toString()}`;

      const [qRes, tRes] = await Promise.all([fetch(url), fetch("/api/topics")]);

      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestions(qData.questions || []);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        setTopics(tData.topics || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }
    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [user, authLoading, selectedTopicId, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng đề?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } else {
        alert("Không thể xóa câu hỏi này.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded w-1/4" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (user?.role !== "ADMIN") return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs text-purple-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Quay lại tổng quan</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-600" />
            <span>Ngân hàng câu hỏi ({questions.length})</span>
          </h1>
        </div>

        <Link
          href="/admin/questions/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm câu hỏi mới</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            placeholder="Tìm kiếm theo nội dung câu hỏi hoặc công thức LaTeX..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedTopicId}
            onChange={(e) => setSelectedTopicId(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="">-- Tất cả 5 chuyên đề --</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {questions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {q.topic?.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {q.difficulty}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        Đáp án đúng: {q.correctOption}
                      </span>
                    </div>

                    <div className="text-sm font-medium text-slate-900 mb-3 leading-relaxed">
                      <MathRenderer content={q.content} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl">
                      <div>A: <MathRenderer content={q.optionA} /></div>
                      <div>B: <MathRenderer content={q.optionB} /></div>
                      <div>C: <MathRenderer content={q.optionC} /></div>
                      <div>D: <MathRenderer content={q.optionD} /></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      href={`/admin/questions/${q.id}/edit`}
                      className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      disabled={deletingId === q.id}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
