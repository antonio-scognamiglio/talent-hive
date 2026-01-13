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
const Auth = lazy(() => import("@/pages/auth/Auth"));

// Jobs pages (role-specific)
const CandidateJobsPage = lazy(() => import("@/pages/jobs/CandidateJobsPage"));
const RecruiterJobsPage = lazy(() => import("@/pages/jobs/RecruiterJobsPage"));
const AdminJobsPage = lazy(() => import("@/pages/jobs/AdminJobsPage"));

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
        path: "/auth",
        element: Auth,
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
  // CANDIDATE: Jobs Marketplace
  {
    name: "Candidate Jobs",
    allowedRoles: [USER_ROLES.CANDIDATE],
    icon: LayoutDashboard,
    order: 1,
    routes: [
      {
        path: "/jobs",
        element: CandidateJobsPage,
        allowedRoles: [USER_ROLES.CANDIDATE],
        layout: "sidebar",
        meta: {
          title: "Available Jobs",
          icon: LayoutDashboard,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Browse jobs",
        },
      },
    ],
  },
  // RECRUITER: Jobs Management
  {
    name: "Recruiter Jobs",
    allowedRoles: [USER_ROLES.RECRUITER],
    icon: LayoutDashboard,
    order: 1,
    routes: [
      {
        path: "/jobs",
        element: RecruiterJobsPage,
        allowedRoles: [USER_ROLES.RECRUITER],
        layout: "sidebar",
        meta: {
          title: "Jobs Management",
          icon: LayoutDashboard,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Manage jobs",
        },
      },
    ],
  },
  // ADMIN: Platform Jobs
  {
    name: "Admin Jobs",
    allowedRoles: [USER_ROLES.ADMIN],
    icon: LayoutDashboard,
    order: 1,
    routes: [
      {
        path: "/jobs",
        element: AdminJobsPage,
        allowedRoles: [USER_ROLES.ADMIN],
        layout: "sidebar",
        meta: {
          title: "Platform Jobs",
          icon: LayoutDashboard,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "All jobs",
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
