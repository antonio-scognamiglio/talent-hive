import { z } from "zod";

/**
 * Register Form Schema
 *
 * Validates user registration data.
 * - Email must be valid format
 * - Password minimum 8 characters
 * - Passwords must match
 * - First name and last name required (min 2 chars)
 * - Role must be valid enum value
 */
export const registerSchema = z
  .object({
    email: z.string().min(1, "Email è richiesta").email("Email non valida"),
    password: z.string().min(8, "La password deve essere almeno 8 caratteri"),
    confirmPassword: z.string().min(1, "Conferma password è richiesta"),
    firstName: z.string().min(2, "Il nome deve essere almeno 2 caratteri"),
    lastName: z.string().min(2, "Il cognome deve essere almeno 2 caratteri"),
    role: z.enum(["ADMIN", "RECRUITER", "CANDIDATE"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

/**
 * Register Form Data Type
 * Inferred from registerSchema for type safety
 */
export type RegisterFormData = z.infer<typeof registerSchema>;
