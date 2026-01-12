import { lazy } from "react";
import { LayoutDashboard } from "lucide-react";
import { USER_ROLES, type UserRole } from "@/features/shared/types/roles.types";
import type {
  RouteGroup,
  StrictGuestGroup,
  StrictProtectedGroup,
} from "@/features/routing/types";

// ==========================================================================
// LAZY LOADED COMPONENTS
// ==========================================================================
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));

// ==========================================================================
// CONFIGURATION ALIASES
// Shortcut to avoid repeating <UserRole> everywhere
// ==========================================================================
type AppGuestOnlyGroup = StrictGuestGroup<UserRole>;
type AppProtectedGroup = StrictProtectedGroup<UserRole>;

// ==========================================================================
// PUBLIC ROUTES CONFIGURATION
// ==========================================================================
const GUEST_GROUPS: AppGuestOnlyGroup[] = [
  {
    name: "Auth",
    allowedRoles: null, // REQUIRED by StrictPublicGroup
    routes: [
      {
        path: "/auth/login",
        element: LoginPage,
        allowedRoles: null,
        layout: "guest",
      },
    ],
  },
];

// ==========================================================================
// PROTECTED ROUTES CONFIGURATION
// ==========================================================================
const PROTECTED_GROUPS: AppProtectedGroup[] = [
  {
    name: "Home",
    allowedRoles: [
      USER_ROLES.ADMIN,
      USER_ROLES.RECRUITER,
      USER_ROLES.CANDIDATE,
    ],
    icon: LayoutDashboard,
    order: 1,
    routes: [
      {
        path: "/",
        element: Dashboard,
        allowedRoles: [
          USER_ROLES.ADMIN,
          USER_ROLES.RECRUITER,
          USER_ROLES.CANDIDATE,
        ],
        layout: "sidebar",
        meta: {
          title: "Dashboard",
          icon: LayoutDashboard,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Overview",
        },
      },
    ],
  },
];

// ==========================================================================
// UNIFIED EXPORT
// Combines both for the router consumption
// ==========================================================================
export const ROUTE_GROUPS: RouteGroup<UserRole>[] = [
  ...GUEST_GROUPS,
  ...PROTECTED_GROUPS,
];
