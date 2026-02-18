import { USER_ROLES } from "@/features/shared/types/roles.types";
import type { UserRole } from "@/features/shared/types/roles.types";
import type { User } from "@shared/types";

// Helper to get role from User object or string
const getRole = (
  userOrRole: User | UserRole | string | undefined | null,
): UserRole | null => {
  if (!userOrRole) return null;
  if (typeof userOrRole === "string") return userOrRole as UserRole;
  return (userOrRole as User).role as UserRole;
};

export const isAdmin = (
  userOrRole: User | UserRole | string | undefined | null,
): boolean => {
  return getRole(userOrRole) === USER_ROLES.ADMIN;
};

export const isRecruiter = (
  userOrRole: User | UserRole | string | undefined | null,
): boolean => {
  return getRole(userOrRole) === USER_ROLES.RECRUITER;
};

export const isCandidate = (
  userOrRole: User | UserRole | string | undefined | null,
): boolean => {
  return getRole(userOrRole) === USER_ROLES.CANDIDATE;
};

export const isInternalUser = (
  userOrRole: User | UserRole | string | undefined | null,
): boolean => {
  const role = getRole(userOrRole);
  return role === USER_ROLES.ADMIN || role === USER_ROLES.RECRUITER;
};
