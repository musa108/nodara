import { z } from "zod";
import type { Request, Response } from "express";
import { walletService } from "../services/wallet.service.js";
import { SetColdWalletSchema } from "../validators/wallet.validator.js";

const WalletIdParamSchema = z.object({ id: z.string().cuid() });

export async function listWallets(req: Request, res: Response): Promise<void> {
  const wallets = await walletService.listForUser(req.user!.userId);
  res.status(200).json({ success: true, data: wallets });
}

export async function updateColdWallet(req: Request, res: Response): Promise<void> {
  const { id } = WalletIdParamSchema.parse(req.params);
  const { coldWalletAddress } = SetColdWalletSchema.parse(req.body);
  const wallet = await walletService.setColdWallet(req.user!.userId, id, coldWalletAddress);
  res.status(200).json({ success: true, data: wallet });
}
