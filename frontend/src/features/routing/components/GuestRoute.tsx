import { Navigate } from "react-router-dom";
// Fix import path to match where we created the placeholder
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { LoadingFallback } from "./LoadingFallback";

interface GuestRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  onLoading?: () => React.ReactNode;
}

/**
 * GuestRoute Component
 * Renders children only if the user is NOT authenticated.
 * If the user is authenticated, they are redirected to the `redirectPath` (default: "/").
 * Used for pages like Login, Register, etc.
 */
export function GuestRoute({
  children,
  redirectPath = "/",
  onLoading,
}: GuestRouteProps) {
  const { user, isCheckingAuth } = useAuthContext();

  if (!user && isCheckingAuth) {
    return onLoading ? onLoading() : <LoadingFallback />;
  }

  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
