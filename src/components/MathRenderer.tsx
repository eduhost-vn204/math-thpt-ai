"use client";

import React from "react";
import RichMathContent from "./RichMathContent";

interface MathRendererProps {
  content: string;
  className?: string;
}

export default function MathRenderer({ content, className = "" }: MathRendererProps) {
  return <RichMathContent content={content} className={className} />;
}
