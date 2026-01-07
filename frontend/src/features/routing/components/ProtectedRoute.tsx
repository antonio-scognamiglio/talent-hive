import { Navigate } from "react-router-dom";
import { Scale } from "lucide-react";
import { AuthLoadingFallback } from "./LoadingFallback";

/**
 * Props per il componente ProtectedRoute
 */
interface ProtectedRouteProps<TRole extends string> {
  /** Contenuto da renderizzare se autorizzato */
  children: React.ReactNode;

  /** Ruoli autorizzati ad accedere */
  allowedRoles?: TRole[];

  /** Ruolo corrente dell'utente */
  currentUserRole?: TRole;

  /** Se è in corso il check dell'autenticazione */
  isCheckingAuth: boolean;

  /** Path di redirect se non autenticato */
  authRedirectPath?: string;

  /** Componente custom per loading */
  onLoading?: () => React.ReactNode;

  /** Componente custom per accesso negato */
  onAccessDenied?: () => React.ReactNode;
}

/**
 * Default Access Denied Component
 */
const DefaultAccessDenied: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="max-w-md text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Scale className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Accesso Negato
        </h1>
        <p className="text-muted-foreground">
          Non hai i permessi necessari per accedere a questa pagina.
        </p>
      </div>
      <button
        onClick={() => window.history.back()}
        className="text-sm text-primary hover:underline"
      >
        ← Torna indietro
      </button>
    </div>
  </div>
);

/**
 * Protected Route Component
 * Guard per proteggere rotte che richiedono autenticazione e autorizzazione
 *
 * Comportamento (pattern uniformato):
 * - Se currentUserRole esiste (anche durante check) → controlla permessi o mostra children
 * - Se non autenticato E non in check → redirect a authRedirectPath
 * - Altrimenti (solo durante check senza ruolo) → mostra loading
 *
 * @example
 * <ProtectedRoute
 *   allowedRoles={["admin", "user"]}
 *   currentUserRole={user?.role}
 *   isCheckingAuth={isCheckingAuth}
 * >
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export function ProtectedRoute<TRole extends string>({
  children,
  allowedRoles,
  currentUserRole,
  isCheckingAuth,
  authRedirectPath = "/auth",
  onLoading,
  onAccessDenied,
}: ProtectedRouteProps<TRole>) {
  // Pattern uniformato con RoleBasedRouter:
  // 1. Se non autenticato E non in check → redirect
  // 2. Se non autenticato E in check → loading
  // 3. Altrimenti (autenticato) → controlla permessi o mostra children

  // Se non autenticato e non in check, redirect al path di login
  if (!currentUserRole && !isCheckingAuth) {
    return <Navigate to={authRedirectPath} replace />;
  }

  // Loading solo se stiamo ancora controllando E non abbiamo ancora un ruolo
  // (caso tipico: primo accesso alla pagina o refresh)
  if (!currentUserRole && isCheckingAuth) {
    return onLoading ? onLoading() : <AuthLoadingFallback />;
  }

  // Se arriviamo qui, significa che currentUserRole esiste → controlla permessi
  // Se autenticato ma non ha i permessi, mostra access denied
  if (allowedRoles && !allowedRoles.includes(currentUserRole!)) {
    return onAccessDenied ? onAccessDenied() : <DefaultAccessDenied />;
  }

  // Utente autenticato con permessi corretti
  return <>{children}</>;
}
