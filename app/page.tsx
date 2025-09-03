'use client';

import { useState } from 'react';
import { Table, Pagination } from '../components/ui';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { NOBBLink } from '../components/ui/NOBBLink';
import { SubHeader, Header } from '../components/layout';
import { QuickFilters } from '../components/search';
import { useProductSearch } from '../hooks';
import { useAuth } from '../hooks/useAuth';
import { FilterState } from '../components/search/QuickFilters/types';
import { ApiDebugPanel } from '../components/debug/ApiDebugPanel';
import { AuthDebugPanel } from '../components/debug/AuthDebugPanel';
// Import centralized types
import type { Product, LagerStatus } from '@/types/product';

// Main product catalog data - Updated for 10-column table layout (Phase 1)
const catalogProducts: Product[] = [
  {
    id: '1',
    navn: 'SKRUE TRESKRUE 50MM GALVANISERT',
    vvsnr: '12345678',
    lagerstatus: 'På lager',
    anbrekk: 'Ja',
    produsent: 'BILTEMA',
    kategori: 'Skruer og bolter',
    pris: { salgspris: 35.9, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '123456',
    nobbNumber: '60154545',
    pakningAntall: 5,
    lagerantall: 333,
    prisenhet: 'STK',
    grunnpris: 450.00,
    nettopris: 562.50
  },
  {
    id: '2',
    navn: 'BESLAG VINKELBESLAG 90° STÅL',
    vvsnr: '87654321',
    lagerstatus: 'På lager',
    anbrekk: 'Nei',
    produsent: 'WÜRTH',
    kategori: 'Beslag',
    pris: { salgspris: 89.5, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '234567',
    nobbNumber: '29252657',
    pakningAntall: 1,
    lagerantall: 127,
    prisenhet: 'STK',
    grunnpris: 89.50,
    nettopris: 111.88
  },
  {
    id: '3',
    navn: 'ISOLASJON STEINULL 50MM',
    vvsnr: '13579246',
    lagerstatus: 'Få igjen',
    anbrekk: 'Nei',
    produsent: 'ROCKWOOL',
    kategori: 'Isolasjon',
    pris: { salgspris: 125.5, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '345678',
    nobbNumber: '25704917',
    pakningAntall: 10,
    lagerantall: 23,
    prisenhet: 'M2',
    grunnpris: 125.50,
    nettopris: 156.88
  },
  {
    id: '4',
    navn: 'VERNEBRILLER KLAR POLYKARBONAT',
    vvsnr: '63749281',
    lagerstatus: 'På lager',
    anbrekk: 'Ja',
    produsent: '3M',
    kategori: 'Sikkerhet',
    pris: { salgspris: 245, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '456789',
    nobbNumber: '25704933',
    pakningAntall: 1,
    lagerantall: 89,
    prisenhet: 'STK',
    grunnpris: 245.00,
    nettopris: 306.25
  },
  {
    id: '5',
    navn: 'RØRKRYSS 15MM MESSING',
    vvsnr: '24681357',
    lagerstatus: 'På lager',
    anbrekk: 'Ja',
    produsent: 'UPONOR',
    kategori: 'Rør og koblingsutstyr',
    pris: { salgspris: 89.9, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '567890',
    nobbNumber: '60008533',
    pakningAntall: 1,
    lagerantall: 456,
    prisenhet: 'STK',
    grunnpris: 89.90,
    nettopris: 112.38
  },
  {
    id: '6',
    navn: 'GIPSPLATE 12,5MM 120X240CM',
    vvsnr: '98765432',
    lagerstatus: 'På lager',
    anbrekk: 'Nei',
    produsent: 'GYPROC',
    kategori: 'Byggematerialer',
    pris: { salgspris: 450, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '678901',
    nobbNumber: '60154715',
    pakningAntall: 1,
    lagerantall: 234,
    prisenhet: 'STK',
    grunnpris: 450.00,
    nettopris: 562.50
  },
  {
    id: '7',
    navn: 'DRILL SPIRALBOR 8MM HSS',
    vvsnr: '22222222',
    lagerstatus: 'På lager',
    anbrekk: 'Ja',
    produsent: 'DEWALT',
    kategori: 'Verktøy',
    pris: { salgspris: 78.9, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '789012',
    nobbNumber: '55841762',
    pakningAntall: 1,
    lagerantall: 78,
    prisenhet: 'STK',
    grunnpris: 78.90,
    nettopris: 98.63
  },
  {
    id: '8',
    navn: 'LIM MONTERINGSLIM 300ML',
    vvsnr: '11111111',
    lagerstatus: 'Utsolgt',
    anbrekk: 'Ja',
    produsent: 'BOSTIK',
    kategori: 'Lim og fugemasse',
    pris: { salgspris: 145, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '890123',
    nobbNumber: '27356237',
    pakningAntall: 12,
    lagerantall: 0,
    prisenhet: 'STK',
    grunnpris: 145.00,
    nettopris: 181.25
  },
  {
    id: '9',
    navn: 'PARKETT EIK NATUR 14X140MM',
    vvsnr: '14725836',
    lagerstatus: 'Utsolgt',
    anbrekk: 'Nei',
    produsent: 'TARKETT',
    kategori: 'Gulv',
    pris: { salgspris: 699, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '901234',
    nobbNumber: '60644213',
    pakningAntall: 1,
    lagerantall: 0,
    prisenhet: 'M2',
    grunnpris: 699.00,
    nettopris: 873.75
  },
  {
    id: '10',
    navn: 'SKRUE GIPSSKRUE 25MM',
    vvsnr: '33333333',
    lagerstatus: 'På lager',
    anbrekk: 'Nei',
    produsent: 'ESSVE',
    kategori: 'Skruer og bolter',
    pris: { salgspris: 25.5, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '012345',
    nobbNumber: '60153959',
    pakningAntall: 100,
    lagerantall: 1250,
    prisenhet: 'POS',
    grunnpris: 25.50,
    nettopris: 31.88
  },
  {
    id: '11',
    navn: 'MALING VEGMALING HVIT 1L',
    vvsnr: '44444444',
    lagerstatus: 'Få igjen',
    anbrekk: 'Ja',
    produsent: 'FLÜGGER',
    kategori: 'Maling og lakk',
    pris: { salgspris: 189, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '112233',
    nobbNumber: '60154545',
    pakningAntall: 1,
    lagerantall: 12,
    prisenhet: 'STK',
    grunnpris: 189.00,
    nettopris: 236.25
  },
  {
    id: '12',
    navn: 'ISOLASJON STEINULL 100MM',
    vvsnr: '55555555',
    lagerstatus: 'På lager',
    anbrekk: 'Nei',
    produsent: 'GLAVA',
    kategori: 'Isolasjon',
    pris: { salgspris: 234.5, valuta: 'NOK', inkludertMva: true },
    // New fields for 10-column layout
    lh: '223344',
    nobbNumber: '29252657',
    pakningAntall: 5,
    lagerantall: 67,
    prisenhet: 'M2',
    grunnpris: 234.50,
    nettopris: 293.13
  }
];

export default function Dashboard() {
  const { authState } = useAuth();
  const { searchState, searchProducts } = useProductSearch(authState.accessToken || undefined);
  const [filters, setFilters] = useState<FilterState>({
    supplier: 'Alle leverandører',
    category: 'Alle kategorier',
    stock: 'Alle'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  // Define table columns for complete 10-column layout (Phase 2)
  // Real authentication-based data masking using OAuth scopes
  const tableColumns = [
    { 
      key: 'lagerstatus', 
      label: '', 
      align: 'center' as const,
      render: (value: unknown) => {
        const status = value as string;
        return (
          <StatusIndicator 
            status={status as LagerStatus} 
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
      render: (value: unknown) => (
        <span className="font-mono text-sm text-neutral-700">{value as string}</span>
      )
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
      render: (value: unknown) => 
        authState.permissions.canViewInventory && value !== undefined
          ? <span className="text-neutral-700">{value as number}</span>
          : <span className="text-neutral-400">****</span>
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
      render: (value: unknown) => 
        authState.permissions.canViewPrices && value !== undefined
          ? <span className="text-neutral-700">kr {(value as number).toFixed(2)}</span>
          : <span className="text-neutral-400">****</span>
    },
    { 
      key: 'nettopris', 
      label: 'Nettopris', 
      align: 'right' as const,
      render: (value: unknown) => 
        authState.permissions.canViewPrices && value !== undefined
          ? <span className="text-neutral-700">kr {(value as number).toFixed(2)}</span>
          : <span className="text-neutral-400">****</span>
    }
  ];

  // Apply filters to data
  const applyFilters = (data: Product[]) => {
    let filteredData = [...data];
    
    // Filter by supplier
    if (filters.supplier !== 'Alle leverandører') {
      filteredData = filteredData.filter(product => 
        product.produsent?.toLowerCase() === filters.supplier.toLowerCase()
      );
    }
    
    // Filter by category
    if (filters.category !== 'Alle kategorier') {
      filteredData = filteredData.filter(product => 
        product.kategori?.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // Filter by stock status
    if (filters.stock !== 'Alle') {
      filteredData = filteredData.filter(product => 
        product.lagerstatus === filters.stock
      );
    }
    
    // Always sort by name alphabetically
    filteredData.sort((a, b) => a.navn.localeCompare(b.navn, 'no'));
    
    return filteredData;
  };
  
  // Determine which data to display and apply filters
  const baseData = searchState.hasSearched 
    ? searchState.results  // Use API results (empty if API failed)
    : catalogProducts;     // Only use local data if no search attempted
    
  const filteredData = applyFilters(baseData);

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



  const displayTitle = searchState.hasSearched && searchState.query
    ? `Søkeresultater for "${searchState.query}" (${searchState.results.length} funnet)`
    : `Produktkatalog (${catalogProducts.length} produkter)`;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sub Header: Organization branding (36px) */}
      <SubHeader />
      
      {/* Main Header: Logo and search (56px) */}
      <Header onSearch={searchProducts} />
      
      {/* Quick Filters section (36px) */}
      <QuickFilters 
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          resetPagination();
        }}
      />
      
      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Product Catalog Table */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-800">
              {displayTitle}
            </h2>
          </div>
          
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
            ) : (
              <div className="text-center py-12">
                <p className="text-neutral-600">
                  Ingen produkter funnet for &quot;{searchState.query}&quot;
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Prøv andre søkeord eller sjekk stavingen
                </p>
              </div>
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
            />
          )}
        </div>
      </div>
      
      {/* Debug Panels - Only when devtools enabled */}
      {process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true' && (
        <>
          <ApiDebugPanel />
          <AuthDebugPanel />
        </>
      )}
    </div>
  );
}