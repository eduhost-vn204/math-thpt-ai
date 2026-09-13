"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Sparkles,
  BookOpen,
  FileCheck2,
  Bot,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Calculator,
  Compass,
} from "lucide-react";
import RichMathContent from "@/components/RichMathContent";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-6 shadow-sm border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Đột phá ôn thi tốt nghiệp THPT 2026</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
              Ôn Luyện Môn Toán THPT Quốc Gia Tích Hợp{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Gia Sư AI Thông Minh
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Luyện tập theo từng chuyên đề trọng tâm, làm đề thi thử chuẩn cấu trúc 20 câu 30 phút, nhận lời giải chi tiết và trò chuyện trực tiếp cùng trợ lý AI giải thích phương pháp giải toán từng bước.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <span>Vào bảng điều khiển học tập</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/exams"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-base shadow-sm transition-all"
                  >
                    <FileCheck2 className="w-4 h-4 text-blue-600" />
                    <span>Thi thử ngay</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <span>Tạo tài khoản miễn phí</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-base shadow-sm transition-all"
                  >
                    <span>Đăng nhập học tập</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Credentials pill */}
            <div className="mt-8 inline-block bg-white/80 backdrop-blur border border-slate-200 rounded-xl p-3 text-xs text-slate-500 shadow-sm">
              <span className="font-semibold text-slate-700">Tài khoản demo nghiệm thu:</span>{" "}
              Học sinh: <code className="bg-slate-100 text-blue-600 px-1 py-0.5 rounded font-mono">student@mathai.local</code> (mk: <code className="bg-slate-100 text-blue-600 px-1 py-0.5 rounded font-mono">Student@123</code>) |{" "}
              Admin: <code className="bg-slate-100 text-purple-600 px-1 py-0.5 rounded font-mono">admin@mathai.local</code> (mk: <code className="bg-slate-100 text-purple-600 px-1 py-0.5 rounded font-mono">Admin@123</code>)
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Quy trình học tập khép kín</h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              Công nghệ đồng hành cùng từng bài toán
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">1. Ôn theo chuyên đề</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự chọn chuyên đề trọng điểm: Hàm số, Mũ - Logarit, Tích phân, Hình không gian Oxyz và Xác suất với độ khó phân hóa.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">2. Thi thử tính giờ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đề thi 20 câu 30 phút có đồng hồ đếm ngược, lưu tạm câu trả lời và tự động nộp khi hết giờ mà không lộ đáp án trước.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">3. Phân tích năng lực</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dashboard tự động thống kê điểm trung bình, tỷ lệ đúng theo từng chuyên đề và chỉ ra chính xác chuyên đề học sinh cần cải thiện.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">4. Gia sư AI Toán</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hỏi trực tiếp về từng câu toán vừa làm sai. AI hỗ trợ gợi ý phương pháp, phân tích sai lầm thường gặp và render KaTeX chuẩn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Math Preview KaTeX Showcase */}
      <section className="py-14 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-blue-600">
              <Calculator className="w-4 h-4" />
              <span>Minh họa hiển thị công thức Toán học KaTeX chuẩn xác</span>
            </div>
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
              <div className="font-medium text-slate-800 text-sm">
                Ví dụ câu hỏi:
              </div>
              <RichMathContent
                content={String.raw`Tính tích phân từng phần: $I = \int_0^1 x e^x dx$ và xác định đường tiệm cận ngang của hàm số $y = \frac{2x - 1}{x + 1}$.`}
                className="text-base text-slate-800"
              />
              <div className="mt-3 text-xs bg-white p-3 rounded-lg border border-slate-200">
                <RichMathContent
                  content={String.raw`**✓ Lời giải mẫu KaTeX:** Áp dụng công thức $\int u dv = uv - \int v du$. Đặt $u = x \implies du = dx$; $dv = e^x dx \implies v = e^x$. Suy ra $I = \left. x e^x \right|_0^1 - \int_0^1 e^x dx = e - (e - 1) = 1$.`}
                  className="text-xs text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
