import { prisma } from "../libs/prisma";
import type { User, Prisma } from "@prisma/client";
import type {
  ListUsersDto,
  UserWithoutPassword,
  UpdateProfileDto,
} from "@shared/types";
import type { PaginatedResponse } from "../types/pagination.types";
import { sanitizePrismaQuery } from "../utils/sanitize-prisma-query.util";
import { setQueryDefaults } from "../utils/prisma-query.utils";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../errors/app.error";

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

  /**
   * Update user profile (firstName, lastName, email)
   * Requires currentPassword verification for security
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<UserWithoutPassword> {
    // First, get the user to verify password
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError("Utente non trovato");
    }

    // Verify current password
    const { verifyPassword } = await import("../utils/hash.util");
    const isPasswordValid = await verifyPassword(
      data.currentPassword,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new ValidationError("Password non corretta");
    }

    // Check if email is being changed and if new email already exists
    if (data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictError("Questa email è già in uso");
      }
    }

    // Update the user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as UserWithoutPassword;
  }
}

export const userService = new UserService();
