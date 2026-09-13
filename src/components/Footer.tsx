import React from "react";
import { GraduationCap, Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-base">Math THPT AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống ôn luyện thi THPT Quốc gia môn Toán thông minh tích hợp trợ lý AI gia sư sư phạm, hỗ trợ học sinh lớp 12 bứt phá điểm số.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Chức năng chính</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• Luyện tập câu hỏi theo 5 chuyên đề trọng tâm</li>
              <li>• Thi thử trắc nghiệm 20 câu chuẩn thời gian 30 phút</li>
              <li>• Chấm điểm tự động và phân tích chuyên đề còn yếu</li>
              <li>• Chatbot AI Gia sư giải đáp từng bước và phân tích lỗi sai</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Đồ án tốt nghiệp / NCKH</h4>
            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5 font-medium text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Hệ thống nghiệm thu P0 theo đặc tả XPS 2026
              </p>
              <p className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Bản quyền học liệu & công nghệ Toán XPS 2026
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                * Lưu ý: AI hỗ trợ học tập mang tính chất gợi ý phương pháp, khuyến khích học sinh đối chiếu lời giải chi tiết.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 Hệ thống Web Ôn thi THPT Quốc gia môn Toán tích hợp Chatbot AI.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Xây dựng với <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" /> cho học sinh lớp 12 cả nước
          </p>
        </div>
      </div>
    </footer>
  );
}
