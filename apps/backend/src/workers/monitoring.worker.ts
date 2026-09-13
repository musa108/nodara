import { Poller, triggerRegistry, conditionRegistry } from "@nodara/monitor";
import { getPublicClient, getBalance, NATIVE_TOKEN_SENTINEL } from "@nodara/blockchain";
import type { Address } from "viem";
import { env } from "../config/env.js";
import { resolveRpcUrl } from "../config/rpc.js";
import { registerHandlers } from "../monitor/registerHandlers.js";
import { getTokenDecimals } from "../monitor/token-metadata.js";
import { workflowRepository, type WorkflowWithParts } from "../repositories/workflow.repository.js";
import { walletRepository } from "../repositories/wallet.repository.js";
import { executionService } from "../services/execution.service.js";
import { createModuleLogger } from "../utils/logger.js";
import type { Wallet } from "@prisma/client";

const log = createModuleLogger("monitoring-worker");

function groupByWallet(workflows: WorkflowWithParts[]): Map<string, WorkflowWithParts[]> {
  const map = new Map<string, WorkflowWithParts[]>();
  for (const wf of workflows) {
    const list = map.get(wf.walletId) ?? [];
    list.push(wf);
    map.set(wf.walletId, list);
  }
  return map;
}

async function evaluateWallet(wallet: Wallet, workflows: WorkflowWithParts[]): Promise<void> {
  const client = getPublicClient({ chainId: wallet.chainId, rpcUrl: resolveRpcUrl(wallet.chainId) });
  const currentBlock = await client.getBlockNumber();

  // First-ever sweep for this wallet: start from the current block rather
  // than scanning the wallet's entire history.
  const fromBlock = wallet.lastScannedBlock === 0n ? currentBlock : wallet.lastScannedBlock + 1n;
  const toBlock = currentBlock;

  for (const workflow of workflows) {
    if (!workflow.trigger || !workflow.action) continue;

    try {
      const handler = triggerRegistry.resolve(workflow.trigger.type);
      const result = await handler.evaluate(workflow.trigger.config, {
        workflowId: workflow.id,
        walletId: wallet.id,
        walletAddress: wallet.address,
        chainId: wallet.chainId,
        fromBlock,
        toBlock,
      });

      await workflowRepository.updateLastEvaluatedAt(workflow.id, new Date());

      if (!result.triggered) continue;

      const conditionConfig = workflow.trigger.conditionConfig as { operator: string };
      const conditionHandler = conditionRegistry.resolve(conditionConfig.operator);

      const tokenAddress = (result.evidence.tokenAddress as string | undefined) ?? NATIVE_TOKEN_SENTINEL;
      const tokenDecimals = await getTokenDecimals(tokenAddress, wallet.chainId).catch(() => 18);

      const conditionMet = conditionHandler.evaluate(conditionConfig, { evidence: result.evidence, tokenDecimals });
      if (!conditionMet) continue;

      log.info({ workflowId: workflow.id }, "condition met — handing off to execution service");
      await executionService.runForTrigger({ workflow, evidence: result.evidence });
    } catch (err) {
      // Isolated per-workflow: one bad workflow (bad RPC response, a
      // handler bug) never stops the rest of the sweep from running.
      log.error({ workflowId: workflow.id, err }, "workflow evaluation failed");
    }
  }

  const nativeBalance = await getBalance(client, NATIVE_TOKEN_SENTINEL, wallet.address as Address).catch(() => null);
  await walletRepository.updateScanCursor(wallet.id, {
    lastScannedBlock: toBlock,
    lastKnownNativeBalance: nativeBalance ? nativeBalance.raw.toString() : wallet.lastKnownNativeBalance,
  });
}

async function sweep(): Promise<void> {
  const workflows = await workflowRepository.findEnabledForSweep();
  if (workflows.length === 0) return;

  const byWallet = groupByWallet(workflows);

  for (const [walletId, walletWorkflows] of byWallet) {
    const wallet = await walletRepository.findById(walletId);
    if (!wallet) continue;

    try {
      await evaluateWallet(wallet, walletWorkflows);
    } catch (err) {
      // Isolated per-wallet too (e.g. that chain's RPC is down) — other
      // wallets still get evaluated this tick.
      log.error({ walletId, err }, "wallet sweep failed");
    }
  }
}

let poller: Poller | null = null;

export function createMonitoringWorker(): Poller {
  registerHandlers();
  poller = new Poller("monitoring-sweep", sweep, {
    intervalMs: env.MONITOR_INTERVAL_MS,
    logger: {
      info: (msg: string, meta?: Record<string, unknown>) => log.info(meta ?? {}, msg),
      warn: (msg: string, meta?: Record<string, unknown>) => log.warn(meta ?? {}, msg),
      error: (msg: string, meta?: Record<string, unknown>) => log.error(meta ?? {}, msg),
    },
  });
  return poller;
}
