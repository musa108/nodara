"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, ArrowDownToLine, ShieldAlert, Send, Repeat, ShieldOff, ChevronLeft, Check, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateWorkflow } from "@/hooks/useWorkflows";
import { useWallets } from "@/hooks/useWallets";
import { TriggerType, ActionType, type CreateWorkflowInput } from "@nodara/shared";
import { cn } from "@/utils/cn";
import { useAccount } from "wagmi";

type Step = "trigger" | "configure-trigger" | "action" | "configure-action" | "review";

const TRIGGER_OPTIONS = [
  { type: TriggerType.MANUAL, label: "Manual", description: "Fire on demand from the dashboard.", icon: Zap },
  { type: TriggerType.SCHEDULE, label: "Scheduled Time", description: "Cron-based recurring trigger.", icon: Clock },
  { type: TriggerType.WALLET_RECEIVES_FUNDS, label: "Wallet Receives Funds", description: "Fires when funds arrive.", icon: ArrowDownToLine },
  { type: TriggerType.TOKEN_APPROVAL_DETECTED, label: "Token Approval Detected", description: "Fires on a new ERC-20 approval.", icon: ShieldAlert },
];

const ACTION_OPTIONS = [
  { type: ActionType.TRANSFER_TOKENS, label: "Transfer Tokens", description: "Send tokens to another address.", icon: Send },
  { type: ActionType.SWAP_TOKENS, label: "Swap Tokens", description: "Swap one token for another.", icon: Repeat },
  { type: ActionType.REVOKE_APPROVAL, label: "Revoke Approval", description: "Set an allowance to zero.", icon: ShieldOff },
];

const STEP_ORDER: Step[] = ["trigger", "configure-trigger", "action", "configure-action", "review"];

// WHEN / IF / THEN framing for each step, so the builder reads as plain
// English before it reads as a form — matches how the pipeline actually
// executes (trigger -> condition -> action).
const STEP_CLAUSE: Record<Step, string> = {
  trigger: "WHEN",
  "configure-trigger": "WHEN",
  action: "THEN",
  "configure-action": "THEN",
  review: "REVIEW",
};

export default function NewWorkflowPage() {
  const router = useRouter();
  const { data: wallets } = useWallets();
  const createWorkflow = useCreateWorkflow();
  const { chainId } = useAccount();

  const [step, setStep] = useState<Step>("trigger");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  // Trigger config fields
  const [cronExpression, setCronExpression] = useState("0 10 * * FRI");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [receivesTokenAddress, setReceivesTokenAddress] = useState("NATIVE");
  const [approvalTokenAddress, setApprovalTokenAddress] = useState("");

  // Condition fields
  const [conditionOperator, setConditionOperator] = useState<
    "GREATER_THAN" | "GREATER_THAN_OR_EQUAL" | "LESS_THAN" | "LESS_THAN_OR_EQUAL" | "EQUAL" | "NOT_EQUAL"
  >("GREATER_THAN");
  const [conditionValue, setConditionValue] = useState("2.0");

  // Action config fields
  const [transferToken, setTransferToken] = useState("NATIVE");
  const [transferDestination, setTransferDestination] = useState("COLD_WALLET");
  const [transferAmountMode, setTransferAmountMode] = useState<"FIXED" | "EXCESS" | "ALL">("EXCESS");
  const [transferFixedAmount, setTransferFixedAmount] = useState("10");
  const [revokeToken, setRevokeToken] = useState("");
  const [revokeSpender, setRevokeSpender] = useState("");
  const [swapFrom, setSwapFrom] = useState("");
  const [swapTo, setSwapTo] = useState("");
  const [swapAmount, setSwapAmount] = useState("10");

  const primaryWallet =
    wallets?.find((w) => w.chainId === chainId) ??
    wallets?.find((w) => w.isPrimary) ??
    wallets?.[0];

  function goNext() {
    const idx = STEP_ORDER.indexOf(step);
    setStep(STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)]!);
  }
  function goBack() {
    const idx = STEP_ORDER.indexOf(step);
    setStep(STEP_ORDER[Math.max(idx - 1, 0)]!);
  }

  function buildTriggerConfig() {
    switch (triggerType) {
      case TriggerType.SCHEDULE:
        return { type: TriggerType.SCHEDULE, cronExpression, timezone } as const;
      case TriggerType.WALLET_RECEIVES_FUNDS:
        return { type: TriggerType.WALLET_RECEIVES_FUNDS, tokenAddress: receivesTokenAddress } as const;
      case TriggerType.TOKEN_APPROVAL_DETECTED:
        return { type: TriggerType.TOKEN_APPROVAL_DETECTED, tokenAddress: approvalTokenAddress || undefined } as const;
      default:
        return { type: TriggerType.MANUAL } as const;
    }
  }

  function buildConditionConfig() {
    if (triggerType === TriggerType.TOKEN_APPROVAL_DETECTED) return { operator: "IS_UNLIMITED" } as const;
    if (triggerType === TriggerType.MANUAL || triggerType === TriggerType.SCHEDULE) return { operator: "ALWAYS" } as const;
    return { operator: conditionOperator, value: conditionValue } as const;
  }

  function buildActionConfig() {
    switch (actionType) {
      case ActionType.TRANSFER_TOKENS:
        return {
          type: ActionType.TRANSFER_TOKENS,
          tokenAddress: transferToken,
          destinationAddress: transferDestination,
          amountMode: transferAmountMode,
          fixedAmount: transferAmountMode === "FIXED" ? transferFixedAmount : undefined,
        } as const;
      case ActionType.REVOKE_APPROVAL:
        return { type: ActionType.REVOKE_APPROVAL, tokenAddress: revokeToken, spenderAddress: revokeSpender } as const;
      case ActionType.SWAP_TOKENS:
        return {
          type: ActionType.SWAP_TOKENS,
          fromTokenAddress: swapFrom,
          toTokenAddress: swapTo,
          amountMode: "FIXED",
          fixedAmount: swapAmount,
          maxSlippageBps: 100,
        } as const;
      default:
        return null;
    }
  }

  async function handleSave() {
    if (!primaryWallet || !triggerType || !actionType) return;
    const input: CreateWorkflowInput = {
      name: name || "Untitled workflow",
      description: description || undefined,
      walletId: primaryWallet.id,
      trigger: buildTriggerConfig(),
      condition: buildConditionConfig(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      action: buildActionConfig()!,
      enabled: true,
    };
    await createWorkflow.mutateAsync(input);
    router.push("/workflows");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        {step !== "trigger" && (
          <Button variant="ghost" size="icon" onClick={goBack} aria-label="Back">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New Workflow</h1>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">{STEP_CLAUSE[step]}</span> a trigger happens, evaluate a condition, then run an action.
          </p>
        </div>
      </div>

      <div className="flex gap-1.5">
        {STEP_ORDER.map((s) => (
          <div key={s} className={cn("h-1 flex-1 rounded-full", STEP_ORDER.indexOf(step) >= STEP_ORDER.indexOf(s) ? "bg-primary" : "bg-secondary")} />
        ))}
      </div>

      {step === "trigger" && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">When…</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TRIGGER_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.type}
                {...opt}
                selected={triggerType === opt.type}
                onClick={() => {
                  setTriggerType(opt.type);
                  goNext();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {step === "configure-trigger" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            {triggerType === TriggerType.SCHEDULE && (
              <>
                <Field label="Timezone">
                  <Select
                    value={timezone}
                    onChange={setTimezone}
                    options={[
                      { value: "Africa/Lagos", label: "Africa/Lagos (WAT)" },
                      { value: "UTC", label: "UTC" },
                    ]}
                  />
                </Field>
                <Field label={`Cron expression (${timezone})`}>
                  <Input value={cronExpression} onChange={setCronExpression} placeholder="40 14 * * *" />
                </Field>
              </>
            )}
            {triggerType === TriggerType.WALLET_RECEIVES_FUNDS && (
              <>
                <Field label="Token address (or NATIVE)">
                  <Input value={receivesTokenAddress} onChange={setReceivesTokenAddress} placeholder="NATIVE" />
                </Field>
                <Field label="If the amount is…">
                  <div className="flex gap-2">
                    <Select value={conditionOperator} onChange={(v) => setConditionOperator(v as typeof conditionOperator)} options={OPERATOR_OPTIONS} />
                    <Input value={conditionValue} onChange={setConditionValue} placeholder="2.0" />
                  </div>
                </Field>
              </>
            )}
            {triggerType === TriggerType.TOKEN_APPROVAL_DETECTED && (
              <Field label="Token address (optional — leave blank to watch all tokens)">
                <Input value={approvalTokenAddress} onChange={setApprovalTokenAddress} placeholder="0x…" />
              </Field>
            )}
            {triggerType === TriggerType.MANUAL && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Manual triggers run instantly when you click "Run now" — nothing to configure.
                </p>
              </div>
            )}
            <Button onClick={goNext} className="w-full">
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "action" && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Then…</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ACTION_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.type}
                {...opt}
                selected={actionType === opt.type}
                onClick={() => {
                  setActionType(opt.type);
                  goNext();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {step === "configure-action" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            {actionType === ActionType.TRANSFER_TOKENS && (
              <>
                <Field label="Token address (or NATIVE)">
                  <Input value={transferToken} onChange={setTransferToken} placeholder="NATIVE" />
                </Field>
                <Field label="Destination (address or COLD_WALLET)">
                  <Input value={transferDestination} onChange={setTransferDestination} placeholder="COLD_WALLET" />
                </Field>
                <Field label="Amount mode">
                  <Select
                    value={transferAmountMode}
                    onChange={(v) => setTransferAmountMode(v as typeof transferAmountMode)}
                    options={[
                      { value: "EXCESS", label: "Excess above threshold" },
                      { value: "ALL", label: "All triggered amount" },
                      { value: "FIXED", label: "Fixed amount" },
                    ]}
                  />
                </Field>
                {transferAmountMode === "FIXED" && (
                  <Field label="Fixed amount">
                    <Input value={transferFixedAmount} onChange={setTransferFixedAmount} placeholder="10" />
                  </Field>
                )}
              </>
            )}
            {actionType === ActionType.REVOKE_APPROVAL && (
              <>
                <Field label="Token address">
                  <Input value={revokeToken} onChange={setRevokeToken} placeholder="0x…" />
                </Field>
                <Field label="Spender address">
                  <Input value={revokeSpender} onChange={setRevokeSpender} placeholder="0x…" />
                </Field>
              </>
            )}
            {actionType === ActionType.SWAP_TOKENS && (
              <>
                <Field label="From token address">
                  <Input value={swapFrom} onChange={setSwapFrom} placeholder="0x…" />
                </Field>
                <Field label="To token address">
                  <Input value={swapTo} onChange={setSwapTo} placeholder="0x…" />
                </Field>
                <Field label="Amount">
                  <Input value={swapAmount} onChange={setSwapAmount} placeholder="10" />
                </Field>
              </>
            )}
            <Button onClick={goNext} className="w-full">
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "review" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Field label="Workflow name">
              <Input value={name} onChange={setName} placeholder="Sweep excess ETH to cold wallet" />
            </Field>
            <Field label="Description (optional)">
              <Input value={description} onChange={setDescription} placeholder="What does this workflow do?" />
            </Field>

            <div className="space-y-2 rounded-md border border-border bg-secondary/40 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">When</span>
                <span className="font-medium">{triggerType?.replaceAll("_", " ")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Then</span>
                <span className="font-medium">{actionType?.replaceAll("_", " ")}</span>
              </div>
              {!primaryWallet && (
                <p className="flex items-center gap-1.5 pt-1 text-warning">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Connect a wallet before saving.
                </p>
              )}
              {primaryWallet && primaryWallet.chainId !== chainId && (
                <p className="flex items-center gap-1.5 pt-1 text-warning">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  This workflow will be created on chain {primaryWallet.chainId}, which doesn't match your
                  currently connected network ({chainId}). Switch networks or sign in again on this chain.
                </p>
              )}
            </div>

            <Button onClick={handleSave} disabled={!primaryWallet || createWorkflow.isPending} className="w-full">
              <Check className="h-4 w-4" />
              {createWorkflow.isPending ? "Saving…" : "Save Workflow"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const OPERATOR_OPTIONS = [
  { value: "GREATER_THAN", label: "greater than" },
  { value: "GREATER_THAN_OR_EQUAL", label: "greater than or equal to" },
  { value: "LESS_THAN", label: "less than" },
  { value: "LESS_THAN_OR_EQUAL", label: "less than or equal to" },
  { value: "EQUAL", label: "equal to" },
  { value: "NOT_EQUAL", label: "not equal to" },
];

function OptionCard({
  label,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className={cn("h-full transition-colors hover:border-primary/50", selected && "border-primary bg-primary/5")}>
        <CardContent className="flex items-start gap-3 pt-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15">
            <Icon className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
