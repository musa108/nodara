"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, ArrowDownToLine, ShieldAlert, Send, Repeat, ShieldOff, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateWorkflow } from "@/hooks/useWorkflows";
import { useWallets } from "@/hooks/useWallets";
import { TriggerType, ActionType, type CreateWorkflowInput } from "@nodara/shared";
import { cn } from "@/utils/cn";

type Step = "trigger" | "configure-trigger" | "action" | "configure-action" | "review";

const TRIGGER_OPTIONS = [
  { type: TriggerType.MANUAL, label: "Manual", description: "Fire on demand from a button.", icon: Zap },
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

export default function NewWorkflowPage() {
  const router = useRouter();
  const { data: wallets } = useWallets();
  const createWorkflow = useCreateWorkflow();

  const [step, setStep] = useState<Step>("trigger");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  // Trigger config fields
  const [cronExpression, setCronExpression] = useState("0 10 * * FRI");
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

  const primaryWallet = wallets?.find((w) => w.isPrimary) ?? wallets?.[0];

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
        return { type: TriggerType.SCHEDULE, cronExpression, timezone: "UTC" } as const;
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
      {/* Page Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border/40">
        {step !== "trigger" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={goBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Workflows</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground">New</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Create Workflow</h1>
          <p className="text-xs font-medium text-muted-foreground/90">Design automated rules for executing on-chain actions.</p>
        </div>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex gap-2 bg-card border border-border/40 p-2 rounded-2xl shadow-subtle">
        {STEP_ORDER.map((s, index) => {
          const isCompleted = STEP_ORDER.indexOf(step) >= index;
          return (
            <div key={s} className="flex-1 space-y-1">
              <div className={cn("h-1.5 rounded-full transition-all duration-300", isCompleted ? "bg-primary" : "bg-muted")} />
              <span className={cn("hidden sm:block text-[9px] uppercase tracking-wider font-bold text-center", isCompleted ? "text-primary" : "text-muted-foreground/80")}>
                {s.replace("-", " ")}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="space-y-6">
        {step === "trigger" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        )}

        {step === "configure-trigger" && (
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardContent className="space-y-5 pt-6">
              {triggerType === TriggerType.SCHEDULE && (
                <Field label="Cron expression (UTC)">
                  <Input value={cronExpression} onChange={setCronExpression} placeholder="0 10 * * FRI" />
                </Field>
              )}
              {triggerType === TriggerType.WALLET_RECEIVES_FUNDS && (
                <>
                  <Field label="Token address (or NATIVE)">
                    <Input value={receivesTokenAddress} onChange={setReceivesTokenAddress} placeholder="NATIVE" />
                  </Field>
                  <Field label="Condition">
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
                <div className="text-center py-4 space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Zap className="h-6 w-6" />
                  </div>
                  <p className="text-xs text-muted-foreground/90 max-w-sm mx-auto leading-relaxed">
                    Manual triggers run instantly when clicked from the workflow list — no additional parameters are required.
                  </p>
                </div>
              )}
              <Button onClick={goNext} className="w-full h-11 rounded-xl font-bold text-sm shadow-sm transition-all mt-4">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "action" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        )}

        {step === "configure-action" && (
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardContent className="space-y-5 pt-6">
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
              <Button onClick={goNext} className="w-full h-11 rounded-xl font-bold text-sm shadow-sm transition-all mt-4">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "review" && (
          <Card className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
            <CardContent className="space-y-5 pt-6">
              <Field label="Workflow name">
                <Input value={name} onChange={setName} placeholder="Sweep excess ETH to cold wallet" />
              </Field>
              <Field label="Description (optional)">
                <Input value={description} onChange={setDescription} placeholder="What does this workflow do?" />
              </Field>
              
              <div className="rounded-xl border border-border/40 bg-muted/20 p-4.5 text-xs font-semibold text-muted-foreground/95 space-y-2">
                <p className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span>Trigger Configuration</span>
                  <span className="text-foreground bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                    {triggerType?.replaceAll("_", " ")}
                  </span>
                </p>
                <p className="flex justify-between items-center">
                  <span>Action Execution</span>
                  <span className="text-foreground bg-card border border-border/60 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                    {actionType?.replaceAll("_", " ")}
                  </span>
                </p>
                {!primaryWallet && (
                  <p className="mt-3 text-center text-warning bg-warning/5 border border-warning/10 p-2.5 rounded-lg font-bold">
                    No wallet connected — connect a wallet in the header before saving.
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleSave}
                disabled={!primaryWallet || createWorkflow.isPending}
                className="w-full h-11 rounded-xl font-bold text-sm shadow-sm transition-all mt-4"
              >
                <Check className="mr-1.5 h-4.5 w-4.5" />
                {createWorkflow.isPending ? "Saving…" : "Save Workflow"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
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
    <button type="button" onClick={onClick} className="text-left w-full group outline-none">
      <Card className={cn(
        "h-full border border-border/40 shadow-premium transition-all rounded-2xl overflow-hidden cursor-pointer",
        selected
          ? "border-primary bg-primary/5 shadow-md scale-[1.01]"
          : "hover:border-primary/20 hover:bg-card/50"
      )}>
        <CardContent className="flex items-start gap-4 pt-6 p-5">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all",
            selected
              ? "bg-primary text-white border-transparent"
              : "bg-primary/5 border-primary/10 text-primary group-hover:bg-primary/10"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/90 leading-relaxed">{description}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/90">{label}</label>
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
      className="flex h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs font-medium outline-none shadow-inner transition-all focus:border-primary focus:ring-1 focus:ring-primary"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold outline-none shadow-inner transition-all focus:border-primary focus:ring-1 focus:ring-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
