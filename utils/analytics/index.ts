/**
 * Analytics Module - Public API
 * Exports all analytics functionality with TypeScript strict mode compliance
 */

// Configuration exports
export { GA_TRACKING_ID, ANALYTICS_CONFIG, DEFAULT_USER_PROPERTIES, ECOMMERCE_CONFIG } from './ga-config';

// Event type exports
export type {
  SearchEventParams,
  ProductEventParams,
  GAProductItem,
  FilterEventParams,
  PaginationEventParams,
  AuthEventParams,
  ErrorEventParams,
  PriceVisibilityEventParams,
  NOBBLinkEventParams,
  CatalogStatsEventParams,
  UserProperties,
  GAEventName,
} from './events';

export { GA_EVENTS } from './events';

// Tracking function exports
export {
  setUserProperties,
  trackSearch,
  trackViewSearchResults,
  trackNoSearchResults,
  trackViewItem,
  trackSelectItem,
  trackViewItemList,
  trackFilterApply,
  trackFilterReset,
  trackPaginationChange,
  trackLogin,
  trackLoginSuccess,
  trackLogout,
  trackPriceVisibilityToggle,
  trackNOBBLinkClick,
  trackCatalogStatsView,
  trackError,
} from './tracking';