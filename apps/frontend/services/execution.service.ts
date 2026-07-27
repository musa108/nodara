import { apiRequest } from "./api-client";
import type { ExecutionDTO, Paginated } from "@nodara/shared";

export const executionService = {
  list: (page = 1, pageSize = 20) =>
    apiRequest<Paginated<ExecutionDTO>>(`/api/executions?page=${page}&pageSize=${pageSize}`),

  triggerManually: (workflowId: string) =>
    apiRequest<ExecutionDTO>(`/api/executions/workflows/${workflowId}/trigger`, { method: "POST" }),
};
