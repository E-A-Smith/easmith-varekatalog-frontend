/**
 * Product search hook for Varekatalog
 *
 * Interfaces with OpenSearch-powered backend search API:
 * - OpenSearch Domain: eas-dev-varekatalog
 * - Index: eas-varekatalog-products
 * - Features: Full-text search, VVS-nummer lookup, Norwegian language support
 */

'use client';

import { useState, useCallback } from 'react';
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

export const useProductSearch = (accessToken?: string) => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false,
    loadingState: 'idle',
  });

  // Mock data removed - using real API only

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

      // Call backend search API - queries OpenSearch domain eas-dev-varekatalog
      // Index: eas-varekatalog-products
      const products = await apiClient.searchProducts(searchQuery, accessToken);

      setSearchState(prev => ({
        ...prev,
        results: products,
        isLoading: false,
        loadingState: 'succeeded',
        hasSearched: true
      }));

    } catch (error) {
      console.error('Search API error:', error);
      
      // Enhanced error handling for progressive enhancement
      let errorMessage = 'API ikke tilgjengelig';
      if (error instanceof Error) {
        if (error.message.includes('HTTP 401') || error.message.includes('Unauthorized')) {
          // Check if this was a progressive enhancement attempt that failed completely
          if (accessToken && error.message.includes('public access failed')) {
            errorMessage = 'API krever autentisering, men både autentisert og offentlig tilgang feilet';
          } else if (accessToken) {
            errorMessage = 'Autentisering feilet - token utløpt eller ugyldig';
          } else {
            errorMessage = 'API krever autentisering - logg inn for å søke etter produkter';
          }
        } else if (error.message.includes('Search Failed')) {
          errorMessage = 'OpenSearch søkefeil - indeks eas-varekatalog-products utilgjengelig';
        } else if (error.message.includes('Network error')) {
          errorMessage = 'Nettverksfeil - kan ikke nå API';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'OpenSearch timeout - prøv igjen';
        } else if (error.message.includes('illegal_argument_exception') || error.message.includes('fielddata=true')) {
          errorMessage = 'OpenSearch konfigurasjonfeil - feltdata må aktiveres for sortering på domene eas-dev-varekatalog';
        } else if (error.message.includes('index_not_found_exception')) {
          errorMessage = 'OpenSearch indeks eas-varekatalog-products ikke funnet';
        } else if (error.message.includes('search_phase_execution_exception')) {
          errorMessage = 'OpenSearch spørringsfel - ugyldig søkeparametere';
        } else {
          errorMessage = `API feil: ${error.message}`;
        }
      }
      
      // No fallback to mock data - show API error
      setSearchState(prev => ({
        ...prev,
        results: [],
        isLoading: false,
        loadingState: 'failed',
        hasSearched: true,
        error: errorMessage
      }));
    }
  }, [accessToken]);

  return {
    searchState,
    searchProducts,
  };
};