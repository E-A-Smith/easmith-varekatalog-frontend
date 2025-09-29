/**
 * Google Analytics Tracking Functions
 * Core tracking utilities with TypeScript strict mode compliance
 */

import { ANALYTICS_CONFIG, DEFAULT_USER_PROPERTIES, ECOMMERCE_CONFIG } from './ga-config';
import {
  SearchEventParams,
  GAProductItem,
  FilterEventParams,
  PaginationEventParams,
  AuthEventParams,
  ErrorEventParams,
  PriceVisibilityEventParams,
  NOBBLinkEventParams,
  CatalogStatsEventParams,
  UserProperties,
  GA_EVENTS,
  GAEventName,
} from './events';
import type { Product } from '@/types/product';

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date | GAEventName,
      parameters?: Record<string, unknown>
    ) => void;
  }
}

// Helper function to safely call gtag
const gtag = (...args: Parameters<NonNullable<Window['gtag']>>) => {
  if (typeof window !== 'undefined' && window.gtag && ANALYTICS_CONFIG.enableAnalytics) {
    try {
      window.gtag(...args);
      if (ANALYTICS_CONFIG.enableDebugMode) {
        console.log('📊 GA4 Event:', ...args);
      }
    } catch (error) {
      console.error('GA4 tracking error:', error);
    }
  }
};

// Set user properties
export const setUserProperties = (properties: UserProperties): void => {
  const allProperties = {
    ...DEFAULT_USER_PROPERTIES,
    ...properties,
  };

  gtag('config', ANALYTICS_CONFIG.trackingId, {
    custom_map: allProperties,
    ...ANALYTICS_CONFIG.cookieSettings,
  });

  if (ANALYTICS_CONFIG.enableDebugMode) {
    console.log('📊 User Properties Set:', allProperties);
  }
};

// Search tracking functions
export const trackSearch = (
  query: string,
  resultCount: number,
  filters?: string,
  duration?: number
): void => {
  if (!ANALYTICS_CONFIG.features.searchTracking) return;

  const params: SearchEventParams = {
    search_term: query,
    result_count: resultCount,
    event_category: 'search',
    custom_parameter_1: ANALYTICS_CONFIG.enableDebugMode ? 'debug' : 'production',
  };

  if (filters) {
    params.search_filters = filters;
  }

  if (duration !== undefined) {
    params.search_duration = duration;
  }

  gtag('event', GA_EVENTS.SEARCH, params);
};

export const trackViewSearchResults = (
  query: string,
  resultCount: number,
  page?: number,
  itemsPerPage?: number,
  totalPages?: number
): void => {
  if (!ANALYTICS_CONFIG.features.searchTracking) return;

  const params: SearchEventParams = {
    search_term: query,
    result_count: resultCount,
    event_category: 'search',
  };

  if (page !== undefined) {
    params.custom_parameter_1 = `page_${page}`;
  }

  if (itemsPerPage !== undefined && totalPages !== undefined) {
    params.custom_parameter_2 = `${itemsPerPage}_per_page`;
    params.custom_parameter_3 = `${totalPages}_total_pages`;
  }

  gtag('event', GA_EVENTS.VIEW_SEARCH_RESULTS, params);
};

export const trackNoSearchResults = (query: string, filters?: string): void => {
  if (!ANALYTICS_CONFIG.features.searchTracking) return;

  const params: SearchEventParams = {
    search_term: query,
    result_count: 0,
    event_category: 'search',
  };

  if (filters) {
    params.search_filters = filters;
  }

  gtag('event', GA_EVENTS.SEARCH_NO_RESULTS, params);
};

// Product tracking functions
const convertProductToGAItem = (product: Product, index?: number, listName?: string): GAProductItem => {
  const item: GAProductItem = {
    item_id: product.vvsnr, // Use Norwegian property name
    item_name: product.navn, // Use Norwegian property name
  };

  // Add optional properties only if they exist
  if (product.kategori) {
    item.item_category = product.kategori;
  }

  if (product.produsent) {
    item.item_brand = product.produsent;
  }

  if (product.grunnpris !== null && product.grunnpris !== undefined) {
    item.price = product.grunnpris;
  }

  if (index !== undefined) {
    item.index = index;
  }

  if (listName !== undefined) {
    item.item_list_name = listName;
  }

  item.quantity = 1; // Always set quantity to 1

  return item;
};

export const trackViewItem = (product: Product, listName?: string): void => {
  if (!ANALYTICS_CONFIG.features.productTracking) return;

  const item = convertProductToGAItem(product, undefined, listName);

  gtag('event', GA_EVENTS.VIEW_ITEM, {
    currency: ECOMMERCE_CONFIG.currency,
    value: item.price || 0,
    items: [item],
  });
};

export const trackSelectItem = (product: Product, listName?: string, index?: number): void => {
  if (!ANALYTICS_CONFIG.features.productTracking) return;

  const item = convertProductToGAItem(product, index, listName);

  gtag('event', GA_EVENTS.SELECT_ITEM, {
    item_list_name: listName || 'Product List',
    items: [item],
  });
};

export const trackViewItemList = (products: Product[], listName: string): void => {
  if (!ANALYTICS_CONFIG.features.productTracking || products.length === 0) return;

  const items = products.slice(0, 10).map((product, index) =>
    convertProductToGAItem(product, index, listName)
  );

  gtag('event', GA_EVENTS.VIEW_ITEM_LIST, {
    item_list_name: listName,
    items,
  });
};

// Filter tracking functions
export const trackFilterApply = (
  filterType: string,
  value: string,
  resultCount: number,
  previousValue?: string
): void => {
  if (!ANALYTICS_CONFIG.features.filterTracking) return;

  const params: FilterEventParams = {
    filter_type: filterType,
    filter_value: value,
    result_count: resultCount,
    event_category: 'filter',
  };

  if (previousValue) {
    params.previous_filter_value = previousValue;
  }

  gtag('event', GA_EVENTS.FILTER_APPLY, params);
};

export const trackFilterReset = (filtersReset: string[], resultCount: number): void => {
  if (!ANALYTICS_CONFIG.features.filterTracking) return;

  gtag('event', GA_EVENTS.FILTER_RESET, {
    event_category: 'filter',
    custom_parameter_1: filtersReset.join(','),
    value: resultCount,
  });
};

// Pagination tracking
export const trackPaginationChange = (
  fromPage: number,
  toPage: number,
  totalPages: number,
  itemsPerPage: number
): void => {
  if (!ANALYTICS_CONFIG.features.paginationTracking) return;

  const params: PaginationEventParams = {
    from_page: fromPage,
    to_page: toPage,
    total_pages: totalPages,
    items_per_page: itemsPerPage,
    event_category: 'navigation',
  };

  gtag('event', GA_EVENTS.PAGINATION_CHANGE, params);
};

// Authentication tracking
export const trackLogin = (method: 'azure_ad' | 'cognito'): void => {
  if (!ANALYTICS_CONFIG.features.authenticationTracking) return;

  const params: AuthEventParams = {
    method,
    event_category: 'authentication',
  };

  gtag('event', GA_EVENTS.LOGIN, params);
};

export const trackLoginSuccess = (method: 'azure_ad' | 'cognito', organizationId?: string): void => {
  if (!ANALYTICS_CONFIG.features.authenticationTracking) return;

  const params: AuthEventParams = {
    method,
    event_category: 'authentication',
  };

  if (organizationId) {
    params.organization_id = organizationId;
  }

  gtag('event', GA_EVENTS.LOGIN_SUCCESS, params);
};

export const trackLogout = (): void => {
  if (!ANALYTICS_CONFIG.features.authenticationTracking) return;

  gtag('event', GA_EVENTS.LOGOUT, {
    event_category: 'authentication',
  });
};

// Feature interaction tracking
export const trackPriceVisibilityToggle = (isVisible: boolean, isAuthenticated: boolean): void => {
  const params: PriceVisibilityEventParams = {
    is_visible: isVisible,
    is_authenticated: isAuthenticated,
    toggle_type: isVisible ? 'show' : 'hide',
    event_category: 'feature_interaction',
  };

  gtag('event', GA_EVENTS.PRICE_VISIBILITY_TOGGLE, params);
};

export const trackNOBBLinkClick = (
  vvsNumber: string,
  productName: string,
  position: number,
  listName?: string
): void => {
  if (!ANALYTICS_CONFIG.features.productTracking) return;

  const params: NOBBLinkEventParams = {
    vvs_number: vvsNumber,
    product_name: productName,
    position,
    event_category: 'external_link',
  };

  if (listName) {
    params.list_name = listName;
  }

  gtag('event', GA_EVENTS.NOBB_LINK_CLICK, params);
};

// Business intelligence tracking
export const trackCatalogStatsView = (
  totalProducts: number,
  totalSuppliers: number,
  lastUpdated?: string
): void => {
  const params: CatalogStatsEventParams = {
    total_products: totalProducts,
    total_suppliers: totalSuppliers,
    event_category: 'catalog_insights',
  };

  if (lastUpdated) {
    params.last_updated = lastUpdated;
  }

  gtag('event', GA_EVENTS.CATALOG_STATS_VIEW, params);
};

// Error tracking
export const trackError = (
  errorType: string,
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: string
): void => {
  if (!ANALYTICS_CONFIG.features.errorTracking) return;

  const params: ErrorEventParams = {
    error_type: errorType,
    error_message: message.substring(0, 150), // Limit message length
    error_severity: severity,
    event_category: 'error',
  };

  if (context) {
    params.error_context = context;
  }

  gtag('event', GA_EVENTS.ERROR_OCCURRED, params);
};