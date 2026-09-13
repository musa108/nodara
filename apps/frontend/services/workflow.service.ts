import { apiRequest } from "./api-client";
import type { WorkflowDTO, CreateWorkflowInput, UpdateWorkflowInput } from "@nodara/shared";

export const workflowService = {
  list: () => apiRequest<WorkflowDTO[]>("/api/workflows"),

  create: (input: CreateWorkflowInput) =>
    apiRequest<WorkflowDTO>("/api/workflows", { method: "POST", body: input }),

  update: (input: UpdateWorkflowInput) =>
    apiRequest<WorkflowDTO>(`/api/workflows/${input.id}`, { method: "PATCH", body: input }),

  setEnabled: (id: string, enabled: boolean) =>
    apiRequest<WorkflowDTO>(`/api/workflows/${id}/enabled`, { method: "PATCH", body: { enabled } }),

  remove: (id: string) => apiRequest<void>(`/api/workflows/${id}`, { method: "DELETE" }),
};
