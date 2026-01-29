import { z } from "zod";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "Il nome è obbligatorio"),
  lastName: z.string().min(1, "Il cognome è obbligatorio"),
  email: z.string().email("Email non valida"),
  currentPassword: z.string().min(1, "La password è obbligatoria"),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
