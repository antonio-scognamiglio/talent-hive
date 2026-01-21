import { JobCardCandidate } from "@/features/jobs/components";
import {
  useJobsWithApplicationStatus,
  type JobWithApplicationStatus,
} from "@/features/jobs/hooks/useJobsWithApplicationStatus";
import { PaginationWrapperStyled } from "@/features/pagination/components";
import {
  PAGE_SIZES,
  type PageSize,
} from "@/features/pagination/constants/page-sizes";
import { EmptyState, Spinner } from "@/features/shared/components";
import { PageContent, PageHeader } from "@/features/shared/components/layout";
import { Briefcase } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * CandidateJobsPage
 *
 * Job marketplace for candidates.
 */
export default function CandidateJobsPage() {
  const [pageSize, setPageSize] = useState<PageSize>(
    PAGE_SIZES.DEFAULT_PAGE_SIZE,
  );

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
  } = useJobsWithApplicationStatus({ pageSize });

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
                singularText: "job",
                pluralText: "jobs",
              }
            : undefined
        }
      >
        {({ data: paginatedJobs, isLoading: isLoadingData }) => (
          <>
            {isLoadingData ? (
              <Spinner
                size="lg"
                showMessage
                message="Caricamento annunci..."
                className="py-12"
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
