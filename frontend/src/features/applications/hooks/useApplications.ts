import { useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsService } from "@/features/shared/services/applications.service";
import { usePaginationForGen } from "@/features/pagination/hooks/usePaginationForGen";
import { queryKeys } from "@/features/shared/config/query-client.config";
import type { UsePaginationForGenProps } from "@/features/pagination/hooks/usePaginationForGen";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import { handleError } from "@/features/shared/utils/error.utils";
import { handleSuccess } from "@/features/shared/utils/success.utils";
import { PAGE_SIZES } from "@/features/pagination";
import type { Application } from "@shared/types";
import { handleDocumentAction } from "@/features/shared/utils/document-preview.utils";

export interface UseApplicationsProps extends Partial<
  UsePaginationForGenProps<Application>
> {
  prismaQuery?: PrismaQueryOptions<Application>;
}

/**
 * Hook to fetch applications with pagination and filters.
 * Also provides mutations for updating, hiring, and rejecting applications.
 */
export const useApplications = ({
  pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE,
  prismaQuery,
  enabled = true,
}: UseApplicationsProps = {}) => {
  const queryClient = useQueryClient();

  const getApplicationsPaginatedQuery = usePaginationForGen<Application>({
    pageSize,
    apiFunction: applicationsService.listApplications,
    prismaQuery,
    enabled,
    queryKeyFactory: queryKeys.applications.list,
    onError: (error) =>
      handleError(error, "Errore durante il caricamento delle candidature"),
  });

  // 🔧 MUTATION 1: Update Application (PUT)
  const updateApplicationMutation = useMutation({
    mutationFn: ({
      id,
      workflowStatus,
      notes,
      score,
    }: {
      id: string;
      workflowStatus?: string;
      notes?: string;
      score?: number;
    }) =>
      applicationsService.updateApplication(id, {
        workflowStatus,
        notes,
        score,
      }),
    onSuccess: () => {
      // 1. Invalidate queries to ensure eventual consistency
      queryClient.invalidateQueries({
        queryKey: getApplicationsPaginatedQuery.queryKey,
      });

      // Invalidate stats too as status might have changed
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.stats(),
      });
      handleSuccess(null, "Candidatura aggiornata con successo");
    },
    onError(error) {
      handleError(error, "Errore durante l'aggiornamento");
    },
  });

  // 🔧 MUTATION 2: Hire Candidate (POST)
  const hireMutation = useMutation({
    mutationFn: ({
      id,
      notes,
      score,
    }: {
      id: string;
      notes?: string;
      score?: number;
    }) => applicationsService.hireCandidate(id, { notes, score }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getApplicationsPaginatedQuery.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.stats(),
      });
      handleSuccess(null, "Candidato assunto!");
    },
    onError(error) {
      handleError(error, "Errore durante l'assunzione");
    },
  });

  // 🔧 MUTATION 3: Reject Candidate (POST)
  const rejectMutation = useMutation({
    mutationFn: ({
      id,
      reason,
      notes,
      score,
    }: {
      id: string;
      reason?: string;
      notes?: string;
      score?: number;
    }) => applicationsService.rejectCandidate(id, { reason, notes, score }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getApplicationsPaginatedQuery.queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.applications.stats(),
      });
      handleSuccess(null, "Candidatura rifiutata");
    },
    onError(error) {
      handleError(error, "Errore durante il rifiuto");
    },
  });

  // 📄 CV Viewing
  const handleViewCv = async (applicationId: string) => {
    try {
      const url = await applicationsService.getCvUrl(applicationId);
      handleDocumentAction(url, "preview");
    } catch (error) {
      handleError(error, "Errore durante il caricamento del CV");
    }
  };

  return {
    getApplicationsPaginatedQuery,
    updateApplicationMutation,
    hireMutation,
    rejectMutation,
    handleViewCv,
  };
};
