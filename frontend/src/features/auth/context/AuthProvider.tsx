import { useState, useMemo, useCallback, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthMeResponseDto } from "../types/auth-me.types";
import { authService } from "@/features/shared/services/auth.service";
import {
  startTokenRefreshTimer,
  stopTokenRefreshTimer,
} from "../utils/token.utils";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthMeResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const userData = await authService.getMe();
        setUser(userData);
        startTokenRefreshTimer();
      } catch {
        setUser(null);
        stopTokenRefreshTimer();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login({ email, password });
      const userData = await authService.getMe();
      setUser(userData);
      startTokenRefreshTimer();
    } catch (error) {
      setUser(null);
      stopTokenRefreshTimer();
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      stopTokenRefreshTimer();
      setIsLoading(false);
    }
  }, []);

  const refreshMe = useCallback(async () => {
    try {
      // Non settiamo isLoading qui per evitare flashing della UI
      // se è un aggiornamento background
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing me:", error);
      // Non facciamo logout qui, lasciamo che sia l'interceptor a gestire 401
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      userRole: user?.role || null,
      isLoading,
      isCheckingAuth,
      login,
      logout,
      refreshMe,
    }),
    [user, isLoading, isCheckingAuth, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
