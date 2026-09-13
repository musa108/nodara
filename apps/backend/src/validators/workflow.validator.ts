import { z } from "zod";

// Creation/update payload validation reuses @nodara/shared's
// CreateWorkflowSchema/UpdateWorkflowSchema directly (single source of
// truth shared with the frontend) — this file only holds validators that
// are specific to this HTTP surface.

export const WorkflowIdParamSchema = z.object({ id: z.string().cuid() });

export const SetEnabledSchema = z.object({ enabled: z.boolean() });
