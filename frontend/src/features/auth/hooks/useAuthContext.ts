import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../context/AuthContext";

/**
 * Hook to access authentication context
 * Throws error if used outside AuthProvider
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};
