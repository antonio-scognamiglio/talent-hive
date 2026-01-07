import { createContext } from "react";
import type { UserRole } from "./types/roles";
import type { AuthMeResponseDto } from "./types/auth-me.types";

/**
 * Auth Context Type
 */
export interface AuthContextType {
  user: AuthMeResponseDto | null;
  userRole: UserRole | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
