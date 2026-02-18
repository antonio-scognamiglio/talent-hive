import { useState, useCallback, useMemo } from "react";
import { FileText, X } from "lucide-react";
import { CustomTableStyled } from "@/features/shared/components/CustomTableStyled";
import { PaginationWrapperStyled } from "@/features/pagination/components/PaginationWrapperStyled";
import { Toolbar } from "@/features/shared/components/Toolbar";
import { PageHeader, PageContent } from "@/features/shared/components/layout";
import { RefreshButton } from "@/features/shared/components/RefreshButton";
import { GhostButton } from "@/features/shared/components/GhostButton";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { ErrorState } from "@/features/shared/components/ErrorState";
import { ContentCard } from "@/features/shared/components/ContentCard";
import { useApplications } from "@/features/applications/hooks/useApplications";
import { useApplicationStatusCounters } from "@/features/applications/hooks/useApplicationStatusCounters";
import { useApplicationFilters } from "@/features/applications/hooks/useApplicationFilters";
import { JobSearchSelectPaginated } from "@/features/jobs/components/filters/JobSearchSelectPaginated";
import { WorkflowStatusFilter } from "@/features/applications/components/filters/WorkflowStatusFilter";
import type { WorkflowStatusFilterValue } from "@/features/applications/constants/applications-options";
import { ApplicationDetailDialog } from "@/features/applications/components/dialogs/ApplicationDetailDialog";
import type { UpdateApplicationFormValues } from "@/features/applications/schemas/update-application.schema";
import type { Application } from "@shared/types";
import { useStateDialog } from "@/features/shared/hooks/useStateDialog";
import {
  PAGE_SIZES,
  type PageSize,
} from "@/features/pagination/constants/page-sizes";
import { createApplicationColumnsConfig } from "@/features/applications/utils/application-columns.utils";

export default function RecruiterApplicationsPage() {
  const [pageSize, setPageSize] = useState<PageSize>(
    PAGE_SIZES.DEFAULT_PAGE_SIZE,
  );

  // Dialog State Management
  const dialog = useStateDialog<Application>(["detail"]);

  // Filter Logic using Standard Hook
  const {
    jobId,
    workflowStatus,
    prismaQuery,
    handleJobIdChange,
    handleWorkflowStatusChange,
    resetFilters,
    activeFiltersCount,
    resetKey,
  } = useApplicationFilters({
    baseQuery: {
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        job: true,
      },
    },
  });

  // Data Fetching
  const {
    getApplicationsPaginatedQuery,
    updateApplicationMutation,
    hireMutation,
    rejectMutation,
    handleViewCv,
  } = useApplications({
    // Pass the prismaQuery constructed by the filter hook (includes baseQuery + filters)
    prismaQuery,
    pageSize,
  });

  // Badge Counters
  const badgeText = useApplicationStatusCounters({ jobId });

  const {
    data: applications,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    totalItems,
    totalPages,
    currentPage,
    handlePageClick,
    nextPage,
    prevPage,
  } = getApplicationsPaginatedQuery;

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value as PageSize);
  }, []);

  const handleRowClick = (application: Application) => {
    dialog.openDialog(application, "detail");
  };

  const handleUpdateApplication = async (
    id: string,
    data: UpdateApplicationFormValues,
  ) => {
    try {
      const updatedApp = await updateApplicationMutation.mutateAsync({
        id,
        ...data,
      });

      // Merge updated fields with existing selectedItem to preserve relations (user, job)
      if (dialog.selectedItem) {
        dialog.refreshDialogData({
          ...dialog.selectedItem,
          ...updatedApp,
        });
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleHireCandidate = async (
    id: string,
    notes?: string,
    score?: number,
  ) => {
    try {
      const updatedApp = await hireMutation.mutateAsync({ id, notes, score });
      dialog.refreshDialogData(updatedApp);
    } catch {
      // Error handled
    }
  };

  const handleRejectCandidate = async (
    id: string,
    reason?: string,
    notes?: string,
    score?: number,
  ) => {
    try {
      const updatedApp = await rejectMutation.mutateAsync({
        id,
        reason,
        notes,
        score,
      });
      dialog.refreshDialogData(updatedApp);
    } catch {
      // Error handled
    }
  };

  // Use factory function for columns
  const columns = useMemo(() => createApplicationColumnsConfig(), []);

  if (isError) {
    return (
      <ErrorState
        title="Errore nel caricamento"
        description="Non siamo riusciti a caricare le candidature."
        onRetry={refetch}
      />
    );
  }

  return (
    <PageContent>
      <PageHeader
        title="Gestione Candidature"
        subtitle="Visualizza e gestisci le performance delle candidature."
      />

      <Toolbar
        variant="plain"
        leftContent={
          <>
            <JobSearchSelectPaginated
              key={`job-${resetKey}`}
              value={jobId}
              onChange={handleJobIdChange}
              placeholder="Filtra per posizione"
              className="w-full flex-2 min-w-64 sm:min-w-72"
            />
            <WorkflowStatusFilter
              key={`workflow-${resetKey}`}
              value={(workflowStatus || "all") as WorkflowStatusFilterValue}
              onChange={handleWorkflowStatusChange}
              className="w-full flex-1 min-w-48 sm:min-w-60"
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
          </>
        }
      />

      <ContentCard badgeText={badgeText}>
        <PaginationWrapperStyled<Application>
          data={applications}
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
            singularText: "candidatura",
            pluralText: "candidature",
            display: "text",
          }}
        >
          {(props) => (
            <CustomTableStyled<Application>
              {...props}
              columns={columns}
              onRowClick={handleRowClick}
              emptyState={
                <EmptyState
                  title="Nessuna candidatura trovata"
                  description="Prova a modificare i filtri di ricerca."
                  icon={
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  }
                />
              }
            />
          )}
        </PaginationWrapperStyled>
      </ContentCard>

      {dialog.isDialogOpen("detail") && dialog.selectedItem && (
        <ApplicationDetailDialog
          isOpen={true}
          onClose={dialog.closeDialog}
          application={dialog.selectedItem}
          onUpdate={handleUpdateApplication}
          onHire={handleHireCandidate}
          onReject={handleRejectCandidate}
          handleViewCv={handleViewCv}
          isUpdating={updateApplicationMutation.isPending}
          isHiring={hireMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      )}
    </PageContent>
  );
}
