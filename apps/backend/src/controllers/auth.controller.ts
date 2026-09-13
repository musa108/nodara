import type { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { NonceQuerySchema, VerifySiweSchema } from "../validators/auth.validator.js";

export async function getNonce(req: Request, res: Response): Promise<void> {
  const { address } = NonceQuerySchema.parse(req.query);
  const nonce = authService.getNonce(address);
  res.status(200).json({ success: true, data: { nonce } });
}

export async function verify(req: Request, res: Response): Promise<void> {
  const { message, signature } = VerifySiweSchema.parse(req.body);
  const { token, wallet } = await authService.verifyAndCreateSession({ message, signature });
  res.status(200).json({ success: true, data: { token, wallet } });
}

export async function me(req: Request, res: Response): Promise<void> {
  res.status(200).json({ success: true, data: { userId: req.user!.userId, address: req.user!.address } });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  // JWTs are stateless — "logout" is a client-side token discard. This
  // endpoint exists so the API surface is symmetric and predictable.
  res.status(200).json({ success: true, data: { loggedOut: true } });
}
