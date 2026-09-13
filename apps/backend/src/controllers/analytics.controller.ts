import type { Request, Response } from "express";
import { analyticsService } from "../services/analytics.service.js";

export async function getSummary(req: Request, res: Response): Promise<void> {
  const summary = await analyticsService.getSummaryForUser(req.user!.userId);
  res.status(200).json({ success: true, data: summary });
}
