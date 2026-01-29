import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/hash.util";
import { signJwtCookie, type JwtPayload } from "../utils/jwt.util";
import type {
  Role,
  LoginDto,
  RegisterDto,
  UserWithoutPassword,
  AuthResponse,
  ChangePasswordDto,
} from "@shared/types";

import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
} from "../errors/app.error";

const prisma = new PrismaClient();

class AuthService {
  /**
   * Login user
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError("Email o password non corretta");
    }

    const isPasswordValid = await verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Email o password non corretta");
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { cookie } = signJwtCookie(payload);

    const expiresAt = new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000,
    ).toISOString();

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as UserWithoutPassword,
      cookie,
      expiresAt,
    };
  }

  /**
   * Register new user
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictError("User already exists");
    }

    const hashedPassword = await hashPassword(dto.password); // Reverted to original hashPassword

    // SECURITY: Force role to CANDIDATE for public registration
    // Ignores any role sent in DTO to prevent privilege escalation
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: "CANDIDATE",
      },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { cookie } = signJwtCookie(payload);

    const expiresAt = new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000,
    ).toISOString();

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as UserWithoutPassword,
      cookie,
      expiresAt,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserWithoutPassword> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  }

  /**
   * Refresh token
   */
  async refresh(userId: string): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { cookie } = signJwtCookie(payload);

    const expiresAt = new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000,
    ).toISOString();

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as UserWithoutPassword,
      cookie,
      expiresAt,
    };
  }

  /**
   * Change user password
   * Requires current password verification before updating
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("Utente non trovato");
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      dto.currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new ValidationError("La password attuale non è corretta");
    }

    // Validate new password (minimum 6 characters)
    if (dto.newPassword.length < 6) {
      throw new ValidationError(
        "La nuova password deve contenere almeno 6 caratteri",
      );
    }

    // Hash and save new password
    const hashedNewPassword = await hashPassword(dto.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: "Password aggiornata con successo" };
  }
}

export const authService = new AuthService();
