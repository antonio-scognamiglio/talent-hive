import { useQuery } from "@tanstack/react-query";
import { applicationsService } from "@/features/shared/services/applications.service";
import { queryKeys } from "@/features/shared/config/query-client.config";
import type { Application } from "@shared/types";

/**
 * Hook to fetch candidate's own applications
 * Uses TanStack Query for caching and automatic refetching
 *
 * @param enabled - Whether to enable the query (default: true)
 * @returns Query result with applications list
 *
 * @example
 * const { data: myApps, isLoading } = useMyApplications();
 *
 * // Use in multiple components - TanStack Query caches automatically!
 * // Component A
 * const { data } = useMyApplications(); // Fetches from API
 *
 * // Component B (at same time)
 * const { data } = useMyApplications(); // Uses cache, no API call!
 *
 * @example
 * // For invalidation after applying to a job:
 * import { queryKeys } from "@/features/shared/config/query-client.config";
 * queryClient.invalidateQueries({ queryKey: queryKeys.applications.my });
 */
export const useMyApplications = (enabled = true) => {
  return useQuery<Application[], Error>({
    queryKey: queryKeys.applications.my,
    queryFn: applicationsService.getMyApplications,
    enabled,
  });
};
