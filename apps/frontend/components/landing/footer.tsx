"use client";

import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#FBF9F5] py-12 border-t border-[#E6E1D8]/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#E0533C]/20 bg-[#E0533C]/10 text-[#E0533C]">
              <svg viewBox="0 0 32 32" className="h-4.5 w-4.5" aria-hidden="true">
                <circle cx="9" cy="10" r="2.4" fill="#E0533C" />
                <circle cx="23" cy="10" r="2.4" fill="#E0533C" />
                <circle cx="16" cy="22" r="2.4" fill="#E0533C" />
                <path
                  d="M9 10L16 22M23 10L16 22M9 10L23 10"
                  stroke="#E0533C"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-base font-bold text-[#1B1A18]">nodara<span className="text-[#E0533C]">.</span></span>
          </Link>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-[#6F6A63]">
            <Link href="/workflows" className="hover:text-[#1B1A18] transition-colors">
              Workflows
            </Link>
            <Link href="/executions" className="hover:text-[#1B1A18] transition-colors">
              Executions
            </Link>
            <Link href="/audit-logs" className="hover:text-[#1B1A18] transition-colors">
              Audit Logs
            </Link>
            <a
              href="https://scan.botchain.ai"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1B1A18] transition-colors inline-flex items-center gap-1"
            >
              <span>BOTScan (677)</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://github.com/musa108/nodara"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#1B1A18] transition-colors inline-flex items-center gap-1"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-[#8E8981] font-sans flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} Nodara.</span>
            <span className="text-[#E0533C] font-semibold">Made for on-chain execution &hearts;</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
