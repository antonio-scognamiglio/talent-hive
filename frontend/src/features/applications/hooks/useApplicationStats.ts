import { useQuery } from "@tanstack/react-query";
import { applicationsService } from "@/features/shared/services/applications.service";
import { queryKeys } from "@/features/shared/config/query-client.config";

/**
 * Props for useApplicationStats hook
 */
export interface UseApplicationStatsProps {
  /**
   * Optional job ID to filter statistics for a specific job
   * If not provided, returns global statistics for all recruiter's jobs
   */
  jobId?: string;

  /**
   * Whether the query should be enabled
   * @default true
   */
  enabled?: boolean;
}

/**
 * Response type for application statistics
 */
export interface ApplicationStats {
  status: string;
  count: number;
}

/**
 * Hook to fetch application statistics (counts by workflow status)
 * Used for displaying status counters in RecruiterApplicationsPage
 *
 * @example
 * ```tsx
 * // Global stats for all recruiter's jobs
 * const { data: stats, isLoading, refetch } = useApplicationStats();
 *
 * // Stats for specific job
 * const { data: stats } = useApplicationStats({ jobId: "job-123" });
 * ```
 */
export function useApplicationStats({
  jobId,
  enabled = true,
}: UseApplicationStatsProps = {}) {
  const query = useQuery({
    queryKey: queryKeys.applications.stats(jobId),
    queryFn: () => applicationsService.getApplicationStats(jobId),
    enabled,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
