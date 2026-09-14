"use client";

import { Zap, GitBranch, Send } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "TRIGGER",
    subtitle: "Something happens on-chain",
    description:
      "Nodara's poller continuously sweeps block ranges and event logs every 30 seconds. When an event matches your trigger definition, the workflow activates.",
    icon: Zap,
    color: "text-[#E0533C]",
    bg: "bg-orange-50",
    examples: [
      { label: "WALLET_RECEIVES_FUNDS", desc: "Incoming ETH, BOT, or ERC-20 tokens" },
      { label: "TOKEN_APPROVAL_DETECTED", desc: "Spender allowance exceeds threshold" },
      { label: "SCHEDULE", desc: "Cron or interval timestamp reached" },
      { label: "MANUAL_INVOCATION", desc: "Direct webhook or API dispatch" },
    ],
  },
  {
    number: "02",
    title: "CONDITION",
    subtitle: "Decide whether to act",
    description:
      "Before building a transaction, Nodara queries fresh chain state via read-only viem clients to evaluate your mathematical rules without risking gas.",
    icon: GitBranch,
    color: "text-[#3B82F6]",
    bg: "bg-blue-50",
    examples: [
      { label: "BALANCE_GT", desc: "Native/token balance strictly greater than X" },
      { label: "ALLOWANCE_IS_UNLIMITED", desc: "Spender has infinite token approval" },
      { label: "VALUE_THRESHOLD", desc: "Incoming transaction value >= minimum target" },
      { label: "ALWAYS_EXECUTE", desc: "Pass directly without precondition" },
    ],
  },
  {
    number: "03",
    title: "ACTION",
    subtitle: "Execute automatically",
    description:
      "KeeperHub builds the unsigned payload, simulates state transition, estimates gas, attaches an idempotency key, and broadcasts to the network.",
    icon: Send,
    color: "text-[#10B981]",
    bg: "bg-emerald-50",
    examples: [
      { label: "TRANSFER_TOKENS", desc: "Sweep funds to cold storage or vault" },
      { label: "REVOKE_APPROVAL", desc: "Reset risky spender allowance to zero" },
      { label: "SWAP_TOKENS", desc: "Automate liquidity or token rebalancing" },
      { label: "CALL_CONTRACT", desc: "Execute custom protocol interactions" },
    ],
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#FBF9F5] border-b border-[#E6E1D8]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center mb-3">
            <span className="text-[#E0533C] text-2xl font-serif select-none">✱</span>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#E0533C] font-semibold">
            Architecture Blueprint
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1A18] leading-[1.1]">
            How Nodara works.
          </h2>
          <p className="mt-5 text-base text-[#6F6A63] leading-relaxed text-balance">
            Every Nodara automation is a strictly typed combination of a Trigger, a Condition, and an
            Action. No black boxes, no ambiguous logic.
          </p>
        </div>

        {/* 3-Step Technical Architecture Diagram */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex flex-col justify-between rounded-3xl border border-[#E6E1D8] bg-white p-7 shadow-2xs hover:shadow-md hover:border-[#E0533C]/40 transition-all"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-4xl font-extrabold tracking-tighter text-[#E6E1D8]">
                      {step.number}
                    </span>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${step.bg} ${step.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5">
                    <span className="font-mono text-xs font-bold tracking-wider text-[#E0533C] uppercase">
                      {step.title}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-[#1B1A18]">{step.subtitle}</h3>
                    <p className="mt-3 text-xs sm:text-sm text-[#6F6A63] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Concrete Primitives List */}
                <div className="mt-8 border-t border-[#EAE6DE] pt-5">
                  <div className="text-[11px] font-mono text-[#6F6A63] uppercase tracking-wider mb-3">
                    Supported Schemas
                  </div>
                  <div className="space-y-2">
                    {step.examples.map((ex) => (
                      <div
                        key={ex.label}
                        className="rounded-xl border border-[#EAE6DE] bg-[#FAF8F4] px-3.5 py-2 text-xs transition-colors hover:border-[#E6E1D8]"
                      >
                        <div className="font-mono font-semibold text-[#1B1A18] text-[11px]">
                          {ex.label}
                        </div>
                        <div className="text-[11px] text-[#6F6A63] mt-0.5">
                          {ex.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
