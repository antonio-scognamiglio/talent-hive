import { useMemo, useState, useCallback } from "react";
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
import type { Job, CreateJobDto, UpdateJobDto } from "@shared/types";
import { createJobColumnsConfig } from "@/features/jobs/utils/job-columns.utils";
import ConfirmationDialog from "@/features/shared/components/ConfirmationDialog";
import { JobDetailDialog } from "@/features/jobs/components/dialogs/JobDetailDialog";
import { CreateJobDialog } from "@/features/jobs/components/dialogs/CreateJobDialog";
import { useStateDialog } from "@/features/shared/hooks/useStateDialog";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import {
  PAGE_SIZES,
  type PageSize,
} from "@/features/pagination/constants/page-sizes";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";

/**
 * Base query con include per conteggio applications e dati del recruiter owner.
 * L'admin vede tutti i job (nessun filtro RBAC lato backend per ruolo ADMIN).
 */
const BASE_QUERY: PrismaQueryOptions<Job> = {
  include: {
    _count: {
      select: { applications: true },
    },
    createdBy: true,
  },
};

const AdminJobsPage = () => {
  const { user } = useAuthContext();
  const dialog = useStateDialog<JobWithCount>(["create", "delete", "detail"]);

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

  const {
    getJobsPaginatedQuery,
    createJobMutation,
    updateJobMutation,
    deleteJobMutation,
  } = useJobs({
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

  const handleRowClick = useCallback(
    (job: JobWithCount) => {
      dialog.openDialog(job, "detail");
    },
    [dialog],
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

  const handleArchiveJob = useCallback(
    async (id: string) => {
      await deleteJobMutation.mutateAsync(id);
      dialog.closeDialog();
    },
    [deleteJobMutation, dialog],
  );

  const handleUpdateJob = useCallback(
    async (id: string, data: UpdateJobDto) => {
      const response = await updateJobMutation.mutateAsync({ id, data });
      if (dialog.selectedItem) {
        dialog.refreshDialogData({
          ...response.data,
          _count: dialog.selectedItem._count,
          createdBy: dialog.selectedItem.createdBy,
        });
      }
    },
    [updateJobMutation, dialog],
  );

  const handleCreateJob = useCallback(
    async (data: CreateJobDto) => {
      await createJobMutation.mutateAsync(data);
      dialog.closeDialog();
    },
    [createJobMutation, dialog],
  );

  const columns = useMemo(
    () =>
      createJobColumnsConfig({
        onDelete: (job) => handleDeleteClick(job),
        user,
        showCreatedBy: true,
      }),
    [handleDeleteClick, user],
  );

  return (
    <PageContent>
      <PageHeader
        title="Gestione Annunci"
        subtitle="Vista piattaforma — tutti gli annunci di tutti i recruiter."
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
            <PrimaryButton
              text="Nuovo Annuncio"
              showIcon
              onClick={() => dialog.openDialog(null, "create")}
            />
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
                onRowClick={handleRowClick}
                emptyState={customEmptyState}
              />
            );
          }}
        </PaginationWrapperStyled>
      </ContentCard>

      {/* Dialog Creazione Job */}
      {dialog.isDialogOpen("create") && (
        <CreateJobDialog
          isOpen={true}
          onClose={dialog.closeDialog}
          onCreate={handleCreateJob}
          isCreating={createJobMutation.isPending}
        />
      )}

      {/* Dialog Dettaglio Job (View/Edit) */}
      {dialog.isDialogOpen("detail") && dialog.selectedItem && (
        <JobDetailDialog
          isOpen={true}
          onClose={dialog.closeDialog}
          job={dialog.selectedItem}
          onUpdate={handleUpdateJob}
          onArchive={handleArchiveJob}
          isUpdating={updateJobMutation.isPending}
          isArchiving={deleteJobMutation.isPending}
        />
      )}

      {/* Dialog Conferma Archiviazione (da tabella) */}
      {dialog.isDialogOpen("delete") && dialog.selectedItem && (
        <ConfirmationDialog
          isOpen={true}
          onClose={dialog.closeDialog}
          onConfirm={handleConfirmDelete}
          title="Archivia annuncio"
          description={`Sei sicuro di voler archiviare l'annuncio "${dialog.selectedItem.title}"? L'annuncio non sarà più visibile ai candidati ma le candidature esistenti verranno mantenute.`}
          isLoading={deleteJobMutation.isPending}
        />
      )}
    </PageContent>
  );
};

export default AdminJobsPage;
