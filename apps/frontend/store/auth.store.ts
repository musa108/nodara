"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WalletDTO } from "@nodara/shared";

interface AuthState {
  token: string | null;
  wallet: WalletDTO | null;
  setSession: (token: string, wallet: WalletDTO) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      wallet: null,
      setSession: (token, wallet) => set({ token, wallet }),
      clearSession: () => set({ token: null, wallet: null }),
    }),
    { name: "nodara-auth" }
  )
);
