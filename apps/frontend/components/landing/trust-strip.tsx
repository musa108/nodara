"use client";

import { Shield, GitCommit, Layers, Eye, Cpu } from "lucide-react";

const TECHNICAL_GUARANTEES = [
  {
    icon: Shield,
    title: "NON-CUSTODIAL",
    subtitle: "Zero private keys held",
    color: "text-[#E0533C]",
    bg: "bg-orange-50",
  },
  {
    icon: Layers,
    title: "EVM COMPATIBLE",
    subtitle: "Ethereum, Base & BOT Chain",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: GitCommit,
    title: "DETERMINISTIC",
    subtitle: "Idempotency prevents replay",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Eye,
    title: "SIMULATED FIRST",
    subtitle: "Reverts fail safely off-chain",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Cpu,
    title: "BOT CHAIN READY",
    subtitle: "Mainnet Chain ID: 677",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-[#E6E1D8] bg-[#FAF8F4]">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div className="shrink-0 text-center lg:text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-[#E0533C] font-semibold">
              Core Architecture
            </span>
            <p className="text-sm font-bold text-[#1B1A18]">
              Built for reliable on-chain execution.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 w-full lg:w-auto">
            {TECHNICAL_GUARANTEES.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-2xl border border-[#E6E1D8] bg-white px-3.5 py-2.5 shadow-2xs"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] font-bold text-[#1B1A18] tracking-tight">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[#6F6A63] whitespace-nowrap">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
