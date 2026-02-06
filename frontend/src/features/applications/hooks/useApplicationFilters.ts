/**
 * useApplicationFilters Hook
 *
 * Hook per gestire i filtri delle applications con sincronizzazione URL.
 * Incapsula: sincronizzazione filtri con URL, stati locali, prismaQuery con filtri, handler.
 */

import { useState, useCallback, useMemo } from "react";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Application } from "@shared/types";
import {
  useUrlFilters,
  type FilterParamConfig,
} from "@/features/shared/hooks/useUrlFilters";
import { applyApplicationFilters } from "../mappers/applyApplicationFilters";
import {
  type WorkflowStatusFilterValue,
  WORKFLOW_STATUS_FILTER_OPTIONS,
  type FinalDecisionStatusFilterValue,
  APPLICATION_STATUS_FILTER_OPTIONS,
} from "../constants/applications-options";

/**
 * Tipo per i filtri sincronizzati con URL
 */
export type ApplicationUrlFilters = {
  searchTerm?: string;
  statusFilter?: FinalDecisionStatusFilterValue;
  workflowStatus?: WorkflowStatusFilterValue;
  orderBy?: string;
  jobId?: string;
};

/**
 * Props per useApplicationFilters
 */
interface UseApplicationFiltersProps {
  /** Query base Prisma */
  baseQuery: PrismaQueryOptions<Application>;
}

/**
 * Configurazione dei query params per i filtri applications
 */
export const APPLICATION_FILTER_PARAM_CONFIGS: FilterParamConfig<ApplicationUrlFilters>[] =
  [
    {
      param: "q",
      key: "searchTerm",
      parse: (v) => (typeof v === "string" && v.trim() !== "" ? v : undefined),
      serialize: (v) => (typeof v === "string" && v.trim() !== "" ? v : null),
    },
    {
      param: "status",
      key: "statusFilter",
      parse: (v) =>
        typeof v === "string" &&
        APPLICATION_STATUS_FILTER_OPTIONS.some((opt) => opt.value === v) &&
        v !== "all"
          ? (v as FinalDecisionStatusFilterValue)
          : undefined,
      serialize: (v) => (v && v !== "all" ? v : null),
    },

    {
      param: "workflowStatus",
      key: "workflowStatus",
      parse: (v) =>
        typeof v === "string" &&
        WORKFLOW_STATUS_FILTER_OPTIONS.some((opt) => opt.value === v) &&
        v !== "all"
          ? (v as WorkflowStatusFilterValue)
          : undefined,
      serialize: (v) => (v && v !== "all" ? v : null),
    },
    {
      param: "orderBy",
      key: "orderBy",
      parse: (v) => (typeof v === "string" && v.trim() !== "" ? v : undefined),
      serialize: (v) => (typeof v === "string" && v.trim() !== "" ? v : null),
    },
    {
      param: "jobId",
      key: "jobId",
      parse: (v) => (typeof v === "string" && v.trim() !== "" ? v : undefined),
      serialize: (v) => (typeof v === "string" && v.trim() !== "" ? v : null),
    },
  ];

/**
 * Hook per gestire i filtri delle applications
 */
export function useApplicationFilters({
  baseQuery,
}: UseApplicationFiltersProps) {
  // Hook per sincronizzare filtri con URL
  const { filtersFromUrl, setFiltersInUrl } =
    useUrlFilters<ApplicationUrlFilters>(APPLICATION_FILTER_PARAM_CONFIGS, {
      searchTerm: "",
    });

  // Stati controllati derivati dall'URL
  const [searchTerm, setSearchTerm] = useState<string>(
    filtersFromUrl.searchTerm ?? "",
  );
  const [statusFilter, setStatusFilter] =
    useState<FinalDecisionStatusFilterValue>(
      filtersFromUrl.statusFilter ?? "all",
    );
  const [workflowStatus, setWorkflowStatus] =
    useState<WorkflowStatusFilterValue>(
      (filtersFromUrl.workflowStatus as WorkflowStatusFilterValue) ?? "all",
    );
  const [orderBy, setOrderBy] = useState<string | undefined>(
    filtersFromUrl.orderBy,
  );
  const [jobId, setJobId] = useState<string | undefined>(filtersFromUrl.jobId);

  // Key per forzare il remount dei componenti filtro al reset
  const [resetKey, setResetKey] = useState(0);

  // Costruisce la prismaQuery con i filtri applicati
  const prismaQuery = useMemo(() => {
    const filters = {
      searchTerm: searchTerm || undefined,
      statusFilter: statusFilter,
      workflowStatus: workflowStatus,
      orderBy: orderBy,
      jobId: jobId,
    };
    return applyApplicationFilters(baseQuery, filters);
  }, [baseQuery, searchTerm, statusFilter, workflowStatus, orderBy, jobId]);

  // Handler per la ricerca
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setFiltersInUrl({ searchTerm: term });
    },
    [setFiltersInUrl],
  );

  // Handler per status filter (Candidate View)
  const handleStatusChange = useCallback(
    (value: FinalDecisionStatusFilterValue) => {
      setStatusFilter(value);
      setFiltersInUrl({ statusFilter: value });
    },
    [setFiltersInUrl],
  );

  // Handler per workflow status (Recruiter View)
  const handleWorkflowStatusChange = useCallback(
    (value: WorkflowStatusFilterValue) => {
      setWorkflowStatus(value);
      setFiltersInUrl({ workflowStatus: value });
    },
    [setFiltersInUrl],
  );

  // Handler per orderBy change
  const handleOrderByChange = useCallback(
    (value: string) => {
      setOrderBy(value || undefined);
      setFiltersInUrl({ orderBy: value || undefined });
    },
    [setFiltersInUrl],
  );

  // Handler per jobId change
  const handleJobIdChange = useCallback(
    (value: string | undefined) => {
      setJobId(value);
      setFiltersInUrl({ jobId: value });
    },
    [setFiltersInUrl],
  );

  // Resetta tutti i filtri
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setWorkflowStatus("all");
    setOrderBy(undefined);
    setJobId(undefined);
    setFiltersInUrl({});
    setResetKey((prev) => prev + 1);
  }, [setFiltersInUrl]);

  // Conta i filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter && statusFilter !== "all") count++;
    if (workflowStatus && workflowStatus !== "all") count++;
    if (orderBy && orderBy !== "none") count++;
    if (jobId) count++;
    return count;
  }, [searchTerm, statusFilter, workflowStatus, orderBy, jobId]);

  return {
    searchTerm,
    statusFilter,
    workflowStatus,
    orderBy,
    jobId,
    prismaQuery,
    handleSearch,
    handleStatusChange,
    handleWorkflowStatusChange,
    handleOrderByChange,
    handleJobIdChange,
    resetFilters,
    resetKey,
    activeFiltersCount,
  };
}
