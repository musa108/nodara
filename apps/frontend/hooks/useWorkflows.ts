"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { workflowService } from "@/services/workflow.service";
import { useAuthStore } from "@/store/auth.store";
import type { CreateWorkflowInput } from "@nodara/shared";

export function useWorkflows() {
  const isAuthenticated = Boolean(useAuthStore((s) => s.token));
  return useQuery({
    queryKey: ["workflows"],
    queryFn: workflowService.list,
    enabled: isAuthenticated,
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWorkflowInput) => workflowService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow created");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create workflow"),
  });
}

export function useSetWorkflowEnabled() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => workflowService.setEnabled(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows"] }),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update workflow"),
  });
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workflowService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast.success("Workflow deleted");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete workflow"),
  });
}
