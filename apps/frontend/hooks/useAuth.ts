"use client";

import { useCallback, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useAuth() {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { token, wallet, setSession, clearSession } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // A session is only valid for the chain it was issued on. Switching
  // networks in the wallet doesn't invalidate the stored token, but the
  // Wallet row that token maps to is chain-specific — so if the
  // currently-connected chain doesn't match the wallet the session was
  // created for, treat this as "not authenticated" until the user signs
  // in again on the new chain.
  const isAuthenticated = Boolean(token) && wallet?.chainId === chainId;

  const signIn = useCallback(async () => {
    if (!address || !chainId) {
      toast.error("Connect a wallet first");
      return;
    }
    setIsAuthenticating(true);
    try {
      const { nonce } = await authService.getNonce(address);

      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Nodara to manage your automation workflows.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce,
      });
      const message = siweMessage.prepareMessage();

      const signature = await signMessageAsync({ message });
      const { token: sessionToken, wallet: connectedWallet } = await authService.verify(message, signature);

      setSession(sessionToken, connectedWallet);
      toast.success("Signed in");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setIsAuthenticating(false);
    }
  }, [address, chainId, signMessageAsync, setSession]);

  const signOut = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return {
    isConnected,
    isAuthenticated,
    isAuthenticating,
    wallet,
    signIn,
    signOut,
  };
}