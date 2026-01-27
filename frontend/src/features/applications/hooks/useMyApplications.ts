import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsService } from "@/features/shared/services/applications.service";
import { queryKeys } from "@/features/shared/config/query-client.config";
import { handleError } from "@/features/shared/utils/error.utils";
import { handleSuccess } from "@/features/shared/utils/success.utils";
import type { MutationConfigMap } from "@/features/shared/types/mutation.types";
import type { Application } from "@shared/types";

export interface UseMyApplicationsProps {
  enabled?: boolean;
  config?: MutationConfigMap<"applyJob">;
}

/**
 * Hook to fetch candidate's own applications and apply to jobs
 * Uses TanStack Query for caching and automatic refetching
 *
 * @param props - Configuration object
 * @param props.enabled - Whether to enable the query (default: true)
 * @param props.config - Mutation configuration for applyJob
 * @returns Query result with applications list and applyJob mutation
 *
 * @example
 * const { data: myApps, isLoading, applyJobMutation } = useMyApplications();
 *
 * // Apply to a job
 * await applyJobMutation.mutateAsync({
 *   jobId: "123",
 *   coverLetter: "I'm interested...",
 *   cvFile: selectedFile,
 * });
 *
 * @example
 * // With custom config
 * const { applyJobMutation } = useMyApplications({
 *   enabled: false,
 *   config: {
 *     applyJob: {
 *       refetchOnSuccess: true,
 *       showSuccessToast: false,
 *     }
 *   }
 * });
 */
export const useMyApplications = ({
  enabled = true,
  config = {
    applyJob: {
      refetchOnSuccess: true,
      showErrorToast: true,
      showSuccessToast: true,
    },
  },
}: UseMyApplicationsProps = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery<Application[], Error>({
    queryKey: queryKeys.applications.my,
    queryFn: applicationsService.getMyApplications,
    enabled,
  });

  // Mutation per candidarsi a un job
  const applyJobMutation = useMutation({
    mutationFn: ({
      jobId,
      coverLetter,
      cvFile,
    }: {
      jobId: string;
      coverLetter?: string;
      cvFile: File;
    }) => applicationsService.createApplication(jobId, coverLetter, cvFile),
    onSuccess: (response) => {
      if (config.applyJob?.refetchOnSuccess) {
        // Invalida cache applications per aggiornare lista
        queryClient.invalidateQueries({ queryKey: queryKeys.applications.my });
        // Invalida anche la lista generale applications (se recruiter la vede)
        queryClient.invalidateQueries({ queryKey: queryKeys.applications.all });
      }
      if (config.applyJob?.showSuccessToast) {
        handleSuccess(response, "Candidatura inviata con successo!");
      }
      config.applyJob?.onSuccess?.(response);
    },
    onError: (error) => {
      if (config.applyJob?.showErrorToast) {
        handleError(error, "Errore durante l'invio della candidatura");
      }
      config.applyJob?.onError?.(error);
    },
    onMutate: () => {
      config.applyJob?.onMutate?.();
    },
  });

  /**
   * Handle CV viewing for an application
   * Fetches presigned URL and opens CV in new tab
   */
  const handleViewCv = async (applicationId: string) => {
    try {
      const url = await applicationsService.getCvUrl(applicationId);
      const { handleDocumentAction } =
        await import("@/features/shared/utils/document-preview.utils");
      handleDocumentAction(url, "preview");
    } catch (error) {
      handleError(error, "Errore durante il caricamento del CV");
    }
  };

  return {
    ...query,
    applyJobMutation,
    handleViewCv,
  };
};
