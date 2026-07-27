"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletService } from "@/services/wallet.service";
import { useAuthStore } from "@/store/auth.store";

export function useWallets() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  return useQuery({
    queryKey: ["wallets"],
    queryFn: walletService.list,
    enabled: isAuthenticated,
  });
}

export function useSetColdWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ walletId, coldWalletAddress }: { walletId: string; coldWalletAddress: string }) =>
      walletService.setColdWallet(walletId, coldWalletAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast.success("Cold wallet updated");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update cold wallet"),
  });
}
