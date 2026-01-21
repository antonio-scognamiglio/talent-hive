/**
 * Backend Prisma Query Utilities
 *
 * Lightweight utilities for backend query manipulation.
 * Uses native Prisma types (not custom frontend types).
 *
 * Inspired by frontend prisma-query-utils but optimized for backend use cases:
 * - RBAC enforcement
 * - Query sanitization
 * - Condition combination
 */

/**
 * Adds OR constraints to an existing where clause, intelligently combining them with AND.
 *
 * **Use this when:** You need to add multiple alternative conditions (OR) to an existing query.
 *
 * **Don't use this when:** You have a single condition or nested relations - just use spread:
 * `{ ...where, userId: user.id }` or `{ ...where, job: { createdById: user.id } }`
 *
 * **How it works:**
 * - If where has existing OR → wraps both in AND to preserve all conditions
 * - Otherwise → creates simple AND with new OR constraints
 *
 * @param where - Existing where clause (can have filters from frontend)
 * @param orConstraints - Array of conditions to combine with OR (e.g., RBAC rules)
 * @returns Combined where clause
 *
 * @example
 * // RECRUITER RBAC: see PUBLISHED jobs OR own jobs
 * const where = { title: { contains: "developer" } }; // From frontend
 *
 * addORConstraints(where, [
 *   { status: "PUBLISHED" },
 *   { createdById: userId }
 * ]);
 *
 * // Result:
 * {
 *   AND: [
 *     { title: { contains: "developer" } },           // Frontend filter preserved
 *     { OR: [{ status: ... }, { createdById: ... }] } // RBAC constraints
 *   ]
 * }
 */
export function addORConstraints<T = any>(
  where: T | undefined,
  orConstraints: T[],
): T {
  const orClause = { OR: orConstraints } as T;

  if (!where || Object.keys(where).length === 0) {
    // No existing conditions, just return OR constraints
    return orClause;
  }

  // If where already has OR, wrap both in AND
  if ((where as any).OR) {
    return {
      AND: [where, orClause],
    } as T;
  }

  // Otherwise, simple AND
  return {
    AND: [where, orClause],
  } as T;
}

/**
 * Removes restricted fields from where clause for RBAC purposes.
 * Useful when certain roles shouldn't be able to filter on sensitive fields.
 *
 * @param where - Where clause from frontend
 * @param restrictedFields - Array of field names to remove
 * @returns Sanitized where clause without restricted fields
 *
 * @example
 * // CANDIDATE shouldn't filter by workflowStatus or finalDecision
 * const where = { workflowStatus: "NEW", jobId: "123" };
 *
 * removeRestrictedFields(where, ["workflowStatus", "finalDecision"]);
 * // Result: { jobId: "123" }
 */
export function removeRestrictedFields<T = any>(
  where: T | undefined,
  restrictedFields: string[],
): T | undefined {
  if (!where) return where;

  const result = { ...where } as any;
  restrictedFields.forEach((field) => delete result[field]);

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Sets default values for common query parameters (skip, take, orderBy).
 * Applies defaults only if values are not already set.
 *
 * @param query - Prisma query args
 * @param defaults - Default values to apply
 * @returns Query with defaults applied
 *
 * @example
 * setQueryDefaults(query, {
 *   skip: 0,
 *   take: 10,
 *   orderBy: { createdAt: "desc" }
 * });
 */
export function setQueryDefaults<
  T extends { skip?: number; take?: number; orderBy?: any },
>(
  query: T,
  defaults: {
    skip?: number;
    take?: number;
    orderBy?: any;
  } = {},
): T {
  return {
    ...query,
    skip: query.skip ?? defaults.skip ?? 0,
    take: query.take ?? defaults.take ?? 10,
    orderBy:
      query.orderBy ?? defaults.orderBy ?? ({ createdAt: "desc" } as const),
  };
}

/**
 * Merges multiple where clauses using AND logic.
 * Useful for combining base filters with dynamic filters.
 *
 * @param whereClauses - Array of where clauses to merge
 * @returns Combined where clause
 *
 * @example
 * mergeWhereAND([
 *   { status: "PUBLISHED" },
 *   { title: { contains: "developer" } }
 * ]);
 * // Result: { AND: [{ status: ... }, { title: ... }] }
 */
export function mergeWhereAND<T = any>(whereClauses: T[]): T | undefined {
  const nonEmpty = whereClauses.filter(
    (clause) => clause && Object.keys(clause).length > 0,
  );

  if (nonEmpty.length === 0) return undefined;
  if (nonEmpty.length === 1) return nonEmpty[0];

  return { AND: nonEmpty } as T;
}

/**
 * Merges multiple where clauses using OR logic.
 * Useful for building flexible search conditions.
 *
 * @param whereClauses - Array of where clauses to merge
 * @returns Combined where clause
 *
 * @example
 * mergeWhereOR([
 *   { title: { contains: "react" } },
 *   { description: { contains: "react" } }
 * ]);
 * // Result: { OR: [{ title: ... }, { description: ... }] }
 */
export function mergeWhereOR<T = any>(whereClauses: T[]): T | undefined {
  const nonEmpty = whereClauses.filter(
    (clause) => clause && Object.keys(clause).length > 0,
  );

  if (nonEmpty.length === 0) return undefined;
  if (nonEmpty.length === 1) return nonEmpty[0];

  return { OR: nonEmpty } as T;
}

/**
 * Cleans empty nested objects from a where clause.
 * Removes properties that are undefined or empty objects.
 *
 * Adapted from frontend cleanEmptyNestedObjects but simplified.
 *
 * @param where - Where clause to clean
 * @returns Cleaned where clause
 */
export function cleanEmptyNestedObjects<T = any>(
  where: T | undefined,
): T | undefined {
  if (!where || typeof where !== "object") {
    return where;
  }

  const cleaned: any = { ...where };

  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];

    // Remove undefined
    if (value === undefined) {
      delete cleaned[key];
      return;
    }

    // If it's an object (not array), check if empty
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const cleanedValue = { ...value };

      // Remove undefined nested properties
      Object.keys(cleanedValue).forEach((nestedKey) => {
        if (cleanedValue[nestedKey] === undefined) {
          delete cleanedValue[nestedKey];
        }
      });

      // If object is now empty, remove it
      if (Object.keys(cleanedValue).length === 0) {
        delete cleaned[key];
      } else {
        cleaned[key] = cleanedValue;
      }
    }
  });

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
