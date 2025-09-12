/**
 * Supplier Mapping Utility for Løvenskiold Supplier Code to Name Conversion
 * 
 * Provides utilities for converting 5-digit supplier codes to human-readable
 * company names using the mapping data from Løvenskiold's catalog system.
 */

import supplierMappingData from '@/docs/project/lovenskiold-supplier-mapping.json';

// Type definitions for the supplier mapping data
export interface SupplierMapping {
  [supplierCode: string]: {
    name: string;
    web_catalog_id: string;
  };
}

export interface SupplierMappingFile {
  metadata: {
    source: string;
    extraction_date: string;
    mapping_updated: string;
    total_suppliers: number;
    match_rate: string;
    web_catalog_source: string;
    description: string;
  };
  suppliers: SupplierMapping;
}

// Cache the mapping data for performance
const supplierMapping: SupplierMappingFile = supplierMappingData as SupplierMappingFile;
const supplierMap = supplierMapping.suppliers;

// Create reverse lookup map for name-to-code conversion
const nameToCodeMap = new Map<string, string>();
Object.entries(supplierMap).forEach(([code, supplier]) => {
  nameToCodeMap.set(supplier.name.toLowerCase(), code);
});

/**
 * Get supplier name from 5-digit supplier code
 * 
 * @param supplierCode - 5-digit supplier code (e.g., "10000")
 * @returns Company name or fallback string if not found
 * 
 * @example
 * ```typescript
 * const name = getSupplierName("10000");
 * // Returns: "Teknikk AS"
 * 
 * const unknown = getSupplierName("99999");
 * // Returns: "Unknown Supplier (99999)"
 * ```
 */
export function getSupplierName(supplierCode: string): string {
  if (!supplierCode || typeof supplierCode !== 'string') {
    return 'Unknown Supplier';
  }

  const trimmedCode = supplierCode.trim();
  const supplier = supplierMap[trimmedCode];
  
  if (supplier && supplier.name) {
    return supplier.name;
  }
  
  // Fallback for unmapped suppliers
  return `Unknown Supplier (${trimmedCode})`;
}

/**
 * Get supplier code from company name (case-insensitive)
 * 
 * @param supplierName - Company name to look up
 * @returns 5-digit supplier code or null if not found
 * 
 * @example
 * ```typescript
 * const code = getSupplierCode("Teknikk AS");
 * // Returns: "10000"
 * 
 * const notFound = getSupplierCode("NonExistent Company");
 * // Returns: null
 * ```
 */
export function getSupplierCode(supplierName: string): string | null {
  if (!supplierName || typeof supplierName !== 'string') {
    return null;
  }

  const normalizedName = supplierName.trim().toLowerCase();
  return nameToCodeMap.get(normalizedName) || null;
}

/**
 * Check if a supplier code exists in the mapping
 * 
 * @param supplierCode - 5-digit supplier code to check
 * @returns True if the code exists in the mapping
 * 
 * @example
 * ```typescript
 * const exists = hasSupplierMapping("10000");
 * // Returns: true
 * 
 * const missing = hasSupplierMapping("99999");
 * // Returns: false
 * ```
 */
export function hasSupplierMapping(supplierCode: string): boolean {
  if (!supplierCode || typeof supplierCode !== 'string') {
    return false;
  }
  
  return supplierCode.trim() in supplierMap;
}

/**
 * Get all supplier names sorted alphabetically (Norwegian locale)
 * 
 * @returns Array of all supplier names sorted by Norwegian locale
 * 
 * @example
 * ```typescript
 * const names = getAllSupplierNames();
 * // Returns: ["ADAX AS", "Alloc AS", "Alvdal Skurlag AS", ...]
 * ```
 */
export function getAllSupplierNames(): string[] {
  const names = Object.values(supplierMap).map(supplier => supplier.name);
  return names.sort((a, b) => a.localeCompare(b, 'no', { 
    numeric: true, 
    sensitivity: 'base' 
  }));
}

/**
 * Get all supplier codes sorted numerically
 * 
 * @returns Array of all supplier codes sorted numerically
 * 
 * @example
 * ```typescript
 * const codes = getAllSupplierCodes();
 * // Returns: ["10000", "10005", "10007", ...]
 * ```
 */
export function getAllSupplierCodes(): string[] {
  return Object.keys(supplierMap).sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Get mapping metadata information
 * 
 * @returns Metadata about the supplier mapping
 * 
 * @example
 * ```typescript
 * const info = getMappingInfo();
 * // Returns: { total_suppliers: 133, match_rate: "100%", ... }
 * ```
 */
export function getMappingInfo() {
  return supplierMapping.metadata;
}

/**
 * Transform supplier identifier (code or name) to display name
 * Handles both codes and names as input, always returns display name
 * 
 * @param supplierIdentifier - Either supplier code or name
 * @returns Display name for the supplier
 * 
 * @example
 * ```typescript
 * const displayName1 = getDisplayName("10000");
 * // Returns: "Teknikk AS"
 * 
 * const displayName2 = getDisplayName("Teknikk AS");
 * // Returns: "Teknikk AS"
 * ```
 */
export function getDisplayName(supplierIdentifier: string): string {
  if (!supplierIdentifier || typeof supplierIdentifier !== 'string') {
    return 'Unknown Supplier';
  }

  const trimmed = supplierIdentifier.trim();
  
  // Check if it's a numeric code (5 digits)
  if (/^\d{5}$/.test(trimmed)) {
    return getSupplierName(trimmed);
  }
  
  // Already a name, return as-is if it exists in our mapping
  if (nameToCodeMap.has(trimmed.toLowerCase())) {
    return trimmed;
  }
  
  // Try to find the name by checking if it's a partial match
  const matchedName = Object.values(supplierMap)
    .find(supplier => supplier.name.toLowerCase() === trimmed.toLowerCase());
  
  return matchedName?.name || trimmed;
}

/**
 * Validate supplier data structure
 * Utility for testing and debugging
 */
export function validateMappingData(): {
  isValid: boolean;
  errors: string[];
  stats: {
    totalSuppliers: number;
    codesWithNames: number;
    codesWithWebIds: number;
  };
} {
  const errors: string[] = [];
  let codesWithNames = 0;
  let codesWithWebIds = 0;

  // Check metadata
  if (!supplierMapping.metadata) {
    errors.push('Missing metadata section');
  }

  // Check suppliers
  if (!supplierMapping.suppliers || typeof supplierMapping.suppliers !== 'object') {
    errors.push('Missing or invalid suppliers section');
    return {
      isValid: false,
      errors,
      stats: { totalSuppliers: 0, codesWithNames: 0, codesWithWebIds: 0 }
    };
  }

  // Validate each supplier entry
  Object.entries(supplierMap).forEach(([code, supplier]) => {
    // Check code format
    if (!/^\d{5}$/.test(code)) {
      errors.push(`Invalid supplier code format: ${code}`);
    }

    // Check supplier data
    if (!supplier || typeof supplier !== 'object') {
      errors.push(`Invalid supplier data for code: ${code}`);
      return;
    }

    if (supplier.name && typeof supplier.name === 'string' && supplier.name.trim()) {
      codesWithNames++;
    } else {
      errors.push(`Missing or invalid name for supplier code: ${code}`);
    }

    if (supplier.web_catalog_id && typeof supplier.web_catalog_id === 'string') {
      codesWithWebIds++;
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    stats: {
      totalSuppliers: Object.keys(supplierMap).length,
      codesWithNames,
      codesWithWebIds
    }
  };
}