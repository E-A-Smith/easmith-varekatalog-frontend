/**
 * API Client for Varekatalog
 * Provides simplified API access with progressive enhancement support
 */

import { Product, ProductSearchQuery, isProductCategory, type ProductCategory } from '@/types/product';
import { getSupplierName, hasSupplierMapping } from '@/utils/supplier-mapping';

// Current API response format
export interface BackendProduct {
  id: string;
  navn: string;            // Product name
  vvsnr: string;           // VVS number
  lagerstatus?: string;    // Stock status (raw from backend - we'll recalculate this)
  anbrekk: string;         // Partial quantity availability
  lh: string;              // LH/Løvenskjold number
  nobbNumber: string;      // NOBB number
  pakningAntall: number;   // Package quantity
  prisenhet: string;       // Price unit
  lagerantall?: number | null;    // Stock quantity (null when unauthorized)
  grunnpris?: number | null;      // Base price (null when unauthorized)
  nettopris?: number | null;      // Net price (null when unauthorized)
  produsent?: string;      // Supplier/manufacturer
  kategori?: string;       // Category
  beskrivelse?: string;    // Description
  ean?: string;            // EAN code
  enhet?: string;          // Unit
}

/**
 * Transform backend product to frontend Product format (Phase 2)
 */
export function transformBackendProduct(backendProduct: BackendProduct): Product {
  // Debug logging for LH field issues
  if (process.env.NODE_ENV === 'development' && (!backendProduct.lh || backendProduct.lh.trim() === '')) {
    console.warn('[API Transform] Product with empty LH field:', {
      id: backendProduct.id,
      navn: backendProduct.navn,
      lh: backendProduct.lh,
      vvsnr: backendProduct.vvsnr
    });
  }

  const product: Product = {
    id: backendProduct.id,
    navn: backendProduct.navn,
    vvsnr: backendProduct.vvsnr,
    
    // Calculate lagerstatus from lagerantall (inventory count)
    lagerstatus: backendProduct.lagerantall === null ? 'NA' : 
                 backendProduct.lagerantall !== undefined && backendProduct.lagerantall > 0 ? 'På lager' : 'Utsolgt',
    
    // Handle anbrekk (partial quantity) - backend already returns 'Ja'/'Nei'
    anbrekk: (backendProduct.anbrekk === 'Ja' || backendProduct.anbrekk === 'Nei') 
      ? backendProduct.anbrekk 
      : 'Nei',
    
    // Required fields from current API format - handle null values
    lh: (backendProduct.lh && backendProduct.lh.trim() && backendProduct.lh.trim() !== "0") 
      ? backendProduct.lh.trim() 
      : null,
    nobbNumber: backendProduct.nobbNumber || backendProduct.vvsnr || '',
    pakningAntall: backendProduct.pakningAntall || 1,
    prisenhet: backendProduct.prisenhet || 'STK',
    
    // Security-filtered fields (null when unauthorized, values when authorized)
    lagerantall: backendProduct.lagerantall ?? null,
    grunnpris: backendProduct.grunnpris ?? null,
    nettopris: backendProduct.nettopris ?? null,
  };

  // Optional fields - only add if they exist in the API response
  if (backendProduct.produsent) {
    // Check if produsent is a numeric code that needs mapping
    if (/^\d+$/.test(backendProduct.produsent.trim()) && hasSupplierMapping(backendProduct.produsent)) {
      // Store original code and map to display name
      product.produsentKode = backendProduct.produsent;
      product.produsent = getSupplierName(backendProduct.produsent);
    } else {
      // Already a name or unmapped code, use as-is
      product.produsent = backendProduct.produsent;
      // If it looks like a numeric code but isn't mapped, store it as the code
      if (/^\d+$/.test(backendProduct.produsent.trim())) {
        product.produsentKode = backendProduct.produsent;
      }
    }
  }
  
  if (backendProduct.beskrivelse) {
    product.beskrivelse = backendProduct.beskrivelse;
  }
  
  if (backendProduct.ean) {
    product.ean = backendProduct.ean;
  }
  
  if (backendProduct.kategori && isProductCategory(backendProduct.kategori)) {
    // Type-safe assignment for optional kategori field
    const productWithKategori = product as Product & { kategori?: ProductCategory };
    productWithKategori.kategori = backendProduct.kategori;
  }
  
  if (backendProduct.vvsnr) {
    product.nobbNummer = backendProduct.vvsnr; // Legacy field compatibility
  }
  
  if (backendProduct.enhet) {
    product.enhet = backendProduct.enhet;
  }
  
  if (backendProduct.kategori) {
    product.kategori = backendProduct.kategori;
  }
  
  // Legacy price structure for compatibility (if nettopris is available)
  if (backendProduct.nettopris !== undefined && backendProduct.nettopris !== null) {
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
    // Always use Next.js API routes for client-side requests to avoid CORS issues
    // The server-side API routes will proxy to the external backend
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    this.timeout = 10000; // 10 second timeout
    
    this.log(`API Client initialized with baseUrl: ${this.baseUrl}`);
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
    accessToken?: string // TODO: Implement authentication
  ): Promise<Product[]> {
    // Convert legacy query format to new API format
    const searchBody = {
      query: query.søketekst || '',
      limit: query.sideStørrelse || 50,
      offset: ((query.side || 1) - 1) * (query.sideStørrelse || 50),
      // Include filters if provided
      filters: {
        ...(query.kategori && { kategori: query.kategori }),
        ...(query.lagerstatus && { lagerstatus: query.lagerstatus }),
        ...(query.produsent && { produsent: query.produsent }),
        ...(query.anbrekk && { anbrekk: query.anbrekk }),
      },
      sort: query.sortering === 'relevans' ? { field: '_score', order: 'desc' } : undefined
    };

    try {
      // Check if using direct API or Next.js proxy
      const isDirectAPI = this.baseUrl.includes('execute-api.amazonaws.com');
      
      this.log('Searching with:', isDirectAPI ? 'Direct Backend API' : 'Next.js API route');
      this.log('Request payload:', searchBody);
      this.log('Auth token:', accessToken ? 'present' : 'none');

      // Call API (direct or via Next.js proxy)
      const result = await this.request<{
        products?: Product[];
        results?: Product[]; // Could be in results field too
        success?: boolean;
        total?: number;
        responseTime?: string;
      }>('/search', { 
        method: 'POST' as const, 
        body: searchBody,
        ...(accessToken && { token: accessToken }) // Only include token if present
      });

      this.log('Search response:', result);

      // Extract products from response
      let products: Product[] = [];
      
      if (result.products) {
        products = result.products;
      } else if (result.results) {
        products = result.results;
      }

      // Check if products need transformation (BackendProduct vs Product format)
      // BackendProduct doesn't have lagerstatus field, Product does
      const needsTransformation = products.length > 0 && 
        products[0] && 
        typeof products[0] === 'object' &&
        !('lagerstatus' in products[0]);

      if (needsTransformation) {
        // Transform backend format to frontend format
        return products.map(product => transformBackendProduct(product as BackendProduct));
      } else {
        // Products are already in correct format - return as is
        return products;
      }

    } catch (error) {
      this.log('Search failed:', error);
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