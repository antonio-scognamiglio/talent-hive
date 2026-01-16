/**
 * Frontend pagination types
 * Used by frontend with PrismaQueryOptions typing
 */

import type { PrismaQueryOptions } from "./prismaQuery.types";

/**
 * Paginated response from API
 * Frontend version with typed PrismaQueryOptions
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];

  /** Total count of items (all pages) */
  count: number;

  /** Query used to fetch this page (typed for FE query building) */
  query: PrismaQueryOptions<T>;
}

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
  skip?: number;
  take?: number;
}
