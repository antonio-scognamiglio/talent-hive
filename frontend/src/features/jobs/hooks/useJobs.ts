import { usePaginationForGen } from "@/features/pagination/hooks/usePaginationForGen";
import type { MutationConfigMap } from "@/features/shared/types/mutation.types";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { CreateJobDto, Job, UpdateJobDto } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsService } from "@/features/shared/services/jobs.service";
import { PAGE_SIZES } from "@/features/pagination/constants/page-sizes";
import { handleError } from "@/features/shared/utils/error.utils";
import { handleSuccess } from "@/features/shared/utils/success.utils";
import { queryKeys } from "@/features/shared/config/query-client.config";

export interface UseJobsProps {
  isQueryEnabled?: boolean;
  defaultPrismaQuery?: PrismaQueryOptions<Job>;
  pageSize?: number;
  config?: MutationConfigMap<"createJob" | "updateJob" | "deleteJob">;
}

export const useJobs = ({
  isQueryEnabled = true,
  defaultPrismaQuery,
  pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE,
  config = {
    createJob: {
      refetchOnSuccess: true,
      showErrorToast: true,
      showSuccessToast: true,
    },
    updateJob: {
      refetchOnSuccess: true,
      showErrorToast: true,
      showSuccessToast: true,
    },
    deleteJob: {
      refetchOnSuccess: true,
      showErrorToast: true,
      showSuccessToast: true,
    },
  },
}: UseJobsProps = {}) => {
  const queryClient = useQueryClient();

  const getJobsPaginatedQuery = usePaginationForGen<Job>({
    pageSize,
    apiFunction: jobsService.listJobs,
    prismaQuery: defaultPrismaQuery,
    enabled: isQueryEnabled,
    queryKeyFactory: queryKeys.jobs.list,
  });

  const createJobMutation = useMutation({
    mutationFn: (data: CreateJobDto) => jobsService.createJob(data),
    onSuccess: (response) => {
      if (config.createJob?.refetchOnSuccess) {
        queryClient.invalidateQueries({
          queryKey: getJobsPaginatedQuery.queryKey,
        });
      }
      if (config.createJob?.showSuccessToast) {
        handleSuccess(response, "Annuncio creato con successo");
      }
    },
    onError(error) {
      if (config.createJob?.showErrorToast) {
        handleError(
          error,
          "Si è verificato un errore durante la creazione dell'annuncio"
        );
      }
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobDto }) =>
      jobsService.updateJob(id, data),
    onSuccess: (response) => {
      if (config.updateJob?.refetchOnSuccess) {
        queryClient.invalidateQueries({
          queryKey: getJobsPaginatedQuery.queryKey,
        });
      }
      if (config.updateJob?.showSuccessToast) {
        handleSuccess(response, "Annuncio aggiornato con successo");
      }
    },
    onError(error) {
      if (config.updateJob?.showErrorToast) {
        handleError(
          error,
          "Si è verificato un errore durante la creazione dell'annuncio"
        );
      }
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => jobsService.deleteJob(id),
    onSuccess: (response) => {
      if (config.deleteJob?.refetchOnSuccess) {
        queryClient.invalidateQueries({
          queryKey: getJobsPaginatedQuery.queryKey,
        });
      }
      if (config.deleteJob?.showSuccessToast) {
        handleSuccess(response, "Annuncio eliminato con successo");
      }
    },
    onError(error) {
      if (config.deleteJob?.showErrorToast) {
        handleError(
          error,
          "Si è verificato un errore durante l'eliminazione dell'annuncio"
        );
      }
    },
  });

  return {
    getJobsPaginatedQuery,
    createJobMutation,
    updateJobMutation,
    deleteJobMutation,
  };
};
