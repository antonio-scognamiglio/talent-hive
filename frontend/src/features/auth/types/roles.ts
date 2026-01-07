export const USER_ROLES = {
  ADMIN: "ADMIN",
  RECRUITER: "RECRUITER",
  CANDIDATE: "CANDIDATE",
  HIRING_MANAGER: "HIRING_MANAGER"
} as const;

export type UserRole = keyof typeof USER_ROLES;
