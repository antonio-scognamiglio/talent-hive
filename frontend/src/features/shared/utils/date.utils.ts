/**
 * Date utility functions using date-fns
 */

import { formatDistanceToNow, format } from "date-fns";

/**
 * Normalizes a date input to a Date object
 * Handles string, Date, and null/undefined inputs
 *
 * @param date - Input date (string, Date, or null/undefined)
 * @param fallback - Fallback date if input is null/undefined
 * @returns Date object or fallback value
 */
export function normalizeDate<T = null>(
  date: string | Date | null | undefined,
  fallback: T = null as T,
): Date | T {
  if (date === null || date === undefined) {
    return fallback;
  }
  return typeof date === "string" ? new Date(date) : date;
}

/**
 * Checks if a date is in the past
 * @param date - Date to check
 * @returns true if date is before now
 */
export function isPastDate(date: string | Date | null | undefined): boolean {
  const normalized = normalizeDate(date);
  if (!normalized) return false;
  return normalized < new Date();
}

/**
 * Formats a date as a relative time string using date-fns
 * @param date - Date to format
 * @returns Relative time string (e.g., "2 days ago")
 */
export function getRelativeTimeString(date: string | Date): string {
  const normalized = normalizeDate(date);
  if (!normalized) return "";

  return formatDistanceToNow(normalized, { addSuffix: true });
}

/**
 * Formats a date using date-fns format
 * @param date - Date to format
 * @param formatStr - Format string (default: "PPP" = localized date)
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = "PPP",
): string {
  const normalized = normalizeDate(date);
  if (!normalized) return "";

  return format(normalized, formatStr);
}
