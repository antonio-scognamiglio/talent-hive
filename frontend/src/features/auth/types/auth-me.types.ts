/**
 * Auth Me Types
 *
 * Uses shared types from backend
 */

import type { User } from "@shared/types/index";

// Frontend DTO for authenticated user (no password)
export type AuthMeResponseDto = Omit<User, "password">;

export function isAdmin(user: AuthMeResponseDto | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function isRecruiter(
  user: AuthMeResponseDto | null | undefined
): boolean {
  return user?.role === "RECRUITER";
}

export function isCandidate(
  user: AuthMeResponseDto | null | undefined
): boolean {
  return user?.role === "CANDIDATE";
}
