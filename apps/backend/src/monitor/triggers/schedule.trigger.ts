import type { TriggerHandler, TriggerEvaluationContext, TriggerEvaluationResult } from "@nodara/monitor";
import { TriggerType, type TriggerConfig } from "@nodara/shared";
import parser from "cron-parser";
import { prisma } from "../../database/prisma.js";

type Config = Extract<TriggerConfig, { type: typeof TriggerType.SCHEDULE }>;

/**
 * A schedule "fires" when the most recent valid cron occurrence (relative
 * to lastEvaluatedAt) has already passed by the time this tick runs.
 */
export const scheduleTriggerHandler: TriggerHandler<Config> = {
  type: TriggerType.SCHEDULE,

  async evaluate(config, ctx: TriggerEvaluationContext): Promise<TriggerEvaluationResult> {
    const workflow = await prisma.workflow.findUnique({ where: { id: ctx.workflowId } });
    if (!workflow) return { triggered: false, evidence: {} };

    const interval = parser.parseExpression(config.cronExpression, {
      tz: config.timezone,
      currentDate: workflow.lastEvaluatedAt ?? new Date(0),
    });

    const nextOccurrence = interval.next().toDate();
    const now = new Date();
    const triggered = nextOccurrence <= now;

    return {
      triggered,
      evidence: triggered ? { scheduledFor: nextOccurrence.toISOString(), evaluatedAt: now.toISOString() } : {},
    };
  },
};
