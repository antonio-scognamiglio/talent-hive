import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/hash.util";
import { signJwtCookie, type JwtPayload } from "../utils/jwt.util";
import type { UserWithoutPassword } from "../types/user.types";

const prisma = new PrismaClient();

export type { UserWithoutPassword };

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "ADMIN" | "RECRUITER" | "CANDIDATE";
}

export interface AuthResponse {
  user: UserWithoutPassword; // ✅ Usa tipo Prisma
  cookie: string;
  expiresAt: string;
}

class AuthService {
  /**
   * Login user
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // 1. Cerca utente per email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // 2. Verifica che esista
    if (!user) {
      throw new Error("Email o password non corretta");
    }

    // 3. Verifica password
    const isPasswordValid = await verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Email o password non corretta");
    }

    // 4. Genera JWT token + cookie
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { cookie } = signJwtCookie(payload);

    // 5. Calcola scadenza (24h da ora)
    const expiresAt = new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000
    ).toISOString();

    // 6. Ritorna user (senza password!) + cookie
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      cookie,
      expiresAt,
    };
  }

  /**
   * Register new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    // 1. Controlla se email già esiste
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("Email già registrata");
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(data.password);

    // 3. Crea utente
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || "CANDIDATE",
      },
    });

    // 4. Genera JWT token + cookie (auto-login dopo registrazione)
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const { cookie } = signJwtCookie(payload);

    const expiresAt = new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN || "86400") * 1000
    ).toISOString();

    // 5. Ritorna user (senza password!) + cookie
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      cookie,
      expiresAt,
    };
  }

  /**
   * Get user by ID (per middleware auth)
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Utente non trovato");
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
