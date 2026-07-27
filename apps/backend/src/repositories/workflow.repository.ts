import { prisma } from "../database/prisma.js";
import type { Prisma, Workflow, Trigger, Action } from "@prisma/client";
import type { ActionType, TriggerType, WorkflowStatus } from "@nodara/shared";

export type WorkflowWithParts = Workflow & { trigger: Trigger | null; action: Action | null };

export interface CreateWorkflowRecordParams {
  walletId: string;
  name: string;
  description?: string;
  enabled: boolean;
  status: WorkflowStatus;
  triggerType: TriggerType;
  triggerConfig: Prisma.InputJsonValue;
  conditionConfig: Prisma.InputJsonValue;
  actionType: ActionType;
  actionConfig: Prisma.InputJsonValue;
}

export const workflowRepository = {
  async create(params: CreateWorkflowRecordParams): Promise<WorkflowWithParts> {
    return prisma.workflow.create({
      data: {
        walletId: params.walletId,
        name: params.name,
        description: params.description,
        enabled: params.enabled,
        status: params.status,
        trigger: { create: { type: params.triggerType, config: params.triggerConfig, conditionConfig: params.conditionConfig } },
        action: { create: { type: params.actionType, config: params.actionConfig } },
      },
      include: { trigger: true, action: true },
    });
  },

  findById(id: string): Promise<WorkflowWithParts | null> {
    return prisma.workflow.findUnique({ where: { id }, include: { trigger: true, action: true } });
  },

  findManyForWallets(walletIds: string[]): Promise<WorkflowWithParts[]> {
    return prisma.workflow.findMany({
      where: { walletId: { in: walletIds } },
      include: { trigger: true, action: true },
      orderBy: { createdAt: "desc" },
    });
  },

  /** All currently-enabled, non-MANUAL workflows — the set the monitoring engine sweeps every tick. */
  findEnabledForSweep(): Promise<WorkflowWithParts[]> {
    return prisma.workflow.findMany({
      where: { enabled: true, status: "ACTIVE", trigger: { type: { not: "MANUAL" } } },
      include: { trigger: true, action: true },
    });
  },

  async updateParts(
    id: string,
    params: Partial<{
      name: string;
      description: string | null;
      enabled: boolean;
      status: WorkflowStatus;
      triggerType: TriggerType;
      triggerConfig: Prisma.InputJsonValue;
      conditionConfig: Prisma.InputJsonValue;
      actionType: ActionType;
      actionConfig: Prisma.InputJsonValue;
    }>
  ): Promise<WorkflowWithParts> {
    return prisma.workflow.update({
      where: { id },
      data: {
        name: params.name,
        description: params.description,
        enabled: params.enabled,
        status: params.status,
        trigger:
          params.triggerType || params.triggerConfig || params.conditionConfig
            ? {
                update: {
                  ...(params.triggerType ? { type: params.triggerType } : {}),
                  ...(params.triggerConfig ? { config: params.triggerConfig } : {}),
                  ...(params.conditionConfig ? { conditionConfig: params.conditionConfig } : {}),
                },
              }
            : undefined,
        action:
          params.actionType || params.actionConfig
            ? {
                update: {
                  ...(params.actionType ? { type: params.actionType } : {}),
                  ...(params.actionConfig ? { config: params.actionConfig } : {}),
                },
              }
            : undefined,
      },
      include: { trigger: true, action: true },
    });
  },

  updateLastEvaluatedAt(id: string, at: Date): Promise<Workflow> {
    return prisma.workflow.update({ where: { id }, data: { lastEvaluatedAt: at } });
  },

  delete(id: string): Promise<Workflow> {
    return prisma.workflow.delete({ where: { id } });
  },
};
