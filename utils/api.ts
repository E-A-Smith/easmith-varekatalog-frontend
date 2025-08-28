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
      token?: string;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params, token } = options;
    
    // Build URL with params
    let url = `${API_CONFIG.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // Add Authorization header if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(API_CONFIG.timeout)
    };

    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    this.log(`${method} ${url}`, { body });

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = `${errorData.error}: ${errorData.message || errorData.error}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If we can't parse JSON error, use status text
        }
        
        throw new ApiError(
          errorMessage,
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

  async healthCheck(token?: string): Promise<boolean> {
    try {
      const options = token ? { token } : {};
      const response = await this.request<{ status: string }>('/health', options);
      this.log('Health check response:', response);
      // Check if the response indicates healthy status
      return response && (response as { status?: string }).status === 'healthy';
    } catch (error) {
      this.log('Health check failed:', error);
      return false;
    }
  }

  async searchProducts(query: ProductSearchQuery, token?: string): Promise<Product[]> {
    // Use POST endpoint as required by the AWS API Gateway
    const searchBody = {
      søketekst: query.søketekst || '',
      side: query.side || 1,
      sideStørrelse: query.sideStørrelse || 50,
      sortering: query.sortering || 'relevans'
    };
    
    this.log('Searching products:', searchBody);
    
    try {
      // Try with authentication token first if available
      const options = token ? 
        { method: 'POST' as const, body: searchBody, token } :
        { method: 'POST' as const, body: searchBody };
      
      const result = await this.request<{ 
        success: boolean; 
        results: Product[]; 
        total: number;
        responseTime: string;
      }>('/search', options);
      
      // Handle different response formats
      if (Array.isArray(result)) {
        return result;
      }
      
      return result.results || [];

    } catch (error) {
      // If authentication fails but we have a token, try without token (public access)
      if (token && error instanceof ApiError && error.status === 401) {
        this.log('Authenticated request failed, trying public access...');
        
        try {
          const publicResult = await this.request<{ 
            success: boolean; 
            results: Product[]; 
            total: number;
            responseTime: string;
          }>('/search', { method: 'POST', body: searchBody });
          
          if (Array.isArray(publicResult)) {
            return publicResult;
          }
          
          return publicResult.results || [];
        } catch (publicError) {
          this.log('Public access also failed:', publicError);
          // Create enhanced error message indicating both attempts failed
          throw new ApiError(
            `${error.message} (public access failed)`,
            error.status
          );
        }
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  async getProduct(id: string, token?: string): Promise<Product> {
    const options = token ? { token } : {};
    return this.request<Product>(`/products/${id}`, options);
  }
}

// Export singleton instance
export const apiClient = new SimpleApiClient();