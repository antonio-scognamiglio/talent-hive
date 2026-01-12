import { Navigate } from "react-router-dom";
// Fix import path to match where we created the placeholder
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { AuthLoadingFallback } from "./LoadingFallback";

interface GuestRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  onLoading?: () => React.ReactNode;
}

export function GuestRoute({
  children,
  redirectPath = "/",
  onLoading,
}: GuestRouteProps) {
  const { user, isCheckingAuth } = useAuthContext();

  if (!user && isCheckingAuth) {
    return onLoading ? onLoading() : <AuthLoadingFallback />;
  }

  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
