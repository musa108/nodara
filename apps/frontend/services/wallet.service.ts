import { apiRequest } from "./api-client";
import type { WalletDTO } from "@nodara/shared";

export const walletService = {
  list: () => apiRequest<WalletDTO[]>("/api/wallets"),

  setColdWallet: (walletId: string, coldWalletAddress: string) =>
    apiRequest<WalletDTO>(`/api/wallets/${walletId}/cold-wallet`, {
      method: "PATCH",
      body: { coldWalletAddress },
    }),
};
