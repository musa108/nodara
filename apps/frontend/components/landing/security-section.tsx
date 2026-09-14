"use client";

import { Lock, EyeOff, KeyRound, Database, FileCheck } from "lucide-react";

const PRINCIPLES = [
  {
    icon: Lock,
    title: "Non-Custodial Architecture",
    description:
      "Nodara never holds custody of your assets. Workflows interact via direct wallet approvals or execution keys with constrained allowances that you control and can revoke at any time.",
    metric: "0 user assets held",
  },
  {
    icon: EyeOff,
    title: "Read-Only Blockchain Access",
    description:
      "The @nodara/blockchain package is read-only by construction. It queries balances, token allowances, and logs using public RPCs without ever touching or importing private keys.",
    metric: "Zero private keys in scanner",
  },
  {
    icon: KeyRound,
    title: "Isolated Execution Authority",
    description:
      "Only the designated KeeperHub service possesses authority to submit state-changing transactions. No other service or background poller can bypass this single gateway.",
    metric: "Single execution choke-point",
  },
  {
    icon: Database,
    title: "Deterministic Idempotency",
    description:
      "Every execution key is cryptographically derived from the workflow ID and block evidence. Even if background pollers crash and replay blocks, a transaction can never execute twice.",
    metric: "Replay-proof by design",
  },
  {
    icon: FileCheck,
    title: "Append-Only Audit Trail",
    description:
      "Every state change, simulation run, gas estimate, and confirmation receipt is permanently recorded in an append-only audit log with immutable timestamps.",
    metric: "100% auditable history",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-20 sm:py-28 bg-[#FBF9F5] border-b border-[#E6E1D8]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center mb-3">
            <span className="text-[#E0533C] text-2xl font-serif select-none">✱</span>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#E0533C] font-semibold">
            Security &amp; Boundaries
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1A18] leading-[1.1]">
            Built to execute.
            <br />
            <span className="text-[#6F6A63]">Not to take custody.</span>
          </h2>
          <p className="mt-5 text-base text-[#6F6A63] leading-relaxed text-balance">
            Security is not an afterthought or an insurance policy. It is structurally enforced in the
            package architecture, module boundaries, and execution pipeline.
          </p>
        </div>

        {/* Security Pillars */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="flex flex-col justify-between rounded-3xl border border-[#E6E1D8] bg-white p-7 shadow-2xs hover:shadow-md hover:border-[#E0533C]/40 transition-all"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#E0533C]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-[#1B1A18]">{principle.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#6F6A63] leading-relaxed">
                    {principle.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-[#EAE6DE] pt-3.5">
                  <span className="font-mono text-xs font-semibold text-[#E0533C]">
                    &bull; {principle.metric}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
