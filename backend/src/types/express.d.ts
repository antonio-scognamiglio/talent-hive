import type { UserWithoutPassword } from "./user.types";

// Extend Express Request type to include user from auth middleware
declare global {
  namespace Express {
    interface Request {
      user?: UserWithoutPassword;
    }
  }
}

export {};
