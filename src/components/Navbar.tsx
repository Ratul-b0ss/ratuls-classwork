"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/assignments", label: "Assignments" },
    { href: "/practicals", label: "Practicals" },
    { href: "/notices", label: "Notices" },
  ];

  return (
    <nav className="sticky top-0 z-40" style={{ height: "56px" }}>
      <div className="mx-auto max-w-6xl px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 rounded border border-[#2a2a2a] flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold">CS</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded text-sm no-underline ${
                isActive(link.href)
                  ? "bg-[#141414] text-white"
                  : "text-[#777] hover:text-white hover:bg-[#141414]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col items-center justify-center w-9 h-9 rounded border border-[#1a1a1a] cursor-pointer bg-transparent"
          aria-label="Toggle menu"
        >
          <span className={`block w-4 h-px bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-0" : "-translate-y-1"}`} />
          <span className={`block w-4 h-px bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
          <span className={`block w-4 h-px bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 translate-y-0" : "translate-y-1"}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#1a1a1a] bg-[#000000]">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded text-sm no-underline ${
                  isActive(link.href)
                    ? "bg-[#141414] text-white"
                    : "text-[#777] hover:text-white hover:bg-[#141414]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
