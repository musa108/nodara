import { z } from "zod";
import { TriggerConfigSchema, ConditionConfigSchema } from "./trigger.js";
import { ActionConfigSchema } from "./action.js";

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  walletId: z.string().cuid(),
  trigger: TriggerConfigSchema,
  condition: ConditionConfigSchema,
  action: ActionConfigSchema,
  enabled: z.boolean().default(true),
});
export type CreateWorkflowInput = z.infer<typeof CreateWorkflowSchema>;

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial().extend({
  id: z.string().cuid(),
});
export type UpdateWorkflowInput = z.infer<typeof UpdateWorkflowSchema>;
