/**
 * Product search hook for Varekatalog
 * Step 2.2: Enhanced with comprehensive TypeScript types system
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { apiClient } from '@/utils/api';
import type { 
  Product, 
  ProductSearchQuery
} from '@/types/product';

type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

interface SearchState {
  query: string;
  results: Product[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  loadingState: LoadingState;
}

export const useProductSearch = () => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
    loadingState: 'idle',
  });

  // Minimal mock data for development
  const mockProducts = useMemo((): Product[] => [
    {
      id: '1',
      navn: 'VVS Rør 15mm',
      vvsnr: 'VVS12345',
      lagerstatus: 'På lager',
      anbrekk: 'Nei',
      produsent: 'Uponor',
      pris: { salgspris: 15000, valuta: 'NOK', inkludertMva: true },
      kategori: 'Rør og koblingsutstyr',
      beskrivelse: 'Kobberrør for varmt og kaldt vann'
    },
    {
      id: '2', 
      navn: 'Varmepumpe 12kW',
      vvsnr: 'VP-12000',
      lagerstatus: 'På lager',
      anbrekk: 'Nei',
      produsent: 'NIBE',
      pris: { salgspris: 35000, valuta: 'NOK', inkludertMva: true },
      kategori: 'Ovner og varme',
      beskrivelse: 'Luft/vann-varmepumpe for enebolig'
    },
    {
      id: '3',
      navn: 'Ventil 15mm',
      vvsnr: 'VALV-001', 
      lagerstatus: 'På lager',
      anbrekk: 'Nei',
      produsent: 'Uponor',
      pris: { salgspris: 129, valuta: 'NOK', inkludertMva: true },
      kategori: 'Rør og koblingsutstyr',
      beskrivelse: 'Avstengningsventil for vann'
    }
  ], []);

  const searchProducts = useCallback(async (query: string): Promise<void> => {
    setSearchState(prev => ({
      ...prev,
      isLoading: true,
      loadingState: 'loading',
      error: null,
      query
    }));

    try {
      if (!query.trim()) {
        setSearchState(prev => ({
          ...prev,
          results: [],
          isLoading: false,
          loadingState: 'idle',
          hasSearched: false,
          query: ''
        }));
        return;
      }

      // Create search query for real API
      const searchQuery: ProductSearchQuery = {
        søketekst: query,
        side: 1,
        sideStørrelse: 10,
        sortering: 'relevans'
      };

      // Call real API
      const products = await apiClient.searchProducts(searchQuery);

      setSearchState(prev => ({
        ...prev,
        results: products,
        isLoading: false,
        loadingState: 'succeeded',
        hasSearched: true
      }));

    } catch (error) {
      console.error('Search API error:', error);
      
      // Fallback to mock data if API fails
      const searchTerm = query.toLowerCase();
      const filteredProducts = mockProducts.filter(product =>
        product.navn.toLowerCase().includes(searchTerm) ||
        (product.vvsnr && product.vvsnr.includes(searchTerm)) ||
        (product.produsent && product.produsent.toLowerCase().includes(searchTerm)) ||
        (product.kategori && product.kategori.toLowerCase().includes(searchTerm))
      );

      setSearchState(prev => ({
        ...prev,
        results: filteredProducts,
        isLoading: false,
        loadingState: 'succeeded',
        hasSearched: true,
        error: 'Bruker lokal data (API ikke tilgjengelig)'
      }));
    }
  }, [mockProducts]);

  return {
    searchState,
    searchProducts,
  };
};