/**
 * Analytics Hook for Varekatalog
 * React hook providing convenient access to all analytics functions
 */

'use client';

import { useCallback } from 'react';
import {
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
  UserProperties,
} from '@/utils/analytics';
import type { Product } from '@/types/product';

export interface AnalyticsHook {
  // User properties
  setUserProperties: (properties: UserProperties) => void;

  // Search tracking
  trackSearch: (query: string, resultCount: number, filters?: string, duration?: number) => void;
  trackViewSearchResults: (
    query: string,
    resultCount: number,
    page?: number,
    itemsPerPage?: number,
    totalPages?: number
  ) => void;
  trackNoSearchResults: (query: string, filters?: string) => void;

  // Product tracking
  trackViewItem: (product: Product, listName?: string) => void;
  trackSelectItem: (product: Product, listName?: string, index?: number) => void;
  trackViewItemList: (products: Product[], listName: string) => void;

  // Filter tracking
  trackFilterApply: (
    filterType: string,
    value: string,
    resultCount: number,
    previousValue?: string
  ) => void;
  trackFilterReset: (filtersReset: string[], resultCount: number) => void;

  // Navigation tracking
  trackPaginationChange: (
    fromPage: number,
    toPage: number,
    totalPages: number,
    itemsPerPage: number
  ) => void;

  // Authentication tracking
  trackLogin: (method: 'azure_ad' | 'cognito') => void;
  trackLoginSuccess: (method: 'azure_ad' | 'cognito', organizationId?: string) => void;
  trackLogout: () => void;

  // Feature interaction tracking
  trackPriceVisibilityToggle: (isVisible: boolean, isAuthenticated: boolean) => void;
  trackNOBBLinkClick: (
    vvsNumber: string,
    productName: string,
    position: number,
    listName?: string
  ) => void;

  // Business intelligence tracking
  trackCatalogStatsView: (
    totalProducts: number,
    totalSuppliers: number,
    lastUpdated?: string
  ) => void;

  // Error tracking
  trackError: (
    errorType: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    context?: string
  ) => void;
}

export const useAnalytics = (): AnalyticsHook => {
  // Memoize all tracking functions to prevent unnecessary re-renders
  const memoizedSetUserProperties = useCallback((properties: UserProperties) => {
    setUserProperties(properties);
  }, []);

  const memoizedTrackSearch = useCallback(
    (query: string, resultCount: number, filters?: string, duration?: number) => {
      trackSearch(query, resultCount, filters, duration);
    },
    []
  );

  const memoizedTrackViewSearchResults = useCallback(
    (
      query: string,
      resultCount: number,
      page?: number,
      itemsPerPage?: number,
      totalPages?: number
    ) => {
      trackViewSearchResults(query, resultCount, page, itemsPerPage, totalPages);
    },
    []
  );

  const memoizedTrackNoSearchResults = useCallback((query: string, filters?: string) => {
    trackNoSearchResults(query, filters);
  }, []);

  const memoizedTrackViewItem = useCallback((product: Product, listName?: string) => {
    trackViewItem(product, listName);
  }, []);

  const memoizedTrackSelectItem = useCallback(
    (product: Product, listName?: string, index?: number) => {
      trackSelectItem(product, listName, index);
    },
    []
  );

  const memoizedTrackViewItemList = useCallback((products: Product[], listName: string) => {
    trackViewItemList(products, listName);
  }, []);

  const memoizedTrackFilterApply = useCallback(
    (filterType: string, value: string, resultCount: number, previousValue?: string) => {
      trackFilterApply(filterType, value, resultCount, previousValue);
    },
    []
  );

  const memoizedTrackFilterReset = useCallback((filtersReset: string[], resultCount: number) => {
    trackFilterReset(filtersReset, resultCount);
  }, []);

  const memoizedTrackPaginationChange = useCallback(
    (fromPage: number, toPage: number, totalPages: number, itemsPerPage: number) => {
      trackPaginationChange(fromPage, toPage, totalPages, itemsPerPage);
    },
    []
  );

  const memoizedTrackLogin = useCallback((method: 'azure_ad' | 'cognito') => {
    trackLogin(method);
  }, []);

  const memoizedTrackLoginSuccess = useCallback(
    (method: 'azure_ad' | 'cognito', organizationId?: string) => {
      trackLoginSuccess(method, organizationId);
    },
    []
  );

  const memoizedTrackLogout = useCallback(() => {
    trackLogout();
  }, []);

  const memoizedTrackPriceVisibilityToggle = useCallback(
    (isVisible: boolean, isAuthenticated: boolean) => {
      trackPriceVisibilityToggle(isVisible, isAuthenticated);
    },
    []
  );

  const memoizedTrackNOBBLinkClick = useCallback(
    (vvsNumber: string, productName: string, position: number, listName?: string) => {
      trackNOBBLinkClick(vvsNumber, productName, position, listName);
    },
    []
  );

  const memoizedTrackCatalogStatsView = useCallback(
    (totalProducts: number, totalSuppliers: number, lastUpdated?: string) => {
      trackCatalogStatsView(totalProducts, totalSuppliers, lastUpdated);
    },
    []
  );

  const memoizedTrackError = useCallback(
    (
      errorType: string,
      message: string,
      severity: 'low' | 'medium' | 'high' | 'critical',
      context?: string
    ) => {
      trackError(errorType, message, severity, context);
    },
    []
  );

  return {
    setUserProperties: memoizedSetUserProperties,
    trackSearch: memoizedTrackSearch,
    trackViewSearchResults: memoizedTrackViewSearchResults,
    trackNoSearchResults: memoizedTrackNoSearchResults,
    trackViewItem: memoizedTrackViewItem,
    trackSelectItem: memoizedTrackSelectItem,
    trackViewItemList: memoizedTrackViewItemList,
    trackFilterApply: memoizedTrackFilterApply,
    trackFilterReset: memoizedTrackFilterReset,
    trackPaginationChange: memoizedTrackPaginationChange,
    trackLogin: memoizedTrackLogin,
    trackLoginSuccess: memoizedTrackLoginSuccess,
    trackLogout: memoizedTrackLogout,
    trackPriceVisibilityToggle: memoizedTrackPriceVisibilityToggle,
    trackNOBBLinkClick: memoizedTrackNOBBLinkClick,
    trackCatalogStatsView: memoizedTrackCatalogStatsView,
    trackError: memoizedTrackError,
  };
};