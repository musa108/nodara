import { Poller } from "@nodara/monitor";
import { executionRepository } from "../repositories/execution.repository.js";
import { executionService } from "../services/execution.service.js";
import { createModuleLogger } from "../utils/logger.js";

const log = createModuleLogger("execution-tracker-worker");

async function reconcileAll(): Promise<void> {
  const pending = await executionRepository.findSubmittedForReconciliation();
  if (pending.length === 0) return;

  for (const execution of pending) {
    try {
      await executionService.reconcile(execution);
    } catch (err) {
      // One execution failing to reconcile this tick just means we try
      // again next tick — it stays SUBMITTED until KeeperHub resolves it.
      log.error({ executionId: execution.id, err }, "reconciliation failed");
    }
  }
}

export function createExecutionTrackerWorker(): Poller {
  return new Poller("execution-tracker", reconcileAll, {
    intervalMs: 15_000, // tighter than the 30s monitoring sweep — confirmations matter for responsiveness
    logger: {
      info: (msg: string, meta?: Record<string, unknown>) => log.info(meta ?? {}, msg),
      warn: (msg: string, meta?: Record<string, unknown>) => log.warn(meta ?? {}, msg),
      error: (msg: string, meta?: Record<string, unknown>) => log.error(meta ?? {}, msg),
    },
  });
}
