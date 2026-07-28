import { prisma } from "../database/prisma.js";
import type { Execution, ExecutionStatus, Prisma } from "@prisma/client";

export interface CreateExecutionParams {
  workflowId: string;
  idempotencyKey: string;
  triggerSnapshot: Prisma.InputJsonValue;
}

export const executionRepository = {
  create(params: CreateExecutionParams): Promise<Execution> {
    return prisma.execution.create({
      data: {
        workflowId: params.workflowId,
        idempotencyKey: params.idempotencyKey,
        triggerSnapshot: params.triggerSnapshot,
        status: "PENDING",
      },
    });
  },

  findByIdempotencyKey(idempotencyKey: string): Promise<Execution | null> {
    return prisma.execution.findUnique({ where: { idempotencyKey } });
  },

  
  findById(id: string): Promise<(Execution & { workflow: { name: string } }) | null> {
  return prisma.execution.findUnique({
    where: { id },
    include: { workflow: { select: { name: true } } },
  });
},

  update(id: string, data: Prisma.ExecutionUpdateInput): Promise<Execution> {
    return prisma.execution.update({ where: { id }, data });
  },

  findManyForWorkflows(
    workflowIds: string[],
    params: { skip: number; take: number; status?: ExecutionStatus }
  ): Promise<(Execution & { workflow: { name: string } })[]> {
    return prisma.execution.findMany({
      where: { workflowId: { in: workflowIds }, status: params.status },
      include: { workflow: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
  },

  countForWorkflows(workflowIds: string[], status?: ExecutionStatus): Promise<number> {
    return prisma.execution.count({ where: { workflowId: { in: workflowIds }, status } });
  },

  findSubmittedForReconciliation(): Promise<Execution[]> {
    return prisma.execution.findMany({ where: { status: "SUBMITTED" } });
  },

  countByStatusForWorkflows(workflowIds: string[]): Promise<{ status: ExecutionStatus; _count: number }[]> {
    return prisma.execution.groupBy({
      by: ["status"],
      where: { workflowId: { in: workflowIds } },
      _count: true,
    }) as unknown as Promise<{ status: ExecutionStatus; _count: number }[]>;
  },

  countRecentByDay(workflowIds: string[], since: Date): Promise<{ createdAt: Date }[]> {
    return prisma.execution.findMany({
      where: { workflowId: { in: workflowIds }, createdAt: { gte: since } },
      select: { createdAt: true },
    });
  },
};
