/**
 * Sanitize Prisma include object to prevent N+1 query explosions
 *
 * Recursively limits the depth of nested includes to a configurable maximum.
 * Default max depth: 1 (allows one level of relations)
 *
 * @example
 * const query = {
 *   include: {
 *     createdBy: true,
 *     applications: {
 *       include: {
 *         user: {
 *           include: { profile: true } // TOO DEEP!
 *         }
 *       }
 *     }
 *   }
 * };
 *
 * sanitizeInclude(query.include, 1);
 * // Result: {
 * //   createdBy: true,
 * //   applications: true  // Nested include removed
 * // }
 */
export function sanitizeInclude(
  include: any,
  maxDepth: number = 1,
  currentDepth: number = 0,
): any {
  // Base case: if include is boolean or null/undefined, return as-is
  if (typeof include === "boolean" || !include) {
    return include;
  }

  // If we've reached max depth, convert to boolean (include relation but not nested)
  if (currentDepth >= maxDepth) {
    return true;
  }

  // If include is an object, recurse into its properties
  if (typeof include === "object") {
    const sanitized: any = {};

    for (const key in include) {
      const value = include[key];

      if (value === true) {
        // Simple boolean include - keep as-is
        sanitized[key] = true;
      } else if (value && typeof value === "object") {
        // Nested include object
        if (value.include) {
          // Has nested include - recurse with increased depth
          sanitized[key] = {
            ...value,
            include: sanitizeInclude(value.include, maxDepth, currentDepth + 1),
          };
        } else {
          // No nested include (might have select, where, etc.) - keep as-is
          sanitized[key] = value;
        }
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  return include;
}

/**
 * Sanitize entire Prisma query args
 * Applies include depth limiting + pagination cap
 */
export function sanitizePrismaQuery(
  query: any,
  options: {
    maxIncludeDepth?: number;
    maxTake?: number;
  } = {},
): any {
  const { maxIncludeDepth = 1, maxTake = 100 } = options;

  const sanitized = { ...query };

  // Sanitize include depth
  if (sanitized.include) {
    sanitized.include = sanitizeInclude(sanitized.include, maxIncludeDepth);
  }

  // Cap pagination
  if (sanitized.take) {
    sanitized.take = Math.min(sanitized.take, maxTake);
  }

  return sanitized;
}
