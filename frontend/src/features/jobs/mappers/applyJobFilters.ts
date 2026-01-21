import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Job } from "@shared/types";
import { cleanEmptyNestedObjects } from "@/features/shared/utils/prisma-query-utils";
import { getJobSearchFilterCleanedQuery } from "./job-query-builders";

/**
 * Valori dei filtri per la ricerca jobs
 */
export interface JobFilters {
  searchTerm?: string;
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

  // Pulisci oggetti nested vuoti
  return cleanEmptyNestedObjects(result);
}
