import { z } from "zod";
import { ALL_WORKFLOW_STATUSES } from "../constants/applications-options";

export const updateApplicationSchema = z.object({
  workflowStatus: z.enum([...ALL_WORKFLOW_STATUSES]),
  notes: z.string().max(1000).optional(),
  score: z.number().int().min(1).max(5).optional(),
});

export type UpdateApplicationFormValues = z.infer<
  typeof updateApplicationSchema
>;

export function toUpdateApplicationDto(data: UpdateApplicationFormValues) {
  return {
    workflowStatus: data.workflowStatus,
    notes: data.notes,
    score: data.score,
  };
}
