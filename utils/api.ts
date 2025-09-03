/**
 * API Client for Varekatalog
 * Provides simplified API access with progressive enhancement support
 */

import { Product, ProductSearchQuery } from '@/types/product';

// Backend field mapping (Phase 2)
interface BackendProduct {
  VVSnr: string;           // → id/nobbNumber
  varenavn: string;        // → navn
  leverandørNavn?: string; // → produsent
  lagerstatus?: string;    // → lagerstatus
  kanAnbrekke?: string;    // → anbrekk ('1' = 'Ja', '' = 'Nei')
  enhet?: string;          // → prisenhet
  lh?: string;             // → lh (LH/Løvenskjold number)
  pakningAntall?: number;  // → pakningAntall (package quantity)
  lagerantall?: number;    // → lagerantall (requires 'varekatalog/inventory' scope)
  grunnpris?: number;      // → grunnpris (requires 'varekatalog/prices' scope)
  nettopris?: number;      // → nettopris (requires 'varekatalog/prices' scope)
  EAN?: string;
  varebeskrivelse?: string;
  størrelse?: string;
}

/**
 * Transform backend product to frontend Product format (Phase 2)
 */
function transformBackendProduct(backendProduct: BackendProduct): Product {
  const product: Product = {
    id: backendProduct.VVSnr,
    navn: backendProduct.varenavn,
    vvsnr: backendProduct.VVSnr,
    lagerstatus: (backendProduct.lagerstatus as Product['lagerstatus']) || 'Ikke tilgjengelig',
    anbrekk: backendProduct.kanAnbrekke === '1' ? 'Ja' : 'Nei',
    
    // New Phase 2 fields with OAuth scope-dependent availability
    lh: backendProduct.lh || backendProduct.VVSnr, // Fallback to VVSnr
    nobbNumber: backendProduct.VVSnr, // NOBB number same as VVSnr
    pakningAntall: backendProduct.pakningAntall || 1,
    prisenhet: backendProduct.enhet || 'STK',
  };

  // Optional fields - only add if they exist
  if (backendProduct.leverandørNavn) {
    product.produsent = backendProduct.leverandørNavn;
  }
  
  if (backendProduct.varebeskrivelse) {
    product.beskrivelse = backendProduct.varebeskrivelse;
  }
  
  if (backendProduct.EAN) {
    product.ean = backendProduct.EAN;
  }
  
  if (backendProduct.VVSnr) {
    product.nobbNummer = backendProduct.VVSnr; // Legacy field
  }
  
  if (backendProduct.enhet) {
    product.enhet = backendProduct.enhet;
  }
  
  // OAuth scope-dependent fields (only add if authorized and available)
  if (backendProduct.lagerantall !== undefined) {
    product.lagerantall = backendProduct.lagerantall;
  }
  
  if (backendProduct.grunnpris !== undefined) {
    product.grunnpris = backendProduct.grunnpris;
  }
  
  if (backendProduct.nettopris !== undefined) {
    product.nettopris = backendProduct.nettopris;
    
    // Price structure for legacy compatibility
    product.pris = {
      salgspris: backendProduct.nettopris,
      valuta: 'NOK',
      inkludertMva: true
    };
  }

  return product;
}

/**
 * API Error class for handling API-specific errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Simple API Client with progressive enhancement
 * Supports both authenticated and public API access
 */
export class SimpleApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    // Get API base URL from environment
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 
                   process.env.NEXT_PUBLIC_API_ENDPOINT || 
                   '/api';
    this.timeout = 10000; // 10 second timeout
  }

  /**
   * Log messages in development mode only
   */
  private log(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_API_DEBUG === 'true') {
      console.log(`[API Client] ${message}`, data ? data : '');
    }
  }

  /**
   * Make HTTP request with error handling and timeout
   */
  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: unknown;
      params?: Record<string, string | number>;
      token?: string;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, params, token } = options;

    // Build URL with query parameters
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      requestOptions.body = JSON.stringify(body);
    }

    this.log(`${method} ${url}`, { body, headers: token ? { ...headers, Authorization: '[REDACTED]' } : headers });

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = `${errorData.error}${errorData.details ? `: ${errorData.details}` : ''}`;
          }
        } catch {
          // Ignore JSON parsing errors for error responses
        }

        throw new ApiError(response.status, errorMessage, response);
      }

      const data = await response.json();
      this.log(`Response:`, data);
      return data;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network and timeout errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout');
      }

      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new ApiError(0, 'Network error');
      }

      // Unknown error
      throw new ApiError(0, error instanceof Error ? error.message : 'Unknown error occurred');
    }
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request<{ status: string }>('/health');
      return response.status === 'healthy';
    } catch (error) {
      this.log('Health check failed:', error);
      return false;
    }
  }

  /**
   * Search products with progressive enhancement
   * Supports both authenticated and public access
   */
  async searchProducts(
    query: ProductSearchQuery, 
    accessToken?: string
  ): Promise<Product[]> {
    const searchBody = {
      søketekst: query.søketekst || '',
      side: query.side || 1,
      sideStørrelse: query.sideStørrelse || 50,
      sortering: query.sortering || 'relevans',
      // Include optional filters if provided
      ...(query.kategori && { kategori: query.kategori }),
      ...(query.lagerstatus && { lagerstatus: query.lagerstatus }),
      ...(query.produsent && { produsent: query.produsent }),
      ...(query.prisområde && { prisområde: query.prisområde }),
      ...(query.anbrekk && { anbrekk: query.anbrekk }),
    };

    try {
      // First try with authentication if token provided
      const options = accessToken 
        ? { method: 'POST' as const, body: searchBody, token: accessToken }
        : { method: 'POST' as const, body: searchBody };

      const result = await this.request<{
        results?: BackendProduct[];
        success?: boolean;
        total?: number;
        responseTime?: string;
      } | BackendProduct[]>('/search', options);

      // Handle different response formats and transform backend data
      let backendProducts: BackendProduct[];
      
      if (Array.isArray(result)) {
        backendProducts = result;
      } else {
        backendProducts = result.results || [];
      }

      // Transform backend products to frontend format
      return backendProducts.map(transformBackendProduct);

    } catch (error) {
      // Progressive enhancement: retry without authentication if 401
      if (accessToken && error instanceof ApiError && error.status === 401) {
        this.log('Authenticated request failed, trying public access...');
        try {
          return await this.searchProducts(query); // Retry without token
        } catch (publicError) {
          this.log('Public access also failed:', publicError);
          throw publicError;
        }
      }

      // Re-throw the original error
      throw error;
    }
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: string, accessToken?: string): Promise<Product> {
    const options = accessToken 
      ? { token: accessToken }
      : {};

    const backendProduct = await this.request<BackendProduct>(`/products/${id}`, options);
    return transformBackendProduct(backendProduct);
  }
}

// Export singleton instance
export const apiClient = new SimpleApiClient();