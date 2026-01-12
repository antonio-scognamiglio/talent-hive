import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/hash.util";
import { signJwtCookie, type JwtPayload } from "../utils/jwt.util";
import type { User, Role } from "@shared/types/index";

const prisma = new PrismaClient();

// Use shared type for User without password
export type UserWithoutPassword = Omit<User, "password">;

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

export interface AuthResponse {
  user: UserWithoutPassword;
  cookie: string;
  expiresAt: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Email o password non corretta");
    }

    const isPasswordValid = await verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email o password non corretta");
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { cookie } = signJwtCookie(payload);

    const expiresAt = new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000
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
  async register(data: RegisterDto): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email già registrata");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || "CANDIDATE",
      },
    });

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { cookie } = signJwtCookie(payload);

    const expiresAt = new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000
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
      throw new Error("Utente non trovato");
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
      throw new Error("Utente non trovato");
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { cookie } = signJwtCookie(payload);

    const expiresAt = new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000
    ).toISOString();

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword as UserWithoutPassword,
      cookie,
      expiresAt,
    };
  }
}

export const authService = new AuthService();
