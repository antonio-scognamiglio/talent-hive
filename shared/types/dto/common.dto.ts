/**
 * Generic DTO for listing/filtering entities
 * Provides flexibility for Prisma query options (where, orderBy, etc.)
 */
export interface BaseListDto {
  skip?: number;
  take?: number;
  [key: string]: any; // Flexible to support full Prisma query power
}
