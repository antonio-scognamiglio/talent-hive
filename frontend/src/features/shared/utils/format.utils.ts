/**
 * Utility functions for formatting values for display
 */

/**
 * Format a number as currency (EUR)
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'EUR')
 * @returns Formatted currency string
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: string = "EUR",
): string {
  if (amount === null || amount === undefined) return "-";

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
