/**
 * Date utility functions using date-fns
 */

import { formatDistanceToNow, format } from "date-fns";
import { it } from "date-fns/locale";

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

  return formatDistanceToNow(normalized, { addSuffix: true, locale: it });
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

  return format(normalized, formatStr, { locale: it });
}

/**
 * Formats a date for HTML input type="date" (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format or empty string
 */
export function formatDateForInput(
  date: string | Date | null | undefined,
): string {
  const normalized = normalizeDate(date);
  if (!normalized) return "";
  return format(normalized, "yyyy-MM-dd");
}

/**
 * Parses a date string from HTML input type="date" to a local Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or undefined if invalid
 */
export function parseDateInputToLocal(dateString: string): Date | undefined {
  if (!dateString) return undefined;
  // Create date parts to avoid timezone issues with default parsing
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}
