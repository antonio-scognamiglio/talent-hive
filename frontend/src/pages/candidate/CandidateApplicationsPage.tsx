import { useState, useCallback, useMemo } from "react";
import { PageContent } from "@/features/shared/components/layout/PageContent";
import { PageHeader } from "@/features/shared/components/layout/PageHeader";
import { useApplications } from "@/features/applications/hooks/useApplications";
import { useMyApplications } from "@/features/applications/hooks/useMyApplications";
import {
  useApplicationFilters,
  APPLICATION_ORDER_BY_OPTIONS,
} from "@/features/applications/hooks/useApplicationFilters";
import {
  ApplicationCard,
  ApplicationDetailModal,
  ApplicationStatusFilter,
} from "@/features/applications/components";
import { PaginationWrapperStyled } from "@/features/pagination/components/PaginationWrapperStyled";
import {
  PAGE_SIZES,
  type PageSize,
} from "@/features/pagination/constants/page-sizes";
import {
  EmptyState,
  ErrorState,
  Spinner,
  Toolbar,
  RefreshButton,
  PrimaryButton,
} from "@/features/shared/components";
import {
  SearchInput,
  OrderByFilter,
} from "@/features/shared/components/filters";
import { useStateDialog } from "@/features/shared/hooks/useStateDialog";
import { FileText, X } from "lucide-react";
import type { Application } from "@shared/types";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";

/**
 * CandidateApplicationsPage
 *
 * Page for candidates to view and track their submitted applications.
 */
export default function CandidateApplicationsPage() {
  const [pageSize, setPageSize] = useState<PageSize>(
    PAGE_SIZES.DEFAULT_PAGE_SIZE,
  );

  // Base query
  const DEFAULT_PRISMA_QUERY: PrismaQueryOptions<Application> = useMemo(
    () => ({
      orderBy: { createdAt: "desc" },
    }),
    [],
  );

  // Filter hook (manages search, status, orderBy, URL sync, prismaQuery)
  const {
    searchTerm,
    statusFilter,
    orderBy,
    prismaQuery,
    handleSearch,
    handleStatusChange,
    handleOrderByChange,
    resetFilters,
    activeFiltersCount,
  } = useApplicationFilters({ baseQuery: DEFAULT_PRISMA_QUERY });

  // Dialog state with useStateDialog pattern
  const applicationDialog = useStateDialog<Application>(["view"]);

  const { getApplicationsPaginatedQuery } = useApplications({
    pageSize,
    defaultPrismaQuery: prismaQuery,
  });

  // Get handleViewCv from useMyApplications
  const { handleViewCv } = useMyApplications({ enabled: false });

  const {
    data: applications,
    isLoading,
    isError,
    error,
    refetch,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    handlePageClick,
    totalItems,
    isFetching,
  } = getApplicationsPaginatedQuery;

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value as PageSize);
  }, []);

  const handleApplicationClick = useCallback(
    (application: Application) => {
      applicationDialog.openDialog(application, "view");
    },
    [applicationDialog],
  );

  return (
    <PageContent>
      <PageHeader
        title="Le Mie Candidature"
        subtitle="Visualizza e monitora lo stato delle tue candidature."
      />

      {/* Toolbar con filtri */}
      <Toolbar
        variant="plain"
        leftContent={
          <>
            <SearchInput
              placeholder="Cerca per titolo job..."
              value={searchTerm}
              onSearch={handleSearch}
              debounceMs={500}
              className="flex-2 min-w-72 sm:min-w-96"
            />
            <ApplicationStatusFilter
              value={statusFilter}
              onChange={handleStatusChange}
              className="flex-1 min-w-48 sm:min-w-60"
            />
            <OrderByFilter
              value={orderBy || "none"}
              onChange={handleOrderByChange}
              options={APPLICATION_ORDER_BY_OPTIONS}
              placeholder="Ordina per..."
              className="flex-1 min-w-48 sm:min-w-60"
            />
          </>
        }
        rightContent={
          <>
            <PrimaryButton
              text="Azzera filtri"
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
              icon={<X className="h-4 w-4" />}
            />
            <RefreshButton refetch={refetch} isLoading={isFetching} />
          </>
        }
      />

      <PaginationWrapperStyled<Application>
        data={applications || []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={refetch}
        currentPage={currentPage}
        totalPages={totalPages}
        nextPage={nextPage}
        prevPage={prevPage}
        handlePageClick={handlePageClick}
        pageSizeConfig={{
          value: pageSize,
          onValueChange: handlePageSizeChange,
          label: "Per pagina",
        }}
        totalItemsConfig={
          totalItems !== undefined
            ? {
                totalItems,
                singularText: "Candidatura",
                pluralText: "Candidature",
              }
            : undefined
        }
      >
        {({
          data: paginatedApplications,
          isLoading: isLoadingData,
          isError: hasError,
          refetch: retryFetch,
        }) => (
          <>
            {isLoadingData ? (
              <Spinner
                size="lg"
                showMessage
                message="Caricamento candidature..."
                className="py-12"
              />
            ) : hasError ? (
              <ErrorState
                title="Errore di caricamento"
                description="Non è stato possibile caricare le candidature. Riprova più tardi."
                onRetry={() => retryFetch?.()}
              />
            ) : paginatedApplications.length === 0 ? (
              <EmptyState
                icon={<FileText />}
                title="Nessuna candidatura trovata"
                description="Non hai ancora inviato nessuna candidatura. Esplora il marketplace per trovare opportunità!"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onClick={handleApplicationClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </PaginationWrapperStyled>

      {/* Modal dettaglio candidatura */}
      {applicationDialog.isDialogOpen("view") &&
        applicationDialog.selectedItem && (
          <ApplicationDetailModal
            application={applicationDialog.selectedItem}
            isOpen={true}
            onClose={applicationDialog.closeDialog}
            onViewCv={handleViewCv}
          />
        )}
    </PageContent>
  );
}
