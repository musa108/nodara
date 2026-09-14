"use client";

import { ArrowUpRight, Cpu, CheckCircle2 } from "lucide-react";

export function BotChainSection() {
  return (
    <section id="botchain" className="py-20 sm:py-28 bg-[#FAF8F4] border-b border-[#E6E1D8]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-mono text-emerald-800 font-semibold mb-4">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>MAINNET INTEGRATION ACTIVE</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1A18] leading-[1.1]">
            Now running on BOT Chain Mainnet.
          </h2>

          <p className="mt-5 text-base text-[#6F6A63] leading-relaxed text-balance">
            Nodara natively supports BOT Chain as a first-class EVM execution environment. Every workflow
            execution can be anchored directly on-chain through the Nodara Execution Registry.
          </p>
        </div>

        {/* Integration Details Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Chain Metadata & Registry Architecture */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#E6E1D8] bg-white p-6 sm:p-8 shadow-sm lg:col-span-7">
            <div>
              <div className="flex items-center justify-between border-b border-[#EAE6DE] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1B1A18]">BOT Chain Native Specification</h3>
                    <p className="text-xs font-mono text-[#6F6A63]">ChainList ID: 677 &bull; EVM Layer 1</p>
                  </div>
                </div>

                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-[#E6E1D8] bg-[#F7F4EE] px-3 py-1 text-xs font-mono text-[#1B1A18] hover:bg-white transition-colors"
                >
                  <span>BOTScan</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs font-mono sm:grid-cols-3">
                <div className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F4] p-3.5">
                  <div className="text-[10px] text-[#6F6A63] font-bold">CHAIN ID</div>
                  <div className="mt-1 text-base font-bold text-[#1B1A18]">677</div>
                </div>
                <div className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F4] p-3.5">
                  <div className="text-[10px] text-[#6F6A63] font-bold">CURRENCY</div>
                  <div className="mt-1 text-base font-bold text-[#1B1A18]">BOT (18 dec)</div>
                </div>
                <div className="rounded-2xl border border-[#E6E1D8] bg-[#FAF8F4] p-3.5 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-[#6F6A63] font-bold">RPC ENDPOINT</div>
                  <div className="mt-1 text-xs font-bold text-[#1B1A18] truncate">rpc.botchain.ai</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-mono uppercase tracking-wider text-[#6F6A63] font-bold">
                  NodaraExecutionRegistry Contract Architecture
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-[#6F6A63] leading-relaxed">
                  A minimal, non-custodial, permissionless on-chain log. Any execution firing can record its
                  unique <code className="text-[#1B1A18] bg-[#F3EFE8] px-1.5 py-0.5 rounded font-mono text-xs">executionId</code> to BOT Chain,
                  creating an immutable, third-party verifiable execution receipt without relying on Nodara&apos;s
                  internal PostgreSQL database.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-[#E6E1D8] bg-[#FAF8F4] p-4 font-mono text-xs">
              <div className="text-[#6F6A63] text-[11px] mb-2 flex items-center justify-between">
                <span className="font-semibold">Solidity Interface (`NodaraExecutionRegistry.sol`)</span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">Non-payable / Non-custodial</span>
              </div>
              <pre className="overflow-x-auto text-[11px] text-[#1B1A18] font-mono leading-relaxed">
{`function recordExecution(bytes32 workflowId, bytes32 executionId) external;
mapping(bytes32 => bool) public isRecorded;
event WorkflowExecuted(address indexed wallet, bytes32 indexed workflowId, ...);`}
              </pre>
            </div>
          </div>

          {/* Right: On-Chain Verification Flow */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#E6E1D8] bg-white p-6 sm:p-8 shadow-sm lg:col-span-5">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#E0533C] font-bold">
                Verifiable Anchoring
              </span>
              <h3 className="mt-2 text-xl font-bold text-[#1B1A18]">
                From Trigger to BOT Chain Proof
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#6F6A63] leading-relaxed">
                How Nodara transforms off-chain workflow execution into an independently verifiable on-chain record.
              </p>

              {/* Step Sequence */}
              <div className="mt-6 space-y-3 font-mono text-xs">
                <div className="flex items-start gap-3 rounded-2xl border border-[#E6E1D8] bg-[#FAF8F4] p-3.5">
                  <span className="text-[#E0533C] font-bold text-sm">1</span>
                  <div>
                    <div className="font-bold text-[#1B1A18]">Workflow Execution</div>
                    <div className="text-[11px] text-[#6F6A63]">KeeperHub completes off-chain action</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-[#E6E1D8] bg-[#FAF8F4] p-3.5">
                  <span className="text-[#E0533C] font-bold text-sm">2</span>
                  <div>
                    <div className="font-bold text-[#1B1A18]">Execution Registry</div>
                    <div className="text-[11px] text-[#6F6A63]">NodaraExecutionRegistry.recordExecution()</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-[#E6E1D8] bg-[#FAF8F4] p-3.5">
                  <span className="text-[#E0533C] font-bold text-sm">3</span>
                  <div>
                    <div className="font-bold text-[#1B1A18]">BOT Chain Consensus</div>
                    <div className="text-[11px] text-[#6F6A63]">Transaction mined and finalized on Chain 677</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-900">Verifiable On-Chain Record</div>
                    <div className="text-[11px] text-emerald-700">Query isRecorded(executionId) via any RPC</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#EAE6DE] flex items-center justify-between text-xs font-mono">
              <span className="text-[#6F6A63]">Read Deployment Docs:</span>
              <a
                href="https://scan.botchain.ai"
                target="_blank"
                rel="noreferrer"
                className="text-[#E0533C] hover:underline flex items-center gap-1 font-bold"
              >
                <span>View on BOTScan</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
