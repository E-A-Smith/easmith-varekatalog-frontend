/**
 * Formatting utilities for Varekatalog
 * Norwegian-specific formatting functions for prices, dates, etc.
 */

/**
 * Formats a price from øre to Norwegian kroner
 * @param oreValue - Price value in øre (Norwegian cents)
 * @returns Formatted price string like "kr 304,72"
 */
export function formatNorwegianPrice(oreValue: number | null): string {
  if (oreValue === null) {
    return "****"; // Keep existing null handling for unauthorized users
  }

  // Convert øre to kroner (divide by 100)
  const kroner = oreValue / 100;

  // Format with Norwegian locale (comma as decimal separator)
  const formatted = kroner.toLocaleString('no-NO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `kr ${formatted}`;
}

/**
 * Formats a regular number with Norwegian locale
 * @param value - Numeric value
 * @returns Formatted number string with Norwegian formatting
 */
export function formatNorwegianNumber(value: number | null): string {
  if (value === null) {
    return "****";
  }

  return value.toLocaleString('no-NO');
}