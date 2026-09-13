import { walletRepository } from "../repositories/wallet.repository.js";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors.js";
import type { WalletDTO } from "@nodara/shared";
import type { Wallet } from "@prisma/client";

function toDTO(wallet: Wallet): WalletDTO {
  return {
    id: wallet.id,
    address: wallet.address,
    chainId: wallet.chainId,
    coldWalletAddress: wallet.coldWalletAddress,
    isPrimary: wallet.isPrimary,
    createdAt: wallet.createdAt.toISOString(),
  };
}

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

async function listForUser(userId: string): Promise<WalletDTO[]> {
  const wallets = await walletRepository.findManyForUser(userId);
  return wallets.map(toDTO);
}

async function assertOwnership(userId: string, walletId: string): Promise<Wallet> {
  const wallet = await walletRepository.findById(walletId);
  if (!wallet) throw new NotFoundError("Wallet", walletId);
  if (wallet.userId !== userId) throw new ForbiddenError("You do not own this wallet");
  return wallet;
}

async function setColdWallet(userId: string, walletId: string, coldWalletAddress: string): Promise<WalletDTO> {
  if (!EVM_ADDRESS_RE.test(coldWalletAddress)) {
    throw new ValidationError("coldWalletAddress must be a valid EVM address");
  }
  const wallet = await assertOwnership(userId, walletId);
  const updated = await walletRepository.updateColdWallet(wallet.id, coldWalletAddress);
  return toDTO(updated);
}

export const walletService = { listForUser, assertOwnership, setColdWallet };
