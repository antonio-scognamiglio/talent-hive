import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { AuthLoadingFallback } from "./LoadingFallback";

/**
 * Props per il componente GuestRoute
 */
interface GuestRouteProps {
  /** Contenuto da renderizzare se non autenticato */
  children: React.ReactNode;

  /** Path di redirect se autenticato */
  redirectPath?: string;

  /** Componente custom per loading */
  onLoading?: () => React.ReactNode;
}

/**
 * Guest Route Component
 * Guard per proteggere rotte destinate solo a utenti non autenticati
 *
 * Comportamento:
 * - Se isCheckingAuth = true → mostra loading
 * - Se utente è autenticato → redirect a redirectPath (default: "/")
 * - Altrimenti → renderizza children (pagina auth)
 *
 * @example
 * <GuestRoute>
 *   <Auth />
 * </GuestRoute>
 */
export function GuestRoute({
  children,
  redirectPath = "/",
  onLoading,
}: GuestRouteProps) {
  const { user: me, isCheckingAuth } = useAuthContext();

  // Pattern uniformato con RoleBasedRouter e ProtectedRoute:
  // 1. Controlli negativi/edge cases prima (loading, redirect)
  // 2. Caso normale alla fine (mostra children)

  // Loading solo se stiamo ancora controllando E non abbiamo ancora un utente
  // (caso tipico: primo accesso alla pagina o refresh)
  if (!me && isCheckingAuth) {
    return onLoading ? onLoading() : <AuthLoadingFallback />;
  }

  // Se autenticato (anche durante check), redirect immediato senza loading
  // Questo evita flash di loading durante navigazione per utenti già loggati
  // Utenti autenticati non devono vedere questa rotta (es. pagina di login, registrazione, ecc.)
  if (me) {
    return <Navigate to={redirectPath} replace />;
  }

  // Utente non autenticato → mostra contenuto (questa rotta è solo per guest)
  return <>{children}</>;
}
