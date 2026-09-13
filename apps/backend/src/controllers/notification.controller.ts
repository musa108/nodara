import { z } from "zod";
import type { Request, Response } from "express";
import { notificationService } from "../services/notification.service.js";
import { PaginationQuerySchema } from "@nodara/shared";

const NotificationIdParamSchema = z.object({ id: z.string().cuid() });

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const query = PaginationQuerySchema.parse(req.query);
  const result = await notificationService.listForUser(req.user!.userId, query);
  res.status(200).json({ success: true, data: result });
}

export async function markNotificationRead(req: Request, res: Response): Promise<void> {
  const { id } = NotificationIdParamSchema.parse(req.params);
  const notification = await notificationService.markRead(req.user!.userId, id);
  res.status(200).json({ success: true, data: notification });
}
