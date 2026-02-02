import { z } from "zod";
import type { JobStatus } from "@shared/types";

/**
 * Schema per l'aggiornamento di un Job.
 * Usato nel JobDetailDialog (modalità edit).
 */
export const updateJobSchema = z
  .object({
    title: z.string().min(1, "Il titolo è obbligatorio"),
    description: z.string().optional(),
    location: z.string().optional(),
    salaryMin: z.union([z.number(), z.literal("")]),
    salaryMax: z.union([z.number(), z.literal("")]),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"] as const),
  })
  .superRefine((data, ctx) => {
    if (data.salaryMin === "") {
      ctx.addIssue({
        code: "custom",
        message: "Il salario minimo è obbligatorio",
        path: ["salaryMin"],
      });
    }
    if (data.salaryMax === "") {
      ctx.addIssue({
        code: "custom",
        message: "Il salario massimo è obbligatorio",
        path: ["salaryMax"],
      });
    }
  });

export type UpdateJobFormValues = z.infer<typeof updateJobSchema>;

/**
 * Trasforma i valori del form in UpdateJobDto compatibile con il backend.
 */
export function toUpdateJobDto(values: UpdateJobFormValues) {
  return {
    title: values.title,
    description: values.description || undefined,
    location: values.location || undefined,
    // Validation ensures these are not empty strings
    salaryMin: values.salaryMin as number,
    salaryMax: values.salaryMax as number,
    status: values.status as JobStatus,
  };
}
