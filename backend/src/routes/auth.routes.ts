import { Router, Request, Response } from "express";
import { authService } from "../services/auth.service";

const router = Router();

/**
 * POST /api/auth/login
 * Login user e setta cookie httpOnly
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validazione base
    if (!email || !password) {
      return res.status(400).json({
        error: "Email e password sono obbligatori",
      });
    }

    // Login tramite service
    const result = await authService.login({ email, password });

    // Setta cookie httpOnly
    res.setHeader("Set-Cookie", result.cookie);

    // Risposta
    return res.status(200).json({
      user: result.user,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({
      error: error instanceof Error ? error.message : "Errore durante il login",
    });
  }
});

/**
 * POST /api/auth/register
 * Registra nuovo utente e auto-login
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validazione base
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: "Email, password, nome e cognome sono obbligatori",
      });
    }

    // Validazione password (minimo 6 caratteri)
    if (password.length < 6) {
      return res.status(400).json({
        error: "La password deve contenere almeno 6 caratteri",
      });
    }

    // Registrazione tramite service
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    // Setta cookie httpOnly (auto-login)
    res.setHeader("Set-Cookie", result.cookie);

    // Risposta
    return res.status(201).json({
      user: result.user,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(400).json({
      error:
        error instanceof Error
          ? error.message
          : "Errore durante la registrazione",
    });
  }
});

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
