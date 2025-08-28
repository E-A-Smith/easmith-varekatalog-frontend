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
// Import centralized types
import type { Product, LagerStatus } from '@/types/product';

// Main product catalog data
const catalogProducts: Product[] = [
  { id: '1', navn: 'Gipsplate 12,5mm 120x240cm', vvsnr: '98765432', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Gyproc', pris: { salgspris: 450, valuta: 'NOK', inkludertMva: true }, kategori: 'Byggematerialer' },
  { id: '2', navn: 'Isolasjon steinull 50mm', vvsnr: '13579246', lagerstatus: 'Få igjen', anbrekk: 'Nei', produsent: 'Rockwool', pris: { salgspris: 125.5, valuta: 'NOK', inkludertMva: true }, kategori: 'Isolasjon' },
  { id: '3', navn: 'Rørkryss 15mm messing', vvsnr: '24681357', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: 'Uponor', pris: { salgspris: 89.9, valuta: 'NOK', inkludertMva: true }, kategori: 'Rør og koblingsutstyr' },
  { id: '4', navn: 'Parkett eik natur 14x140mm', vvsnr: '14725836', lagerstatus: 'Utsolgt', anbrekk: 'Nei', produsent: 'Tarkett', pris: { salgspris: 699, valuta: 'NOK', inkludertMva: true }, kategori: 'Gulv' },
  { id: '5', navn: 'Vernebriller klar polykarbonat', vvsnr: '63749281', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: '3M', pris: { salgspris: 245, valuta: 'NOK', inkludertMva: true }, kategori: 'Sikkerhet' },
  { id: '6', navn: 'Skrue treskrue 50mm galvanisert', vvsnr: '12345678', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: 'Biltema', pris: { salgspris: 35.9, valuta: 'NOK', inkludertMva: true }, kategori: 'Skruer og bolter' },
  { id: '7', navn: 'Beslag vinkelbeslag 90° stål', vvsnr: '87654321', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Würth', pris: { salgspris: 89.5, valuta: 'NOK', inkludertMva: true }, kategori: 'Beslag' },
  { id: '8', navn: 'Lim monteringslim 300ml', vvsnr: '11111111', lagerstatus: 'Utsolgt', anbrekk: 'Ja', produsent: 'Bostik', pris: { salgspris: 145, valuta: 'NOK', inkludertMva: true }, kategori: 'Lim og fugemasse' },
  { id: '9', navn: 'Drill spiralbor 8mm HSS', vvsnr: '22222222', lagerstatus: 'På lager', anbrekk: 'Ja', produsent: 'DeWalt', pris: { salgspris: 78.9, valuta: 'NOK', inkludertMva: true }, kategori: 'Verktøy' },
  { id: '10', navn: 'Skrue gipsskrue 25mm', vvsnr: '33333333', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Essve', pris: { salgspris: 25.5, valuta: 'NOK', inkludertMva: true }, kategori: 'Skruer og bolter' },
  { id: '11', navn: 'Maling vegmaling hvit 1L', vvsnr: '44444444', lagerstatus: 'Få igjen', anbrekk: 'Ja', produsent: 'Flügger', pris: { salgspris: 189, valuta: 'NOK', inkludertMva: true }, kategori: 'Maling og lakk' },
  { id: '12', navn: 'Isolasjon steinull 100mm', vvsnr: '55555555', lagerstatus: 'På lager', anbrekk: 'Nei', produsent: 'Glava', pris: { salgspris: 234.5, valuta: 'NOK', inkludertMva: true }, kategori: 'Isolasjon' }
];

export default function Dashboard() {
  const { authState } = useAuth();
  const { searchState, searchProducts } = useProductSearch(authState.accessToken);
  const [filters, setFilters] = useState<FilterState>({
    supplier: 'Alle leverandører',
    category: 'Alle kategorier',
    stock: 'Alle'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;


  // Define table columns for consistent display
  const tableColumns = [
    { 
      key: 'lagerstatus', 
      label: 'Status', 
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
    { key: 'navn', label: 'Produktnavn' },
    { key: 'produsent', label: 'Leverandør' },
    { 
      key: 'vvsnr', 
      label: 'VVS-nr', 
      align: 'center' as const,
      render: (value: unknown) => (
        <span className="font-mono text-sm text-neutral-700">{value as string}</span>
      )
    },
    { key: 'anbrekk', label: 'Anbrekk', align: 'center' as const },
    { 
      key: 'pris', 
      label: 'Pris', 
      align: 'right' as const,
      render: (value: unknown) => {
        if (!value) return <span className="text-neutral-500">—</span>;
        
        // Handle both old string format and new PriceInfo format
        if (typeof value === 'string') {
          return (
            <span className="font-semibold text-neutral-800">
              kr {value}
            </span>
          );
        }
        
        // New PriceInfo format
        const priceInfo = value as { salgspris: number; valuta: string };
        return (
          <span className="font-semibold text-neutral-800">
            kr {priceInfo.salgspris.toFixed(2)}
          </span>
        );
      }
    },
    { 
      key: 'nobb-link', 
      label: 'NOBB', 
      align: 'center' as const,
      render: (value: unknown, row: unknown) => (
        <NOBBLink vvsNumber={(row as Product).vvsnr || ''} size="sm" />
      )
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
        totalItems={filteredData.length}
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
      
      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && <ApiDebugPanel />}
    </div>
  );
}