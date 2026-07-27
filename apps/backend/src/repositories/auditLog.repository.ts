import { prisma } from "../database/prisma.js";
import type { AuditEventType } from "@nodara/shared";
import type { AuditLog, Prisma } from "@prisma/client";

export interface CreateAuditLogParams {
  userId: string;
  eventType: AuditEventType;
  walletId?: string | null;
  workflowId?: string | null;
  executionId?: string | null;
  metadata?: Record<string, unknown>;
}

export const auditLogRepository = {
  create(params: CreateAuditLogParams): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        userId: params.userId,
        walletId: params.walletId ?? null,
        workflowId: params.workflowId ?? null,
        executionId: params.executionId ?? null,
        eventType: params.eventType,
        metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });
  },

  findManyForUser(userId: string, params: { skip: number; take: number }): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
  },

  countForUser(userId: string): Promise<number> {
    return prisma.auditLog.count({ where: { userId } });
  },
};
