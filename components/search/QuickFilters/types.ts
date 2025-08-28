/**
 * QuickFilters Component Types
 * Phase 1.3: Type definitions for the 36px Quick Filters section
 */

export interface FilterState {
  /** Selected supplier filter */
  supplier: string;
  
  /** Selected category filter */
  category: string;
}

export interface QuickFiltersProps {
  /** Callback when filters change */
  onFiltersChange?: (filters: FilterState) => void;
  
  /** Additional CSS classes */
  className?: string | undefined;
  
  /** Initial filter state */
  initialFilters?: Partial<FilterState>;
}