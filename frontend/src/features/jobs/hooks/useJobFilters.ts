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

import { useState, useCallback, useMemo } from "react";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Job } from "@shared/types";
import {
  useUrlFilters,
  type FilterParamConfig,
} from "@/features/shared/hooks/useUrlFilters";
import { applyJobFilters } from "../mappers/applyJobFilters";
import type { OrderByOption } from "@/features/shared/components/filters";

/**
 * Tipo per i filtri sincronizzati con URL
 */
export type JobUrlFilters = {
  searchTerm?: string;
  salaryMin?: number;
  salaryMax?: number;

  status?: string;
  orderBy?: string;
};

/**
 * Props per useJobFilters
 */
interface UseJobFiltersProps {
  /** Query base Prisma (include, orderBy, ecc.) */
  baseQuery: PrismaQueryOptions<Job>;
}

/**
 * Opzioni di ordinamento per i jobs
 */
export const JOB_ORDER_BY_OPTIONS: OrderByOption[] = [
  { label: "Nessun ordinamento", value: "none" },
  { label: "Più recenti", value: "createdAt-desc" },
  { label: "Meno recenti", value: "createdAt-asc" },
  { label: "Salario min: Alto → Basso", value: "salaryMin-desc" },
  { label: "Salario min: Basso → Alto", value: "salaryMin-asc" },
];

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
  {
    param: "status",
    key: "status",
    parse: (v) => (v ? v : undefined),
    serialize: (v) => (v ? String(v) : null),
  },
  {
    param: "orderBy",
    key: "orderBy",
    parse: (v) => (typeof v === "string" && v.trim() !== "" ? v : undefined),
    serialize: (v) => (typeof v === "string" && v.trim() !== "" ? v : null),
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
  const [status, setStatus] = useState<string | undefined>(
    filtersFromUrl.status,
  );
  const [orderBy, setOrderBy] = useState<string | undefined>(
    filtersFromUrl.orderBy,
  );

  // Costruisce la prismaQuery con i filtri applicati
  const prismaQuery = useMemo(() => {
    const filters = {
      searchTerm: searchTerm || undefined,
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      status: status,
      orderBy: orderBy,
    };
    return applyJobFilters(baseQuery, filters);
  }, [baseQuery, searchTerm, salaryMin, salaryMax, status, orderBy]);

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

  // Handler per orderBy change
  const handleOrderByChange = useCallback(
    (value: string) => {
      setOrderBy(value || undefined);
      setFiltersInUrl({ orderBy: value || undefined });
    },
    [setFiltersInUrl],
  );

  // Handler per status change
  const handleStatusChange = useCallback(
    (value: string | undefined) => {
      const newValue = value === "all" ? undefined : value;
      setStatus(newValue);
      setFiltersInUrl({ status: newValue });
    },
    [setFiltersInUrl],
  );

  // Resetta tutti i filtri
  const [resetKey, setResetKey] = useState(0);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSalaryMin(undefined);
    setSalaryMax(undefined);
    setStatus(undefined);
    setOrderBy(undefined);
    setFiltersInUrl({});
    setResetKey((prev) => prev + 1); // Increment reset key to force remount of filter components
  }, [setFiltersInUrl]);

  // Conta i filtri attivi
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (salaryMin !== undefined) count++;
    if (salaryMax !== undefined) count++;
    if (status) count++;
    if (orderBy) count++;
    return count;
  }, [searchTerm, salaryMin, salaryMax, status, orderBy]);

  return {
    // Valori dei filtri
    searchTerm,
    salaryMin,
    salaryMax,
    status,
    orderBy,
    // Query Prisma con filtri applicati
    prismaQuery,
    // Handler per cambiare i filtri
    handleSearch,
    handleSalaryMinChange,
    handleSalaryMaxChange,
    handleStatusChange,
    handleOrderByChange,
    resetFilters,
    activeFiltersCount,
    // Key per forzare remount dei filtri al reset
    resetKey,
  };
}
