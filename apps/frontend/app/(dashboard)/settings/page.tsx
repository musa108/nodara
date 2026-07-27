"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallets, useSetColdWallet } from "@/hooks/useWallets";
import { truncateAddress } from "@nodara/utils";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

export default function SettingsPage() {
  const { data: wallets, isLoading } = useWallets();
  const setColdWallet = useSetColdWallet();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  return (
    <div className="space-y-6">
      {/* Title Header Section */}
      <div className="pb-4 border-b border-border/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Home</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-muted-foreground">Settings</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Account Settings</h1>
          <p className="text-xs font-medium text-muted-foreground/90">Manage connected wallets, execution limits, and cold-storage configurations.</p>
        </div>
      </div>

      {isLoading || !wallets ? (
        <div className="h-32 animate-pulse rounded-2xl bg-secondary" />
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-xl">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="border border-border/40 shadow-premium rounded-2xl overflow-hidden bg-card">
              <CardHeader className="pb-3 border-b border-border/30 bg-muted/10 p-5">
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="font-mono text-sm font-bold text-foreground">{truncateAddress(wallet.address)}</span>
                  </div>
                  {wallet.isPrimary && (
                    <span className="text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                      Primary Wallet
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4 p-5 pt-4">
                <div className="space-y-2">
                  <label className="text-2xs font-bold uppercase tracking-wider text-muted-foreground/90">
                    Cold wallet address
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={drafts[wallet.id] ?? wallet.coldWalletAddress ?? ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [wallet.id]: e.target.value }))}
                      placeholder="0x…"
                      className="flex h-10 flex-1 rounded-xl border border-border bg-background px-3.5 text-xs font-semibold outline-none shadow-inner transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      className="h-10 rounded-xl px-4 text-xs font-bold shadow-sm"
                      disabled={setColdWallet.isPending || !drafts[wallet.id]}
                      onClick={() => setColdWallet.mutate({ walletId: wallet.id, coldWalletAddress: drafts[wallet.id]! })}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-1.5 pt-1.5 text-2xs font-semibold text-muted-foreground/80 leading-relaxed">
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                  <span>
                    Used as the destination target for automation actions configured to transfer funds to "COLD_WALLET". Ensure the address is correctly configured and accessible.
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
