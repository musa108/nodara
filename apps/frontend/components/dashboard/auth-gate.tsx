"use client";

import { Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ConnectWalletButton } from "@/components/dashboard/connect-wallet-button";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <Zap className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-medium">Connect your wallet to continue</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Nodara needs a signed-in wallet to load your workflows, executions, and audit history.
          </p>
        </div>
        <ConnectWalletButton />
      </div>
    );
  }

  return <>{children}</>;
}
