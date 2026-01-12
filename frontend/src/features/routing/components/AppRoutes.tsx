import { useMemo, useCallback, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { RoleBasedRouter, GuestRoute } from "@/features/routing/components";
import { SidebarLayout } from "@/features/routing/layouts/SidebarLayout";
import { CompactLoadingFallback } from "@/features/routing/components/LoadingFallback";
import { ROUTE_GROUPS } from "@/features/shared/config/routes.config";
import { getLayoutConfig } from "@/features/shared/config/layout.config";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { useIsMobile } from "@/features/shared/hooks/useIsMobile";
import { ThemeToggle } from "@/features/shared/components/ThemeToggle";
import type { RouteConfig } from "@/features/routing/types";
import LoginPage from "@/pages/auth/LoginPage";
import { getRoutesForRole } from "@/features/routing/utils/route-helpers";

/**
 * App Routes Component
 * Componente che gestisce il routing dell'applicazione con layout dinamici
 *
 * Responsabilità:
 * - Filtrare le rotte in base al ruolo utente
 * - Configurare il layout (sidebar/topbar) in base al ruolo e device
 * - Gestire il layoutWrapper per applicare SidebarLayout alle rotte protette
 * - Separare rotte pubbliche (login) da quelle protette
 */
export function AppRoutes() {
  const { user, userRole, isCheckingAuth } = useAuthContext();
  const isMobile = useIsMobile();

  // Filtra le rotte solo per il ruolo corrente
  const userRoutes = useMemo(() => {
    if (!user || !userRole) return [];
    return getRoutesForRole(ROUTE_GROUPS, userRole);
  }, [user, userRole]);

  // Ottieni configurazione layout per il ruolo corrente (con supporto responsive)
  const layoutConfig = useMemo(
    () => (userRole ? getLayoutConfig(userRole, isMobile) : null),
    [userRole, isMobile]
  );

  // Memoizza additionalActions (ThemeToggle, ecc.)
  const additionalActions = useMemo(
    () => (
      <>
        {/* Theme Toggle */}
        <ThemeToggle />
      </>
    ),
    []
  );

  // Memoizza layoutWrapper per evitare re-render infiniti
  const layoutWrapper = useCallback(
    (children: React.ReactNode, route: RouteConfig) => {
      // Switch basato su route.layout
      if (route.layout === "sidebar") {
        return (
          <SidebarLayout
            config={layoutConfig ?? undefined}
            user={user}
            routes={userRoutes}
            isMobile={isMobile}
            additionalActions={additionalActions}
          >
            {/* Suspense interno: loader localizzato nel content area */}
            <Suspense fallback={<CompactLoadingFallback />}>
              {children}
            </Suspense>
          </SidebarLayout>
        );
      }

      // Nessun layout - usa Suspense esterno
      return children;
    },
    [layoutConfig, user, userRoutes, isMobile, additionalActions]
  );

  return (
    <>
      <Routes>
        {/* Public/Guest Routes */}
        <Route
          path="/auth/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />

        {/* Protected Routes managed by RoleBasedRouter */}
        <Route
          path="/*"
          element={
            <RoleBasedRouter
              user={user}
              userRole={userRole ?? undefined}
              isCheckingAuth={isCheckingAuth}
              routeGroups={ROUTE_GROUPS}
              layoutWrapper={layoutWrapper}
            />
          }
        />
      </Routes>
    </>
  );
}
