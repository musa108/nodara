import type { Request, Response } from "express";
import { prisma } from "../database/prisma.js";

export function getLiveness(_req: Request, res: Response): void {
  res.status(200).json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
}

export async function getReadiness(_req: Request, res: Response): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
  res.status(200).json({ success: true, data: { status: "ready", db: "connected" } });
}
