import { lazy } from "react";
import { LayoutDashboard } from "lucide-react";
import { USER_ROLES, type UserRole } from "@/features/shared/types/roles.types";
import type { RouteGroup } from "@/features/routing/types";

// ==========================================================================
// LAZY LOADED COMPONENTS
// ==========================================================================
// Jobs pages (role-specific)
const CandidateJobsPage = lazy(() => import("@/pages/jobs/CandidateJobsPage"));
const RecruiterJobsPage = lazy(() => import("@/pages/jobs/RecruiterJobsPage"));
const AdminJobsPage = lazy(() => import("@/pages/jobs/AdminJobsPage"));

// ==========================================================================
// PROTECTED ROUTES CONFIGURATION
// ==========================================================================
export const PROTECTED_ROUTE_GROUPS: RouteGroup<UserRole>[] = [
  {
    name: "Home",
    allowedRoles: [
      USER_ROLES.RECRUITER,
      USER_ROLES.ADMIN,
      USER_ROLES.CANDIDATE,
    ],
    icon: LayoutDashboard,
    order: 1,
    routes: [
      {
        path: "/",
        element: CandidateJobsPage,
        allowedRoles: [USER_ROLES.CANDIDATE],
        layout: "sidebar",
        meta: {
          title: "Jobs Marketplace",
          icon: LayoutDashboard,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Cerca e candidati alle offerte di lavoro",
        },
      },
      {
        path: "/",
        element: RecruiterJobsPage,
        allowedRoles: [USER_ROLES.RECRUITER],
        layout: "sidebar",
        meta: {
          title: "Annunci Pubblicati",
          icon: LayoutDashboard,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Gestisci i tuoi annunci di lavoro",
        },
      },
      {
        path: "/",
        element: AdminJobsPage,
        allowedRoles: [USER_ROLES.ADMIN],
        layout: "sidebar",
        meta: {
          title: "Gestione Annunci",
          icon: LayoutDashboard,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Gestisci tutti gli annunci di lavoro",
        },
      },
    ],
  },
];
