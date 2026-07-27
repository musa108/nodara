import { auditLogRepository, type CreateAuditLogParams } from "../repositories/auditLog.repository.js";
import { createModuleLogger } from "../utils/logger.js";
import type { AuditLogDTO, Paginated, PaginationQuery } from "@nodara/shared";
import type { AuditLog } from "@prisma/client";

const log = createModuleLogger("audit-log-service");

function toDTO(entry: AuditLog): AuditLogDTO {
  return {
    id: entry.id,
    userId: entry.userId,
    walletId: entry.walletId,
    workflowId: entry.workflowId,
    executionId: entry.executionId,
    eventType: entry.eventType,
    metadata: entry.metadata,
    createdAt: entry.createdAt.toISOString(),
  };
}

/** Never throws — a failed audit write shouldn't fail the real operation it's describing. */
async function record(params: CreateAuditLogParams): Promise<void> {
  try {
    await auditLogRepository.create(params);
  } catch (err) {
    log.error({ err, params }, "failed to record audit event");
  }
}

async function listForUser(userId: string, query: PaginationQuery): Promise<Paginated<AuditLogDTO>> {
  const skip = (query.page - 1) * query.pageSize;
  const [items, total] = await Promise.all([
    auditLogRepository.findManyForUser(userId, { skip, take: query.pageSize }),
    auditLogRepository.countForUser(userId),
  ]);
  return { items: items.map(toDTO), total, page: query.page, pageSize: query.pageSize };
}

export const auditLogService = { record, listForUser };
