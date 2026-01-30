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
import type { ApplicationStatusFilterValue } from "../components/filters";
import type { OrderByOption } from "@/features/shared/components/filters";

/**
 * Tipo per i filtri sincronizzati con URL
 */
export type ApplicationUrlFilters = {
  searchTerm?: string;
  statusFilter?: ApplicationStatusFilterValue;
  orderBy?: string;
};

/**
 * Props per useApplicationFilters
 */
interface UseApplicationFiltersProps {
  /** Query base Prisma */
  baseQuery: PrismaQueryOptions<Application>;
}

/**
 * Opzioni di ordinamento per le applications
 */
export const APPLICATION_ORDER_BY_OPTIONS: OrderByOption[] = [
  { label: "Nessun ordinamento", value: "none" },
  { label: "Più recenti", value: "createdAt-desc" },
  { label: "Meno recenti", value: "createdAt-asc" },
];

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
        v === "pending" || v === "HIRED" || v === "REJECTED"
          ? (v as ApplicationStatusFilterValue)
          : undefined,
      serialize: (v) => (v && v !== "all" ? v : null),
    },
    {
      param: "orderBy",
      key: "orderBy",
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
    useState<ApplicationStatusFilterValue>(
      filtersFromUrl.statusFilter ?? "all",
    );
  const [orderBy, setOrderBy] = useState<string | undefined>(
    filtersFromUrl.orderBy,
  );

  // Key per forzare il remount dei componenti filtro al reset
  const [resetKey, setResetKey] = useState(0);

  // Costruisce la prismaQuery con i filtri applicati
  const prismaQuery = useMemo(() => {
    const filters = {
      searchTerm: searchTerm || undefined,
      statusFilter: statusFilter,
      orderBy: orderBy,
    };
    return applyApplicationFilters(baseQuery, filters);
  }, [baseQuery, searchTerm, statusFilter, orderBy]);

  // Handler per la ricerca
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setFiltersInUrl({ searchTerm: term });
    },
    [setFiltersInUrl],
  );

  // Handler per status filter
  const handleStatusChange = useCallback(
    (value: ApplicationStatusFilterValue) => {
      setStatusFilter(value);
      setFiltersInUrl({ statusFilter: value });
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

  // Resetta tutti i filtri
  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("all");
    setOrderBy(undefined);
    setFiltersInUrl({});
    setResetKey((prev) => prev + 1);
  }, [setFiltersInUrl]);

  // Conta i filtri attivi (per mostrare il pulsante reset)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter && statusFilter !== "all") count++;
    if (orderBy && orderBy !== "none") count++;
    return count;
  }, [searchTerm, statusFilter, orderBy]);

  return {
    // Valori dei filtri
    searchTerm,
    statusFilter,
    orderBy,
    // Query Prisma con filtri applicati
    prismaQuery,
    // Handler per cambiare i filtri
    handleSearch,
    handleStatusChange,
    handleOrderByChange,
    resetFilters,
    resetKey,
    activeFiltersCount,
  };
}
