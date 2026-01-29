import { Router, Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import {
  authMiddleware,
  type AuthRequest,
} from "../middlewares/auth.middleware";
import { ChangePasswordDto } from "@shared/types";
import { ValidationError } from "../errors/app.error";

const router = Router();

/**
 * POST /api/auth/login
 * Login user e setta cookie httpOnly
 */
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Validazione base
      if (!email || !password) {
        throw new ValidationError("Email e password sono obbligatori");
      }

      // Login tramite service
      const result = await authService.login({ email, password });

      // Setta cookie httpOnly
      res.setHeader("Set-Cookie", result.cookie);

      // Risposta - SOLO conferma login (come lex-nexus)
      // User data viene ottenuto tramite GET /auth/me
      return res.status(200).json({
        message: "Login effettuato con successo",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/register
 * Registra nuovo utente e auto-login
 */
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Validazione base
      if (!email || !password || !firstName || !lastName) {
        throw new ValidationError(
          "Email, password, nome e cognome sono obbligatori",
        );
      }

      // Validazione password (minimo 6 caratteri)
      if (password.length < 6) {
        throw new ValidationError(
          "La password deve contenere almeno 6 caratteri",
        );
      }

      // Registrazione tramite service
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      // Setta cookie httpOnly (auto-login)
      res.setHeader("Set-Cookie", result.cookie);

      // Risposta - SOLO conferma registrazione
      return res.status(201).json({
        message: "Registrazione effettuata con successo",
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /api/auth/me
 * Ottiene dati utente autenticato dal cookie
 */
router.get(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        // Should be handled by middleware, but double check
        return res.status(401).json({ message: "Non autenticato" });
      }

      return res.status(200).json(req.user);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/refresh
 * Rinnova il token se valido
 */
router.post(
  "/refresh",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const result = await authService.refresh(req.user.id);

      // Setta nuovo cookie
      res.setHeader("Set-Cookie", result.cookie);

      return res.status(200).json({
        message: "Sessione rinnovata",
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/change-password
 * Cambia la password dell'utente autenticato
 */
router.post(
  "/change-password",
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Non autenticato" });
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validazione base
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new ValidationError(
          "Password attuale, nuova password e conferma sono obbligatorie",
        );
      }

      // Verifica che newPassword e confirmPassword coincidano
      if (newPassword !== confirmPassword) {
        throw new ValidationError(
          "La nuova password e la conferma non coincidono",
        );
      }

      // Esegui cambio password
      const result = await authService.changePassword(
        req.user.id,
        req.body as ChangePasswordDto,
      );

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /api/auth/logout
 * Cancella cookie e logout
 */
router.post("/logout", (_req: Request, res: Response) => {
  // Cancella cookie settando Max-Age=0
  res.setHeader("Set-Cookie", "accessToken=; HttpOnly; Path=/; Max-Age=0");
  return res.status(200).json({ message: "Logout effettuato" });
});

export default router;
