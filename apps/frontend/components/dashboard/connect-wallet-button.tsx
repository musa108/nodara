"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/hooks/useAuth";
import { User, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConnectWalletButton() {
  const { isConnected, isAuthenticated, isAuthenticating, signIn } = useAuth();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openChainModal, openAccountModal, mounted }) => {
        const ready = mounted;
        if (!ready) return null;

        if (!account || !chain) {
          return (
            <Button onClick={openConnectModal} size="sm">
              <User className="h-3.5 w-3.5" />
              Connect Wallet
            </Button>
          );
        }

        if (isConnected && !isAuthenticated) {
          return (
            <Button onClick={signIn} disabled={isAuthenticating} size="sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isAuthenticating ? "Verifying…" : "Sign in"}
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            {chain.unsupported ? (
              <Button onClick={openChainModal} variant="destructive" size="sm">
                <AlertTriangle className="h-3.5 w-3.5" />
                Wrong network
              </Button>
            ) : (
              <Button onClick={openChainModal} variant="outline" size="sm" className="hidden sm:inline-flex">
                {chain.name}
              </Button>
            )}

            <Button onClick={openAccountModal} variant="secondary" size="sm">
              {account.displayName}
            </Button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
