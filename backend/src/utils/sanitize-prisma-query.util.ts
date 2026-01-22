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
 * Recursively sanitize integers to fit within PostgreSQL Int4 range.
 * Caps values at +/- 2,147,483,647.
 *
 * This prevents "integer out of range" errors from database.
 */
function sanitizeIntegers(value: any): any {
  const MAX_INT32 = 2147483647;
  const MIN_INT32 = -2147483648;

  if (typeof value === "number") {
    // If integer (check if safe integer or just check bounds?)
    // Prisma inputs are usually integers for Int fields.
    // Floats are supported by Prisma Float type, but capping them is also usually fine for filters.
    if (value > MAX_INT32) return MAX_INT32;
    if (value < MIN_INT32) return MIN_INT32;
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeIntegers);
  }

  if (value && typeof value === "object") {
    // Skip if it is a Date object or Buffer etc (simple check)
    if (value instanceof Date) return value;

    const clean: any = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        clean[key] = sanitizeIntegers(value[key]);
      }
    }
    return clean;
  }

  return value;
}

/**
 * Sanitize entire Prisma query args
 * Applies include depth limiting + pagination cap + integer overflow protection
 */
export function sanitizePrismaQuery(
  query: any,
  options: {
    maxIncludeDepth?: number;
    maxTake?: number;
  } = {},
): any {
  const { maxIncludeDepth = 1, maxTake = 100 } = options;

  let sanitized = { ...query };

  // 1. Sanitize include depth
  if (sanitized.include) {
    sanitized.include = sanitizeInclude(sanitized.include, maxIncludeDepth);
  }

  // 2. Cap pagination
  if (sanitized.take) {
    sanitized.take = Math.min(sanitized.take, maxTake);
  }

  // 3. Prevent Integer Overflow globally
  // We sanitize the whole object to catch deep filters in 'where'
  sanitized = sanitizeIntegers(sanitized);

  return sanitized;
}
