import { workflowRepository, type WorkflowWithParts } from "../repositories/workflow.repository.js";
import { walletService } from "./wallet.service.js";
import { auditLogService } from "./auditLog.service.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import {
  AuditEventType,
  WorkflowStatus,
  TriggerConfigSchema,
  ConditionConfigSchema,
  ActionConfigSchema,
  type CreateWorkflowInput,
  type UpdateWorkflowInput,
  type WorkflowDTO,
} from "@nodara/shared";
import type { Prisma } from "@prisma/client";

function toDTO(workflow: WorkflowWithParts): WorkflowDTO {
  if (!workflow.trigger || !workflow.action) {
    // Every workflow is created with both parts atomically (see
    // workflow.repository.ts), so this only happens if data was corrupted
    // out-of-band — surface it loudly rather than silently guessing.
    throw new Error(`Workflow ${workflow.id} is missing its trigger or action`);
  }
  return {
    id: workflow.id,
    walletId: workflow.walletId,
    name: workflow.name,
    description: workflow.description,
    status: workflow.status,
    enabled: workflow.enabled,
    triggerType: workflow.trigger.type,
    triggerConfig: workflow.trigger.config,
    conditionConfig: workflow.trigger.conditionConfig,
    actionType: workflow.action.type,
    actionConfig: workflow.action.config,
    lastEvaluatedAt: workflow.lastEvaluatedAt?.toISOString() ?? null,
    createdAt: workflow.createdAt.toISOString(),
    updatedAt: workflow.updatedAt.toISOString(),
  };
}

async function assertWalletOwnership(userId: string, walletId: string) {
  await walletService.assertOwnership(userId, walletId);
}

async function assertWorkflowOwnership(userId: string, workflowId: string): Promise<WorkflowWithParts> {
  const workflow = await workflowRepository.findById(workflowId);
  if (!workflow) throw new NotFoundError("Workflow", workflowId);
  const wallet = await walletService.assertOwnership(userId, workflow.walletId).catch(() => null);
  if (!wallet) throw new ForbiddenError("You do not own this workflow");
  return workflow;
}

async function listForUser(userId: string, walletIds: string[]): Promise<WorkflowDTO[]> {
  for (const walletId of walletIds) {
    await assertWalletOwnership(userId, walletId);
  }
  const workflows = await workflowRepository.findManyForWallets(walletIds);
  return workflows.map(toDTO);
}

async function create(userId: string, input: CreateWorkflowInput): Promise<WorkflowDTO> {
  await assertWalletOwnership(userId, input.walletId);

  // Re-validate here even though the route already parsed with the same
  // schema — services must never trust that a caller validated for them.
  const trigger = TriggerConfigSchema.parse(input.trigger);
  const condition = ConditionConfigSchema.parse(input.condition);
  const action = ActionConfigSchema.parse(input.action);

  const created = await workflowRepository.create({
    walletId: input.walletId,
    name: input.name,
    description: input.description,
    enabled: input.enabled,
    status: input.enabled ? WorkflowStatus.ACTIVE : WorkflowStatus.DRAFT,
    triggerType: trigger.type,
    triggerConfig: trigger as unknown as Prisma.InputJsonValue,
    conditionConfig: condition as unknown as Prisma.InputJsonValue,
    actionType: action.type,
    actionConfig: action as unknown as Prisma.InputJsonValue,
  });

  await auditLogService.record({
    userId,
    walletId: input.walletId,
    workflowId: created.id,
    eventType: AuditEventType.WORKFLOW_CREATED,
    metadata: { name: input.name, triggerType: trigger.type, actionType: action.type },
  });

  return toDTO(created);
}

async function update(userId: string, input: UpdateWorkflowInput): Promise<WorkflowDTO> {
  const existing = await assertWorkflowOwnership(userId, input.id);

  const trigger = input.trigger ? TriggerConfigSchema.parse(input.trigger) : undefined;
  const condition = input.condition ? ConditionConfigSchema.parse(input.condition) : undefined;
  const action = input.action ? ActionConfigSchema.parse(input.action) : undefined;

  const updated = await workflowRepository.updateParts(existing.id, {
    name: input.name,
    description: input.description,
    enabled: input.enabled,
    status: input.enabled === false ? WorkflowStatus.PAUSED : input.enabled === true ? WorkflowStatus.ACTIVE : undefined,
    triggerType: trigger?.type,
    triggerConfig: trigger as unknown as Prisma.InputJsonValue | undefined,
    conditionConfig: condition as unknown as Prisma.InputJsonValue | undefined,
    actionType: action?.type,
    actionConfig: action as unknown as Prisma.InputJsonValue | undefined,
  });

  await auditLogService.record({
    userId,
    walletId: existing.walletId,
    workflowId: existing.id,
    eventType: AuditEventType.WORKFLOW_UPDATED,
    metadata: { changedFields: Object.keys(input).filter((k) => k !== "id") },
  });

  return toDTO(updated);
}

async function setEnabled(userId: string, workflowId: string, enabled: boolean): Promise<WorkflowDTO> {
  const existing = await assertWorkflowOwnership(userId, workflowId);
  const updated = await workflowRepository.updateParts(existing.id, {
    enabled,
    status: enabled ? WorkflowStatus.ACTIVE : WorkflowStatus.PAUSED,
  });

  await auditLogService.record({
    userId,
    walletId: existing.walletId,
    workflowId: existing.id,
    eventType: enabled ? AuditEventType.WORKFLOW_ENABLED : AuditEventType.WORKFLOW_DISABLED,
  });

  return toDTO(updated);
}

async function remove(userId: string, workflowId: string): Promise<void> {
  const existing = await assertWorkflowOwnership(userId, workflowId);
  await workflowRepository.delete(existing.id);
  await auditLogService.record({
    userId,
    walletId: existing.walletId,
    eventType: AuditEventType.WORKFLOW_DELETED,
    metadata: { workflowId: existing.id, name: existing.name },
  });
}

export const workflowService = { listForUser, create, update, setEnabled, remove, assertWorkflowOwnership, toDTO };
