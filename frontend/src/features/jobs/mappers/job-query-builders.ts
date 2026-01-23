import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Job } from "@shared/types";
import {
  updateSearchConditions,
  cleanPrismaQuery,
} from "@/features/shared/utils/prisma-query-utils";

/**
 * Applica il filtro di ricerca jobs (title, description, location)
 */
export function getJobSearchFilterCleanedQuery(
  query: PrismaQueryOptions<Job> | undefined,
  searchText: string,
): PrismaQueryOptions<Job> {
  const baseQuery = query || {};
  const searchKeys = ["title", "description", "location"];
  return (
    updateSearchConditions(
      baseQuery,
      searchKeys,
      searchText,
      "contains",
      false,
    ) || baseQuery
  );
}

/**
 * Applica il filtro salaryMin alla query
 */
export function getJobSalaryMinFilterCleanedQuery(
  query: PrismaQueryOptions<Job> | undefined,
  salaryMin: number | undefined,
): PrismaQueryOptions<Job> {
  const baseQuery = query || {};

  return (
    cleanPrismaQuery(baseQuery, "salaryMin", salaryMin, "where", "gte") ||
    baseQuery
  );
}

/**
 * Applica il filtro salaryMax alla query
 */
export function getJobSalaryMaxFilterCleanedQuery(
  query: PrismaQueryOptions<Job> | undefined,
  salaryMax: number | undefined,
): PrismaQueryOptions<Job> {
  const baseQuery = query || {};

  return (
    cleanPrismaQuery(baseQuery, "salaryMax", salaryMax, "where", "lte") ||
    baseQuery
  );
}

/**
 * Applica l'ordinamento alla query
 * NOTA: Usa 'replace' mode per garantire ordinamento esclusivo,
 * più ID come tie-breaker stabile.
 */
export function getJobOrderByCleanedQuery(
  query: PrismaQueryOptions<Job> | undefined,
  orderByValue: string | undefined,
): PrismaQueryOptions<Job> {
  const baseQuery = query || {};

  // Se vuoto o "none", resetta al default (o rimuovi)
  if (!orderByValue || orderByValue === "" || orderByValue === "none") {
    // Rimuoviamo l'orderBy esistente e mettiamo il default
    const { orderBy: _existingOrderBy, ...queryWithoutOrderBy } = baseQuery;
    return {
      ...queryWithoutOrderBy,
      orderBy: { createdAt: "desc" },
    };
  }

  // Parse "field-direction" → es. "createdAt-desc"
  const [field, direction] = orderByValue.split("-");

  // 1. Applica il filtro principale in modalità REPLACE (sovrascrive tutto)
  const result = cleanPrismaQuery(
    baseQuery,
    field as keyof Job,
    direction || "desc",
    "orderBy",
    undefined,
    "replace", // Sovrascrive precedenti ordinamenti
  );

  return result || baseQuery;
}
