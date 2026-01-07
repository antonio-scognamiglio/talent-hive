import type { UserRole } from "./roles";

export interface AuthMeResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// Helpers che erano usati nel hook (mocked per ora o implementati)
export const isAuthMeAdmin = (user: AuthMeResponseDto | null) => user?.role === "ADMIN";
export const isAuthMeRecruiter = (user: AuthMeResponseDto | null) => user?.role === "RECRUITER";
export const isAuthMeCandidate = (user: AuthMeResponseDto | null) => user?.role === "CANDIDATE";
export const isAuthMeHiringManager = (user: AuthMeResponseDto | null) => user?.role === "HIRING_MANAGER";

// Legacy helpers from Lex Nexus to match imports in useSidebarBadgeCount
export const isAuthMeLawyer = () => false;
export const isAuthMeEmployee = () => false;
