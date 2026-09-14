"use client";

import Link from "next/link";
import { Github, ArrowUpRight, Zap, ShieldAlert, Clock, Send, Repeat, ShieldOff, Cpu, Database, CheckCircle2, Lock, Eye, Bell } from "lucide-react";

const AUTOMATION_NODES = [
  { icon: Zap, label: "Funds In", bg: "bg-orange-100", text: "text-orange-700" },
  { icon: Cpu, label: "BOT Chain", bg: "bg-emerald-100", text: "text-emerald-700" },
  { icon: ShieldAlert, label: "Approval Guard", bg: "bg-red-100", text: "text-red-700" },
  { icon: Clock, label: "Cron Sweep", bg: "bg-blue-100", text: "text-blue-700" },
  { icon: Send, label: "Auto-Transfer", bg: "bg-purple-100", text: "text-purple-700" },
  { icon: Repeat, label: "DEX Swap", bg: "bg-amber-100", text: "text-amber-700" },
  { icon: ShieldOff, label: "Revoke Approval", bg: "bg-rose-100", text: "text-rose-700" },
  { icon: Database, label: "Postgres Log", bg: "bg-sky-100", text: "text-sky-700" },
  { icon: Lock, label: "Non-Custodial", bg: "bg-teal-100", text: "text-teal-700" },
  { icon: Eye, label: "0-Gas Sim", bg: "bg-lime-100", text: "text-lime-800" },
  { icon: CheckCircle2, label: "Idempotency", bg: "bg-indigo-100", text: "text-indigo-700" },
  { icon: Bell, label: "Webhook Ping", bg: "bg-pink-100", text: "text-pink-700" },
];

export function ProblemSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#FBF9F5] border-b border-[#E6E1D8]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Bold Editorial Copy */}
          <div className="lg:col-span-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1B1A18] leading-[1.1]">
              A little less manual.
              <br />
              <span className="text-[#E0533C]">A lot more execution.</span>
            </h2>

            <p className="mt-6 text-base text-[#6F6A63] leading-relaxed max-w-lg">
              We miss when blockchain tools felt like software that worked for you, not the other way
              around. You shouldn&apos;t have to babysit pending transactions, check gas prices every
              ten minutes, or wake up at 3 AM to rebalance liquidity.
            </p>

            <p className="mt-4 text-base text-[#6F6A63] leading-relaxed max-w-lg">
              Nodara turns your manual checklist into deterministic, simulation-gated workflows. No
              speculative pitch. Just good, reliable execution.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <a
                href="https://github.com/musa108/nodara"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#1C1C1F] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2C2C30] transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>Star on GitHub</span>
              </a>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E6E1D8] bg-white px-6 py-3 text-sm font-semibold text-[#1B1A18] hover:bg-[#F3EFE8] transition-colors"
              >
                <span>Read how it works</span>
                <ArrowUpRight className="h-4 w-4 text-[#6F6A63]" />
              </a>
            </div>
          </div>

          {/* Right Column: Visual Matrix of Modular Primitives */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-[#E6E1D8] bg-[#F7F4EE] p-6 sm:p-8 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-[#6F6A63] mb-4 font-mono">
                Modular Automation Nodes &bull; EVM Compatible
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AUTOMATION_NODES.map((node) => {
                  const Icon = node.icon;
                  return (
                    <div
                      key={node.label}
                      className="group flex flex-col items-center justify-center rounded-2xl border border-[#E6E1D8] bg-white p-4 text-center shadow-2xs hover:shadow-sm hover:border-[#E0533C]/40 transition-all cursor-default"
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${node.bg} ${node.text} mb-2.5 transition-transform group-hover:scale-105`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-[#1B1A18]">
                        {node.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between text-[11px] font-mono text-[#6F6A63] pt-3 border-t border-[#EAE6DE]">
                <span>Pre-built triggers &amp; actions</span>
                <span className="text-[#E0533C] font-semibold">100% Non-Custodial</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
