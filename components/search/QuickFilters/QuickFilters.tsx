/**
 * Quick Filters Component for Varekatalog
 * Phase 1.3: 36px Quick Filters section implementation
 * 
 * Provides dropdown filters for Suppliers, Categories, Stock status, and Sort options
 * Follows the design specification with lightning bolt icon and item count display
 */

'use client';

import { FC, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { QuickFiltersProps, FilterState } from './types';
import { validateFilterValue } from '@/utils/filter-helpers';

export const QuickFilters: FC<QuickFiltersProps> = ({
  onFiltersChange,
  className,
  supplierOptions,
  categoryOptions,
  filters: controlledFilters,
  onFiltersReset
}) => {
  // Use controlled filters if provided, otherwise use internal state
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    supplier: 'Alle leverandører',
    category: 'Alle kategorier',
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

  // Use dynamic options or fallback to default options
  const currentSupplierOptions = supplierOptions || ['Alle leverandører'];
  const currentCategoryOptions = categoryOptions || ['Alle kategorier'];
  
  // Validate current filter values against available options
  useEffect(() => {
    const validatedSupplier = validateFilterValue(filters.supplier, currentSupplierOptions);
    const validatedCategory = validateFilterValue(filters.category, currentCategoryOptions);
    
    if (validatedSupplier !== filters.supplier || validatedCategory !== filters.category) {
      const resetFilters = {
        ...filters,
        supplier: validatedSupplier,
        category: validatedCategory
      };
      
      if (controlledFilters && onFiltersReset) {
        onFiltersReset(resetFilters);
      } else {
        setInternalFilters(resetFilters);
        onFiltersChange?.(resetFilters);
      }
    }
  }, [currentSupplierOptions, currentCategoryOptions, filters.supplier, filters.category, controlledFilters, onFiltersReset, onFiltersChange]);



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
            value={filters.supplier}
            onChange={(e) => handleFilterChange('supplier', e.target.value)}
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
            {currentSupplierOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            id="category-filter"
            name="category"
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


      </div>

    </div>
  );
};