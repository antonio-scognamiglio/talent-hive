import type { User } from "@prisma/client";

/**
 * User without password field (safe to send to frontend)
 */
export type UserWithoutPassword = Omit<User, "password">;
