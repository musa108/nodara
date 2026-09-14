"use client";

import { useState } from "react";
import { Check, Copy, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const CODE_EXAMPLES = {
  typescript: `import { TriggerType, ActionType, ConditionOperator } from "@nodara/shared";

// Programmatic Nodara Workflow Definition
export const treasurySweepWorkflow = {
  name: "Auto-Sweep & Cold Storage Vault",
  walletId: "clw9x0a4b000012345678abcd",
  trigger: {
    type: TriggerType.WALLET_RECEIVES_FUNDS,
    tokenAddress: "NATIVE", // Supports ETH, BOT Chain
  },
  condition: {
    operator: ConditionOperator.GREATER_THAN,
    value: "1000000000000000000", // 1.0 BOT (18 decimals)
  },
  action: {
    type: ActionType.TRANSFER_TOKENS,
    tokenAddress: "NATIVE",
    destinationAddress: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
    amountMode: "FIXED",
    fixedAmount: "500000000000000000", // 0.5 BOT swept
  },
  enabled: true,
};`,
  api: `// POST /api/workflows
curl -X POST https://api.nodara.io/v1/workflows \\
  -H "Authorization: Bearer <JWT_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Revoke Unlimited Approvals",
    "walletId": "clw9x0a4b000012345678abcd",
    "trigger": {
      "type": "TOKEN_APPROVAL_DETECTED"
    },
    "condition": {
      "operator": "IS_UNLIMITED"
    },
    "action": {
      "type": "REVOKE_APPROVAL",
      "tokenAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "spenderAddress": "0x1111111254EEB25477B68fb85Ed929f73A960582"
    }
  }'`,
};

export function DeveloperSection() {
  const [activeTab, setActiveTab] = useState<"typescript" | "api">("typescript");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_EXAMPLES[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="py-20 sm:py-28 bg-[#FBF9F5] border-b border-[#E6E1D8]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center mb-3">
            <span className="text-[#E0533C] text-2xl font-serif select-none">✱</span>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#E0533C] font-semibold">
            Developer Primitives
          </span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1B1A18] leading-[1.1]">
            Automation without hiding the infrastructure.
          </h2>
          <p className="mt-5 text-base text-[#6F6A63] leading-relaxed text-balance">
            Every trigger and action is defined with strict Zod schemas in <code className="text-[#1B1A18] bg-[#F3EFE8] px-1.5 py-0.5 rounded font-mono text-xs">@nodara/shared</code>.
            Compose, version-control, and trigger workflows via typed APIs.
          </p>
        </div>

        {/* Code Editor Container */}
        <div className="mt-16 mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#E6E1D8] bg-[#1C1C1F] text-white shadow-xl">
          {/* Editor Header Bar */}
          <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#25262A] px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("typescript")}
                className={`rounded-full px-3.5 py-1 font-mono text-xs font-semibold transition-colors ${
                  activeTab === "typescript"
                    ? "bg-[#1C1C1F] text-white shadow-sm border border-white/15"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                workflow.schema.ts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("api")}
                className={`rounded-full px-3.5 py-1 font-mono text-xs font-semibold transition-colors ${
                  activeTab === "api"
                    ? "bg-[#1C1C1F] text-white shadow-sm border border-white/15"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                cURL Dispatch
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-mono text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Editor Body */}
          <div className="p-5 sm:p-7 overflow-x-auto bg-[#18191B]">
            <pre className="font-mono text-xs leading-relaxed text-gray-200">
              <code>{CODE_EXAMPLES[activeTab]}</code>
            </pre>
          </div>

          {/* Footer Bar with Documentation Link */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 bg-[#25262A] px-6 py-3.5 text-xs font-mono text-gray-400">
            <span>Package: @nodara/shared &bull; Zero external runtime deps</span>
            <div className="flex items-center gap-4">
              <Link href="/workflows/new" className="text-[#E0533C] hover:text-[#ff6d54] inline-flex items-center gap-1 font-bold">
                <span>Create via UI Builder</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
