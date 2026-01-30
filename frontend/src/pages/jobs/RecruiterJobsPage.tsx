import { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, Briefcase } from "lucide-react";

import {
  useJobFilters,
  JOB_ORDER_BY_OPTIONS,
} from "@/features/jobs/hooks/useJobFilters";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import {
  SearchInput,
  NumberFilter,
  OrderByFilter,
} from "@/features/shared/components/filters";
import { PrimaryButton } from "@/features/shared/components/PrimaryButton";
import { RefreshButton } from "@/features/shared/components/RefreshButton";
import { GhostButton } from "@/features/shared/components/GhostButton";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { CustomTableStyled } from "@/features/shared/components/CustomTableStyled";
import { PaginationWrapperStyled } from "@/features/pagination/components/PaginationWrapperStyled";
import { JobStatusFilter } from "@/features/jobs/components/filters/JobStatusFilter";
import { PageHeader, PageContent } from "@/features/shared/components/layout";
import { Toolbar } from "@/features/shared/components/Toolbar";
import { ContentCard } from "@/features/shared/components/ContentCard";
import type { JobWithCount } from "@/features/jobs/types/job.types";
import type { Job } from "@shared/types";
import { createJobColumnsConfig } from "@/features/jobs/utils/job-columns.utils";
import ConfirmationDialog from "@/features/shared/components/ConfirmationDialog";
import { useStateDialog } from "@/features/shared/hooks/useStateDialog";
import {
  PAGE_SIZES,
  type PageSize,
} from "@/features/pagination/constants/page-sizes";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";

/**
 * Base query con include per conteggio applications
 */
const BASE_QUERY: PrismaQueryOptions<Job> = {
  include: {
    _count: {
      select: { applications: true },
    },
  },
};

const RecruiterJobsPage = () => {
  const navigate = useNavigate();
  const dialog = useStateDialog<JobWithCount>(["delete"]);

  const [pageSize, setPageSize] = useState<PageSize>(
    PAGE_SIZES.DEFAULT_PAGE_SIZE,
  );

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value as PageSize);
  }, []);

  const {
    searchTerm,
    status,
    salaryMin,
    salaryMax,
    orderBy,
    handleSearch,
    handleStatusChange,
    handleSalaryMinChange,
    handleSalaryMaxChange,
    handleOrderByChange,
    prismaQuery,
    resetFilters,
    activeFiltersCount,
    resetKey,
  } = useJobFilters({ baseQuery: BASE_QUERY });

  const { getJobsPaginatedQuery, deleteJobMutation } = useJobs({
    defaultPrismaQuery: prismaQuery,
    pageSize,
  });

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    totalItems,
    totalPages,
    currentPage,
    handlePageClick,
    nextPage,
    prevPage,
    refetch,
  } = getJobsPaginatedQuery;

  const handleEdit = useCallback(
    (job: JobWithCount) => {
      navigate(`/jobs/${job.id}/edit`);
    },
    [navigate],
  );

  const handleDeleteClick = useCallback(
    (job: JobWithCount) => {
      dialog.openDialog(job, "delete");
    },
    [dialog],
  );

  const handleConfirmDelete = async () => {
    if (dialog.selectedItem) {
      await deleteJobMutation.mutateAsync(dialog.selectedItem.id);
      dialog.closeDialog();
    }
  };

  // Configurazione Colonne tramite Factory
  const columns = useMemo(
    () =>
      createJobColumnsConfig({
        onView: (job) => navigate(`/jobs/${job.id}`),
        onEdit: (job) => handleEdit(job),
        onDelete: (job) => handleDeleteClick(job),
      }),

    [navigate, handleEdit, handleDeleteClick],
  );

  return (
    <PageContent>
      <PageHeader
        title="I Miei Annunci"
        subtitle="Gestisci le posizioni aperte e monitora le candidature."
      />

      <Toolbar
        variant="plain"
        leftContent={
          <>
            <SearchInput
              key={`search-${resetKey}`}
              value={searchTerm}
              onSearch={handleSearch}
              placeholder="Cerca annunci..."
              className="flex-2 min-w-72 sm:min-w-96"
            />
            <JobStatusFilter
              key={`status-${resetKey}`}
              value={status}
              onChange={handleStatusChange}
              className="flex-1 min-w-48 sm:min-w-60"
            />
            <NumberFilter
              key={`salaryMin-${resetKey}`}
              value={salaryMin}
              onChange={handleSalaryMinChange}
              placeholder="Salario minimo"
              prefix="€"
              step={1000}
              className="flex-1 min-w-48 sm:min-w-60"
            />
            <NumberFilter
              key={`salaryMax-${resetKey}`}
              value={salaryMax}
              onChange={handleSalaryMaxChange}
              placeholder="Salario massimo"
              prefix="€"
              step={1000}
              className="flex-1 min-w-48 sm:min-w-60"
            />
            <OrderByFilter
              key={`orderBy-${resetKey}`}
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
            <GhostButton
              text="Azzera filtri"
              onClick={resetFilters}
              disabled={activeFiltersCount === 0}
              icon={<X className="h-4 w-4" />}
            />
            <RefreshButton refetch={refetch} isLoading={isFetching} />
            <Link to="/jobs/new">
              <PrimaryButton text="Nuovo Annuncio" showIcon />
            </Link>
          </>
        }
      />

      <ContentCard>
        <PaginationWrapperStyled<JobWithCount>
          data={data}
          isLoading={isLoading}
          isError={isError}
          error={error}
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
          totalItemsConfig={{
            totalItems: totalItems || 0,
            singularText: "annuncio",
            pluralText: "annunci",
            display: "text",
          }}
        >
          {(props) => {
            const customEmptyState = (
              <EmptyState
                icon={<Briefcase />}
                title="Nessun annuncio trovato"
                description="Non ci sono annunci che corrispondono ai tuoi filtri."
              />
            );

            return (
              <CustomTableStyled<JobWithCount>
                {...props}
                columns={columns}
                emptyState={customEmptyState}
              />
            );
          }}
        </PaginationWrapperStyled>
      </ContentCard>

      {dialog.isDialogOpen("delete") && dialog.selectedItem && (
        <ConfirmationDialog
          isOpen={true}
          onClose={dialog.closeDialog}
          onConfirm={handleConfirmDelete}
          title="Elimina annuncio"
          description={`Sei sicuro di voler eliminare l'annuncio "${dialog.selectedItem.title}"? Questa azione non può essere annullata.`}
          isLoading={deleteJobMutation.isPending}
        />
      )}
    </PageContent>
  );
};

export default RecruiterJobsPage;
