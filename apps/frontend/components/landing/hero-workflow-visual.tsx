"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldCheck, ArrowRight, Play, RotateCcw, Cpu, Zap, GitBranch, Send, Check } from "lucide-react";
import { cn } from "@/utils/cn";

type ExecutionPhase = "DETECTING" | "EVALUATING" | "SIMULATING" | "SUBMITTING" | "CONFIRMED";

export function HeroWorkflowVisual() {
  const [phase, setPhase] = useState<ExecutionPhase>("DETECTING");
  const [blockNumber, setBlockNumber] = useState(14829104);
  const [gasEstimated, setGasEstimated] = useState(21000);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setPhase((current) => {
        switch (current) {
          case "DETECTING":
            return "EVALUATING";
          case "EVALUATING":
            return "SIMULATING";
          case "SIMULATING":
            return "SUBMITTING";
          case "SUBMITTING":
            setBlockNumber((b) => b + 1);
            setGasEstimated(21000 + Math.floor(Math.random() * 800));
            return "CONFIRMED";
          case "CONFIRMED":
            return "DETECTING";
          default:
            return "DETECTING";
        }
      });
    }, 2600);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const stepTriggerActive = true;
  const stepConditionActive = phase !== "DETECTING";
  const stepActionSimulated = phase === "SIMULATING" || phase === "SUBMITTING" || phase === "CONFIRMED";
  const stepActionConfirmed = phase === "CONFIRMED";

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Desktop App Window Frame inspired by reference screenshot */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-[#E6E1D8] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.07)] overflow-hidden">
        {/* Window Topbar */}
        <div className="flex h-11 items-center justify-between border-b border-[#EAE6DE] bg-[#F7F4EE] px-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#E57373]/80" />
            <span className="h-3 w-3 rounded-full bg-[#FFB74D]/80" />
            <span className="h-3 w-3 rounded-full bg-[#81C784]/80" />
            <div className="ml-3 flex items-center gap-1.5 rounded-md border border-[#E6E1D8] bg-white px-3 py-1 font-mono text-[11px] text-[#6F6A63]">
              <span className="font-semibold text-[#1B1A18]">Nodara Console</span>
              <span>&bull;</span>
              <span>workflow_0194.botchain</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#6F6A63]">
              <span>Block:</span>
              <span className="font-medium text-[#1B1A18]">#{blockNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="inline-flex items-center gap-1 rounded-full border border-[#E6E1D8] bg-white px-2.5 py-0.5 text-[10px] font-mono text-[#6F6A63] hover:text-[#1B1A18] transition-colors shadow-2xs"
            >
              {isAutoPlaying ? <RotateCcw className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
              <span>{isAutoPlaying ? "Simulating" : "Paused"}</span>
            </button>
          </div>
        </div>

        {/* Interior Two-Pane Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
          {/* Left: Workflow Builder Pipeline (4 cols) */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#EAE6DE] bg-[#FAF8F4] p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6F6A63]">
                  Pipeline Architecture
                </span>
                <span className="rounded-full bg-[#E0533C]/10 border border-[#E0533C]/20 px-2.5 py-0.5 text-[10px] font-semibold text-[#E0533C]">
                  LIVE EXECUTION
                </span>
              </div>

              {/* 3 Step Pipeline Cards */}
              <div className="space-y-3">
                {/* 1. Trigger Card */}
                <div
                  className={cn(
                    "rounded-xl border p-3.5 transition-all",
                    stepTriggerActive
                      ? "border-[#E0533C]/40 bg-white shadow-2xs"
                      : "border-[#E6E1D8] bg-[#F7F4EE]"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#E0533C] font-semibold">01 &bull; TRIGGER</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[10px]">
                      DETECTED
                    </span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-[#1B1A18] flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-[#E0533C]" />
                    <span>WALLET_RECEIVES_FUNDS</span>
                  </div>
                  <div className="mt-1 text-xs text-[#6F6A63] font-mono">
                    Event: +2.40 BOT incoming on Chain 677
                  </div>
                </div>

                {/* 2. Condition Card */}
                <div
                  className={cn(
                    "rounded-xl border p-3.5 transition-all",
                    stepConditionActive
                      ? "border-[#3B82F6]/40 bg-white shadow-2xs"
                      : "border-[#E6E1D8] bg-[#F7F4EE] opacity-70"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#3B82F6] font-semibold">02 &bull; CONDITION</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-medium text-[10px]",
                        stepConditionActive
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {stepConditionActive ? "EVALUATED: TRUE" : "PENDING"}
                    </span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-[#1B1A18] flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5 text-[#3B82F6]" />
                    <span>BALANCE_GT &gt; 1.00 BOT</span>
                  </div>
                  <div className="mt-1 text-xs text-[#6F6A63] font-mono">
                    Observed: 2.40 BOT &gt; 1.00 BOT &check;
                  </div>
                </div>

                {/* 3. Action Card */}
                <div
                  className={cn(
                    "rounded-xl border p-3.5 transition-all",
                    stepActionConfirmed
                      ? "border-emerald-500/50 bg-white shadow-2xs"
                      : stepActionSimulated
                      ? "border-[#E0533C]/40 bg-white"
                      : "border-[#E6E1D8] bg-[#F7F4EE] opacity-70"
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#1B1A18] font-semibold">03 &bull; ACTION</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-semibold text-[10px]",
                        stepActionConfirmed
                          ? "bg-emerald-100 text-emerald-800"
                          : phase === "SUBMITTING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-orange-50 text-orange-700"
                      )}
                    >
                      {phase}
                    </span>
                  </div>
                  <div className="mt-1.5 font-semibold text-sm text-[#1B1A18] flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-emerald-600" />
                    <span>TRANSFER_TOKENS &rarr; Vault</span>
                  </div>
                  <div className="mt-1 text-xs text-[#6F6A63] font-mono">
                    Sweep 0.50 BOT to cold reserve
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#EAE6DE] flex items-center justify-between text-[11px] font-mono text-[#6F6A63]">
              <span>Chains: BOT Chain, Base, ETH</span>
              <span className="font-medium text-[#1B1A18]">Idempotent: YES</span>
            </div>
          </div>

          {/* Right: Real-time Execution Feed & Telemetry (7 cols) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#EAE6DE] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1B1A18]">
                    KeeperHub Execution Engine
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#6F6A63]">
                  RPC Sweep: 30s Poller
                </span>
              </div>

              {/* Execution Feed Items */}
              <div className="space-y-3 font-mono text-xs">
                {/* Event 1 */}
                <div className="flex items-start gap-3 rounded-xl border border-[#EAE6DE] bg-[#FAF8F4] p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E0533C]/10 text-[#E0533C]">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1B1A18]">Event Detected</span>
                      <span className="text-[10px] text-[#6F6A63]">0.1s ago</span>
                    </div>
                    <p className="text-[11px] text-[#6F6A63] mt-0.5">
                      Incoming Transfer to wallet 0x3B8...21C (+2.40 BOT)
                    </p>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="flex items-start gap-3 rounded-xl border border-[#EAE6DE] bg-[#FAF8F4] p-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1B1A18]">Simulation Gate</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        PASSED (0 Reverts)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6F6A63] mt-0.5">
                      State transition evaluated off-chain. Zero gas risked.
                    </p>
                  </div>
                </div>

                {/* Event 3 */}
                <div
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                    stepActionConfirmed
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-[#EAE6DE] bg-[#FAF8F4]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                      stepActionConfirmed
                        ? "bg-emerald-600 text-white"
                        : "bg-orange-100 text-orange-700"
                    )}
                  >
                    {stepActionConfirmed ? <Check className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#1B1A18]">
                        {stepActionConfirmed ? "Confirmed on BOT Chain" : "Broadcasting via KeeperHub"}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700">
                        {stepActionConfirmed ? "TX CONFIRMED" : "PENDING"}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6F6A63]">
                      <span>Gas: {gasEstimated}</span>
                      <span>Tx: 0x7f9a...3c21</span>
                      <span>Latency: 1.2s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Banner */}
            <div className="mt-4 rounded-xl border border-[#E6E1D8] bg-[#FAF8F4] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#1B1A18]">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-medium">Non-Custodial Architecture</span>
              </div>
              <span className="text-[11px] text-[#6F6A63]">Zero private keys in scanner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
