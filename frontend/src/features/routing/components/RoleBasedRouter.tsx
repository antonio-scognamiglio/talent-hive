import { Suspense, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { GuestRoute } from "./GuestRoute";
import { LoadingFallback } from "./LoadingFallback";

import {
  applyLayoutToRoute,
  type LayoutWrapperFn,
} from "../utils/layout-helper";
import type { RouteGroup } from "../types";
import NotFound from "@/pages/not-found/NotFound";

/**
 * Props per il componente RoleBasedRouter
 */
interface RoleBasedRouterProps<TRole extends string, TUser> {
  user: TUser | null;
  userRole: TRole | undefined;
  isCheckingAuth: boolean;
  routeGroups: RouteGroup<TRole>[];
  layoutWrapper?: LayoutWrapperFn;
  authRedirectPath?: string;
  loadingFallback?: React.ReactNode;
  accessDeniedFallback?: React.ReactNode;
  authLoadingFallback?: React.ReactNode;
}

export function RoleBasedRouter<TRole extends string, TUser>({
  user,
  userRole,
  isCheckingAuth,
  routeGroups,
  layoutWrapper,
  authRedirectPath = "/auth/login",
  loadingFallback,
  accessDeniedFallback,
  authLoadingFallback,
}: RoleBasedRouterProps<TRole, TUser>) {
  const allRoutes = useMemo(() => {
    return routeGroups.flatMap((group) => group.routes);
  }, [routeGroups]);

  if (isCheckingAuth) {
    return authLoadingFallback || <LoadingFallback />;
  }

  return (
    <Suspense fallback={loadingFallback || <LoadingFallback />}>
      <Routes>
        {allRoutes.map((route) => {
          // Determine if route is Guest Only (allowedRoles is explicitly null)
          // or Protected (allowedRoles is an array)
          const isGuestOnly = route.allowedRoles === null;
          const allowedRoles = route.allowedRoles || [];

          // Access Check:
          // 1. Guest Only -> Allow (GuestRoute will handle redirect if logged in)
          // 2. Protected -> Check if user has role

          const hasRole = !!(
            user &&
            userRole &&
            allowedRoles?.includes(userRole)
          );

          // Render Logic:
          // - Render if Guest Only
          // - Render if Protected AND (LoggedOut OR HasRole) -> ProtectedRoute handles LoggedOut redirect.
          // - HIDE if Protected AND LoggedIn AND NoRole (Security/UX choice: 404 for unauthorized)

          const canRender = isGuestOnly || !user || hasRole;

          if (!canRender) return null;

          const Component = route.element;

          const content = isGuestOnly ? (
            <GuestRoute>
              <Component />
            </GuestRoute>
          ) : (
            <ProtectedRoute
              allowedRoles={allowedRoles || []}
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

          const wrappedContent = layoutWrapper
            ? applyLayoutToRoute(content, route, layoutWrapper)
            : content;

          return (
            <Route
              key={route.path}
              path={route.path}
              element={wrappedContent}
            />
          );
        })}
        {/* 
          Catch-all & Role-Independent Routes.
          Routes placed here are accessible to ALL users (Guest & Authenticated)
          as they are outside the guard logic (e.g. 404 Not Found).
        */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
