/**
 * User Roles Constants & Types
 * Il tipo Role viene da @shared/types/index (auto-generato da Prisma)
 */
import type { Role } from "@shared/types/index";

export const USER_ROLES = {
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
  CANDIDATE: "CANDIDATE",
} as const satisfies Record<string, Role>;

export type UserRole = Role;

export const getRoleDisplayName = (role: string | null | undefined): string => {
  if (!role) return "Guest";
  // Capitalize logic or dictionary
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
};
