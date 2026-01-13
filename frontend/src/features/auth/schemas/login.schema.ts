import { z } from "zod";

/**
 * Login Form Schema
 *
 * Validates user login credentials.
 * - Email must be valid format
 * - Password minimum 8 characters
 */
export const loginSchema = z.object({
  email: z.string().min(1, "Email è richiesta").email("Email non valida"),
  password: z.string().min(8, "La password deve essere almeno 8 caratteri"),
});

/**
 * Login Form Data Type
 * Inferred from loginSchema for type safety
 */
export type LoginFormData = z.infer<typeof loginSchema>;
