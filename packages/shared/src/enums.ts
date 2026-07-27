export const TriggerType = {
  MANUAL: "MANUAL",
  SCHEDULE: "SCHEDULE",
  WALLET_RECEIVES_FUNDS: "WALLET_RECEIVES_FUNDS",
  TOKEN_APPROVAL_DETECTED: "TOKEN_APPROVAL_DETECTED",
} as const;
export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

export const ActionType = {
  TRANSFER_TOKENS: "TRANSFER_TOKENS",
  SWAP_TOKENS: "SWAP_TOKENS",
  REVOKE_APPROVAL: "REVOKE_APPROVAL",
} as const;
export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export const ConditionOperator = {
  GREATER_THAN: "GREATER_THAN",
  GREATER_THAN_OR_EQUAL: "GREATER_THAN_OR_EQUAL",
  LESS_THAN: "LESS_THAN",
  LESS_THAN_OR_EQUAL: "LESS_THAN_OR_EQUAL",
  EQUAL: "EQUAL",
  NOT_EQUAL: "NOT_EQUAL",
  IS_UNLIMITED: "IS_UNLIMITED",
  ALWAYS: "ALWAYS",
} as const;
export type ConditionOperator = (typeof ConditionOperator)[keyof typeof ConditionOperator];

export const WorkflowStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  DRAFT: "DRAFT",
} as const;
export type WorkflowStatus = (typeof WorkflowStatus)[keyof typeof WorkflowStatus];

export const ExecutionStatus = {
  PENDING: "PENDING",
  SIMULATING: "SIMULATING",
  SIMULATION_FAILED: "SIMULATION_FAILED",
  ESTIMATING_GAS: "ESTIMATING_GAS",
  SUBMITTED: "SUBMITTED",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
  RETRYING: "RETRYING",
} as const;
export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

export const AuditEventType = {
  WORKFLOW_CREATED: "WORKFLOW_CREATED",
  WORKFLOW_UPDATED: "WORKFLOW_UPDATED",
  WORKFLOW_DELETED: "WORKFLOW_DELETED",
  WORKFLOW_ENABLED: "WORKFLOW_ENABLED",
  WORKFLOW_DISABLED: "WORKFLOW_DISABLED",
  EXECUTION_STARTED: "EXECUTION_STARTED",
  EXECUTION_SUCCEEDED: "EXECUTION_SUCCEEDED",
  EXECUTION_FAILED: "EXECUTION_FAILED",
  RETRY_ATTEMPT: "RETRY_ATTEMPT",
  WALLET_CONNECTED: "WALLET_CONNECTED",
} as const;
export type AuditEventType = (typeof AuditEventType)[keyof typeof AuditEventType];

export const NotificationType = {
  WORKFLOW_TRIGGERED: "WORKFLOW_TRIGGERED",
  EXECUTION_CONFIRMED: "EXECUTION_CONFIRMED",
  EXECUTION_FAILED: "EXECUTION_FAILED",
  APPROVAL_DETECTED: "APPROVAL_DETECTED",
  SYSTEM: "SYSTEM",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const ChainId = {
  ETHEREUM_MAINNET: 1,
  SEPOLIA: 11155111,
  BASE: 8453,
  BASE_SEPOLIA: 84532,
} as const;
export type ChainId = (typeof ChainId)[keyof typeof ChainId];
