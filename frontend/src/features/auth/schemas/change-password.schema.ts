import { z } from "zod";

/**
 * Schema for change password form validation
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La password attuale è obbligatoria"),
    newPassword: z
      .string()
      .min(6, "La nuova password deve contenere almeno 6 caratteri"),
    confirmPassword: z
      .string()
      .min(1, "La conferma della password è obbligatoria"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
