import { apiRequest } from "./api-client";
import type { WalletDTO } from "@nodara/shared";

export const authService = {
  getNonce: (address: string) => apiRequest<{ nonce: string }>(`/api/auth/nonce?address=${address}`, { auth: false }),

  verify: (message: string, signature: string) =>
    apiRequest<{ token: string; wallet: WalletDTO }>("/api/auth/verify", {
      method: "POST",
      body: { message, signature },
      auth: false,
    }),
};
