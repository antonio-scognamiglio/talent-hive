import { Request, Response, NextFunction } from "express";
import { verifyToken, type JwtPayload } from "../utils/jwt.util";
import { authService } from "../services/auth.service";
import type { UserWithoutPassword } from "@shared/types";
import { UnauthorizedError } from "../errors/app.error";

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
  next: NextFunction,
) => {
  try {
    // 1. Estrai token dal cookie (usando cookie-parser)
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedError("Non autenticato");
    }

    // 2. Verifica token JWT
    // Se fallisce, verifyToken lancia un errore che verrà catturato e convertito in 401/403 se appropriato
    // o gestito come errore generico.
    // TODO: verifyToken dovrebbe lanciare AppErrors specifici.
    const payload: JwtPayload = verifyToken(token);

    // 3. Carica user dal DB (per avere dati freschi)
    const user = await authService.getUserById(payload.userId);

    // 4. Attacca user alla request
    req.user = user;

    // 5. Procedi al prossimo handler
    next();
  } catch (error) {
    if (error instanceof Error && error.message === "Utente non trovato") {
      next(new UnauthorizedError("Utente non trovato"));
    } else {
      // Se verifyToken lancia errore, lo passiamo
      // Sarebbe meglio se verifyToken lanciasse UnauthorizedError
      next(new UnauthorizedError("Token non valido o scaduto"));
    }
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
