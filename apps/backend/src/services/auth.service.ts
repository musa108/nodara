import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ValidationError, UnauthorizedError } from "../utils/errors.js";
import { consumeNonce, issueNonce } from "./nonce.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { walletRepository } from "../repositories/wallet.repository.js";
import { auditLogService } from "./auditLog.service.js";
import { AuditEventType } from "@nodara/shared";
import type { WalletDTO } from "@nodara/shared";
import { createModuleLogger } from "../utils/logger.js";
import type { Wallet } from "@prisma/client";

const log = createModuleLogger("auth-service");

export interface SessionPayload {
  userId: string;
  address: string;
}

function toWalletDTO(wallet: Wallet): WalletDTO {
  return {
    id: wallet.id,
    address: wallet.address,
    chainId: wallet.chainId,
    coldWalletAddress: wallet.coldWalletAddress,
    isPrimary: wallet.isPrimary,
    createdAt: wallet.createdAt.toISOString(),
  };
}

function getNonce(address: string): string {
  return issueNonce(address);
}

async function verifyAndCreateSession(params: { message: string; signature: string }): Promise<{
  token: string;
  wallet: WalletDTO;
}> {
  let siweMessage: SiweMessage;
  try {
    siweMessage = new SiweMessage(params.message);
  } catch (err) {
    throw new ValidationError("Malformed SIWE message", { cause: (err as Error).message });
  }

  if (siweMessage.domain !== env.SIWE_DOMAIN) {
    throw new UnauthorizedError(`SIWE domain mismatch: expected ${env.SIWE_DOMAIN}`);
  }
  if (!consumeNonce(siweMessage.address, siweMessage.nonce)) {
    throw new UnauthorizedError("Invalid or expired nonce — request a new one and try again");
  }

  try {
    const result = await siweMessage.verify({ signature: params.signature, domain: env.SIWE_DOMAIN });
    if (!result.success) throw new UnauthorizedError("Signature verification failed");
  } catch (err) {
    log.warn({ err }, "SIWE verification failed");
    throw new UnauthorizedError("Signature verification failed");
  }

  const address = siweMessage.address.toLowerCase();
  const chainId = siweMessage.chainId;
  if (!chainId) throw new ValidationError("SIWE message is missing a chainId");

  const user = await userRepository.upsertByAddress(address);
  const existingCount = await walletRepository.countForUser(user.id);
  const wallet = await walletRepository.upsertByAddressAndChain({
    userId: user.id,
    address,
    chainId,
    isPrimary: existingCount === 0,
  });

  await auditLogService.record({
    userId: user.id,
    walletId: wallet.id,
    eventType: AuditEventType.WALLET_CONNECTED,
    metadata: { address, chainId },
  });

  const token = jwt.sign(
    { userId: user.id, address } satisfies SessionPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  return { token, wallet: toWalletDTO(wallet) };
}

function verifySessionToken(token: string): SessionPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string" || !("userId" in decoded) || !("address" in decoded)) {
      throw new Error("Malformed token payload");
    }
    return { userId: decoded.userId as string, address: decoded.address as string };
  } catch {
    throw new UnauthorizedError("Invalid or expired session token");
  }
}

export const authService = { getNonce, verifyAndCreateSession, verifySessionToken };
