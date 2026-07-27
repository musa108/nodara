import { workflowRepository } from "../repositories/workflow.repository.js";
import { executionRepository } from "../repositories/execution.repository.js";
import { walletService } from "./wallet.service.js";
import type { AnalyticsSummaryDTO } from "@nodara/shared";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function getSummaryForUser(userId: string): Promise<AnalyticsSummaryDTO> {
  const wallets = await walletService.listForUser(userId);
  const walletIds = wallets.map((w) => w.id);

  const workflows = await workflowRepository.findManyForWallets(walletIds);
  const workflowIds = workflows.map((w) => w.id);

  const statusCounts = await executionRepository.countByStatusForWorkflows(workflowIds);
  const successfulExecutions = statusCounts.find((s) => s.status === "CONFIRMED")?._count ?? 0;
  const failedExecutions = statusCounts.find((s) => s.status === "FAILED")?._count ?? 0;

  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);
  const recent = await executionRepository.countRecentByDay(workflowIds, since);

  const byDay = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(dateKey(d), 0);
  }
  for (const row of recent) {
    const key = dateKey(row.createdAt);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  return {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter((w) => w.enabled && w.status === "ACTIVE").length,
    successfulExecutions,
    failedExecutions,
    executionsLast7Days: Array.from(byDay.entries()).map(([date, count]) => ({ date, count })),
  };
}

export const analyticsService = { getSummaryForUser };
