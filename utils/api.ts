/**
 * Simplified API utilities for Varekatalog
 * Step 3.1: Streamlined approach to avoid module resolution issues
 */

'use client';

import { Product, ProductSearchQuery } from '../types';

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_ENDPOINT || '/api',
  timeout: 10000,
  enableLogging: process.env.NODE_ENV === 'development'
};

// Simple error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Simple API client
export class SimpleApiClient {
  private log(message: string, data?: unknown) {
    if (API_CONFIG.enableLogging) {
      console.log(`[API] ${message}`, data);
    }
  }

  async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST';
      body?: unknown;
      params?: Record<string, string | number>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params } = options;
    
    // Build URL with params
    let url = `${API_CONFIG.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    this.log(`${method} ${url}`, { body });

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data = await response.json();
      this.log(`${method} ${url} - Success`, data);
      
      return data;
    } catch (error) {
      this.log(`${method} ${url} - Error`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      throw new ApiError('Network error', 0);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string }>('/health');
      this.log('Health check response:', response);
      // Check if the response indicates healthy status
      return response && (response as { status?: string }).status === 'healthy';
    } catch (error) {
      this.log('Health check failed:', error);
      return false;
    }
  }

  async searchProducts(query: ProductSearchQuery): Promise<Product[]> {
    // Use GET endpoint with query parameters for simpler implementation
    const searchParams = {
      q: query.søketekst || '',
      limit: String(query.sideStørrelse || 50),
      offset: String(((query.side || 1) - 1) * (query.sideStørrelse || 50))
    };
    
    const result = await this.request<{ 
      success: boolean; 
      results: Product[]; 
      total: number;
      responseTime: string;
    }>('/search', { 
      method: 'GET',
      params: searchParams
    });
    
    return result.results || [];
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }
}

// Export singleton instance
export const apiClient = new SimpleApiClient();