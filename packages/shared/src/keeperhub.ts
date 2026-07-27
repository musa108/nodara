import { z } from "zod";
import { ExecutionStatus } from "./enums.js";

export const UnsignedTxSchema = z.object({
  chainId: z.number().int().positive(),
  from: z.string(),
  to: z.string(),
  data: z.string(),
  value: z.string().default("0"),
});
export type UnsignedTx = z.infer<typeof UnsignedTxSchema>;

export const SimulationRequestSchema = z.object({
  chainId: z.number().int().positive(),
  tx: UnsignedTxSchema,
  workflowId: z.string().cuid(),
});
export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;

export const SimulationResultSchema = z.object({
  success: z.boolean(),
  revertReason: z.string().nullable().default(null),
  simulatedGasUsed: z.string().nullable().default(null),
  stateChanges: z.array(z.record(z.string(), z.unknown())).default([]),
  raw: z.unknown().optional(),
});
export type SimulationResult = z.infer<typeof SimulationResultSchema>;

export const GasEstimateSchema = z.object({
  gasLimit: z.string(),
  maxFeePerGas: z.string(),
  maxPriorityFeePerGas: z.string(),
  estimatedCostWei: z.string(),
  estimatedCostNative: z.string(),
});
export type GasEstimate = z.infer<typeof GasEstimateSchema>;

export const SubmissionRequestSchema = z.object({
  chainId: z.number().int().positive(),
  tx: UnsignedTxSchema,
  gas: GasEstimateSchema,
  workflowId: z.string().cuid(),
  executionId: z.string().cuid(),
  idempotencyKey: z.string(),
});
export type SubmissionRequest = z.infer<typeof SubmissionRequestSchema>;

export const SubmissionResultSchema = z.object({
  keeperHubJobId: z.string(),
  transactionHash: z.string().nullable(),
  status: z.enum([ExecutionStatus.SUBMITTED, ExecutionStatus.FAILED]),
});
export type SubmissionResult = z.infer<typeof SubmissionResultSchema>;

export const TrackingResultSchema = z.object({
  keeperHubJobId: z.string(),
  transactionHash: z.string().nullable(),
  status: z.enum([ExecutionStatus.SUBMITTED, ExecutionStatus.CONFIRMED, ExecutionStatus.FAILED]),
  blockNumber: z.number().int().nonnegative().nullable().default(null),
  gasUsed: z.string().nullable().default(null),
  effectiveGasPrice: z.string().nullable().default(null),
  errorMessage: z.string().nullable().default(null),
  confirmedAt: z.string().datetime().nullable().default(null),
});
export type TrackingResult = z.infer<typeof TrackingResultSchema>;

/** Full KeeperHub-side audit trail for a job — surfaced via getAuditTrail(). */
export const KeeperHubAuditEntrySchema = z.object({
  timestamp: z.string().datetime(),
  stage: z.string(),
  message: z.string(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type KeeperHubAuditEntry = z.infer<typeof KeeperHubAuditEntrySchema>;
