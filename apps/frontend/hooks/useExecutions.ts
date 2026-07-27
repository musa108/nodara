"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { executionService } from "@/services/execution.service";
import { useAuthStore } from "@/store/auth.store";

export function useExecutions(page = 1) {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  return useQuery({
    queryKey: ["executions", page],
    queryFn: () => executionService.list(page),
    enabled: isAuthenticated,
    refetchInterval: 10_000, // executions update automatically, per spec
  });
}

export function useTriggerWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workflowId: string) => executionService.triggerManually(workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["executions"] });
      toast.success("Workflow triggered — tracking execution");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to trigger workflow"),
  });
}
