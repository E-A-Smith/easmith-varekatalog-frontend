/**
 * QuickFilters Component Types
 * Phase 1.3: Type definitions for the 36px Quick Filters section
 */

export interface FilterState {
  /** Selected supplier filter */
  supplier: string;
  
  /** Selected category filter */
  category: string;
  
  /** Selected stock status filter */
  stock: string;
}

export interface QuickFiltersProps {
  /** Total number of items being filtered */
  totalItems?: number;
  
  /** Callback when filters change */
  onFiltersChange?: (filters: FilterState) => void;
  
  /** Additional CSS classes */
  className?: string | undefined;
  
  /** Initial filter state */
  initialFilters?: Partial<FilterState>;
}