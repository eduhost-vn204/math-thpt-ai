"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export interface RichMathContentProps {
  content: string;
  className?: string;
}

/**
 * Chuẩn hóa các delimiter LaTeX:
 * - Chuyển \[ ... \] thành $$ ... $$
 * - Chuyển \( ... \) thành $ ... $
 */
function normalizeMathDelimiters(rawText: string): string {
  if (!rawText) return "";

  let text = rawText;

  // 1. Chuyển display math \[ ... \] sang $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_match, math) => {
    return `\n\n$$\n${math.trim()}\n$$\n\n`;
  });

  // 2. Chuyển inline math \( ... \) sang $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_match, math) => {
    return `$${math.trim()}$`;
  });

  return text;
}

export default function RichMathContent({
  content,
  className = "",
}: RichMathContentProps) {
  const normalized = useMemo(() => normalizeMathDelimiters(content), [content]);

  if (!content) return null;

  return (
    <div className={`rich-math-content text-inherit leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          p: ({ children }) => (
            <div className="mb-2 last:mb-0 leading-relaxed">{children}</div>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-2 space-y-1 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-2 space-y-1 pl-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          code: ({ children }) => (
            <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">
              {children}
            </code>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
