import { apiClient } from "@/features/shared/api";
import type { AuthMeResponseDto } from "@/features/auth/types/auth-me.types";
import {
  type LoginDto,
  type RegisterDto,
  type User,
  type UpdateProfileDto,
  type ChangePasswordDto,
} from "@shared/types";

export const authService = {
  /**
   * Login user
   * Backend sets HTTP-only cookie automatically
   * Does NOT return user data - use getMe() after login
   */
  login: async (credentials: LoginDto) => {
    const { data } = await apiClient.post<{ message: string }>(
      "/auth/login",
      credentials,
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
      dto,
    );
    return data;
  },

  /**
   * Change user password
   * Requires current password for verification
   */
  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await apiClient.post("/auth/change-password", data);
  },

  updateProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await apiClient.put<User>("/users/profile", data);
    return response.data;
  },
};
