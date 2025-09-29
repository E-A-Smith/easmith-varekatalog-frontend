/**
 * Google Analytics Event Types and Parameters
 * TypeScript definitions for GA4 events with strict type safety
 */

// Base event parameter interface with index signature for strict mode
interface BaseEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter_1?: string;
  custom_parameter_2?: string;
  custom_parameter_3?: string;
  [key: string]: unknown; // Index signature for TypeScript strict mode
}

// Search event parameters
export interface SearchEventParams extends BaseEventParams {
  search_term: string;
  result_count: number;
  search_filters?: string;
  search_duration?: number;
}

// Product-related event parameters
export interface ProductEventParams extends BaseEventParams {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_brand?: string;
  price?: number;
  quantity?: number;
  index?: number;
  item_list_name?: string;
  currency?: string;
}

// Enhanced e-commerce item structure with proper optional properties for strict mode
export interface GAProductItem {
  item_id: string;
  item_name: string;
  item_category?: string | undefined;
  item_brand?: string | undefined;
  price?: number | undefined;
  quantity?: number | undefined;
  index?: number | undefined;
  item_list_name?: string | undefined;
}

// Filter event parameters
export interface FilterEventParams extends BaseEventParams {
  filter_type: string;
  filter_value: string;
  previous_filter_value?: string;
  result_count: number;
}

// Pagination event parameters
export interface PaginationEventParams extends BaseEventParams {
  from_page: number;
  to_page: number;
  total_pages: number;
  items_per_page: number;
}

// Authentication event parameters
export interface AuthEventParams extends BaseEventParams {
  method: 'azure_ad' | 'cognito';
  organization_id?: string;
}

// Error event parameters
export interface ErrorEventParams extends BaseEventParams {
  error_type: string;
  error_message: string;
  error_severity: 'low' | 'medium' | 'high' | 'critical';
  error_context?: string;
}

// Price visibility event parameters
export interface PriceVisibilityEventParams extends BaseEventParams {
  is_visible: boolean;
  is_authenticated: boolean;
  toggle_type: 'show' | 'hide';
}

// NOBB link click parameters
export interface NOBBLinkEventParams extends BaseEventParams {
  vvs_number: string;
  product_name: string;
  position: number;
  list_name?: string;
}

// Catalog stats event parameters
export interface CatalogStatsEventParams extends BaseEventParams {
  total_products: number;
  total_suppliers: number;
  last_updated?: string;
}

// User properties interface
export interface UserProperties {
  user_type?: 'authenticated' | 'anonymous';
  organization_id?: string;
  environment?: 'development' | 'production';
  session_start_time?: string;
  application_name?: string;
  application_version?: string;
  [key: string]: string | number | boolean | undefined;
}

// GA4 Event types enumeration
export const GA_EVENTS = {
  // Standard GA4 events
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  VIEW_SEARCH_RESULTS: 'view_search_results',
  VIEW_ITEM: 'view_item',
  VIEW_ITEM_LIST: 'view_item_list',
  SELECT_ITEM: 'select_item',
  LOGIN: 'login',

  // Custom events
  SEARCH_NO_RESULTS: 'search_no_results',
  FILTER_APPLY: 'filter_apply',
  FILTER_RESET: 'filter_reset',
  PAGINATION_CHANGE: 'pagination_change',
  PRICE_VISIBILITY_TOGGLE: 'price_visibility_toggle',
  NOBB_LINK_CLICK: 'nobb_link_click',
  CATALOG_STATS_VIEW: 'catalog_stats_view',
  LOGIN_SUCCESS: 'login_success',
  LOGOUT: 'logout',
  ERROR_OCCURRED: 'error_occurred',
} as const;

export type GAEventName = typeof GA_EVENTS[keyof typeof GA_EVENTS];