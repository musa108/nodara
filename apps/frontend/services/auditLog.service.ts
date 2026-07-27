import { apiRequest } from "./api-client";
import type { AuditLogDTO, Paginated } from "@nodara/shared";

export const auditLogService = {
  list: (page = 1, pageSize = 20) =>
    apiRequest<Paginated<AuditLogDTO>>(`/api/audit-logs?page=${page}&pageSize=${pageSize}`),
};
