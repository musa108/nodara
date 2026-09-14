"use client";

import Link from "next/link";
import { ArrowUpRight, Github, Zap, ShieldCheck, Cpu } from "lucide-react";
import { HeroWorkflowVisual } from "./hero-workflow-visual";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-[#FBF9F5]">
      {/* Subtle warm ambient backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Floating Badges inspired by the screenshot's playful floating avatars */}
        <div className="relative mx-auto max-w-4xl text-center">
          {/* Top decorative starburst asterisk */}
          <div className="flex justify-center mb-4">
            <span className="text-[#E0533C] text-3xl font-serif select-none animate-pulse">
              ✱
            </span>
          </div>

          {/* Floating Pill: Top Left */}
          <div className="hidden lg:flex absolute -left-12 top-4 items-center gap-2 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.04)] animate-bounce [animation-duration:6s]">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-50 text-[#E0533C]">
              <Zap className="h-4 w-4" />
            </div>
            <div className="text-left font-mono text-[11px]">
              <div className="text-[#6F6A63]">Trigger</div>
              <div className="font-semibold text-[#1B1A18]">Funds In</div>
            </div>
          </div>

          {/* Floating Pill: Top Right */}
          <div className="hidden lg:flex absolute -right-12 top-8 items-center gap-2 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.04)] animate-bounce [animation-duration:7s]">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Cpu className="h-4 w-4" />
            </div>
            <div className="text-left font-mono text-[11px]">
              <div className="text-[#6F6A63]">Network</div>
              <div className="font-semibold text-[#1B1A18]">BOT Chain 677</div>
            </div>
          </div>

          {/* Floating Pill: Lower Left */}
          <div className="hidden lg:flex absolute -left-6 bottom-32 items-center gap-2 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2 shadow-[0_8px_20px_rgba(0,0,0,0.04)] animate-bounce [animation-duration:8s]">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="text-left font-mono text-[11px]">
              <div className="text-[#6F6A63]">Simulation</div>
              <div className="font-semibold text-emerald-600">0 Reverts</div>
            </div>
          </div>

          {/* Main Title inspired directly by the screenshot's typography */}
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-[84px] leading-[1.08] text-[#1B1A18]">
            A home for{" "}
            <span className="block text-[#E0533C]">
              your automation.
            </span>
          </h1>

          {/* Subtitle Copy */}
          <p className="mx-auto mt-6 max-w-2xl text-base text-[#6F6A63] sm:text-lg leading-relaxed text-balance">
            For the late-night triggers, the scheduled sweeps, and the transactions that just need to
            happen. Build programmable on-chain workflows that execute without manual intervention.
          </p>

          {/* Dual CTAs in warm pill shape */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/workflows/new"
              className="inline-flex items-center gap-2 rounded-full bg-[#E0533C] px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#CC4732] transition-all"
            >
              <span>Build your workflow</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>

            <a
              href="https://github.com/musa108/nodara"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#E6E1D8] bg-white px-7 py-3.5 text-sm font-semibold text-[#1B1A18] shadow-2xs hover:bg-[#F3EFE8] transition-all"
            >
              <Github className="h-4 w-4" />
              <span>Star on GitHub</span>
            </a>
          </div>

          {/* Casual annotation with curved arrow */}
          <div className="mt-4 flex items-center justify-center sm:justify-end sm:mr-16 gap-1 text-xs text-[#8E8981] font-sans italic">
            <span>less watching, more executing</span>
            <span className="text-sm not-italic">⤵</span>
          </div>
        </div>

        {/* Hero Interactive App Window */}
        <div className="mt-12 sm:mt-16">
          <HeroWorkflowVisual />
        </div>
      </div>
    </section>
  );
}
