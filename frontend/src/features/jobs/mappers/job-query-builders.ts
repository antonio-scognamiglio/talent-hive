import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { Job } from "@shared/types";
import { updateSearchConditions } from "@/features/shared/utils/prisma-query-utils";

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
