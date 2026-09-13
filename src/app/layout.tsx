import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Math THPT AI - Ôn thi THPT Quốc gia môn Toán tích hợp Chatbot AI",
  description:
    "Hệ thống web hỗ trợ ôn luyện kỳ thi THPT Quốc gia môn Toán tích hợp chatbot AI gia sư thông minh, luyện tập chuyên đề, thi thử và phân tích năng lực.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
