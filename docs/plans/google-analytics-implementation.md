# Google Analytics Implementation Plan for Varekatalog Frontend

**Version**: 1.0
**Date**: September 29, 2025
**Tracking ID**: G-HTG0231TCQ
**Production URL**: https://varekatalog.byggern.no/
**Implementation Status**: ✅ COMPLETED

---

## Overview

This document outlines the comprehensive Google Analytics GA4 implementation for the Varekatalog frontend application. The implementation provides detailed user behavior tracking, product interaction analytics, and business intelligence for the Byggern retail chain's digital product catalog.

## Architecture Integration

### System Context
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Authentication**: AWS Cognito + Azure AD OIDC
- **API**: AWS API Gateway + Lambda
- **Analytics**: Google Analytics 4 (GA4)
- **Environment**: DEV (852634887748) + PROD (785105558045)

### Implementation Approach
- **Next.js Official Support**: Uses `@next/third-parties/google` package
- **Type Safety**: Full TypeScript implementation with strict types
- **Privacy Compliant**: Environment-specific configuration with user consent
- **Performance Optimized**: Client-side rendering with automatic pageview tracking

## File Structure

```
/utils/analytics/
├── ga-config.ts          # GA configuration and environment settings
├── events.ts             # Event types and interface definitions
├── tracking.ts           # Core tracking functions
└── index.ts             # Public API exports

/hooks/
└── useAnalytics.ts      # React hook for convenient tracking

/app/
└── layout.tsx           # GoogleAnalytics component integration
```

## Core Features Implemented

### 1. **Automatic Tracking**
- ✅ Pageview tracking (automatic with Next.js App Router)
- ✅ Client-side navigation tracking
- ✅ Session tracking with user properties

### 2. **Search Analytics**
```typescript
// Search initiation and results
trackSearch(query, resultCount, filters, duration)
trackViewSearchResults(query, resultCount, page, itemsPerPage, totalPages)
trackNoSearchResults(query, filters)
```

### 3. **Product Interaction Analytics**
```typescript
// E-commerce enhanced tracking
trackViewItem(product)
trackSelectItem(product, listName, index)
trackViewItemList(products, listName)
trackNOBBLinkClick(vvsNumber, productName, position)
```

### 4. **Authentication Analytics**
```typescript
// Authentication flow tracking
trackLogin(method: 'azure_ad' | 'cognito')
trackLoginSuccess(method, organizationId)
trackLogout()
```

### 5. **Feature Usage Analytics**
```typescript
// UI feature interactions
trackFilterApply(filterType, value, resultCount, previousValue)
trackFilterReset(filtersReset, resultCount)
trackPaginationChange(fromPage, toPage, totalPages, itemsPerPage)
trackPriceVisibilityToggle(isVisible, isAuthenticated)
```

### 6. **Error Tracking**
```typescript
// Comprehensive error monitoring
trackError(errorType, message, severity, context)
```

### 7. **Business Intelligence**
```typescript
// Catalog engagement metrics
trackCatalogStatsView(totalProducts, totalSuppliers, lastUpdated)
```

## User Properties Tracking

### Global Properties
- **Environment**: 'development' | 'production'
- **User Type**: 'authenticated' | 'anonymous'
- **Organization ID**: Azure AD organization identifier
- **Session Start Time**: ISO timestamp

### Authentication Context
- **Login Method**: 'azure_ad' (primary) | 'cognito'
- **User Role**: Based on OAuth scopes
- **Organization Context**: Byggern employee identification

## Event Schema Examples

### Search Event
```json
{
  "event_name": "search",
  "parameters": {
    "search_term": "multislipepapir",
    "result_count": 15,
    "search_filters": "supplier:STANLEY,category:Verktøy",
    "search_duration": 1250,
    "custom_parameter_1": "production",
    "custom_parameter_2": "authenticated"
  }
}
```

### Product View Event (E-commerce)
```json
{
  "event_name": "view_item",
  "parameters": {
    "currency": "NOK",
    "value": 25.81,
    "items": [{
      "item_id": "54327454",
      "item_name": "Multislipepapir 40k sta31432 5 ark",
      "item_category": "Verktøy",
      "item_brand": "STANLEY",
      "price": 25.81,
      "quantity": 1,
      "index": 0,
      "item_list_name": "Search Results"
    }]
  }
}
```

### Filter Application Event
```json
{
  "event_name": "filter_apply",
  "parameters": {
    "filter_type": "supplier",
    "filter_value": "STANLEY",
    "previous_filter_value": "Alle leverandører",
    "result_count": 47,
    "event_category": "filter"
  }
}
```

## Security Implementation

### Content Security Policy
```javascript
// next.config.ts - Updated CSP
"script-src 'self' 'unsafe-eval' 'unsafe-inline'
  https://www.googletagmanager.com
  https://www.google-analytics.com
  https://*.google-analytics.com"

"connect-src 'self' [existing domains]
  https://www.google-analytics.com
  https://*.google-analytics.com"

"img-src 'self' data: https:
  https://www.google-analytics.com
  https://*.google-analytics.com"
```

### Privacy Features
- **IP Anonymization**: Configured in GA4 property
- **Cookie Control**: Configurable consent management
- **Data Retention**: Custom retention policies
- **GDPR Compliance**: EU user data protection

## Technical Integration Points

### 1. **Root Layout Integration**
```typescript
// app/layout.tsx
import { GoogleAnalytics } from "@next/third-parties/google";
import { GA_TRACKING_ID } from '@/utils/analytics';

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      <body>{children}</body>
      <GoogleAnalytics gaId={GA_TRACKING_ID} />
    </html>
  );
}
```

### 2. **Component Usage**
```typescript
// Any component
import { useAnalytics } from '@/hooks';

function ProductComponent() {
  const analytics = useAnalytics();

  const handleProductClick = (product: Product) => {
    analytics.trackViewItem(product);
  };

  return <ProductCard onClick={handleProductClick} />;
}
```

### 3. **Authentication Integration**
```typescript
// hooks/useAuth.ts - Automatic tracking
const signIn = () => {
  trackLogin('azure_ad');
  // ... existing logic
};

const handleAuthSuccess = () => {
  trackLoginSuccess('azure_ad', organizationId);
  setUserProperties({
    user_type: 'authenticated',
    organization_id: organizationId,
  });
};
```

## Production URL Configuration

### Domain Setup
- **Production URL**: https://varekatalog.byggern.no/ ✅ CONFIRMED
- **Cookie Domain**: varekatalog.byggern.no
- **GA4 Property**: G-HTG0231TCQ configured for production domain
- **CSP Headers**: Updated to allow GA4 scripts from production URL

### URL Tracking Validation
- ✅ Automatic pageview tracking for production domain
- ✅ Cookie domain properly configured for varekatalog.byggern.no
- ✅ User property tracking includes environment detection
- ✅ Cross-domain tracking properly configured

## Configuration Management

### Environment Variables
```bash
# Production
GA_TRACKING_ID=G-HTG0231TCQ
NODE_ENV=production

# Development
GA_TRACKING_ID=G-HTG0231TCQ  # Same for testing
NODE_ENV=development
```

### Feature Flags
```typescript
// utils/analytics/ga-config.ts
export const ANALYTICS_FEATURES = {
  SEARCH_TRACKING: true,
  PRODUCT_TRACKING: true,
  AUTHENTICATION_TRACKING: true,
  FILTER_TRACKING: true,
  PAGINATION_TRACKING: true,
  ERROR_TRACKING: true,
} as const;
```

## Monitoring & Validation

### 1. **Development Testing**
- **GA4 DebugView**: Real-time event validation
- **Console Logging**: Detailed event debugging
- **Network Tab**: Request monitoring

### 2. **Production Monitoring**
- **Real-time Reports**: GA4 dashboard monitoring
- **Custom Events Report**: Business metric tracking
- **E-commerce Reports**: Product interaction analysis

### 3. **Key Metrics Dashboard**
- **User Engagement**: Search patterns and product views
- **Authentication Flow**: Login success rates and errors
- **Feature Adoption**: Filter usage and price visibility
- **Error Monitoring**: Authentication and API failures

## Business Value

### 1. **Product Insights**
- **Search Performance**: Most searched products and categories
- **Product Engagement**: View rates and NOBB link clicks
- **Supplier Analytics**: Brand preference and performance

### 2. **User Experience**
- **Authentication Analytics**: Login patterns and failure rates
- **Feature Usage**: Filter adoption and pagination behavior
- **Performance Monitoring**: Search response times and errors

### 3. **Business Intelligence**
- **Catalog Health**: Product coverage and data completeness
- **User Segmentation**: Authenticated vs anonymous behavior
- **Operational Metrics**: System reliability and user satisfaction

## Implementation Status

✅ **COMPLETED FEATURES**:
- [x] Package installation and setup
- [x] Core analytics architecture
- [x] GoogleAnalytics component integration
- [x] React hook implementation
- [x] Search and product tracking
- [x] Authentication analytics
- [x] Filter and pagination tracking
- [x] Error monitoring
- [x] CSP configuration
- [x] TypeScript type safety
- [x] Documentation

## Future Enhancements

### Phase 2 Considerations
1. **Advanced E-commerce**: Purchase funnel tracking
2. **Custom Dimensions**: Additional business metrics
3. **A/B Testing**: Feature experiment tracking
4. **Real-time Alerts**: Critical error notifications
5. **Data Studio Integration**: Advanced reporting dashboards

## Maintenance

### Regular Tasks
1. **Monthly**: Review tracking accuracy and data quality
2. **Quarterly**: Update event definitions for new features
3. **Annually**: Review privacy compliance and data retention

### Monitoring Checklist
- [ ] GA4 data collection active
- [ ] Event parameters correctly structured
- [ ] User properties updating correctly
- [ ] Error tracking capturing issues
- [ ] CSP headers allowing GA resources

---

**Implementation Team**: Claude Code (Frontend Implementation Specialist)
**Documentation Date**: September 29, 2025
**Next Review**: December 29, 2025