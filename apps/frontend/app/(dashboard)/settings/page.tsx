"use client";

import { useState } from "react";
import { useWallets, useSetColdWallet } from "@/hooks/useWallets";
import { truncateAddress } from "@nodara/utils";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { data: wallets, isLoading } = useWallets();
  const setColdWallet = useSetColdWallet();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage connected wallets and cold-storage destinations.</p>
      </div>

      {isLoading || !wallets ? (
        <div className="h-40 animate-pulse rounded-lg bg-secondary" />
      ) : (
        <div className="grid max-w-xl grid-cols-1 gap-4">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium text-foreground">{truncateAddress(wallet.address)}</p>
                    <p className="text-xs text-muted-foreground">Chain ID: {wallet.chainId}</p>
                  </div>
                </div>
                {wallet.isPrimary && <Badge variant="outline">Primary</Badge>}
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cold wallet address
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={drafts[wallet.id] ?? wallet.coldWalletAddress ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [wallet.id]: e.target.value }))}
                    placeholder="0x…"
                    className="flex h-9 flex-1 rounded-md border border-border bg-background px-3 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <Button
                    size="sm"
                    disabled={setColdWallet.isPending || !drafts[wallet.id]}
                    onClick={() => setColdWallet.mutate({ walletId: wallet.id, coldWalletAddress: drafts[wallet.id]! })}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Used as the destination for automation actions configured to transfer funds to "COLD_WALLET".
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
