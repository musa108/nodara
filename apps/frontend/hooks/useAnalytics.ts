"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { useAuthStore } from "@/store/auth.store";

export function useAnalytics() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: analyticsService.getSummary,
    enabled: isAuthenticated,
    refetchInterval: 15_000,
  });
}
