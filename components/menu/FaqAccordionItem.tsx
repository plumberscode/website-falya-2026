"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface FaqAccordionItemProps {
  question: string;
  answer: string;
  // Opsional: bagian dari `answer` yang dirender sebagai hyperlink.
  // `answer` harus mengandung `link.matchText` persis sekali.
  link?: {
    matchText: string;
    href: string;
  };
}

export default function FaqAccordionItem({
  question,
  answer,
  link,
}: FaqAccordionItemProps) {
  const [open, setOpen] = useState(false);

  const answerIndex = link ? answer.indexOf(link.matchText) : -1;
  const answerContent =
    link && answerIndex !== -1 ? (
      <>
        {answer.slice(0, answerIndex)}
        <Link
          href={link.href}
          className="text-[#a82868] font-semibold hover:underline"
        >
          {link.matchText}
        </Link>
        {answer.slice(answerIndex + link.matchText.length)}
      </>
    ) : (
      answer
    );

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(36,27,24,0.06)]">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
      >
        <span className="text-sm sm:text-base font-semibold text-[#241b18]">
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#a82868] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm text-[#665b56] leading-relaxed">
            {answerContent}
          </p>
        </div>
      </div>
    </div>
  );
}
