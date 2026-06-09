"use client";

import { useState } from "react";

interface SubjectGroupProps {
  subject: string;
  count: number;
  typeLabel: string;
  typeColor: string;
  children: React.ReactNode;
}

export default function SubjectGroup({
  subject,
  count,
  typeLabel,
  typeColor,
  children,
}: SubjectGroupProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      {/* Folder header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all cursor-pointer"
      >
        {/* Chevron icon */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#555] transition-transform duration-200 shrink-0 ${expanded ? 'rotate-90' : 'rotate-0'}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>

        {/* Subject name */}
        <span className="text-xs font-medium text-white truncate flex-1 text-left">{subject}</span>
        <span className="text-[10px] text-[#555] shrink-0">
          {count} {count === 1 ? typeLabel.toLowerCase() : `${typeLabel.toLowerCase()}s`}
        </span>
      </button>

      {/* Items */}
      <div
        className={`ml-1 pl-2.5 border-l border-[#1a1a1a] flex flex-col gap-1.5 overflow-hidden transition-all duration-200 ${
          expanded ? "mt-1.5 opacity-100 max-h-[9999px]" : "mt-0 opacity-0 max-h-0 pointer-events-none"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
