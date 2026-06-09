"use client";

import { useState, useEffect } from "react";

interface FilePreviewProps {
  fileUrl: string;
  fileName?: string | null;
  large?: boolean;
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".avif"];

function isImage(url: string): boolean {
  const ext = url.toLowerCase().split("?").shift()?.split("#").shift()?.slice(url.lastIndexOf(".")) || "";
  return IMAGE_EXTENSIONS.includes(ext);
}

export default function FilePreview({ fileUrl, fileName, large }: FilePreviewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const img = isImage(fileUrl);

  // ESC key + body scroll lock when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  if (!img) {
    if (large) {
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-48 sm:h-56 flex flex-col items-center justify-center gap-2 bg-[#080808] border-b border-[#1a1a1a] hover:bg-[#0a0a0a] transition-colors no-underline"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#444]">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="text-xs text-[#555]">{fileName || "Download File"}</span>
        </a>
      );
    }
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-[#bbb] hover:text-white no-underline px-2.5 py-1.5 rounded bg-[#141414] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {fileName || "Download"}
      </a>
    );
  }

  return (
    <>
      <button
        onClick={() => setLightboxOpen(true)}
        className="group relative overflow-hidden rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all cursor-pointer w-full"
      >
        <img
          src={fileUrl}
          alt={fileName || "Preview"}
          className={`${large ? 'w-full h-48 sm:h-56 object-cover' : 'w-20 h-20 object-cover'}`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
          <svg
            width={large ? "32" : "20"}
            height={large ? "32" : "20"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </button>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={fileUrl}
              alt={fileName || "Preview"}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#2a2a2a] transition-all cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {fileName && (
              <p className="text-xs text-[#777] mt-2 text-center">{fileName}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
