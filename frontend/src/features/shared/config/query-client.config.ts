import { QueryClient } from "@tanstack/react-query";
import type { QueryKeyFactory } from "@/features/shared/types/queryKeys.types";

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ============================================================================
// QUERY KEYS REGISTRY
// ============================================================================

/**
 * Centralized Query Keys for type-safe invalidation and caching
 *
 * IMPORTANT NOTES:
 * - Paginated lists use `usePaginationForGen` which auto-generates keys: ["pagination", apiFunction.name]
 * - Use those keys directly from the hook's `queryKey` property for invalidation
 * - This registry is for:
 *   - Non-paginated queries (my-applications, user profile, etc.)
 *   - Detail queries (job by ID, application by ID)
 *   - Special queries (stats, dashboard data)
 *
 * @example
 * // Usage in hooks:
 * useQuery({ queryKey: queryKeys.applications.my })
 *
 * // Usage for invalidation after mutation:
 * queryClient.invalidateQueries({ queryKey: queryKeys.applications.my })
 * queryClient.invalidateQueries({ queryKey: queryKeys.applications.all }) // Invalidates all applications
 */
export const queryKeys = {
  // ========================================
  // Auth & User
  // ========================================
  auth: {
    /** All auth-related queries */
    all: ["auth"] as const,
    /** Current user profile */
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  // ========================================
  // Jobs
  // ========================================
  jobs: {
    /** All jobs queries - use to invalidate everything */
    all: ["jobs"] as const,

    /** All jobs lists - use to invalidate all lists with any params */
    lists: () => [...queryKeys.jobs.all, "list"] as const,

    /**
     * Jobs list with optional params
     * @param params - Optional filtering/pagination params
     * @returns Query key for specific or all lists
     *
     * @example
     * // Invalidate all jobs lists
     * queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list() })
     *
     * // Invalidate specific list
     * queryClient.invalidateQueries({
     *   queryKey: queryKeys.jobs.list({ skip: 0, take: 10 })
     * })
     */
    list: ((params?) => {
      if (!params) return queryKeys.jobs.lists();
      return [...queryKeys.jobs.lists(), params] as const;
    }) as QueryKeyFactory,

    /** Job detail by ID */
    detail: (id: string) => [...queryKeys.jobs.all, "detail", id] as const,
  },

  // ========================================
  // Applications
  // ========================================
  applications: {
    /** All applications queries */
    all: ["applications"] as const,

    /** Candidate's own applications (non-paginated) */
    my: ["my-applications"] as const,

    /** All applications lists */
    lists: () => [...queryKeys.applications.all, "list"] as const,

    /**
     * Applications list with optional params
     * Use this if you add paginated applications later
     */
    list: ((params?) => {
      if (!params) return queryKeys.applications.lists();
      return [...queryKeys.applications.lists(), params] as const;
    }) as QueryKeyFactory,

    /** Application detail by ID */
    detail: (id: string) =>
      [...queryKeys.applications.all, "detail", id] as const,
  },

  // ========================================
  // Users (Admin)
  // ========================================
  users: {
    /** All users queries */
    all: ["users"] as const,

    /** All users lists */
    lists: () => [...queryKeys.users.all, "list"] as const,

    /**
     * Users list with optional params
     */
    list: ((params?) => {
      if (!params) return queryKeys.users.lists();
      return [...queryKeys.users.lists(), params] as const;
    }) as QueryKeyFactory,

    /** User detail by ID */
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
  },
} as const;

// ============================================================================
// QUERY OPTIONS PRESETS
// ============================================================================

/**
 * Options for data that changes rarely (e.g., user profile, settings)
 */
export const staticQueryOptions = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
};

/**
 * Options for real-time data (e.g., application status, job applicants count)
 */
export const realtimeQueryOptions = {
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 2 * 60 * 1000, // 2 minutes
  refetchInterval: 30 * 1000, // Refetch every 30 seconds
};

/**
 * Options for critical data that must always be fresh
 */
export const criticalQueryOptions = {
  staleTime: 0, // Always stale (always refetch)
  gcTime: 5 * 60 * 1000, // 5 minutes
  retry: 3,
};
