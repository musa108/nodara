"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectWalletButton } from "@/components/dashboard/connect-wallet-button";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 border-b",
        scrolled
          ? "border-[#E6E1D8] bg-[#FBF9F5]/95 backdrop-blur-md shadow-sm"
          : "border-[#E6E1D8]/60 bg-[#FBF9F5]/80 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Left: Brandmark */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-[#E0533C]/20 bg-[#E0533C]/10 transition-colors group-hover:bg-[#E0533C]/15">
              <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
                <circle cx="9" cy="10" r="2.4" fill="#E0533C" />
                <circle cx="23" cy="10" r="2.4" fill="#E0533C" />
                <circle cx="16" cy="22" r="2.4" fill="#E0533C" />
                <path
                  d="M9 10L16 22M23 10L16 22M9 10L23 10"
                  stroke="#E0533C"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.75"
                />
              </svg>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-[#1B1A18]">nodara</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#E0533C]" />
            </div>
          </Link>

          {/* Subtitle status indicator */}
          <div className="hidden items-center gap-2 rounded-full border border-[#E6E1D8] bg-[#F3EFE8] px-3 py-1 text-[11px] font-mono text-[#6F6A63] md:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
            <span>BOT Chain &bull; 677</span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#6F6A63] md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-[#1B1A18]">
            Product
          </a>
          <a href="#pipeline" className="transition-colors hover:text-[#1B1A18]">
            Pipeline
          </a>
          <a href="#botchain" className="transition-colors hover:text-[#1B1A18]">
            BOT Chain
          </a>
          <a href="#security" className="transition-colors hover:text-[#1B1A18]">
            Architecture
          </a>
          <a href="#developers" className="transition-colors hover:text-[#1B1A18]">
            Developers
          </a>
          <Link href="/overview" className="transition-colors hover:text-[#1B1A18]">
            Dashboard
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/workflows/new"
            className="hidden items-center gap-1.5 rounded-full bg-[#1C1C1F] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#2C2C30] sm:inline-flex shadow-sm"
          >
            <span>Launch App</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
          </Link>
          <ConnectWalletButton />

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#6F6A63] hover:bg-[#F3EFE8] hover:text-[#1B1A18] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#E6E1D8] bg-[#FBF9F5] px-6 py-5 shadow-lg md:hidden">
          <div className="flex flex-col space-y-4 text-sm font-medium">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#6F6A63] hover:text-[#1B1A18]"
            >
              Product
            </a>
            <a
              href="#pipeline"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#6F6A63] hover:text-[#1B1A18]"
            >
              Execution Pipeline
            </a>
            <a
              href="#botchain"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#6F6A63] hover:text-[#1B1A18]"
            >
              BOT Chain Mainnet
            </a>
            <a
              href="#security"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#6F6A63] hover:text-[#1B1A18]"
            >
              Non-Custodial Architecture
            </a>
            <a
              href="#developers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#6F6A63] hover:text-[#1B1A18]"
            >
              Developers &amp; API
            </a>
            <div className="pt-3 border-t border-[#E6E1D8] flex flex-col gap-2">
              <Link
                href="/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-[#1B1A18] font-medium"
              >
                <span>Open Dashboard</span>
                <ArrowUpRight className="h-4 w-4 text-[#6F6A63]" />
              </Link>
              <Link
                href="/workflows/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-full bg-[#E0533C] py-2.5 text-xs font-semibold text-white hover:bg-[#CC4732]"
              >
                Launch Nodara ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
