/**
 * Comprehensive tests for useProductSearch hook
 * Tests search functionality, API integration, and error handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProductSearch } from './useProductSearch';
import { apiClient } from '@/utils/api';
import { Product } from '@/types/product';

// Mock the API client
jest.mock('@/utils/api', () => ({
  apiClient: {
    searchProducts: jest.fn(),
    healthCheck: jest.fn(),
  },
}));

// Mock console to clean up test output
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
});

afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('useProductSearch Hook', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      navn: 'VVS Ror 15mm',
      vvsnr: 'VVS12345',
      lagerstatus: 'På lager',
      anbrekk: 'Nei',
      produsent: 'Uponor',
      pris: { salgspris: 15000, valuta: 'NOK', inkludertMva: true },
      kategori: 'Ror og koblingsutstyr',
      beskrivelse: 'Kobberror for varmt og kaldt vann',
      lh: 'TEST123',
      nobbNumber: '41000001',
      pakningAntall: 1,
      prisenhet: 'STK',
      lagerantall: 100,
      grunnpris: 120.00,
      nettopris: 150.00
    }
  ];

  describe('Initial State', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useProductSearch());

      expect(result.current.searchState).toEqual({
        query: '',
        results: [],
        isLoading: false,
        error: null,
        hasSearched: false,
        loadingState: 'idle',
      });
    });
  });

  describe('Search Functionality', () => {
    it('should handle empty search query', async () => {
      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('');
      });

      expect(result.current.searchState.results).toEqual([]);
      expect(result.current.searchState.hasSearched).toBe(false);
      expect(result.current.searchState.loadingState).toBe('idle');
    });

    it('should trim whitespace from search query', async () => {
      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('   ');
      });

      expect(result.current.searchState.results).toEqual([]);
      expect(result.current.searchState.hasSearched).toBe(false);
    });

    it('should set loading state during search', async () => {
      (apiClient.searchProducts as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockProducts), 100))
      );

      const { result } = renderHook(() => useProductSearch());

      act(() => {
        result.current.searchProducts('test');
      });

      // Should be loading immediately after starting search
      expect(result.current.searchState.isLoading).toBe(true);
      expect(result.current.searchState.loadingState).toBe('loading');

      await waitFor(() => {
        expect(result.current.searchState.isLoading).toBe(false);
      });
    });

    it('should call API with correct search parameters', async () => {
      (apiClient.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('test');
      });

      expect(apiClient.searchProducts).toHaveBeenCalledWith({
        søketekst: 'test',
        side: 1,
        sideStørrelse: 10,
        sortering: 'relevans'
      }, undefined);
    });

    it('should update state with API results on success', async () => {
      (apiClient.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('test');
      });

      expect(result.current.searchState).toMatchObject({
        query: 'test',
        results: mockProducts,
        isLoading: false,
        error: null,
        hasSearched: true,
        loadingState: 'succeeded'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API network errors', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('test');
      });

      expect(result.current.searchState.results).toHaveLength(0);
      expect(result.current.searchState.error).toContain('Nettverksfeil - kan ikke nå API');
      expect(result.current.searchState.loadingState).toBe('failed');
    });

    it('should handle OpenSearch errors correctly', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('Search Failed: index not found')
      );

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('test');
      });

      expect(result.current.searchState.error).toContain('OpenSearch søkefeil - indeks eas-varekatalog-products utilgjengelig');
    });

    it('should handle timeout errors', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('Request timeout')
      );

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('test');
      });

      expect(result.current.searchState.error).toContain('OpenSearch timeout - prøv igjen');
    });

    it('should handle authentication errors', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('HTTP 401: Unauthorized')
      );

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('test');
      });

      expect(result.current.searchState.error).toContain('API krever autentisering');
    });
  });

  describe('State Management', () => {
    it('should preserve query in state', async () => {
      (apiClient.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProductSearch());

      await act(async () => {
        await result.current.searchProducts('ventil');
      });

      expect(result.current.searchState.query).toBe('ventil');
    });

    it('should mark hasSearched after search', async () => {
      (apiClient.searchProducts as jest.Mock).mockResolvedValue(mockProducts);

      const { result } = renderHook(() => useProductSearch());

      expect(result.current.searchState.hasSearched).toBe(false);

      await act(async () => {
        await result.current.searchProducts('test');
      });

      expect(result.current.searchState.hasSearched).toBe(true);
    });

    it('should reset error on new search', async () => {
      (apiClient.searchProducts as jest.Mock)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockProducts);

      const { result } = renderHook(() => useProductSearch());

      // First search fails
      await act(async () => {
        await result.current.searchProducts('fail');
      });

      expect(result.current.searchState.error).toBeTruthy();

      // Second search succeeds and clears error
      await act(async () => {
        await result.current.searchProducts('success');
      });

      expect(result.current.searchState.error).toBeNull();
    });
  });
});