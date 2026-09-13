"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

interface StudentItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  attemptsCount: number;
  avgScore: number | null;
  maxScore: number | null;
  lastActive: string | null;
}

export default function AdminStudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 1,
  });

  const fetchStudents = useCallback(
    async (currentPage = page, search = searchQuery, filter = performanceFilter) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: "10",
          q: search,
          performance: filter,
        });

        const res = await fetch(`/api/admin/students?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
          setPagination(data.pagination || { page: 1, pageSize: 10, totalCount: 0, totalPages: 1 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [page, searchQuery, performanceFilter]
  );

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/dashboard");
      return;
    }

    if (user?.role === "ADMIN") {
      fetchStudents(page, searchQuery, performanceFilter);
    }
  }, [user, authLoading, page, performanceFilter, router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents(1, searchQuery, performanceFilter);
  };

  const handleFilterChange = (filter: string) => {
    setPerformanceFilter(filter);
    setPage(1);
    fetchStudents(1, searchQuery, filter);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="text-xs font-semibold text-slate-500 hover:text-purple-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Quản lý Học sinh</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold">
              {pagination.totalCount} học sinh
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tra cứu thông tin, lịch sử ôn luyện và năng lực từng học sinh
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo họ tên hoặc email học sinh..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors"
          >
            Tìm kiếm
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Phân loại:</span>
          </span>
          {[
            { id: "all", label: "Tất cả học sinh" },
            { id: "done", label: "Đã làm bài" },
            { id: "none", label: "Chưa làm bài" },
            { id: "under5", label: "Điểm TB < 5" },
            { id: "5to8", label: "Điểm TB 5 - < 8" },
            { id: "above8", label: "Điểm TB ≥ 8 (Khá/Giỏi)" },
          ].map((flt) => (
            <button
              key={flt.id}
              type="button"
              onClick={() => handleFilterChange(flt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                performanceFilter === flt.id
                  ? "bg-purple-600 text-white shadow-sm font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {flt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Học sinh</th>
                <th className="py-3.5 px-4 font-semibold">Ngày đăng ký</th>
                <th className="py-3.5 px-4 font-semibold text-center">Số bài làm</th>
                <th className="py-3.5 px-4 font-semibold text-center">Điểm TB</th>
                <th className="py-3.5 px-4 font-semibold text-center">Điểm cao nhất</th>
                <th className="py-3.5 px-4 font-semibold">Hoạt động gần nhất</th>
                <th className="py-3.5 px-4 font-semibold text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách học sinh...</span>
                    </div>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-purple-50/30 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/admin/students/${st.id}`)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                            {st.name}
                          </p>
                          <p className="text-xs text-slate-400">{st.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(st.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {st.attemptsCount} bài
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {st.avgScore !== null ? (
                        <span
                          className={`font-black px-2 py-0.5 rounded text-xs ${
                            st.avgScore >= 8
                              ? "bg-emerald-100 text-emerald-800"
                              : st.avgScore >= 5
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {st.avgScore}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {st.maxScore !== null ? (
                        <span className="font-bold text-slate-800 text-xs">
                          {st.maxScore}đ
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {st.lastActive
                        ? new Date(st.lastActive).toLocaleDateString("vi-VN")
                        : "Chưa hoạt động"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/students/${st.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800 p-1.5 rounded-lg hover:bg-purple-100"
                      >
                        <span>Hồ sơ</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Trang {pagination.page} / {pagination.totalPages} (Tổng {pagination.totalCount} học sinh)
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg font-semibold text-xs ${
                    pagination.page === p
                      ? "bg-purple-600 text-white"
                      : "border border-slate-200 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
