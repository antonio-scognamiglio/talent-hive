import { useMemo } from "react";
import { useJobs, type UseJobsProps } from "./useJobs";
import { useMyApplications } from "@/features/applications/hooks/useMyApplications";
import type { Job, Application } from "@shared/types";

/**
 * Extended Job type with application status
 */
export interface JobWithApplicationStatus extends Job {
  /** Whether the current user has applied to this job */
  hasApplied: boolean;
  /** The user's application if they have applied, undefined otherwise */
  myApplication?: Application;
}

/**
 * Hook that combines jobs list with application status
 *
 * Fetches both jobs and user's applications in parallel, then enriches
 * each job with hasApplied flag and myApplication reference.
 *
 * Uses TanStack Query caching - both queries are cached independently
 * and reused across components.
 *
 * @param props - Same props as useJobs hook (isQueryEnabled, defaultPrismaQuery, pageSize, config)
 * @returns Jobs with application status + all pagination props
 *
 * @example
 * const { jobs, isLoading } = useJobsWithApplicationStatus();
 *
 * jobs.map(job => (
 *   job.hasApplied
 *     ? <Badge>Applied - {job.myApplication.workflowStatus}</Badge>
 *     : <Button>Apply Now</Button>
 * ))
 */
export const useJobsWithApplicationStatus = (props?: UseJobsProps) => {
  const jobsQuery = useJobs(props);
  const { data: myApplications, isLoading: appsLoading } = useMyApplications();

  // Create Set for O(1) lookup performance
  const appliedJobIds = useMemo(
    () => new Set(myApplications?.map((app) => app.jobId) || []),
    [myApplications]
  );

  // Enrich each job with application status
  const jobsWithStatus = useMemo<JobWithApplicationStatus[]>(
    () =>
      jobsQuery.getJobsPaginatedQuery.data?.map((job) => ({
        ...job,
        hasApplied: appliedJobIds.has(job.id),
        myApplication: myApplications?.find((app) => app.jobId === job.id),
      })) || [],
    [jobsQuery.getJobsPaginatedQuery.data, appliedJobIds, myApplications]
  );

  return {
    jobs: jobsWithStatus,
    isLoading: jobsQuery.getJobsPaginatedQuery.isLoading || appsLoading,
    isFetching: jobsQuery.getJobsPaginatedQuery.isFetching,
    isError: jobsQuery.getJobsPaginatedQuery.isError,
    error: jobsQuery.getJobsPaginatedQuery.error,
    // Pagination controls
    currentPage: jobsQuery.getJobsPaginatedQuery.currentPage,
    totalPages: jobsQuery.getJobsPaginatedQuery.totalPages,
    totalItems: jobsQuery.getJobsPaginatedQuery.totalItems,
    nextPage: jobsQuery.getJobsPaginatedQuery.nextPage,
    prevPage: jobsQuery.getJobsPaginatedQuery.prevPage,
    handlePageClick: jobsQuery.getJobsPaginatedQuery.handlePageClick,
    refetch: jobsQuery.getJobsPaginatedQuery.refetch,
    queryKey: jobsQuery.getJobsPaginatedQuery.queryKey,
  };
};
