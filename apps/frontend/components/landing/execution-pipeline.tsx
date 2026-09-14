"use client";

import { ShieldAlert } from "lucide-react";

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Trigger Ingestion",
    detail: "Poller identifies incoming event or schedule match within block window.",
    badge: "MONITOR SWEEP",
  },
  {
    step: "02",
    title: "Condition Validation",
    detail: "Read-only viem client checks live balances, allowances, and contract state.",
    badge: "ZERO GAS",
  },
  {
    step: "03",
    title: "Transaction Synthesis",
    detail: "Action handler compiles unsigned EVM payload with precise calldata.",
    badge: "UNSIGNED CALLDATA",
  },
  {
    step: "04",
    title: "KeeperHub Simulation",
    detail: "State transition simulated against node state before any broadcast.",
    badge: "CRITICAL GATE",
    highlight: true,
  },
  {
    step: "05",
    title: "Dynamic Gas Estimation",
    detail: "Base fee + priority fee computed with safety margin to ensure inclusion.",
    badge: "SLIPPAGE GUARD",
  },
  {
    step: "06",
    title: "Idempotent Submission",
    detail: "KeeperHub signs and broadcasts with deterministic deduplication key.",
    badge: "ZERO DOUBLE-SPEND",
    highlight: true,
  },
  {
    step: "07",
    title: "Confirmation Tracking",
    detail: "Background worker monitors transaction receipt and reorg safety depth.",
    badge: "POLLING (15s)",
  },
  {
    step: "08",
    title: "State Persistence",
    detail: "Execution record, actual gas used, and block receipt saved to Postgres.",
    badge: "AUDIT LOG",
  },
  {
    step: "09",
    title: "Telemetry & Notification",
    detail: "Dashboard refreshed, webhook dispatched, and optional user alert sent.",
    badge: "COMPLETED",
  },
];

export function ExecutionPipeline() {
  return (
    <section id="pipeline" className="py-20 sm:py-28 bg-[#FAF8F4] border-b border-[#E6E1D8]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center mb-3">
            <span className="text-[#E0533C] text-2xl font-serif select-none">✱</span>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#E0533C] font-semibold">
            Execution Integrity
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1A18] leading-[1.1]">
            We don&apos;t just &ldquo;send a transaction.&rdquo;
            <br />
            We engineer execution reliability.
          </h2>
          <p className="mt-5 text-base text-[#6F6A63] leading-relaxed text-balance">
            Every trigger passes through a 9-stage validation and simulation pipeline. Reverts fail
            safely in memory, gas is conserved, and idempotency guarantees that worker restarts never
            double-execute.
          </p>
        </div>

        {/* 9-Stage Visual Pipeline in Clean White Cards */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PIPELINE_STEPS.map((item) => (
            <div
              key={item.step}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 bg-white shadow-2xs hover:shadow-md ${
                item.highlight
                  ? "border-[#E0533C]/50 ring-1 ring-[#E0533C]/20"
                  : "border-[#E6E1D8] hover:border-[#E0533C]/30"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#8E8981]">
                    STAGE {item.step}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                      item.highlight
                        ? "bg-[#E0533C]/10 text-[#E0533C] border border-[#E0533C]/20"
                        : "bg-[#F3EFE8] text-[#6F6A63]"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-base font-bold text-[#1B1A18]">{item.title}</h3>
                <p className="mt-2 text-xs text-[#6F6A63] leading-relaxed">{item.detail}</p>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-[#8E8981] border-t border-[#EAE6DE] pt-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E0533C]" />
                <span>Deterministic check enforced</span>
              </div>
            </div>
          ))}
        </div>

        {/* Simulation Failure Branch Guarantee */}
        <div className="mt-8 rounded-3xl border border-[#E6E1D8] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#E0533C] font-semibold">
                <ShieldAlert className="h-4 w-4" />
                <span>THE SIMULATION GATEWAY</span>
              </div>
              <h4 className="mt-2 text-lg font-bold text-[#1B1A18]">
                What happens when an on-chain condition fails?
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-[#6F6A63] leading-relaxed">
                If the pool has insufficient liquidity, token price slipped beyond parameters, or a
                reentrancy lock triggers, KeeperHub catches the simulation revert before transaction
                broadcast. The execution marks as <code className="text-[#1B1A18] bg-[#F3EFE8] px-1 py-0.5 rounded font-mono text-xs">SIMULATION_FAILED</code> and halts. Zero gas is spent on-chain.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-orange-200 bg-orange-50/70 px-5 py-4 font-mono text-xs">
              <div className="text-orange-900 font-bold">&bull; Simulation Revert Guard</div>
              <div className="text-[#6F6A63] mt-1 text-[11px]">No gas spent on reverted attempts</div>
              <div className="text-emerald-700 mt-2 text-[11px] font-semibold">&check; 100% On-Chain Capital Safety</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
