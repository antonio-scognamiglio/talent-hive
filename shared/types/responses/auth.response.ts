import type { UserWithoutPassword } from "../entities/user.types";

/**
 * Authentication response
 * Returned after successful login/register
 */
export interface AuthResponse {
  user: UserWithoutPassword;
  cookie: string;
  expiresAt: string;
}
