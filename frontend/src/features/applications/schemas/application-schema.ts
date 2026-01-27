import { z } from "zod";

/**
 * Schema Zod per validazione candidatura job
 * NON factory function - tutto in italiano
 */
export const applyJobSchema = z.object({
  jobId: z.string().min(1, "Il campo è obbligatorio"),
  coverLetter: z.string().optional(),
  // cv viene gestito fuori dallo schema (File state esterno)
});

export type ApplyJobFormValues = z.infer<typeof applyJobSchema>;
