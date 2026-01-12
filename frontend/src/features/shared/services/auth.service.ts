import { apiClient } from "@/features/shared/api";
import type { AuthMeResponseDto } from "@/features/auth/types/auth-me.types";
import type { Role } from "@shared/types/index";

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role;
}

export const authService = {
  /**
   * Login user
   * Backend sets HTTP-only cookie automatically
   * Does NOT return user data - use getMe() after login
   */
  login: async (credentials: LoginDto) => {
    const { data } = await apiClient.post<{ message: string }>(
      "/auth/login",
      credentials
    );
    return data;
  },

  /**
   * Get current user data
   * Uses cookie authentication automatically
   */
  getMe: async () => {
    const { data } = await apiClient.get<AuthMeResponseDto>("/auth/me");
    return data;
  },

  /**
   * Logout user
   * Backend clears cookie
   */
  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  /**
   * Refresh session token
   * Backend updates cookie with new expiry
   */
  refresh: async () => {
    await apiClient.post("/auth/refresh");
  },

  /**
   * Register new user
   * Backend sets HTTP-only cookie automatically
   * Does NOT return user data - use getMe() after register
   */
  register: async (dto: RegisterDto) => {
    const { data } = await apiClient.post<{ message: string }>(
      "/auth/register",
      dto
    );
    return data;
  },
};
