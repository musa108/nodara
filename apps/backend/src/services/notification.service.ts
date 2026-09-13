import { notificationRepository } from "../repositories/notification.repository.js";
import { NotFoundError } from "../utils/errors.js";
import { NotificationType, type NotificationDTO, type Paginated, type PaginationQuery } from "@nodara/shared";
import type { Notification } from "@prisma/client";
import { prisma } from "../database/prisma.js";

function toDTO(n: Notification): NotificationDTO {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  };
}

async function notifyWorkflowTriggered(userId: string, workflowName: string, executionId: string): Promise<void> {
  await notificationRepository.create({
    userId,
    executionId,
    type: NotificationType.WORKFLOW_TRIGGERED,
    title: "Workflow triggered",
    message: `"${workflowName}" fired and is being executed.`,
  });
}

async function notifyExecutionConfirmed(userId: string, workflowName: string, executionId: string, txHash: string | null): Promise<void> {
  await notificationRepository.create({
    userId,
    executionId,
    type: NotificationType.EXECUTION_CONFIRMED,
    title: "Execution confirmed",
    message: txHash ? `"${workflowName}" executed successfully (${txHash.slice(0, 10)}…).` : `"${workflowName}" executed successfully.`,
  });
}

async function notifyExecutionFailed(userId: string, workflowName: string, executionId: string, reason: string): Promise<void> {
  await notificationRepository.create({
    userId,
    executionId,
    type: NotificationType.EXECUTION_FAILED,
    title: "Execution failed",
    message: `"${workflowName}" failed: ${reason}`,
  });
}

async function listForUser(userId: string, query: PaginationQuery): Promise<Paginated<NotificationDTO>> {
  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    notificationRepository.findManyForUser(userId, { skip, take: query.pageSize }),
    notificationRepository.countForUser(userId),
  ]);
  return { items: items.map(toDTO), total, page: query.page, pageSize: query.pageSize };
}

async function markRead(userId: string, notificationId: string): Promise<NotificationDTO> {
  const existing = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!existing || existing.userId !== userId) throw new NotFoundError("Notification", notificationId);
  const updated = await notificationRepository.markRead(notificationId);
  return toDTO(updated);
}

export const notificationService = {
  notifyWorkflowTriggered,
  notifyExecutionConfirmed,
  notifyExecutionFailed,
  listForUser,
  markRead,
};
