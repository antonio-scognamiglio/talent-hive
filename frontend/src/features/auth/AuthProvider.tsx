import { useState, useMemo, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthMeResponseDto } from "./types/auth-me.types";
import type { UserRole } from "./types/roles";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthMeResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth] = useState(false);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    // Mock login mechanism
    setTimeout(() => {
      setUser({
        id: "1",
        email,
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN" as UserRole,
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      userRole: user?.role || null,
      isLoading,
      isCheckingAuth,
      login,
      logout,
    }),
    [user, isLoading, isCheckingAuth, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
