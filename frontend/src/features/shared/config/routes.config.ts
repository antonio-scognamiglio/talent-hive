import { lazy } from "react";
import { LayoutDashboard } from "lucide-react";
import { USER_ROLES, type UserRole } from "@/features/shared/types/roles.types";
import type { RouteGroup } from "@/features/routing/types";

// Lazy loaded components
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));

export const ROUTE_GROUPS: RouteGroup<UserRole>[] = [
  // ==========================================================================
  // HOME / DASHBOARD
  // ==========================================================================
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
