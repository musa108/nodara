import type { Request, Response } from "express";
import { auditLogService } from "../services/auditLog.service.js";
import { PaginationQuerySchema } from "@nodara/shared";

export async function listAuditLogs(req: Request, res: Response): Promise<void> {
  const query = PaginationQuerySchema.parse(req.query);
  const result = await auditLogService.listForUser(req.user!.userId, query);
  res.status(200).json({ success: true, data: result });
}
