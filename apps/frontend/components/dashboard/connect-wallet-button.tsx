"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function ConnectWalletButton() {
  const { isConnected, isAuthenticated, isAuthenticating, signIn } = useAuth();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        const ready = mounted;
        if (!ready) return null;

        if (!account || !chain) {
          return (
            <Button onClick={openConnectModal} size="sm">
              Connect Wallet
            </Button>
          );
        }

        if (isConnected && !isAuthenticated) {
          return (
            <Button onClick={signIn} size="sm" disabled={isAuthenticating}>
              {isAuthenticating ? "Signing in…" : "Sign in with Ethereum"}
            </Button>
          );
        }

        return <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />;
      }}
    </ConnectButton.Custom>
  );
}
