import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { jobsService } from "@/features/shared/services/jobs.service";
import { useMyApplications } from "@/features/applications/hooks/useMyApplications";
import { queryKeys } from "@/features/shared/config/query-client.config";
import type { JobWithApplicationStatus } from "./useJobsWithApplicationStatus";

/**
 * Props for useJobWithApplicationStatus
 */
interface UseJobWithApplicationStatusProps {
  /** The ID of the job to fetch */
  jobId: string | undefined;
  /** Whether the query is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Hook to fetch a single job and enrich it with the current user's application status.
 *
 * It combines the specific job fetch with the user's applications list to determine
 * if they have already applied, and if so, what is the status.
 */
export const useJobWithApplicationStatus = ({
  jobId,
  enabled = true,
}: UseJobWithApplicationStatusProps) => {
  // 1. Fetch the specific job
  const {
    data: job,
    isLoading: isJobLoading,
    error: jobError,
    isError: isJobError,
  } = useQuery({
    queryKey: queryKeys.jobs.detail(jobId || ""),
    queryFn: async () => {
      if (!jobId) throw new Error("Job ID required");
      const response = await jobsService.getJob(jobId);
      return response.data;
    },
    enabled: !!jobId && enabled,
  });

  // 2. Fetch my applications to check status
  const {
    data: myApplications,
    isLoading: isAppsLoading,
    isError: isAppsError,
  } = useMyApplications();

  // 3. Enrich the job with application status
  const jobWithStatus = useMemo<JobWithApplicationStatus | undefined>(() => {
    if (!job) return undefined;

    const myApplication = myApplications?.find((app) => app.jobId === job.id);

    return {
      ...job,
      hasApplied: !!myApplication,
      myApplication: myApplication,
    };
  }, [job, myApplications]);

  return {
    job: jobWithStatus,
    isLoading: isJobLoading || isAppsLoading,
    isError: isJobError || isAppsError,
    error: jobError,
  };
};
