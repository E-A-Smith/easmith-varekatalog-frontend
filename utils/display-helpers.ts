/**
 * Display Helper Utilities for Product Data
 * 
 * Provides utility functions for displaying product data with graceful fallbacks
 * for missing or empty values.
 */

/**
 * Display LH code with graceful fallback for empty values
 * 
 * @param lh - LH code that can be null, empty string, or actual value
 * @returns Formatted display string - "N/A" for empty/invalid values, otherwise the trimmed LH code
 * 
 * @example
 * ```typescript
 * displayLH("208") // Returns: "208"
 * displayLH("") // Returns: "N/A"
 * displayLH(null) // Returns: "N/A"
 * displayLH("0") // Returns: "N/A"
 * displayLH("  ") // Returns: "N/A"
 * ```
 */
export function displayLH(lh: string | null): string {
  // Handle null/undefined
  if (!lh) {
    return "N/A";
  }
  
  // Handle empty string or whitespace only
  const trimmed = lh.trim();
  if (trimmed === "" || trimmed === "0") {
    return "N/A";
  }
  
  return trimmed;
}

/**
 * Check if an LH value should be considered empty/missing
 * 
 * @param lh - LH code to check
 * @returns true if the LH value is considered empty/missing
 */
export function isEmptyLH(lh: string | null): boolean {
  return displayLH(lh) === "N/A";
}

/**
 * Format product display name with fallback handling
 * 
 * @param navn - Product name
 * @returns Formatted display name or fallback text
 */
export function displayProductName(navn: string): string {
  if (!navn || navn.trim() === "") {
    return "Unknown Product";
  }
  return navn.trim();
}

/**
 * Format numeric values with fallback for null/undefined
 * 
 * @param value - Numeric value that might be null
 * @param fallback - Fallback text to display (defaults to "-")
 * @returns Formatted string
 */
export function displayNumeric(value: number | null | undefined, fallback: string = "-"): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  return value.toString();
}