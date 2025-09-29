/**
 * Quick Filters Component for Varekatalog
 * Phase 1.3: 36px Quick Filters section implementation
 * 
 * Provides dropdown filters for Suppliers, Categories, Stock status, and Sort options
 * Follows the design specification with lightning bolt icon and item count display
 */

'use client';

import { FC, useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { QuickFiltersProps, FilterState } from './types';

export const QuickFilters: FC<QuickFiltersProps> = ({
  onFiltersChange,
  className,
  supplierOptions,
  categoryOptions,
  filters: controlledFilters,
}) => {
  // Use controlled filters if provided, otherwise use internal state
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    supplier: '-',
    category: '-',
    stock: 'Alle'
  });
  
  const filters = controlledFilters || internalFilters;

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    if (controlledFilters) {
      // In controlled mode, just notify parent
      onFiltersChange?.(newFilters);
    } else {
      // In uncontrolled mode, update internal state
      setInternalFilters(newFilters);
      onFiltersChange?.(newFilters);
    }
  };

  // Use dynamic options or fallback to default options (memoized to prevent useEffect re-runs)
  const currentSupplierOptions = useMemo(() =>
    (supplierOptions && supplierOptions.length > 0) ? supplierOptions : ['-'],
    [supplierOptions]
  );
  const currentCategoryOptions = useMemo(() =>
    (categoryOptions && categoryOptions.length > 0) ? categoryOptions : ['-'],
    [categoryOptions]
  );
  
  // Removed automatic filter validation to prevent infinite loops
  // Filters will remain stable even when search results change available options



  return (
    <div className={`
      h-9 bg-white 
      border-b border-neutral-200
      flex items-center justify-between
      px-6
      ${className || ''}
    `}>
      {/* Left side: Filter dropdowns */}
      <div className="flex items-center gap-3">
        {/* Supplier Filter */}
        <div className="relative">
          <select
            id="supplier-filter"
            name="supplier"
            aria-label="Supplier filter"
            value={filters.supplier}
            onChange={(e) => handleFilterChange('supplier', e.target.value)}
            className="
              appearance-none bg-transparent
              text-xs font-medium text-neutral-700
              pr-6 pl-1 py-1
              border-none outline-none
              cursor-pointer
              hover:text-byggern-blue
              transition-colors duration-150
            "
          >
            {currentSupplierOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
        </div>

        {/* Category Filter - Hidden until implementation is complete */}
        {false && (
          <div className="relative">
            <select
              id="category-filter"
              name="category"
              aria-label="Category filter"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="
                appearance-none bg-transparent
                text-sm font-medium text-neutral-700
                pr-6 pl-1 py-1
                border-none outline-none
                cursor-pointer
                hover:text-byggern-blue
                transition-colors duration-150
              "
            >
              {currentCategoryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
          </div>
        )}


      </div>

    </div>
  );
};