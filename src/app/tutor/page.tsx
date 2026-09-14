"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RichMathContent from "@/components/RichMathContent";
import {
  Bot,
  User,
  Send,
  Sparkles,
  HelpCircle,
  BookOpen,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

function TutorContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = searchParams.get("questionId");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(true);
  const [aiProvider, setAiProvider] = useState<string>("gemini");
  const [questionContext, setQuestionContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      // 1. Tải ngữ cảnh câu hỏi nếu có questionId
      if (questionId) {
        try {
          // Lấy câu hỏi qua endpoint
          const res = await fetch(`/api/chat?questionId=${questionId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages);
            }
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        // Tải lịch sử chung
        try {
          const res = await fetch("/api/chat");
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              setMessages(data.messages);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    if (user) {
      loadData();
    }
  }, [user, authLoading, questionId, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    setInput("");
    const tempId = Date.now().toString();
    const newUserMsg: Message = {
      id: tempId,
      role: "USER",
      content: messageContent,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          questionId: questionId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsFallbackMode(!!data.isFallback);
        if (data.provider) setAiProvider(data.provider);
        const newAiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ASSISTANT",
          content: data.reply,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newAiMsg]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ASSISTANT",
          content: "Thầy AI đang bận hoặc gặp lỗi tạm thời. Em vui lòng thử lại nhé!",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Phương pháp tìm tiệm cận đứng và tiệm cận ngang nhanh nhất?",
    "Cách phân biệt dùng tổ hợp và chỉnh hợp trong bài toán xác suất?",
    "Công thức tính nguyên hàm từng phần và thứ tự đặt u?",
    "Các bước xác định khoảng đồng biến, nghịch biến của hàm số bậc ba?",
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col h-[calc(100vh-140px)]">
      {/* Header bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span>Gia sư AI Toán THPT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500">
              Hỗ trợ giải đáp phương pháp, phân tích lỗi sai và công thức Toán 12
            </p>
          </div>
        </div>

        {/* Fallback Mode Indicator according to SPEC */}
        <div className="flex items-center gap-2">
          {isFallbackMode ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Chế độ dự phòng</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{aiProvider === "openai" ? "OpenAI AI trực tuyến" : "Gemini AI trực tuyến"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Notice when contextualized from a specific question */}
      {questionId && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              Đang gắn ngữ cảnh câu hỏi ID: <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">{questionId}</code>. Hãy hỏi cụ thể về cách giải câu này!
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSendMessage("Thầy ơi, hướng dẫn em phương pháp giải câu này từng bước và phân tích các lỗi học sinh hay mắc phải với ạ!")}
            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold text-[11px] hover:bg-blue-700 whitespace-nowrap ml-2"
          >
            Hỏi giải câu này
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/70 rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Chào bạn! Tôi là Gia sư AI Toán THPT
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
              Tôi có thể giúp bạn giải thích phương pháp giải, chứng minh công thức, phân tích bẫy đề thi và hướng dẫn chi tiết từng bước.
            </p>

            <div className="w-full text-left space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Gợi ý câu hỏi thường gặp:
              </p>
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="w-full p-2.5 text-xs text-left font-medium bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-slate-700 transition-all flex items-center justify-between"
                >
                  <span className="line-clamp-1">{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "USER";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <RichMathContent content={msg.content} />
                  )}
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isUser ? "text-blue-200 text-right" : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1 font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase() || "H"}
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 ml-1.5">Gia sư AI đang soạn câu trả lời...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi Toán học bạn cần giải đáp hoặc công thức (ví dụ: $y = x^3 - 3x$)..."
          className="flex-1 px-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 disabled:opacity-40 transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-400 text-xs">
          Đang khởi tạo phòng Gia sư AI...
        </div>
      }
    >
      <TutorContent />
    </Suspense>
  );
}
