import { createContext } from "react";
import type { UserRole } from "@/features/shared/types/roles.types";
import type { AuthMeResponseDto } from "../types/auth-me.types";

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
  performLogout?: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
