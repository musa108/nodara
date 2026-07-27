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
    isAuthenticated: Boolean(token),
    isAuthenticating,
    wallet,
    signIn,
    signOut,
  };
}
