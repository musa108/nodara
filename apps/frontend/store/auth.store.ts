"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { WalletDTO } from "@nodara/shared";

const safeStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;

    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Ignore storage quota/security errors in restricted browsers.
    }
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.removeItem(name);
    } catch {
      // Ignore storage security errors.
    }
  },
};

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
    {
      name: "nodara-auth",
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
