/**
 * Central type exports for Varekatalog
 * Step 2.2: TypeScript types system index
 */

// Product-related types
export type {
  Product,
  LagerStatus,
  AnbrekkStatus,
  ProductCategory,
  PriceInfo,
  DiscountInfo,
  ProductDimensions,
  ProductImage,
  ProductSearchQuery,
  ProductSortOrder,
  ProductSearchResult,
  SearchFacets,
  FacetItem,
  PriceRangeFacet,
  ApiResponse,
  ProductApiResponse,
  ProductListApiResponse,
  ProductSearchApiResponse,
  CreateProductData,
  UpdateProductData,
  ProductTableColumn
} from './product';

// Type guards
export {
  isProduct,
  isLagerStatus,
  isAnbrekkStatus,
  isProductCategory
} from './product';

// UI component types (can be extended in the future)
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Common utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}