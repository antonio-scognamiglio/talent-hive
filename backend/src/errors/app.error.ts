/**
 * Custom Application Error
 *
 * Base class for all application errors.
 * Errors thrown with this class will be handled by the error middleware
 * and return a proper JSON response with the correct status code.
 *
 * @example
 * throw new AppError("Password non corretta", 400);
 * throw new AppError("Risorsa non trovata", 404);
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes expected errors from bugs

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================
// Specific Error Classes (for better semantics)
// ============================================

/**
 * 400 Bad Request - Validation or business logic errors
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Non autorizzato") {
    super(message, 401);
  }
}

/**
 * 403 Forbidden - Authenticated but not allowed
 */
export class ForbiddenError extends AppError {
  constructor(message = "Accesso negato") {
    super(message, 403);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(message = "Risorsa non trovata") {
    super(message, 404);
  }
}

/**
 * 409 Conflict - Resource already exists or state conflict
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
