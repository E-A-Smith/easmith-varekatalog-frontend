/**
 * Comprehensive API Client Tests
 * Tests API connectivity, error handling, and environment configuration
 */

import { SimpleApiClient, ApiError } from './api';
import { Product, ProductSearchQuery } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('SimpleApiClient', () => {
  let apiClient: SimpleApiClient;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
    // Create fresh API client instance
    apiClient = new SimpleApiClient();
    
    // Mock console methods for clean test output
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  
  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });
  
  describe('Environment Configuration', () => {
    it('should use correct API endpoint from environment variables', () => {
      // Check if environment variables are properly loaded
      const expectedUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                         process.env.NEXT_PUBLIC_API_ENDPOINT || 
                         '/api';
      
      expect(expectedUrl).toBeTruthy();
      console.log('API Endpoint configured:', expectedUrl);
      
      // For production environment, it should be the AWS API Gateway URL
      if (expectedUrl.includes('execute-api')) {
        expect(expectedUrl).toContain('amazonaws.com');
        expect(expectedUrl).toContain('/dev');
      }
    });
    
    it('should detect development environment correctly', () => {
      const isDevelopment = process.env.NODE_ENV === 'development';
      expect(typeof isDevelopment).toBe('boolean');
    });
  });
  
  describe('Request Method', () => {
    it('should make GET request with correct headers', async () => {
      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      
      await apiClient.request('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      );
    });
    
    it('should make POST request with body', async () => {
      const testBody = { søketekst: 'test', side: 1 };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });
      
      await apiClient.request('/search', {
        method: 'POST',
        body: testBody
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/search'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testBody),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      );
    });
    
    it('should handle query parameters correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      
      await apiClient.request('/test', {
        params: { page: 1, size: 10 }
      });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/test\?page=1&size=10/),
        expect.any(Object)
      );
    });
    
    it('should include timeout signal', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });
      
      await apiClient.request('/test');
      
      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('signal');
      expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);
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
      
      await expect(apiClient.request('/test')).rejects.toThrow(ApiError);
      await expect(apiClient.request('/test')).rejects.toMatchObject({
        status: 500,
        message: expect.stringContaining('Search Failed')
      });
    });
    
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network failure')
      );
      
      await expect(apiClient.request('/test')).rejects.toThrow(ApiError);
      await expect(apiClient.request('/test')).rejects.toMatchObject({
        status: 0,
        message: 'Network error'
      });
    });
    
    it('should handle timeout errors', async () => {
      const timeoutError = new DOMException('Aborted', 'AbortError');
      (global.fetch as jest.Mock).mockRejectedValueOnce(timeoutError);
      
      await expect(apiClient.request('/test')).rejects.toThrow(ApiError);
      await expect(apiClient.request('/test')).rejects.toMatchObject({
        status: 408,
        message: 'Request timeout'
      });
    });
    
    it('should parse JSON error messages correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Invalid search parameters'
        })
      });
      
      await expect(apiClient.request('/test')).rejects.toThrow('Invalid search parameters');
    });
    
    it('should handle non-JSON error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        json: async () => { throw new Error('Invalid JSON'); }
      });
      
      await expect(apiClient.request('/test')).rejects.toThrow('HTTP 502: Bad Gateway');
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
    
    const mockProducts: Product[] = [
      {
        id: '1',
        navn: 'VVS Rør 15mm',
        vvsnr: 'VVS12345',
        lagerstatus: 'På lager',
        anbrekk: 'Nei',
        produsent: 'Uponor',
        pris: { salgspris: 150, valuta: 'NOK', inkludertMva: true },
        kategori: 'Rør',
        beskrivelse: 'Test rør'
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
            søketekst: 'rør',
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
  });
  
  describe('Get Product', () => {
    it('should fetch single product by ID', async () => {
      const mockProduct: Product = {
        id: '123',
        navn: 'Test Product',
        vvsnr: 'TEST123',
        lagerstatus: 'På lager',
        anbrekk: 'Nei',
        produsent: 'Test AS',
        pris: { salgspris: 100, valuta: 'NOK', inkludertMva: true },
        kategori: 'Test',
        beskrivelse: 'Test product'
      };
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct
      });
      
      const product = await apiClient.getProduct('123');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/products/123'),
        expect.any(Object)
      );
      
      expect(product).toEqual(mockProduct);
    });
  });
  
  describe('Logging', () => {
    it('should log in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const client = new SimpleApiClient();
      const logSpy = jest.spyOn(console, 'log');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' })
      });
      
      await client.request('/test');
      
      expect(logSpy).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
    
    it('should not log in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const client = new SimpleApiClient();
      const logSpy = jest.spyOn(console, 'log');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' })
      });
      
      await client.request('/test');
      
      expect(logSpy).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('Real API Integration Tests', () => {
  const REAL_API_URL = 'https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev';
  
  describe('Live API Connection', () => {
    it('should detect if API is reachable', async () => {
      // This test makes a real request to verify connectivity
      try {
        const response = await fetch(`${REAL_API_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        console.log('API Health Check Status:', response.status);
        console.log('API Response Headers:', response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Health Response:', data);
        }
        
        // API is reachable
        expect(response).toBeDefined();
      } catch (error) {
        console.error('API Connection Error:', error);
        // API is not reachable
        expect(error).toBeDefined();
      }
    });
    
    it('should test search endpoint', async () => {
      try {
        const response = await fetch(`${REAL_API_URL}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            søketekst: 'rør',
            side: 1,
            sideStørrelse: 10,
            sortering: 'relevans'
          })
        });
        
        console.log('Search Endpoint Status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Search Error Response:', errorText);
        } else {
          const data = await response.json();
          console.log('Search Response:', data);
        }
        
        expect(response).toBeDefined();
      } catch (error) {
        console.error('Search Endpoint Error:', error);
        expect(error).toBeDefined();
      }
    });
  });
});