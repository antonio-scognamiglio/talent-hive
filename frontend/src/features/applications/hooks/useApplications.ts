import { applicationsService } from "@/features/shared/services/applications.service";
import { usePaginationForGen } from "@/features/pagination/hooks/usePaginationForGen";
import { queryKeys } from "@/features/shared/config/query-client.config";
import type { UsePaginationForGenProps } from "@/features/pagination/hooks/usePaginationForGen";
import type { Application } from "@shared/types";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import { handleError } from "@/features/shared/utils/error.utils";

import { PAGE_SIZES } from "@/features/pagination";

export interface UseApplicationsProps extends Partial<
  UsePaginationForGenProps<Application>
> {
  defaultPrismaQuery?: PrismaQueryOptions<Application>;
}

/**
 * Hook to fetch applications with pagination and filters.
 * Uses usePaginationForGen wrapper.
 */
export const useApplications = ({
  pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE,
  defaultPrismaQuery,
  enabled = true,
}: UseApplicationsProps = {}) => {
  const getApplicationsPaginatedQuery = usePaginationForGen<Application>({
    pageSize,
    apiFunction: applicationsService.listApplications,
    prismaQuery: defaultPrismaQuery,
    enabled,
    queryKeyFactory: queryKeys.applications.list,
    onError: (error) =>
      handleError(error, "Errore durante il caricamento delle candidature"),
  });

  return {
    getApplicationsPaginatedQuery,
  };
};
