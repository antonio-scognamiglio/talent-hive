/**
 * Shared types for query key factories
 * Used across pagination hooks and query-client config
 */

/**
 * Parameters for query key factory functions
 * Uses body/path pattern to match API request structure
 *
 * @example
 * // Invalidate specific query
 * factory({ body: { skip: 0, take: 10, where: {...} }, path: { firmId } })
 *
 * // Invalidate all variants
 * factory()
 */
export interface QueryKeyFactoryParams {
  body?: Record<string, unknown>; // Complete request body (skip, take, prismaQuery merged)
  path?: Record<string, unknown>; // Path parameters
}

/**
 * Type for query key factory functions
 * Generates query keys with optional body/path parameters
 *
 * @example
 * const factory: QueryKeyFactory = (params) =>
 *   params ? ["jobs", "list", params] : ["jobs", "list"]
 */
export type QueryKeyFactory = (
  params?: QueryKeyFactoryParams
) => readonly (string | number | Record<string, unknown>)[];
