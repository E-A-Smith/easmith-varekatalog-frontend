/**
 * Filter Helper Utilities for Dynamic Filter Values
 * 
 * Provides utility functions for extracting unique values from product arrays
 * and validating filter selections. Modified to return '-' for empty/error cases
 * instead of static fallbacks.
 */

import { Product } from '@/types/product';

/**
 * Extracts unique supplier names from a product array with Norwegian locale sorting
 * 
 * @param products - Array of Product objects to analyze
 * @returns Sorted array with "Alle leverandører" first, followed by unique suppliers
 *          Returns ['-'] for empty arrays or error cases
 * 
 * @example
 * ```typescript
 * const products = [
 *   { produsent: 'Würth', kategori: 'Beslag' },
 *   { produsent: 'Biltema', kategori: 'Sikkerhet' }
 * ];
 * const suppliers = getUniqueSuppliers(products);
 * // Returns: ['Alle leverandører', 'Biltema', 'Würth']
 * ```
 * 
 * @example
 * ```typescript
 * // Empty or error case
 * const suppliers = getUniqueSuppliers([]);
 * // Returns: ['Alle leverandører']
 * ```
 */
export function getUniqueSuppliers(products: Product[]): string[] {
  try {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return ['Alle leverandører'];
    }
    
    const uniqueSuppliers = new Set<string>();
    
    products.forEach(product => {
      if (product.produsent && typeof product.produsent === 'string' && product.produsent.trim()) {
        uniqueSuppliers.add(product.produsent.trim());
      }
    });
    
    // If no suppliers found, return only the default option
    if (uniqueSuppliers.size === 0) {
      return ['Alle leverandører'];
    }
    
    const sortedSuppliers = Array.from(uniqueSuppliers).sort((a, b) => 
      a.localeCompare(b, 'no', { numeric: true, sensitivity: 'base' })
    );
    
    return ['Alle leverandører', ...sortedSuppliers];
  } catch (error) {
    console.error('Error extracting unique suppliers:', error);
    return ['Alle leverandører'];
  }
}

/**
 * Extracts unique category names from a product array with Norwegian locale sorting
 * 
 * @param products - Array of Product objects to analyze
 * @returns Sorted array with "Alle kategorier" first, followed by unique categories
 *          Returns ['-'] for empty arrays or error cases
 * 
 * @example
 * ```typescript
 * const products = [
 *   { kategori: 'Sikkerhet', produsent: 'Biltema' },
 *   { kategori: 'Beslag', produsent: 'Würth' }
 * ];
 * const categories = getUniqueCategories(products);
 * // Returns: ['Alle kategorier', 'Beslag', 'Sikkerhet']
 * ```
 * 
 * @example
 * ```typescript
 * // Empty or error case
 * const categories = getUniqueCategories([]);
 * // Returns: ['Alle kategorier']
 * ```
 */
export function getUniqueCategories(products: Product[]): string[] {
  try {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return ['Alle kategorier'];
    }
    
    const uniqueCategories = new Set<string>();
    
    products.forEach(product => {
      if (product.kategori && typeof product.kategori === 'string' && product.kategori.trim()) {
        uniqueCategories.add(product.kategori.trim());
      }
    });
    
    // If no categories found, return only the default option
    if (uniqueCategories.size === 0) {
      return ['Alle kategorier'];
    }
    
    const sortedCategories = Array.from(uniqueCategories).sort((a, b) => 
      a.localeCompare(b, 'no', { numeric: true, sensitivity: 'base' })
    );
    
    return ['Alle kategorier', ...sortedCategories];
  } catch (error) {
    console.error('Error extracting unique categories:', error);
    return ['Alle kategorier'];
  }
}

/**
 * Validates if a filter value exists in the provided options
 * 
 * @param currentValue - Current filter selection
 * @param availableOptions - Array of available options
 * @returns Valid filter value or default option (first in array)
 * 
 * @example
 * ```typescript
 * const options = ['Alle leverandører', 'Biltema', 'Würth'];
 * const validated = validateFilterValue('Biltema', options);
 * // Returns: 'Biltema' (valid)
 * 
 * const invalidated = validateFilterValue('NonExistent', options);
 * // Returns: 'Alle leverandører' (default/first option)
 * 
 * const alleOnly = validateFilterValue('Something', ['Alle leverandører']);
 * // Returns: 'Alle leverandører' (only option available)
 * ```
 */
export function validateFilterValue(currentValue: string, availableOptions: string[]): string {
  if (!availableOptions || availableOptions.length === 0) {
    return 'Alle';
  }
  
  if (availableOptions.includes(currentValue)) {
    return currentValue;
  }
  
  // Return the first option (default "Alle leverandører" or "Alle kategorier")
  return availableOptions[0] ?? 'Alle';
}

/**
 * Type guard to check if a product array contains valid data for filter extraction
 * 
 * @param products - Array to validate
 * @returns True if the array contains valid Product objects
 * 
 * @example
 * ```typescript
 * if (isValidProductArray(products)) {
 *   const suppliers = getUniqueSuppliers(products);
 *   // Process valid product data
 * } else {
 *   // Handle invalid data case
 * }
 * ```
 */
export function isValidProductArray(products: unknown): products is Product[] {
  return Array.isArray(products) && 
         products.length > 0 && 
         products.every(item => 
           item && 
           typeof item === 'object' && 
           'id' in item && 
           'navn' in item
         );
}