/**
 * Quick Filters Component for Varekatalog
 * Phase 1.3: 36px Quick Filters section implementation
 * 
 * Provides dropdown filters for Suppliers, Categories, Stock status, and Sort options
 * Follows the design specification with lightning bolt icon and item count display
 */

'use client';

import { FC, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { QuickFiltersProps, FilterState } from './types';

export const QuickFilters: FC<QuickFiltersProps> = ({
  onFiltersChange,
  className
}) => {
  const [filters, setFilters] = useState<FilterState>({
    supplier: 'Alle leverandører',
    category: 'Alle kategorier'
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  // Supplier options based on Norwegian building supplies market
  const supplierOptions = [
    'Alle leverandører',
    'Biltema',
    'Würth', 
    'Bostik',
    'DeWalt',
    'Essve',
    'Flügger',
    'Glava',
    'Gyproc',
    'Rockwool',
    'Uponor',
    'Tarkett',
    '3M',
    'Roto',
    'Mapei',
    'Monier',
    'Nexans'
  ];

  // Category options for Norwegian building supplies
  const categoryOptions = [
    'Alle kategorier',
    'Sikkerhet',
    'Beslag', 
    'Festing',
    'Skruer og bolter',
    'Byggematerialer',
    'Isolasjon',
    'Rør og koblingsutstyr',
    'Elektro',
    'Gulv',
    'Vindus- og dørbeslag',
    'Lim og fugemasse',
    'Takmateriell',
    'Ventilasjon',
    'Verktøy',
    'Maling og lakk'
  ];



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
            {supplierOptions.map(option => (
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
            {categoryOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
        </div>


      </div>

    </div>
  );
};