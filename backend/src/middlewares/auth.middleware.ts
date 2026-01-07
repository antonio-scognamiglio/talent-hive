import { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.util";
import {
  authService,
  type UserWithoutPassword,
} from "../services/auth.service";

/**
 * Express Request con user autenticato
 */
export interface AuthRequest extends Request {
  user?: UserWithoutPassword; // ✅ Usa tipo condiviso
}

/**
 * Middleware per verificare JWT e autenticare l'utente
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Estrai token dal cookie (usando cookie-parser)
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    // 2. Verifica token JWT
    const payload: JwtPayload = verifyToken(token);

    // 3. Carica user dal DB (per avere dati freschi)
    const user = await authService.getUserById(payload.userId);

    // 4. Attacca user alla request
    req.user = user;

    // 5. Procedi al prossimo handler
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      error: error instanceof Error ? error.message : "Token non valido",
    });
  }
};

/**
 * Middleware per verificare ruolo specifico
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Non autenticato" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Non hai i permessi per accedere a questa risorsa",
      });
    }

    next();
  };
};
