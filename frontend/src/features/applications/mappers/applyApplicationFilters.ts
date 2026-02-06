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
import type {
  FinalDecisionStatusFilterValue,
  WorkflowStatusFilterValue,
} from "../constants/applications-options";

/**
 * Valori dei filtri per la ricerca applications
 */
export interface ApplicationFilters {
  searchTerm?: string;
  statusFilter?: FinalDecisionStatusFilterValue;
  workflowStatus?: WorkflowStatusFilterValue; // Workflow status
  orderBy?: string;
  jobId?: string;
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
      ["job.title"],
      filters.searchTerm,
    ) as PrismaQueryOptions<Application>;
  }

  // Applica filtro jobId (mostra solo candidature per un job specifico)
  if (filters.jobId) {
    result = cleanPrismaQuery(
      result,
      "jobId" as keyof Application,
      filters.jobId,
      "where",
    ) as PrismaQueryOptions<Application>;
  }

  // Applica filtro status (finalDecision) - Vista Candidato
  if (filters.statusFilter && filters.statusFilter !== "all") {
    if (filters.statusFilter === "pending") {
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

  // Applica filtro workflowStatus - Vista Recruiter
  if (filters.workflowStatus && filters.workflowStatus !== "all") {
    result = cleanPrismaQuery(
      result,
      "workflowStatus" as keyof Application,
      filters.workflowStatus,
      "where",
    ) as PrismaQueryOptions<Application>;
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
