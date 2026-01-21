import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { PaginatedResponse } from "@/features/shared/types/pagination.types";
import { apiClient } from "../api/client";
import type { UserWithoutPassword } from "@shared/types";
import type { AxiosResponse } from "axios";

/**
 * Users API Service
 * Handles all user-related API calls
 */
export const usersService = {
  /**
   * List users with pagination and filters
   * POST /api/users/list
   *
   * @param options - API options with body containing Prisma query
   * @returns Full AxiosResponse with PaginatedResponse in .data
   */
  listUsers: async (options: {
    body: PrismaQueryOptions<UserWithoutPassword>;
    path?: Record<string, unknown>;
  }): Promise<AxiosResponse<PaginatedResponse<UserWithoutPassword>>> => {
    return await apiClient.post<PaginatedResponse<UserWithoutPassword>>(
      "/users/list",
      options.body,
    );
  },
};
