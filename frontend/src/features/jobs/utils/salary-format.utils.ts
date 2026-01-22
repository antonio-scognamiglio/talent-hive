/**
 * Salary formatting utilities
 * Formats numeric salary ranges into display-friendly strings
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

/**
 * Format a number to k-notation (e.g., 50000 → "50k")
 */
function formatNumber(value: number): string {
  if (value >= 1000) {
    return `${value / 1000}k`;
  }
  return value.toString();
}

/**
 * Format salary range for display
 * @param min - Minimum salary (nullable)
 * @param max - Maximum salary (nullable)
 * @param currency - ISO currency code (nullable)
 * @returns Formatted salary string or null if no data
 *
 * @example
 * formatSalaryRange(50000, 70000, "EUR") // "€50k-€70k"
 * formatSalaryRange(80000, 110000, "USD") // "$80k-$110k"
 * formatSalaryRange(50000, null, "EUR")   // "From €50k"
 * formatSalaryRange(null, 70000, "EUR")   // "Up to €70k"
 * formatSalaryRange(null, null, "EUR")    // null
 */
export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  currency?: string | null,
): string | null {
  // No salary data
  if (!min && !max) return null;

  // Determine currency symbol (default to EUR if unknown)
  const symbol = CURRENCY_SYMBOLS[currency || "EUR"] || "€";

  // Both min and max
  if (min && max) {
    return `${symbol}${formatNumber(min)}-${formatNumber(max)}`;
  }

  // Only min
  if (min) {
    return `From ${symbol}${formatNumber(min)}`;
  }

  // Only max
  if (max) {
    return `Up to ${symbol}${formatNumber(max)}`;
  }

  return null;
}
