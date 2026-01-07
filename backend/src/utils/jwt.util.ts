import jwt from "jsonwebtoken";
import { config } from "../config/config";

const JWT_SECRET = config.auth.jwtSecret;
const JWT_EXPIRES_IN = config.auth.jwtExpiresIn;

/**
 * Payload del JWT Token
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Crea un JWT token
 * @param payload - Dati da includere nel token
 * @returns JWT token firmato
 */
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN, // in secondi (default 24h)
  });
};

/**
 * Verifica e decodifica un JWT token
 * @param token - Token da verificare
 * @returns Payload decodificato
 * @throws Error se il token è invalido o scaduto
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token scaduto");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Token non valido");
    }
    throw new Error("Errore verifica token");
  }
};

/**
 * Genera token JWT + cookie httpOnly
 * @param payload - Dati utente da includere
 * @returns Token e stringa cookie pronta per Set-Cookie header
 */
export const signJwtCookie = (
  payload: JwtPayload
): { token: string; cookie: string } => {
  const token = signToken(payload);

  // httpOnly: JavaScript non può leggere (sicurezza XSS)
  // SameSite=Strict: Protegge da CSRF
  // Path=/: Cookie valido per tutto il sito
  // Max-Age: Durata in secondi
  const cookie = `accessToken=${token}; HttpOnly; Path=/; Max-Age=${JWT_EXPIRES_IN}; SameSite=Strict`;

  return { token, cookie };
};
