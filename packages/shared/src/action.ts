import { z } from "zod";
import { ActionType } from "./enums.js";

/**
 * EXTENSIBILITY CONTRACT — Actions
 * Same pattern as triggers: add an enum literal + a schema variant here +
 * a handler in apps/backend/src/keeperhub/actions (builds the unsigned
 * tx). The execution engine never hardcodes action logic.
 */

export const TransferTokensActionConfigSchema = z.object({
  type: z.literal(ActionType.TRANSFER_TOKENS),
  tokenAddress: z.string().default("NATIVE"),
  /** A concrete address, or the sentinel "COLD_WALLET" to resolve at execution time. */
  destinationAddress: z.string(),
  amountMode: z.enum(["FIXED", "EXCESS", "ALL"]).default("FIXED"),
  fixedAmount: z.string().optional(),
});

export const RevokeApprovalActionConfigSchema = z.object({
  type: z.literal(ActionType.REVOKE_APPROVAL),
  tokenAddress: z.string(),
  spenderAddress: z.string(),
});

export const SwapTokensActionConfigSchema = z.object({
  type: z.literal(ActionType.SWAP_TOKENS),
  fromTokenAddress: z.string(),
  toTokenAddress: z.string(),
  amountMode: z.enum(["FIXED", "ALL"]).default("FIXED"),
  fixedAmount: z.string().optional(),
  maxSlippageBps: z.number().int().min(1).max(2000).default(100),
});

export const ActionConfigSchema = z.discriminatedUnion("type", [
  TransferTokensActionConfigSchema,
  RevokeApprovalActionConfigSchema,
  SwapTokensActionConfigSchema,
]);
export type ActionConfig = z.infer<typeof ActionConfigSchema>;
