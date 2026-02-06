import { lazy } from "react";
import { Briefcase, Settings, FileText } from "lucide-react";
import { USER_ROLES, type UserRole } from "@/features/shared/types/roles.types";
import type { RouteGroup } from "@/features/routing/types";
import { Navigate } from "react-router-dom";

// ==========================================================================
// LAZY LOADED COMPONENTS
// ==========================================================================
// Jobs pages (role-specific)
const CandidateJobsPage = lazy(() => import("@/pages/jobs/CandidateJobsPage"));
const CandidateJobDetailPage = lazy(
  () => import("@/pages/jobs/CandidateJobDetailPage"),
);
const CandidateApplicationsPage = lazy(
  () => import("@/pages/candidate/CandidateApplicationsPage"),
);
const RecruiterJobsPage = lazy(() => import("@/pages/jobs/RecruiterJobsPage"));
const RecruiterApplicationsPage = lazy(
  () => import("@/pages/applications/RecruiterApplicationsPage"),
);
const AdminJobsPage = lazy(() => import("@/pages/jobs/AdminJobsPage"));

// Account pages
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));

// ==========================================================================
// PROTECTED ROUTES CONFIGURATION
// ==========================================================================
export const PROTECTED_ROUTE_GROUPS: RouteGroup<UserRole>[] = [
  // ==========================================================================
  // ROOT REDIRECTS - Role-based home page redirects
  // ==========================================================================
  {
    name: "Root Redirects",
    order: -1, // Execute before all other routes
    allowedRoles: [
      USER_ROLES.CANDIDATE,
      USER_ROLES.RECRUITER,
      USER_ROLES.ADMIN,
    ],
    routes: [
      {
        path: "/",
        element: <Navigate to="/jobs" replace />,
        allowedRoles: [
          USER_ROLES.CANDIDATE,
          USER_ROLES.RECRUITER,
          USER_ROLES.ADMIN,
        ],
        layout: "sidebar",
        meta: {
          title: "Home Redirect",
          hidden: true,
          description: "Redirects to default page based on user role",
        },
      },
    ],
  },

  // ==========================================================================
  // JOBS - Job listings and management
  // ==========================================================================
  {
    name: "Jobs",
    allowedRoles: [
      USER_ROLES.RECRUITER,
      USER_ROLES.ADMIN,
      USER_ROLES.CANDIDATE,
    ],
    icon: Briefcase,
    order: 1,
    routes: [
      {
        path: "/jobs",
        element: CandidateJobsPage,
        allowedRoles: [USER_ROLES.CANDIDATE],
        layout: "sidebar",
        meta: {
          title: "Jobs Marketplace",
          icon: Briefcase,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Cerca e candidati alle offerte di lavoro",
        },
      },
      {
        path: "/jobs/:id",
        element: CandidateJobDetailPage,
        allowedRoles: [USER_ROLES.CANDIDATE],
        layout: "sidebar",
        meta: {
          title: "Dettaglio Annuncio",
          hidden: true,
        },
      },
      {
        path: "/jobs",
        element: RecruiterJobsPage,
        allowedRoles: [USER_ROLES.RECRUITER],
        layout: "sidebar",
        meta: {
          title: "Annunci Pubblicati",
          icon: Briefcase,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Gestisci i tuoi annunci di lavoro",
        },
      },
      {
        path: "/jobs",
        element: AdminJobsPage,
        allowedRoles: [USER_ROLES.ADMIN],
        layout: "sidebar",
        meta: {
          title: "Gestione Annunci",
          icon: Briefcase,
          showInSidebar: true,
          sidebarOrder: 1,
          description: "Gestisci tutti gli annunci di lavoro",
        },
      },
    ],
  },

  // ==========================================================================
  // APPLICATIONS - Applications management
  // ==========================================================================
  {
    name: "Applications",
    allowedRoles: [
      USER_ROLES.CANDIDATE,
      USER_ROLES.RECRUITER,
      USER_ROLES.ADMIN,
    ],
    icon: FileText,
    order: 2,
    routes: [
      {
        path: "/applications",
        element: CandidateApplicationsPage,
        allowedRoles: [USER_ROLES.CANDIDATE],
        layout: "sidebar",
        meta: {
          title: "Le Mie Candidature",
          icon: FileText,
          showInSidebar: true,
          sidebarOrder: 2,
          description: "Visualizza lo stato delle tue candidature",
        },
      },
      {
        path: "/applications",
        element: RecruiterApplicationsPage,
        allowedRoles: [USER_ROLES.RECRUITER, USER_ROLES.ADMIN],
        layout: "sidebar",
        meta: {
          title: "Gestione Candidature",
          icon: FileText,
          showInSidebar: true,
          sidebarOrder: 2,
          description: "Gestisci le candidature ricevute",
        },
      },
    ],
  },

  // ==========================================================================
  // ACCOUNT & SETTINGS
  // ==========================================================================
  {
    name: "Account",
    allowedRoles: [
      USER_ROLES.CANDIDATE,
      USER_ROLES.RECRUITER,
      USER_ROLES.ADMIN,
    ],
    icon: Settings, // Importato da lucide-react
    order: 100, // Bottom of list
    routes: [
      {
        path: "/settings",
        element: SettingsPage,
        allowedRoles: [
          USER_ROLES.CANDIDATE,
          USER_ROLES.RECRUITER,
          USER_ROLES.ADMIN,
        ],
        layout: "sidebar",
        meta: {
          title: "Impostazioni",
          icon: Settings,
          showInSidebar: true,
          description: "Gestisci le tue impostazioni",
        },
      },
    ],
  },
];
