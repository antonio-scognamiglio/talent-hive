import { prisma } from "../libs/prisma";
import type { User, Prisma } from "@prisma/client";
import type { ListUsersDto, UserWithoutPassword } from "@shared/types";
import type { PaginatedResponse } from "../types/pagination.types";
import { sanitizePrismaQuery } from "../utils/sanitize-prisma-query.util";
import { setQueryDefaults } from "../utils/prisma-query.utils";

class UserService {
  /**
   * Get users list with pagination and filters
   * RBAC: CANDIDATE cannot access this (handled in route/controller)
   */
  async getUsers(
    incomingQuery: ListUsersDto,
  ): Promise<PaginatedResponse<UserWithoutPassword>> {
    // Sanitize query with include depth limit and pagination cap
    let safeQuery: Prisma.UserFindManyArgs = sanitizePrismaQuery(
      incomingQuery,
      { maxIncludeDepth: 1, maxTake: 100 },
    );

    // Set defaults using utility
    safeQuery = setQueryDefaults(safeQuery, {
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" as const },
    });

    // Ensure password is excluded via select
    safeQuery.select = {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    };

    const [users, count] = await Promise.all([
      prisma.user.findMany(safeQuery),
      prisma.user.count({ where: safeQuery.where }),
    ]);

    // Cast to UserWithoutPassword because we selected fields manually to exclude password
    return {
      data: users as UserWithoutPassword[],
      count,
      query: safeQuery,
    };
  }
}

export const userService = new UserService();
