import type { User } from "../entities/generated/interfaces";

/**
 * User without sensitive password field
 */
export type UserWithoutPassword = Omit<User, "password">;

/**
 * User profile view (public fields only)
 */
export type UserProfile = Pick<
  User,
  "id" | "email" | "firstName" | "lastName" | "role"
>;
