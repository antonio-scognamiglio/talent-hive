import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Job } from "@shared/types";
import { cleanEmptyNestedObjects } from "@/features/shared/utils/prisma-query-utils";
import {
  getJobSearchFilterCleanedQuery,
  getJobSalaryMinFilterCleanedQuery,
  getJobSalaryMaxFilterCleanedQuery,
  getJobOrderByCleanedQuery,
} from "./job-query-builders";

/**
 * Valori dei filtri per la ricerca jobs
 */
export interface JobFilters {
  searchTerm?: string;
  salaryMin?: number;
  salaryMax?: number;
  orderBy?: string;
}

/**
 * Applica i filtri alla query Prisma per i jobs.
 * Usa i builder per gestire correttamente la combinazione delle condizioni.
 */
export function applyJobFilters(
  baseQuery: PrismaQueryOptions<Job>,
  filters: JobFilters,
): PrismaQueryOptions<Job> {
  let result = baseQuery;

  // Applica filtro ricerca se presente
  if (filters.searchTerm !== undefined) {
    result = getJobSearchFilterCleanedQuery(result, filters.searchTerm);
  }

  // Applica filtro salary min
  if (filters.salaryMin !== undefined) {
    result = getJobSalaryMinFilterCleanedQuery(result, filters.salaryMin);
  }

  // Applica filtro salary max
  if (filters.salaryMax !== undefined) {
    result = getJobSalaryMaxFilterCleanedQuery(result, filters.salaryMax);
  }

  // Applica ordinamento se presente
  if (filters.orderBy !== undefined) {
    result = getJobOrderByCleanedQuery(result, filters.orderBy);
  }

  // Pulisci oggetti nested vuoti
  return cleanEmptyNestedObjects(result);
}
