import { z } from "zod";
import type { CreateJobDto } from "@shared/types";

/**
 * Schema per la creazione di un Job.
 * Usato nel CreateJobDialog.
 *
 * Differenze rispetto a updateJobSchema:
 * - Nessun campo status nel form (deciso dal bottone: draft vs publish)
 * - salaryMin/salaryMax opzionali (union number | "")
 */
export const createJobSchema = z
  .object({
    title: z.string().min(1, "Il titolo è obbligatorio"),
    description: z.string().optional(),
    location: z.string().optional(),
    salaryMin: z.union([z.number(), z.literal("")]),
    salaryMax: z.union([z.number(), z.literal("")]),
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

export type CreateJobFormValues = z.infer<typeof createJobSchema>;

/**
 * Trasforma i valori del form in CreateJobDto compatibile con il backend.
 * Lo status non è nel form — viene passato dal dialog in base al bottone cliccato.
 */
export function toCreateJobDto(
  values: CreateJobFormValues,
  status: "DRAFT" | "PUBLISHED" = "DRAFT",
): CreateJobDto {
  return {
    title: values.title,
    description: values.description || "",
    location: values.location || undefined,
    salaryMin: values.salaryMin === "" ? undefined : values.salaryMin,
    salaryMax: values.salaryMax === "" ? undefined : values.salaryMax,
    status,
  };
}
