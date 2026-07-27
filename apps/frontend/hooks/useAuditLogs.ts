"use client";

import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "@/services/auditLog.service";
import { useAuthStore } from "@/store/auth.store";

export function useAuditLogs(page = 1) {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  return useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => auditLogService.list(page),
    enabled: isAuthenticated,
  });
}
