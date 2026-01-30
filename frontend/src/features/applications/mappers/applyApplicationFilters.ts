/**
 * applyApplicationFilters
 *
 * Applica i filtri alla query Prisma per le applications.
 * Gestisce: searchTerm (titolo job), statusFilter (finalDecision), orderBy.
 *
 * USA le utilities da prisma-query-utils per costruire le query.
 */

import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Application } from "@shared/types";
import {
  cleanEmptyNestedObjects,
  cleanPrismaQuery,
  updateSearchConditions,
} from "@/features/shared/utils/prisma-query-utils";
import type { ApplicationStatusFilterValue } from "../components/filters";

/**
 * Valori dei filtri per la ricerca applications
 */
export interface ApplicationFilters {
  searchTerm?: string;
  statusFilter?: ApplicationStatusFilterValue;
  orderBy?: string;
}

/**
 * Applica i filtri alla query Prisma per le applications.
 */
export function applyApplicationFilters(
  baseQuery: PrismaQueryOptions<Application>,
  filters: ApplicationFilters,
): PrismaQueryOptions<Application> {
  let result = { ...baseQuery };

  // Applica filtro ricerca su titolo job (relazione nested)
  if (filters.searchTerm !== undefined) {
    result = updateSearchConditions(
      result,
      ["job.title"], // Nested search on job.title
      filters.searchTerm,
    ) as PrismaQueryOptions<Application>;
  }

  // Applica filtro status (finalDecision)
  if (filters.statusFilter && filters.statusFilter !== "all") {
    if (filters.statusFilter === "pending") {
      // "pending" = finalDecision è null (in attesa)
      result = cleanPrismaQuery(
        result,
        "finalDecision" as keyof Application,
        null,
        "where",
      ) as PrismaQueryOptions<Application>;
    } else {
      // HIRED o REJECTED
      result = cleanPrismaQuery(
        result,
        "finalDecision" as keyof Application,
        filters.statusFilter,
        "where",
      ) as PrismaQueryOptions<Application>;
    }
  }

  // Applica ordinamento
  if (filters.orderBy && filters.orderBy !== "none") {
    const [field, direction] = filters.orderBy.split("-");
    if (field && direction) {
      result = cleanPrismaQuery(
        result,
        field as keyof Application,
        direction,
        "orderBy",
        undefined,
        "replace",
      ) as PrismaQueryOptions<Application>;
    }
  }

  return cleanEmptyNestedObjects(result);
}
