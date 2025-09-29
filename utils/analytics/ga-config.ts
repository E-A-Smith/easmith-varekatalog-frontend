/**
 * Google Analytics Configuration for Varekatalog
 * Environment-specific settings and tracking configuration
 */

// GA4 Tracking ID (same for dev and prod for testing purposes)
export const GA_TRACKING_ID = 'G-HTG0231TCQ';

// Environment detection
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

// Analytics configuration
export const ANALYTICS_CONFIG = {
  trackingId: GA_TRACKING_ID,
  enableAnalytics: true, // Can be controlled via environment variable
  enableDebugMode: IS_DEVELOPMENT,
  cookieDomain: IS_PRODUCTION ? 'varekatalog.byggern.no' : 'localhost',

  // Cookie configuration for privacy compliance
  cookieSettings: {
    cookie_expires: 63072000, // 2 years in seconds
    cookie_update: true,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  },

  // Feature flags for different tracking capabilities
  features: {
    searchTracking: true,
    productTracking: true,
    authenticationTracking: true,
    filterTracking: true,
    paginationTracking: true,
    errorTracking: true,
    performanceTracking: true,
  },
} as const;

// Default user properties for all sessions
export const DEFAULT_USER_PROPERTIES = {
  environment: IS_PRODUCTION ? 'production' : 'development',
  session_start_time: new Date().toISOString(),
  application_name: 'varekatalog',
  application_version: '1.0.0',
} as const;

// GA4 Enhanced E-commerce parameters
export const ECOMMERCE_CONFIG = {
  currency: 'NOK',
  defaultItemCategory: 'Building Supplies',
  defaultItemBrand: 'Unknown',
} as const;