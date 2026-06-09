"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import FilePreview from "./FilePreview";

/* ─── Type helpers ─── */

interface NoticeItem {
  id: string;
  title: string;
  content: string;
  date?: string | null;
  createdAt: string | Date;
}

interface SubjectItem {
  id: string;
  title: string;
  description?: string | null;
  subject?: string | null;
  dueDate?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  createdAt: string | Date;
}

interface CategoryBlockProps {
  notices: NoticeItem[];
  assignments: Map<string, SubjectItem[]>;
  practicals: Map<string, SubjectItem[]>;
}

/* ─── Category config ─── */

const CATEGORIES = [
  {
    key: "notices" as const,
    label: "Notices",
    color: "#bbb",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    key: "assignments" as const,
    label: "Assignments",
    color: "#999",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: "practicals" as const,
    label: "Practicals",
    color: "#888",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

export default function CategoryBlocks({ notices, assignments, practicals }: CategoryBlockProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const closeModal = () => {
    setSelectedCategory(null);
    setSelectedSubject(null);
  };

  const goBack = () => setSelectedSubject(null);

  // ESC key + body scroll lock when modal is open
  useEffect(() => {
    if (!selectedCategory) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const getCategoryCount = (key: CategoryKey): number => {
    if (key === "notices") return notices.length;
    const map = key === "assignments" ? assignments : practicals;
    return [...map.values()].flat().length;
  };

  return (
    <>
      {/* ─── 3 square category blocks ─── */}
      {notices.length === 0 && assignments.size === 0 && practicals.size === 0 ? (
        <div className="text-center py-24">
          <p className="text-[#555] text-sm">Nothing posted yet. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                setSelectedCategory(cat.key);
                setSelectedSubject(null);
              }}
              className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-3 hover:border-[#2a2a2a] transition-all cursor-pointer group"
            >
              <div className="text-[#444] group-hover:text-white transition-colors duration-200">
                {cat.icon}
              </div>
              <h2 className="text-sm font-medium tracking-wide uppercase transition-colors duration-200"
                style={{ color: cat.color }}
              >
                {cat.label}
              </h2>
              <span className="text-[10px] text-[#555]">
                {getCategoryCount(cat.key)} {getCategoryCount(cat.key) === 1 ? "item" : "items"}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ─── Modal ─── */}
      {selectedCategory && (
        <CategoryModal
          categoryKey={selectedCategory}
          notices={notices}
          assignments={assignments}
          practicals={practicals}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          onClose={closeModal}
          onBack={goBack}
        />
      )}
    </>
  );
}

/* ─── Category Modal ─── */

interface CategoryModalProps {
  categoryKey: CategoryKey;
  notices: NoticeItem[];
  assignments: Map<string, SubjectItem[]>;
  practicals: Map<string, SubjectItem[]>;
  selectedSubject: string | null;
  onSelectSubject: (s: string | null) => void;
  onClose: () => void;
  onBack: () => void;
}

function CategoryModal({
  categoryKey,
  notices,
  assignments,
  practicals,
  selectedSubject,
  onSelectSubject,
  onClose,
  onBack,
}: CategoryModalProps) {
  const config = CATEGORIES.find((c) => c.key === categoryKey)!;

  /* ─── Get the right data map ─── */
  const getData = (): Map<string, SubjectItem[]> | NoticeItem[] => {
    if (categoryKey === "notices") return notices;
    return categoryKey === "assignments" ? assignments : practicals;
  };

  const data = getData();

  /* ─── Notices: flat card grid ─── */
  if (categoryKey === "notices") {
    const items = data as NoticeItem[];
    return (
      <ModalShell onClose={onClose}>
        <ModalHeader label="Notices" color={config.color} onClose={onClose} onBack={undefined} />
        <div className="flex-1 overflow-y-auto p-5 pt-2">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-[#555]">No notices yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((n) => (
                <div
                  key={n.id}
                  className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 flex flex-col gap-2 hover:border-[#2a2a2a] transition-colors aspect-square"
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[#555]">
                    <span className="text-[#bbb] font-medium">Notice</span>
                    <span>&middot;</span>
                    <span>{n.date ? formatDate(n.date) : formatDate(n.createdAt)}</span>
                  </div>
                  <h3 className="text-xs font-medium text-white line-clamp-2">{n.title}</h3>
                  <p className="text-[10px] text-[#666] leading-relaxed line-clamp-4 flex-1">{n.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalShell>
    );
  }

  /* ─── Assignments / Practicals ─── */
  const subjectMap = data as Map<string, SubjectItem[]>;

  if (selectedSubject === null) {
    /* ─── FOLDER LEVEL: larger square subject boxes ─── */
    return (
      <ModalShell onClose={onClose}>
        <ModalHeader label={config.label} color={config.color} onClose={onClose} onBack={undefined} />
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...subjectMap.entries()].map(([subject, items]) => (
              <button
                key={subject}
                onClick={() => onSelectSubject(subject)}
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl aspect-square flex flex-col items-center justify-center gap-3 hover:border-[#2a2a2a] hover:bg-[#0f0f0f] transition-all cursor-pointer group"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#444] group-hover:text-white transition-colors">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-sm font-medium text-white truncate max-w-[85%]">{subject}</span>
                <span className="text-xs text-[#555]">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </ModalShell>
    );
  }

  /* ─── ITEM LEVEL: image-first rectangular cards ─── */
  const items = subjectMap.get(selectedSubject) || [];

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader label={`${selectedSubject} — ${config.label}`} color={config.color} onClose={onClose} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-3">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-[#555]">No items in this folder</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#2a2a2a] transition-colors flex flex-col"
              >
                {/* Image / File Preview — top area */}
                {item.fileUrl ? (
                  <FilePreview fileUrl={item.fileUrl} fileName={item.fileName} large />
                ) : (
                  <div className="w-full h-32 sm:h-40 bg-[#080808] flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#333]">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                )}

                {/* Details — bottom area */}
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#555] flex-wrap">
                    <span className="font-medium" style={{ color: config.color }}>
                      {config.label.slice(0, -1)}
                    </span>
                    <span>&middot;</span>
                    <span>{formatDate(item.createdAt)}</span>
                    {item.dueDate && (
                      <>
                        <span>&middot;</span>
                        <span className="text-[#888]">Due: {formatDate(item.dueDate)}</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-white line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-[#666] leading-relaxed line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

/* ─── Modal shell ─── */

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl w-full max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Modal header ─── */

function ModalHeader({
  label,
  color,
  onClose,
  onBack,
}: {
  label: string;
  color: string;
  onClose: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-lg border border-[#1a1a1a] flex items-center justify-center hover:border-[#2a2a2a] transition-colors cursor-pointer shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#555]">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <h2 className="text-xs font-medium tracking-wide uppercase truncate" style={{ color }}>
          {label}
        </h2>
      </div>
      <button
        onClick={onClose}
        className="w-7 h-7 rounded-lg border border-[#1a1a1a] flex items-center justify-center hover:border-[#2a2a2a] transition-colors cursor-pointer shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#555]">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
