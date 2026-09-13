import { z } from "zod";
import { TriggerType } from "./enums.js";

/**
 * EXTENSIBILITY CONTRACT — Triggers
 * Adding a trigger type = add an enum literal (enums.ts) + a schema
 * variant here + a handler in apps/backend/src/monitor/triggers. The
 * monitoring engine resolves handlers by `type` and never branches on
 * trigger logic itself.
 */

export const ManualTriggerConfigSchema = z.object({ type: z.literal(TriggerType.MANUAL) });

export const ScheduleTriggerConfigSchema = z.object({
  type: z.literal(TriggerType.SCHEDULE),
  cronExpression: z.string().min(9),
  timezone: z.string().default("UTC"),
});

export const WalletReceivesFundsTriggerConfigSchema = z.object({
  type: z.literal(TriggerType.WALLET_RECEIVES_FUNDS),
  tokenAddress: z.string().default("NATIVE"),
});

export const TokenApprovalDetectedTriggerConfigSchema = z.object({
  type: z.literal(TriggerType.TOKEN_APPROVAL_DETECTED),
  tokenAddress: z.string().optional(),
});

export const TriggerConfigSchema = z.discriminatedUnion("type", [
  ManualTriggerConfigSchema,
  ScheduleTriggerConfigSchema,
  WalletReceivesFundsTriggerConfigSchema,
  TokenApprovalDetectedTriggerConfigSchema,
]);
export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;

// ---------- Condition (attached to a Trigger row) ----------

export const ThresholdConditionConfigSchema = z.object({
  operator: z.enum([
    "GREATER_THAN",
    "GREATER_THAN_OR_EQUAL",
    "LESS_THAN",
    "LESS_THAN_OR_EQUAL",
    "EQUAL",
    "NOT_EQUAL",
  ]),
  value: z.string(),
});

export const UnlimitedApprovalConditionConfigSchema = z.object({
  operator: z.literal("IS_UNLIMITED"),
});

export const AlwaysConditionConfigSchema = z.object({
  operator: z.literal("ALWAYS"),
});

export const ConditionConfigSchema = z.union([
  ThresholdConditionConfigSchema,
  UnlimitedApprovalConditionConfigSchema,
  AlwaysConditionConfigSchema,
]);
export type ConditionConfig = z.infer<typeof ConditionConfigSchema>;
