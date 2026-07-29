import { actionRegistry } from "@nodara/monitor";
import { generateIdempotencyKey, generateManualIdempotencyKey } from "@nodara/utils/idempotency";
import { AuditEventType, ExecutionStatus, type ExecutionDTO } from "@nodara/shared";
import { executionRepository } from "../repositories/execution.repository.js";
import { walletRepository } from "../repositories/wallet.repository.js";
import { workflowRepository, type WorkflowWithParts } from "../repositories/workflow.repository.js";
import { keeperHubService } from "../keeperhub/keeperhub.service.js";
import { auditLogService } from "./auditLog.service.js";
import { notificationService } from "./notification.service.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { createModuleLogger } from "../utils/logger.js";
import { KeeperHubError } from "@nodara/keeperhub";
import type { Execution, Prisma } from "@prisma/client";

const log = createModuleLogger("execution-service");

function toDTO(execution: Execution & { workflow?: { name: string; wallet?: { chainId: number } } }): ExecutionDTO {
  return {
    id: execution.id,
    workflowId: execution.workflowId,
    workflowName: execution.workflow?.name ?? "",
    chainId: execution.workflow?.wallet?.chainId ?? 0,
    status: execution.status,
    triggerSnapshot: execution.triggerSnapshot,
    simulationResult: execution.simulationResult,
    gasEstimate: execution.gasEstimate,
    transactionHash: execution.transactionHash,
    keeperHubJobId: execution.keeperHubJobId,
    errorMessage: execution.errorMessage,
    attempt: execution.attempt,
    durationMs: execution.durationMs,
    createdAt: execution.createdAt.toISOString(),
    updatedAt: execution.updatedAt.toISOString(),
    confirmedAt: execution.confirmedAt?.toISOString() ?? null,
  };
}

/**
 * The full pipeline for one workflow firing. Idempotent by construction:
 * if an execution with this idempotencyKey already exists (e.g. the
 * monitoring engine evaluated the same block range twice after a
 * restart), we return the existing record instead of re-running the
 * pipeline — this is what "prevent duplicate execution" means in
 * practice, not just at the KeeperHub submission step.
 */
async function runForTrigger(params: {
  workflow: WorkflowWithParts;
  evidence: Record<string, unknown>;
  isManual?: boolean;
}): Promise<Execution> {
  const { workflow, evidence } = params;
  if (!workflow.trigger || !workflow.action) {
    throw new ValidationError(`Workflow ${workflow.id} is missing its trigger or action`);
  }

  const idempotencyKey = params.isManual
    ? generateManualIdempotencyKey(workflow.id)
    : generateIdempotencyKey({ workflowId: workflow.id, evidenceFingerprint: evidence });

  const existing = await executionRepository.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    log.info({ executionId: existing.id, idempotencyKey }, "duplicate firing detected — returning existing execution");
    return existing;
  }

  const wallet = await walletRepository.findById(workflow.walletId);
  if (!wallet) throw new NotFoundError("Wallet", workflow.walletId);

  const execution = await executionRepository.create({
    workflowId: workflow.id,
    idempotencyKey,
    triggerSnapshot: evidence as Prisma.InputJsonValue,
  });

  await auditLogService.record({
    userId: wallet.userId,
    walletId: wallet.id,
    workflowId: workflow.id,
    executionId: execution.id,
    eventType: AuditEventType.EXECUTION_STARTED,
    metadata: { triggerType: workflow.trigger.type, actionType: workflow.action.type },
  });
  await notificationService.notifyWorkflowTriggered(wallet.userId, workflow.name, execution.id);

  const startedAt = Date.now();

  try {
    const actionHandler = actionRegistry.resolve(workflow.action.type);
    const unsignedTxParts = await actionHandler.buildTransaction(workflow.action.config, {
      walletAddress: wallet.address,
      coldWalletAddress: wallet.coldWalletAddress,
      chainId: wallet.chainId,
      evidence,
    });
    const tx = { chainId: wallet.chainId, from: wallet.address, ...unsignedTxParts };

    await keeperHubService.simulate({ executionId: execution.id, workflowId: workflow.id, chainId: wallet.chainId, tx });
    const gas = await keeperHubService.estimateGas({ executionId: execution.id, workflowId: workflow.id, chainId: wallet.chainId, tx });
    const submission = await keeperHubService.submit({
      executionId: execution.id,
      workflowId: workflow.id,
      chainId: wallet.chainId,
      tx,
      gas,
      idempotencyKey,
    });

    if (submission.status === "FAILED") {
      throw new ValidationError("KeeperHub rejected the submission");
    }

    await settleSuccess(execution.id, wallet.userId, workflow.name, startedAt);
    return (await executionRepository.findById(execution.id))!;
  } catch (err) {
    await settleFailure(execution.id, wallet.userId, workflow.name, startedAt, err);
    return (await executionRepository.findById(execution.id))!;
  }
}

/** Called by the execution tracker worker once KeeperHub reports CONFIRMED for a SUBMITTED execution. */
async function settleSuccess(executionId: string, userId: string, workflowName: string, startedAt: number): Promise<void> {
  const durationMs = Date.now() - startedAt;
  const execution = await executionRepository.update(executionId, { durationMs });

  await auditLogService.record({
    userId,
    executionId,
    eventType: AuditEventType.EXECUTION_SUCCEEDED,
    metadata: { transactionHash: execution.transactionHash },
  });
}

async function settleFailure(executionId: string, userId: string, workflowName: string, startedAt: number, err: unknown): Promise<void> {
  const durationMs = Date.now() - startedAt;
  const message = err instanceof Error ? err.message : "Unknown error";

  await executionRepository.update(executionId, {
    status: ExecutionStatus.FAILED,
    errorMessage: message,
    durationMs,
  });

  await auditLogService.record({
    userId,
    executionId,
    eventType: AuditEventType.EXECUTION_FAILED,
    metadata: { error: message, retryable: err instanceof KeeperHubError ? err.retryable : false },
  });

  await notificationService.notifyExecutionFailed(userId, workflowName, executionId, message);
  log.error({ executionId, err }, "execution failed");
}

/** Reconciles a SUBMITTED execution against KeeperHub's tracking endpoint — called by the execution tracker worker. */
async function reconcile(execution: Execution): Promise<void> {
  if (!execution.keeperHubJobId) return;

  const workflow = await workflowRepository.findById(execution.workflowId);
  if (!workflow) return;
  const wallet = await walletRepository.findById(workflow.walletId);
  if (!wallet) return;

  const tracking = await keeperHubService.track(execution.keeperHubJobId);

  if (tracking.status === "CONFIRMED") {
    await executionRepository.update(execution.id, {
      status: "CONFIRMED",
      blockNumber: tracking.blockNumber ?? undefined,
      gasUsed: tracking.gasUsed,
      effectiveGasPrice: tracking.effectiveGasPrice,
      confirmedAt: tracking.confirmedAt ? new Date(tracking.confirmedAt) : new Date(),
    });
    await notificationService.notifyExecutionConfirmed(wallet.userId, workflow.name, execution.id, tracking.transactionHash);
  } else if (tracking.status === "FAILED") {
    await settleFailure(execution.id, wallet.userId, workflow.name, execution.createdAt.getTime(), new Error(tracking.errorMessage ?? "Transaction failed on-chain"));
  }
  // SUBMITTED -> still pending, nothing to do this tick.
}

/** Manual "Run now" entry point — bypasses the monitoring sweep and fires immediately. */
async function triggerManually(workflow: WorkflowWithParts): Promise<Execution> {
  return runForTrigger({ workflow, evidence: { manuallyTriggeredAt: new Date().toISOString() }, isManual: true });
}

async function listForWorkflows(workflowIds: string[], query: { page: number; pageSize: number }) {
  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    executionRepository.findManyForWorkflows(workflowIds, { skip, take: query.pageSize }),
    executionRepository.countForWorkflows(workflowIds),
  ]);
  return { items: items.map(toDTO), total, page: query.page, pageSize: query.pageSize };
}

export const executionService = { runForTrigger, reconcile, triggerManually, listForWorkflows, toDTO };
