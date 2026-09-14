"use client";

import { Smartphone, Monitor, CheckCircle2, ShieldCheck, ArrowUpRight, Zap } from "lucide-react";
import Link from "next/link";

export function ProductDemo() {
  return (
    <section className="py-20 sm:py-28 bg-[#FBF9F5] border-b border-[#E6E1D8]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* The High-Contrast Dark Card Container inspired by the screenshot */}
        <div className="rounded-3xl bg-[#1C1C1F] text-white p-8 sm:p-12 lg:p-14 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Side: Headline & Device Badges */}
            <div className="lg:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E0533C] font-semibold">
                Multi-Platform Telemetry
              </span>

              <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
                Take your workflows with you.
              </h2>

              <p className="mt-5 text-sm sm:text-base text-gray-300 leading-relaxed max-w-md">
                Native console for desktop, instant webhook alerts, and full mobile responsiveness.
                Every execution is tracked, gas-estimated, and confirmed on-chain in real time.
              </p>

              {/* Status Badges */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {/* Desktop Badge */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Monitor className="h-5 w-5 text-[#E0533C]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">Web Console</span>
                      <span className="rounded bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 text-[9px] font-mono font-semibold">
                        LIVE
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Desktop &amp; Tablet</div>
                  </div>
                </div>

                {/* Mobile Badge */}
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Smartphone className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">Mobile View</span>
                      <span className="rounded bg-white/10 text-gray-300 px-1.5 py-0.5 text-[9px] font-mono font-semibold">
                        RESPONSIVE
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">iOS &amp; Android PWA</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10">
                <Link
                  href="/overview"
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#E0533C] hover:text-[#ff6a52] font-semibold"
                >
                  <span>Open live dashboard console</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Side: Mockup with Desktop Window and Mobile Phone side-by-side */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              {/* Desktop Preview Card */}
              <div className="w-full sm:w-[68%] rounded-2xl border border-white/15 bg-[#25262A] p-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                    <span className="ml-2 font-mono text-[10px] text-gray-400">Nodara / Executions</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sweeping
                  </span>
                </div>

                <div className="mt-3 space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-[#E0533C]" />
                      <span className="text-white font-medium">Auto-Sweep Treasury</span>
                    </div>
                    <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-white font-medium">Revoke Unlimited Approval</span>
                    </div>
                    <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-white/5 p-2.5 text-gray-400 text-[10px]">
                    <span>Tx: 0x7f9a...3c21</span>
                    <span>Block: #14,829,105</span>
                    <span>Gas: 21,048</span>
                  </div>
                </div>
              </div>

              {/* Mobile Phone Mockup Card */}
              <div className="w-48 rounded-2xl border border-white/20 bg-[#2A2B30] p-3 shadow-2xl shrink-0 sm:-ml-6 sm:mt-12">
                <div className="flex items-center justify-center pb-2">
                  <div className="h-1 w-12 rounded-full bg-white/20" />
                </div>
                <div className="rounded-xl bg-[#1C1C1F] p-3 border border-white/10">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E0533C]" />
                    <span>Nodara Mobile</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-white">
                    Workflow Triggered
                  </div>
                  <div className="mt-1 text-[10px] text-gray-300 font-mono">
                    Received 2.50 BOT
                  </div>
                  <div className="mt-2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono p-1 text-center font-semibold">
                    ✓ Simulated &amp; Confirmed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
