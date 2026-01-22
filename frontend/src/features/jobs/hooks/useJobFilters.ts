/* eslint-disable react-hooks/set-state-in-effect */
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
  salaryMin?: number;
  salaryMax?: number;
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
    parse: (v) => (typeof v === "string" && v.trim() !== "" ? v : undefined),
    serialize: (v) => (typeof v === "string" && v.trim() !== "" ? v : null),
  },
  {
    param: "salaryMin",
    key: "salaryMin",
    parse: (v) => (v ? parseInt(v, 10) : undefined),
    serialize: (v) => (v !== undefined ? String(v) : null),
  },
  {
    param: "salaryMax",
    key: "salaryMax",
    parse: (v) => (v ? parseInt(v, 10) : undefined),
    serialize: (v) => (v !== undefined ? String(v) : null),
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

  // Stati contr controllati derivati dall'URL (per i componenti UI)
  const [searchTerm, setSearchTerm] = useState<string>(
    filtersFromUrl.searchTerm ?? "",
  );
  const [salaryMin, setSalaryMin] = useState<number | undefined>(
    filtersFromUrl.salaryMin,
  );
  const [salaryMax, setSalaryMax] = useState<number | undefined>(
    filtersFromUrl.salaryMax,
  );

  // Sincronizza stati locali quando cambiano i filtri dall'URL (es. back/forward, link esterno)
  useEffect(() => {
    if (filtersFromUrl.searchTerm !== undefined) {
      setSearchTerm(filtersFromUrl.searchTerm);
    }
    if (filtersFromUrl.salaryMin !== undefined) {
      setSalaryMin(filtersFromUrl.salaryMin);
    }
    if (filtersFromUrl.salaryMax !== undefined) {
      setSalaryMax(filtersFromUrl.salaryMax);
    }
  }, [filtersFromUrl]);

  // Costruisce la prismaQuery con i filtri applicati
  const prismaQuery = useMemo(() => {
    const filters = {
      searchTerm: searchTerm || undefined,
      salaryMin: salaryMin,
      salaryMax: salaryMax,
    };
    return applyJobFilters(baseQuery, filters);
  }, [baseQuery, searchTerm, salaryMin, salaryMax]);

  // Handler per la ricerca
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      setFiltersInUrl({ searchTerm: term });
    },
    [setFiltersInUrl],
  );

  // Handler per salary min change
  const handleSalaryMinChange = useCallback(
    (value: number | undefined) => {
      setSalaryMin(value);
      setFiltersInUrl({ salaryMin: value });
    },
    [setFiltersInUrl],
  );

  // Handler per salary max change
  const handleSalaryMaxChange = useCallback(
    (value: number | undefined) => {
      setSalaryMax(value);
      setFiltersInUrl({ salaryMax: value });
    },
    [setFiltersInUrl],
  );

  return {
    // Valori dei filtri
    searchTerm,
    salaryMin,
    salaryMax,
    // Query Prisma con filtri applicati
    prismaQuery,
    // Handler per cambiare i filtri
    handleSearch,
    handleSalaryMinChange,
    handleSalaryMaxChange,
  };
}
