import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error";

/**
 * Global Error Handler Middleware
 *
 * Catches all errors thrown in routes and returns a consistent JSON response.
 * - AppError instances: Returns the error message with the specified status code
 * - Other errors: Returns 500 with a generic message (to avoid leaking internal details)
 *
 * Usage: Register as the LAST middleware in your Express app
 * app.use(errorHandler);
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // If it's our custom AppError (expected/operational error)
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  // Unexpected error (bug) - log and return generic message
  console.error("Unexpected error:", error);
  res.status(500).json({
    message: "Si è verificato un errore interno",
  });
}
