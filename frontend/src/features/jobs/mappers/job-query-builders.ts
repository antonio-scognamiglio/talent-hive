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
