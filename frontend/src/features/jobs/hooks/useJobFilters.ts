/**
 * useJobFilters Hook
 *
 * Hook per gestire i filtri dei jobs con sincronizzazione URL.
 * Incapsula tutta la logica di:
 * - Sincronizzazione filtri con URL params
 * - Gestione stati locali dei filtri
 * - Costruzione prismaQuery con filtri applicati
 * - Handler per cambiare i filtri
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Job } from "@shared/types";
import {
  useUrlFilters,
  type FilterParamConfig,
} from "@/features/shared/hooks/useUrlFilters";
import { applyJobFilters } from "../mappers/applyJobFilters";

/**
 * Tipo per i filtri sincronizzati con URL
 */
export type JobUrlFilters = {
  searchTerm?: string;
};

/**
 * Props per useJobFilters
 */
interface UseJobFiltersProps {
  /** Query base Prisma (include, orderBy, ecc.) */
  baseQuery: PrismaQueryOptions<Job>;
}

/**
 * Configurazione dei query params per i filtri dei jobs
 */
export const JOB_FILTER_PARAM_CONFIGS: FilterParamConfig<JobUrlFilters>[] = [
  {
    param: "q",
    key: "searchTerm",
    parse: (v) => (v && v.trim() !== "" ? v : undefined),
    serialize: (v) => (v && v.trim() !== "" ? v : null),
  },
];

/**
 * Hook per gestire i filtri dei jobs
 *
 * @example
 * ```ts
 * const {
 *   searchTerm,
 *   prismaQuery,
 *   handleSearch,
 * } = useJobFilters({
 *   baseQuery: DEFAULT_PRISMA_QUERY,
 * });
 * ```
 */
export function useJobFilters({ baseQuery }: UseJobFiltersProps) {
  // Hook per sincronizzare filtri con URL
  const { filtersFromUrl, setFiltersInUrl } = useUrlFilters<JobUrlFilters>(
    JOB_FILTER_PARAM_CONFIGS,
    {
      searchTerm: "",
    },
  );

  // Stati controllati derivati dall'URL (per i componenti UI)
  const [searchTerm, setSearchTerm] = useState<string>(
    filtersFromUrl.searchTerm ?? "",
  );

  // Sincronizza stati locali quando cambiano i filtri dall'URL (es. back/forward, link esterno)
  useEffect(() => {
    if (filtersFromUrl.searchTerm !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchTerm(filtersFromUrl.searchTerm);
    }
  }, [filtersFromUrl]);

  // Costruisce la prismaQuery con i filtri applicati
  const prismaQuery = useMemo(() => {
    const filters = {
      searchTerm: searchTerm || undefined,
    };
    return applyJobFilters(baseQuery, filters);
  }, [baseQuery, searchTerm]);

  // Handler per la ricerca
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setFiltersInUrl({ searchTerm: term });
    },
    [setFiltersInUrl],
  );

  return {
    // Valori dei filtri
    searchTerm,
    // Query Prisma con filtri applicati
    prismaQuery,
    // Handler per cambiare i filtri
    handleSearch,
  };
}
