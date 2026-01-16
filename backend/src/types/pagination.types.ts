/**
 * Backend pagination types
 * Used by backend services for API responses
 */

/**
 * Paginated response from backend
 * Returns elaborated query for debugging/comparison (Lex-Nexus pattern)
 */
export interface PaginatedResponse<T> {
  /** Array of items for current page */
  data: T[];

  /** Total count of items (all pages) */
  count: number;

  /** Query used (elaborated/sanitized, for debugging/comparison) */
  query: Record<string, any>;
}

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
  skip?: number;
  take?: number;
}
