import { Suspense, useMemo } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoadingFallback } from "./LoadingFallback";
import { getRoutesForRole } from "../utils/route-helpers";
import NotFound from "@/pages/not-found/NotFound";
import type { RouteGroup, RouteConfig } from "../types";

/**
 * Props per il componente RoleBasedRouter
 */
interface RoleBasedRouterProps<TRole extends string, TUser> {
  /** Utente corrente (null se non autenticato) */
  user: TUser | null;

  /** Ruolo dell'utente corrente (undefined se non autenticato) - già memoizzato nel provider */
  userRole: TRole | undefined;

  /** Se è in corso il check dell'autenticazione */
  isCheckingAuth: boolean;

  /** Gruppi di rotte configurati */
  routeGroups: RouteGroup<TRole>[];

  /** Wrapper per applicare layout alle rotte */
  layoutWrapper?: (
    children: React.ReactNode,
    route: RouteConfig<TRole>,
  ) => React.ReactNode;

  /** Path di redirect se non autenticato */
  authRedirectPath?: string;

  /** Componente custom per loading */
  loadingFallback?: React.ReactNode;

  /** Componente custom per accesso negato */
  accessDeniedFallback?: React.ReactNode;

  /** Componente custom per loading di auth */
  authLoadingFallback?: React.ReactNode;
}

/**
 * Role Based Router Component
 * Router principale che genera dinamicamente le rotte in base al ruolo dell'utente
 *
 * Funzionamento:
 * 1. Filtra le rotte accessibili per il ruolo corrente
 * 2. Genera le Route components dinamicamente
 * 3. Applica ProtectedRoute guard a tutte le rotte
 * 4. Applica layout tramite layoutWrapper se specificato
 * 5. Gestisce redirect se non autenticato
 *
 * Vantaggi:
 * - Zero rotte hardcoded
 * - Aggiungere rotta = solo modifica routeGroups
 * - Type-safe con TypeScript
 * - Performance: solo rotte autorizzate vengono caricate
 *
 * @example
 * <RoleBasedRouter
 *   user={user}
 *   userRole={userRole}
 *   isCheckingAuth={isCheckingAuth}
 *   routeGroups={ROUTE_GROUPS}
 *   layoutWrapper={(children, route) => (
 *     <SidebarLayout config={LAYOUT_CONFIG}>
 *       {children}
 *     </SidebarLayout>
 *   )}
 * />
 */
export function RoleBasedRouter<TRole extends string, TUser>({
  user,
  userRole,
  isCheckingAuth,
  routeGroups,
  layoutWrapper,
  authRedirectPath = "/auth",
  loadingFallback,
  accessDeniedFallback,
  authLoadingFallback,
}: RoleBasedRouterProps<TRole, TUser>) {
  const userRoutes = useMemo(() => {
    if (!userRole) return [];
    return getRoutesForRole(routeGroups, userRole);
  }, [routeGroups, userRole]);

  // Se non autenticato e non in check, redirect
  if (!user && !isCheckingAuth) {
    return <Navigate to={authRedirectPath} replace />;
  }

  // Loading solo se stiamo ancora controllando E non abbiamo ancora un utente
  // (caso tipico: primo accesso alla pagina o refresh)
  if (!user && isCheckingAuth) {
    return authLoadingFallback || <LoadingFallback />;
  }

  // Se arriviamo qui, significa che user esiste → generiamo le rotte
  return (
    <Suspense fallback={loadingFallback || <LoadingFallback />}>
      <Routes>
        {userRoutes.map((route) => {
          const Component = route.element;

          // Content base con ProtectedRoute
          const content = (
            <ProtectedRoute
              allowedRoles={route.allowedRoles}
              currentUserRole={userRole}
              isCheckingAuth={isCheckingAuth}
              authRedirectPath={authRedirectPath}
              onLoading={
                authLoadingFallback ? () => authLoadingFallback : undefined
              }
              onAccessDenied={
                accessDeniedFallback ? () => accessDeniedFallback : undefined
              }
            >
              <Component />
            </ProtectedRoute>
          );

          // Applica layout se specificato
          const wrappedContent = layoutWrapper
            ? layoutWrapper(content, route)
            : content;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={wrappedContent}
            />
          );
        })}

        {/* Catch-all: mostra NotFound per rotte non trovate */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
