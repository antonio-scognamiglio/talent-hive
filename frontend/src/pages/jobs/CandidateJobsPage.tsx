import { JobCardCandidate } from "@/features/jobs/components";
import {
  useJobsWithApplicationStatus,
  type JobWithApplicationStatus,
} from "@/features/jobs/hooks/useJobsWithApplicationStatus";
import {
  useJobFilters,
  JOB_ORDER_BY_OPTIONS,
} from "@/features/jobs/hooks/useJobFilters";
import { PaginationWrapperStyled } from "@/features/pagination/components";
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
  NumberFilter,
  OrderByFilter,
} from "@/features/shared/components/filters";
import { PageContent, PageHeader } from "@/features/shared/components/layout";
import { Briefcase, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Job } from "@shared/types";

/**
 * CandidateJobsPage
 *
 * Job marketplace for candidates.
 */
export default function CandidateJobsPage() {
  const [pageSize, setPageSize] = useState<PageSize>(
    PAGE_SIZES.DEFAULT_PAGE_SIZE,
  );

  // Base query for published jobs
  const DEFAULT_PRISMA_QUERY: PrismaQueryOptions<Job> = useMemo(
    () => ({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
    }),
    [],
  );

  // Filter hook (manages search, salary, URL sync, prismaQuery)
  const {
    searchTerm,
    salaryMin,
    salaryMax,
    orderBy,
    prismaQuery,
    handleSearch,
    handleSalaryMinChange,
    handleSalaryMaxChange,
    handleOrderByChange,
    resetFilters,
    activeFiltersCount,
  } = useJobFilters({
    baseQuery: DEFAULT_PRISMA_QUERY,
  });

  const {
    jobs,
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
  } = useJobsWithApplicationStatus({
    pageSize,
    defaultPrismaQuery: prismaQuery,
  });

  const navigate = useNavigate();

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value as PageSize);
  }, []);

  const handleViewJob = useCallback(
    (job: JobWithApplicationStatus) => {
      navigate(`/jobs/${job.id}`);
    },
    [navigate],
  );

  return (
    <PageContent>
      <PageHeader
        title="Jobs Marketplace"
        subtitle="Cerca e candidati per le opportunità di lavoro"
      />

      {/* Toolbar con filtri */}
      <Toolbar
        variant="plain"
        leftContent={
          <>
            <SearchInput
              placeholder="Cerca per titolo, descrizione o località..."
              value={searchTerm}
              onSearch={handleSearch}
              debounceMs={500}
              className="flex-2 min-w-72 sm:min-w-96"
            />
            <NumberFilter
              value={salaryMin}
              onChange={handleSalaryMinChange}
              placeholder="Salario minimo"
              prefix="€"
              step={1000}
              className="flex-1 min-w-48 sm:min-w-60"
            />
            <NumberFilter
              value={salaryMax}
              onChange={handleSalaryMaxChange}
              placeholder="Salario massimo"
              prefix="€"
              step={1000}
              className="flex-1 min-w-48 sm:min-w-60"
            />
            <OrderByFilter
              value={orderBy || "none"}
              onChange={handleOrderByChange}
              options={JOB_ORDER_BY_OPTIONS}
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

      <PaginationWrapperStyled<JobWithApplicationStatus>
        data={jobs}
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
                singularText: "Offerta",
                pluralText: "Offerte",
              }
            : undefined
        }
      >
        {({
          data: paginatedJobs,
          isLoading: isLoadingData,
          isError: hasError,
          refetch: retryFetch,
        }) => (
          <>
            {isLoadingData ? (
              <Spinner
                size="lg"
                showMessage
                message="Caricamento annunci..."
                className="py-12"
              />
            ) : hasError ? (
              <ErrorState
                title="Errore di caricamento"
                description="Non è stato possibile caricare gli annunci. Riprova più tardi."
                onRetry={() => retryFetch?.()}
              />
            ) : paginatedJobs.length === 0 ? (
              <EmptyState
                icon={<Briefcase />}
                title={"Nessun annuncio trovato"}
                description={
                  "Prova a cambiare i filtri o attendi che venga pubblicato un nuovo annuncio"
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedJobs.map((job) => (
                  <JobCardCandidate
                    key={job.id}
                    job={job}
                    onView={handleViewJob}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </PaginationWrapperStyled>
    </PageContent>
  );
}
