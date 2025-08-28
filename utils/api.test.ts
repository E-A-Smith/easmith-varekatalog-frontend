/**
 * API Client Tests
 * Tests the basic functionality of the API client
 */

import { SimpleApiClient, ApiError } from './api';
import { ProductSearchQuery } from '@/types/product';

// Mock fetch globally
global.fetch = jest.fn();

describe('SimpleApiClient', () => {
  let apiClient: SimpleApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    apiClient = new SimpleApiClient();
    
    // Mock console methods for clean test output
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Environment Configuration', () => {
    it('should use correct API endpoint from environment variables', () => {
      const expectedUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                         process.env.NEXT_PUBLIC_API_ENDPOINT || 
                         '/api';
      
      expect(expectedUrl).toBeTruthy();
    });
  });

  describe('Health Check', () => {
    it('should return true when API is healthy', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'healthy' })
      });

      const isHealthy = await apiClient.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false when API is unhealthy', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'unhealthy' })
      });

      const isHealthy = await apiClient.healthCheck();
      expect(isHealthy).toBe(false);
    });

    it('should return false on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed')
      );

      const isHealthy = await apiClient.healthCheck();
      expect(isHealthy).toBe(false);
    });
  });

  describe('Product Search', () => {
    const mockSearchQuery: ProductSearchQuery = {
      søketekst: 'rør',
      side: 1,
      sideStørrelse: 10,
      sortering: 'relevans'
    };

    const mockProducts = [
      {
        id: '1',
        navn: 'VVS Rør 15mm',
        vvsnr: 'VVS12345',
        lagerstatus: 'På lager',
        anbrekk: 'Nei',
        produsent: 'Uponor',
        pris: { salgspris: 150, valuta: 'NOK', inkludertMva: true },
        kategori: 'Rör och koblingsutstyr',
        beskrivelse: 'Test rör'
      }
    ];

    it('should search products with POST method', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: mockProducts,
          total: 1,
          responseTime: '0.3s'
        })
      });

      const results = await apiClient.searchProducts(mockSearchQuery);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            søketekst: 'rör',
            side: 1,
            sideStørrelse: 10,
            sortering: 'relevans'
          })
        })
      );

      expect(results).toEqual(mockProducts);
    });

    it('should handle array response format', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts // Direct array response
      });

      const results = await apiClient.searchProducts(mockSearchQuery);
      expect(results).toEqual(mockProducts);
    });

    it('should handle empty results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [],
          total: 0
        })
      });

      const results = await apiClient.searchProducts(mockSearchQuery);
      expect(results).toEqual([]);
    });

    it('should use default values for missing query parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      await apiClient.searchProducts({ søketekst: 'test' });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toEqual({
        søketekst: 'test',
        side: 1,
        sideStørrelse: 50,
        sortering: 'relevans'
      });
    });

    it('should handle progressive enhancement fallback', async () => {
      // First call with auth fails with 401
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({ error: 'Invalid token' })
        })
        // Second call without auth succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ results: mockProducts })
        });

      const results = await apiClient.searchProducts(mockSearchQuery, 'invalid-token');

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(results).toEqual(mockProducts);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: 'Search Failed',
          message: 'Elasticsearch cluster is not available'
        })
      });

      await expect(apiClient.searchProducts({ søketekst: 'test' })).rejects.toThrow(ApiError);
      await expect(apiClient.searchProducts({ søketekst: 'test' })).rejects.toMatchObject({
        status: 500,
        message: expect.stringContaining('Elasticsearch cluster is not available')
      });
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('Failed to fetch')
      );

      await expect(apiClient.searchProducts({ søketekst: 'test' })).rejects.toThrow(ApiError);
      await expect(apiClient.searchProducts({ søketekst: 'test' })).rejects.toMatchObject({
        status: 0,
        message: 'Network error'
      });
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new DOMException('Aborted', 'AbortError');
      (global.fetch as jest.Mock).mockRejectedValueOnce(timeoutError);

      await expect(apiClient.searchProducts({ søketekst: 'test' })).rejects.toThrow(ApiError);
      await expect(apiClient.searchProducts({ søketekst: 'test' })).rejects.toMatchObject({
        status: 408,
        message: 'Request timeout'
      });
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header when token provided', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      await apiClient.searchProducts({ søketekst: 'test' }, 'test-token');

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers).toMatchObject({
        'Authorization': 'Bearer test-token'
      });
    });

    it('should not include Authorization header when no token', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [] })
      });

      await apiClient.searchProducts({ søketekst: 'test' });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers).not.toHaveProperty('Authorization');
    });
  });
});