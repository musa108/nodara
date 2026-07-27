import type { TriggerHandler, TriggerEvaluationContext, TriggerEvaluationResult } from "@nodara/monitor";
import { TriggerType, type TriggerConfig } from "@nodara/shared";

type Config = Extract<TriggerConfig, { type: typeof TriggerType.MANUAL }>;

/**
 * MANUAL workflows are never picked up by the background sweep — the
 * monitoring engine filters them out entirely (see monitoring.worker.ts,
 * which sweeps workflowRepository.findEnabledForSweep()). This handler
 * exists so the registry is complete and the execution service can reuse
 * the same evaluate() contract when a user hits "Run now".
 */
export const manualTriggerHandler: TriggerHandler<Config> = {
  type: TriggerType.MANUAL,
  async evaluate(_config, _ctx: TriggerEvaluationContext): Promise<TriggerEvaluationResult> {
    return { triggered: true, evidence: { manuallyTriggeredAt: new Date().toISOString() } };
  },
};
