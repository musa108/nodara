import { prisma } from "../database/prisma.js";
import type { Notification } from "@prisma/client";
import type { NotificationType } from "@nodara/shared";

export interface CreateNotificationParams {
  userId: string;
  executionId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
}

export const notificationRepository = {
  create(params: CreateNotificationParams): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: params.userId,
        executionId: params.executionId ?? null,
        type: params.type,
        title: params.title,
        message: params.message,
      },
    });
  },

  findManyForUser(userId: string, params: { skip: number; take: number }): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.take,
    });
  },

  countForUser(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId } });
  },

  markRead(id: string): Promise<Notification> {
    return prisma.notification.update({ where: { id }, data: { read: true } });
  },
};
