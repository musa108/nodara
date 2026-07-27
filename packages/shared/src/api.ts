import { z } from "zod";
import type {
  ActionType,
  AuditEventType,
  ExecutionStatus,
  NotificationType,
  TriggerType,
  WorkflowStatus,
} from "./enums.js";

export const ConnectWalletSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM address"),
  chainId: z.number().int().positive(),
  signature: z.string(),
  message: z.string(),
});
export type ConnectWalletInput = z.infer<typeof ConnectWalletSchema>;

export interface WalletDTO {
  id: string;
  address: string;
  chainId: number;
  coldWalletAddress: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface WorkflowDTO {
  id: string;
  walletId: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  enabled: boolean;
  triggerType: TriggerType;
  triggerConfig: unknown;
  conditionConfig: unknown;
  actionType: ActionType;
  actionConfig: unknown;
  lastEvaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionDTO {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  triggerSnapshot: unknown;
  simulationResult: unknown;
  gasEstimate: unknown;
  transactionHash: string | null;
  keeperHubJobId: string | null;
  errorMessage: string | null;
  attempt: number;
  durationMs: number | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
}

export const ManualTriggerRequestSchema = z.object({ workflowId: z.string().cuid() });
export type ManualTriggerRequest = z.infer<typeof ManualTriggerRequestSchema>;

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogDTO {
  id: string;
  userId: string;
  walletId: string | null;
  workflowId: string | null;
  executionId: string | null;
  eventType: AuditEventType;
  metadata: unknown;
  createdAt: string;
}

export interface AnalyticsSummaryDTO {
  totalWorkflows: number;
  activeWorkflows: number;
  successfulExecutions: number;
  failedExecutions: number;
  executionsLast7Days: { date: string; count: number }[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}
export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
