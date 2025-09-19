/**
 * Comprehensive tests for useProductSearch hook
 * Tests search functionality, API integration, and fallback mechanisms
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
      navn: 'VVS Rör 15mm',
      vvsnr: 'VVS12345',
      lagerstatus: 'På lager',
      anbrekk: 'Nei',
      produsent: 'Uponor',
      pris: { salgspris: 15000, valuta: 'NOK', inkludertMva: true },
      kategori: 'Rør og koblingsutstyr',
      beskrivelse: 'Kobberrør for varmt og kaldt vann',
      // Required new fields for Phase 1
      lh: 'TEST123',
      nobbNumber: '41000001',
      pakningAntall: 1,
      prisenhet: 'STK',
      lagerantall: 100,
      grunnpris: 120.00,
      nettopris: 150.00
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
      beskrivelse: 'Luft/vann-varmepumpe for enebolig',
      // Required new fields for Phase 1
      lh: 'TEST456',
      nobbNumber: '42000001',
      pakningAntall: 1,
      prisenhet: 'STK',
      lagerantall: 5,
      grunnpris: 28000.00,
      nettopris: 35000.00
    },
    // Test product with null LH field
    {
      id: '3',
      navn: 'Product with missing LH',
      vvsnr: '43000001',
      lagerstatus: 'Utsolgt',
      anbrekk: 'Ja',
      produsent: 'Test Supplier',
      kategori: 'Sikkerhet',
      beskrivelse: 'Product for testing null LH field',
      // LH field is null to test empty value handling
      lh: null,
      nobbNumber: '43000001',
      pakningAntall: 1,
      prisenhet: 'STK',
      lagerantall: null,
      grunnpris: null,
      nettopris: null
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
        await result.current.searchProducts('rør');
      });
      
      expect(apiClient.searchProducts).toHaveBeenCalledWith({
        søketekst: 'rør',
        side: 1,
        sideStørrelse: 10,
        sortering: 'relevans'
      });
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
  
  describe('Error Handling and Fallback', () => {
    it('should fall back to mock data on API error', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );
      
      const { result } = renderHook(() => useProductSearch());
      
      await act(async () => {
        await result.current.searchProducts('rør');
      });
      
      // Should have results from mock data
      expect(result.current.searchState.results).toHaveLength(1);
      expect(result.current.searchState.results[0]?.navn).toContain('Rör');
      expect(result.current.searchState.error).toContain('Bruker lokal data');
      expect(result.current.searchState.error).toContain('Nettverksfeil');
    });
    
    it('should handle Elasticsearch error correctly', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('Search Failed: Elasticsearch cluster is not available')
      );
      
      const { result } = renderHook(() => useProductSearch());
      
      await act(async () => {
        await result.current.searchProducts('test');
      });
      
      expect(result.current.searchState.error).toContain('Backend søkefeil');
      expect(result.current.searchState.error).toContain('Elasticsearch konfigurasjonsproblem');
    });
    
    it('should handle timeout error', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('Request timeout')
      );
      
      const { result } = renderHook(() => useProductSearch());
      
      await act(async () => {
        await result.current.searchProducts('test');
      });
      
      expect(result.current.searchState.error).toContain('API timeout');
    });
    
    it('should filter mock data based on search term', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('API error')
      );
      
      const { result } = renderHook(() => useProductSearch());
      
      // Search for "ventil"
      await act(async () => {
        await result.current.searchProducts('ventil');
      });
      
      expect(result.current.searchState.results).toHaveLength(1);
      expect(result.current.searchState.results[0]?.navn).toContain('Ventil');
      
      // Search for "NIBE" (produsent)
      await act(async () => {
        await result.current.searchProducts('NIBE');
      });
      
      expect(result.current.searchState.results).toHaveLength(1);
      expect(result.current.searchState.results[0]?.produsent).toBe('NIBE');
      
      // Search for VVS number
      await act(async () => {
        await result.current.searchProducts('VVS12345');
      });
      
      expect(result.current.searchState.results).toHaveLength(1);
      expect(result.current.searchState.results[0]?.vvsnr).toBe('VVS12345');
    });
    
    it('should search by category in mock data', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('API error')
      );
      
      const { result } = renderHook(() => useProductSearch());
      
      await act(async () => {
        await result.current.searchProducts('ovner');
      });
      
      expect(result.current.searchState.results).toHaveLength(1);
      expect(result.current.searchState.results[0]?.kategori).toContain('Ovner');
    });
    
    it('should handle unknown error types', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        'String error' // Non-Error object
      );
      
      const { result } = renderHook(() => useProductSearch());
      
      await act(async () => {
        await result.current.searchProducts('test');
      });
      
      expect(result.current.searchState.error).toContain('Bruker lokal data');
      expect(result.current.searchState.error).toContain('API ikke tilgjengelig');
    });
    
    it('should preserve error message from API', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('Custom API error message')
      );
      
      const { result } = renderHook(() => useProductSearch());
      
      await act(async () => {
        await result.current.searchProducts('test');
      });
      
      expect(result.current.searchState.error).toContain('Custom API error message');
    });
  });
  
  describe('State Management', () => {
    it('should preserve query in state', async () => {
      (apiClient.searchProducts as jest.Mock).mockResolvedValue(mockProducts);
      
      const { result } = renderHook(() => useProductSearch());
      
      await act(async () => {
        await result.current.searchProducts('test query');
      });
      
      expect(result.current.searchState.query).toBe('test query');
    });
    
    it('should mark hasSearched after search', async () => {
      (apiClient.searchProducts as jest.Mock).mockResolvedValue([]);
      
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
      
      // First search with error
      await act(async () => {
        await result.current.searchProducts('error');
      });
      
      expect(result.current.searchState.error).toBeTruthy();
      
      // Second search successful
      await act(async () => {
        await result.current.searchProducts('success');
      });
      
      expect(result.current.searchState.error).toBeNull();
    });
  });
  
  describe('Mock Data Integrity', () => {
    it('should have valid mock product structure', async () => {
      (apiClient.searchProducts as jest.Mock).mockRejectedValue(
        new Error('Force mock data')
      );
      
      const { result } = renderHook(() => useProductSearch());
      
      await act(async () => {
        await result.current.searchProducts('rør');
      });
      
      const product = result.current.searchState.results[0];
      expect(product).toBeDefined();
      
      if (product) {
        // Validate product structure
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('navn');
        expect(product).toHaveProperty('vvsnr');
        expect(product).toHaveProperty('lagerstatus');
        expect(product).toHaveProperty('anbrekk');
        expect(product).toHaveProperty('produsent');
        expect(product).toHaveProperty('pris');
        expect(product).toHaveProperty('kategori');
        expect(product).toHaveProperty('beskrivelse');
        
        // Validate price structure
        expect(product.pris).toHaveProperty('salgspris');
        expect(product.pris).toHaveProperty('valuta');
        expect(product.pris).toHaveProperty('inkludertMva');
        
        // Validate Norwegian values
        expect(['På lager', 'Få igjen', 'Utsolgt']).toContain(product.lagerstatus);
        expect(['Ja', 'Nei']).toContain(product.anbrekk);
        expect(product.pris?.valuta).toBe('NOK');
      }
    });
  });
});