'use client';

import { useState, useMemo, useEffect } from 'react';
import { Table, Pagination } from '../components/ui';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { NOBBLink } from '../components/ui/NOBBLink';
import { SubHeader, Header } from '../components/layout';
import { QuickFilters } from '../components/search';
import { useProductSearch } from '../hooks';
import { useAuth } from '../hooks/useAuth';
import { FilterState } from '../components/search/QuickFilters/types';
// Import centralized types
import type { Product, LagerStatus } from '@/types/product';
// Import filter helper utilities
import { getUniqueSuppliers, getUniqueCategories, validateFilterValue, matchesSupplierFilter } from '@/utils/filter-helpers';
import { formatNorwegianPrice } from '@/utils/formatters';
import { displayLH, isEmptyLH } from '@/utils/display-helpers';
import { CatalogStats } from '@/components/catalog/CatalogStats';

// No default products - start with empty search results
const catalogProducts: Product[] = [];

export default function Dashboard() {
  const { authState } = useAuth();
  const { isAuthenticated } = authState;
  const { searchState, searchProducts } = useProductSearch(authState.accessToken || undefined);
  const [filters, setFilters] = useState<FilterState>({
    supplier: 'Alle leverandører',
    category: 'Alle kategorier',
    stock: 'Alle'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Price visibility state (only relevant when authenticated)
  const [showPrices, setShowPrices] = useState(true);


  // Real authentication-based data masking using OAuth scopes
  const tableColumns = [
    { 
      key: 'lagerstatus', 
      label: '', 
      align: 'center' as const,
      render: (value: unknown) => {
        // Status column: show empty space when status is null or "NA"
        if (value === null || value === "NA") {
          return <span className="w-6 h-6 inline-block"></span>; // Empty space maintaining layout
        }
        return (
          <StatusIndicator 
            status={value as LagerStatus} 
            visualOnly={true}
            size="md"
            className="w-6 h-6"
          />
        );
      }
    },
    { key: 'navn', label: 'Product Name' },
    { key: 'produsent', label: 'Supplier' },
    { 
      key: 'lh', 
      label: 'LH', 
      align: 'center' as const,
      render: (value: unknown) => {
        const lhValue = value as string | null;
        const displayValue = displayLH(lhValue);
        const isEmpty = isEmptyLH(lhValue);
        
        return (
          <span className={`font-mono text-sm ${
            isEmpty 
              ? "text-neutral-400 italic" 
              : "text-neutral-700"
          }`}>
            {displayValue}
          </span>
        );
      }
    },
    { 
      key: 'nobbNumber', 
      label: 'NOBB', 
      align: 'center' as const,
      render: (value: unknown, row: unknown) => (
        <NOBBLink 
          vvsNumber={(row as Product).nobbNumber || ''} 
          displayText={(row as Product).nobbNumber || ''}
          size="sm" 
        />
      )
    },
    { key: 'anbrekk', label: 'Anbr', align: 'center' as const },
    { 
      key: 'pakningAntall', 
      label: '# i pakning', 
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="text-neutral-700">{value as number}</span>
      )
    },
    { 
      key: 'lagerantall', 
      label: 'Lagerantall', 
      align: 'right' as const,
      render: (value: unknown) => {
        // Unauthenticated users: always show masking
        if (!isAuthenticated) {
          return <span className="text-neutral-400">****</span>;
        }
        // Authenticated users: show value or dash for missing data
        return value !== null
          ? <span className="text-neutral-700">{value as number}</span>
          : <span className="text-neutral-400">-</span>;
      }
    },
    { 
      key: 'prisenhet', 
      label: 'Prisenhet', 
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="text-neutral-700">{value as string}</span>
      )
    },
    { 
      key: 'grunnpris', 
      label: 'Grunnpris', 
      align: 'right' as const,
      render: (value: unknown) => {
        // Unauthenticated users: always show masking
        if (!isAuthenticated) {
          return <span className="text-neutral-400">****</span>;
        }
        // Authenticated users with price toggle OFF: mask prices
        if (!showPrices) {
          return <span className="text-neutral-400">****</span>;
        }
        // Authenticated users with price toggle ON: show value or dash
        if (value === null) {
          return <span className="text-neutral-400">-</span>;
        }
        const formattedPrice = formatNorwegianPrice(value as number);
        return <span className="text-neutral-700">{formattedPrice}</span>;
      }
    },
    { 
      key: 'nettopris', 
      label: 'Nettopris', 
      align: 'right' as const,
      render: (value: unknown) => {
        // Unauthenticated users: always show masking
        if (!isAuthenticated) {
          return <span className="text-neutral-400">****</span>;
        }
        // Authenticated users with price toggle OFF: mask prices
        if (!showPrices) {
          return <span className="text-neutral-400">****</span>;
        }
        // Authenticated users with price toggle ON: show value or dash
        if (value === null) {
          return <span className="text-neutral-400">-</span>;
        }
        const formattedPrice = formatNorwegianPrice(value as number);
        return <span className="text-neutral-700">{formattedPrice}</span>;
      }
    }
  ];

  // Apply filters to data
  const applyFilters = (data: Product[], filterState: FilterState) => {
    // First, filter out any invalid/malformed products using type guard
    // Temporarily disabled to debug the issue
    let filteredData = [...data]; // data.filter(product => isProduct(product));
    
    // Filter by supplier using enhanced matching function
    filteredData = filteredData.filter(product => 
      matchesSupplierFilter(product, filterState.supplier)
    );
    
    // Filter by category
    if (filterState.category !== 'Alle kategorier') {
      filteredData = filteredData.filter(product => 
        product.kategori?.toLowerCase() === filterState.category.toLowerCase()
      );
    }
    
    // Filter by stock status
    if (filterState.stock !== 'Alle') {
      filteredData = filteredData.filter(product => 
        product.lagerstatus === filterState.stock
      );
    }
    
    // Always sort by name alphabetically - with safe null/undefined handling
    filteredData.sort((a, b) => {
      // Ensure both products exist and have names
      if (!a || !a.navn || !b || !b.navn) {
        return 0; // Keep original order if either product is invalid
      }
      return a.navn.localeCompare(b.navn, 'no');
    });
    
    return filteredData;
  };
  
  // Determine which data to display
  const baseData = searchState.hasSearched 
    ? searchState.results  // Use API results (empty if API failed)
    : catalogProducts;     // Only use local data if no search attempted
  
  // Calculate dynamic filter options based on current data
  const supplierOptions = useMemo(() => {
    return getUniqueSuppliers(baseData);
  }, [baseData]);

  const categoryOptions = useMemo(() => {
    return getUniqueCategories(baseData);
  }, [baseData]);

  // Validate current filter values against available options
  const validatedFilters = useMemo(() => {
    return {
      supplier: validateFilterValue(filters.supplier, supplierOptions),
      category: validateFilterValue(filters.category, categoryOptions),
      stock: filters.stock // Stock options remain static
    };
  }, [filters, supplierOptions, categoryOptions]);

  // Update filters if validation changed them
  useEffect(() => {
    if (validatedFilters.supplier !== filters.supplier || 
        validatedFilters.category !== filters.category) {
      setFilters(validatedFilters);
    }
  }, [validatedFilters, filters]);
    
  const filteredData = applyFilters(baseData, validatedFilters);

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Get paginated data
  const displayData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  const resetPagination = () => setCurrentPage(1);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sub Header: Organization branding (36px) */}
      <SubHeader />
      
      {/* Main Header: Logo and search (56px) */}
      <Header onSearch={searchProducts} />
      
      {/* Quick Filters section (36px) */}
      <QuickFilters 
        supplierOptions={supplierOptions}
        categoryOptions={categoryOptions}
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          resetPagination();
        }}
        onFiltersReset={(resetFilters) => {
          setFilters(resetFilters);
          resetPagination();
        }}
      />
      
      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Product Catalog Table */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-6">
            {searchState.isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-byggern-blue border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-neutral-600">Søker i produktkatalogen...</p>
              </div>
            ) : searchState.error ? (
              <div className="text-center py-12">
                <p className="text-semantic-error">{searchState.error}</p>
              </div>
            ) : displayData.length > 0 ? (
              <Table
                data={displayData}
                columns={tableColumns}
              />
            ) : searchState.hasSearched ? (
              <div className="text-center py-12">
                <p className="text-neutral-600">
                  Ingen produkter funnet for &quot;{searchState.query}&quot;
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Prøv andre søkeord eller sjekk stavingen
                </p>
              </div>
            ) : (
              <CatalogStats />
            )}
          </div>

          {/* Pagination - Only show when we have data */}
          {!searchState.isLoading && !searchState.error && filteredData.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              startItem={startItem}
              endItem={endItem}
              onPageChange={handlePageChange}
              itemLabel="produkter"
              previousLabel="Forrige"
              nextLabel="Neste"
              className="border-t"
              // New props for price masking
              isAuthenticated={isAuthenticated}
              showPriceToggle={true}
              isPriceVisible={showPrices}
              onPriceToggleChange={setShowPrices}
            />
          )}
        </div>
      </div>
      
    </div>
  );
}