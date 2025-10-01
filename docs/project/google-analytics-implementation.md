# Google Analytics GA4 Implementation

**Production URL**: https://varekatalog.byggern.no/
**Tracking ID**: G-HTG0231TCQ
**Implementation Status**: Live and Operational
**Documentation Updated**: September 29, 2025

---

## Overview

The Varekatalog frontend application has Google Analytics 4 (GA4) fully integrated for comprehensive user behavior tracking, product interaction analytics, and business intelligence. The implementation provides detailed insights into the Byggern retail chain's digital product catalog usage patterns.

## Technology Integration

### System Architecture
- **Frontend Framework**: Next.js 15 + React 19 + TypeScript
- **Analytics Platform**: Google Analytics 4 (GA4) with Enhanced E-commerce
- **Analytics Package**: `@next/third-parties/google` (official Next.js support)
- **Authentication System**: AWS Cognito + Azure AD OIDC integration
- **Backend API**: AWS API Gateway + Lambda functions
- **Environments**: Development (852634887748) + Production (785105558045)

### Implementation Approach
- **Type Safety**: Full TypeScript implementation with strict mode compliance
- **Performance Optimized**: Client-side rendering with automatic pageview tracking
- **Privacy Compliant**: Environment-specific configuration with user consent management
- **CSP Integration**: Content Security Policy headers updated for GA4 resources

## File Structure

The analytics implementation is organized in a modular architecture:

```
/utils/analytics/
├── ga-config.ts          # GA4 configuration and environment settings
├── events.ts             # Event type definitions and interfaces
├── tracking.ts           # Core tracking functions and implementations
└── index.ts             # Public API exports and main interface

/hooks/
└── useAnalytics.ts      # React hook with memoized tracking functions

/app/
└── layout.tsx           # GoogleAnalytics component integration point
```

## Current Tracking Capabilities

### 1. Automatic Page Tracking
- **Pageview Tracking**: Automatic with Next.js App Router navigation
- **Client-side Navigation**: Single-page application route changes
- **Session Management**: User session tracking with properties
- **Cross-domain Tracking**: Configured for varekatalog.byggern.no domain

### 2. Search Analytics
```typescript
// Implemented search tracking functions
trackSearch(query, resultCount, filters, duration)
trackViewSearchResults(query, resultCount, page, itemsPerPage, totalPages)
trackNoSearchResults(query, filters)
```

**Captured Data**:
- Search queries and result counts
- Applied filters and search duration
- Pagination context and user navigation patterns
- Zero-result search patterns for UX optimization

### 3. Product Interaction Analytics
```typescript
// E-commerce enhanced tracking implementation
trackViewItem(product)
trackSelectItem(product, listName, index)
trackViewItemList(products, listName)
trackNOBBLinkClick(vvsNumber, productName, position)
```

**E-commerce Integration**:
- Product view events with Norwegian product data (VVS-nummer)
- Product selection tracking with list context
- NOBB external link click tracking
- Enhanced e-commerce item parameters (currency: NOK)

### 4. Authentication Flow Analytics
```typescript
// Authentication tracking implementation
trackLogin(method: 'azure_ad' | 'cognito')
trackLoginSuccess(method, organizationId)
trackLogout()
```

**Authentication Insights**:
- Login method tracking (primarily Azure AD)
- Organization identification for Byggern employees
- Authentication success/failure rates
- User session lifecycle management

### 5. Feature Usage Analytics
```typescript
// UI interaction tracking implementation
trackFilterApply(filterType, value, resultCount, previousValue)
trackFilterReset(filtersReset, resultCount)
trackPaginationChange(fromPage, toPage, totalPages, itemsPerPage)
trackPriceVisibilityToggle(isVisible, isAuthenticated)
```

**User Experience Metrics**:
- Filter application patterns and effectiveness
- Pagination behavior and search refinement
- Price visibility feature adoption
- Feature usage correlation with authentication status

### 6. Error Monitoring
```typescript
// Comprehensive error tracking implementation
trackError(errorType, message, severity, context)
```

**Error Categories**:
- API communication failures
- Authentication errors
- Search and filter failures
- Client-side JavaScript errors

### 7. Business Intelligence
```typescript
// Catalog engagement metrics implementation
trackCatalogStatsView(totalProducts, totalSuppliers, lastUpdated)
```

**Business Metrics**:
- Catalog health and data completeness
- Product and supplier coverage statistics
- Data freshness and update frequency tracking

## User Properties Implementation

### Global User Properties
- **Environment**: 'development' | 'production' (automatic detection)
- **User Type**: 'authenticated' | 'anonymous' (real-time updates)
- **Organization ID**: Azure AD organization identifier
- **Session Start Time**: ISO timestamp for session duration calculation

### Authentication-Specific Properties
- **Login Method**: 'azure_ad' (primary) | 'cognito' (fallback)
- **User Role**: Derived from OAuth scopes and permissions
- **Organization Context**: Byggern employee identification and department

## Event Schema Implementation

### Search Event Structure
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

### Enhanced E-commerce Product Event
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

### Content Security Policy Configuration
```javascript
// next.config.ts - Production CSP headers
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

### Privacy and Compliance Features
- **IP Anonymization**: Configured in GA4 property settings
- **Cookie Domain Control**: Restricted to varekatalog.byggern.no
- **Data Retention**: Custom retention policies for GDPR compliance
- **Consent Management**: Configurable user consent handling

## Technical Integration Points

### Root Layout Integration
```typescript
// app/layout.tsx - Production implementation
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

### Component Usage Pattern
```typescript
// Component implementation example
import { useAnalytics } from '@/hooks';

function ProductSearchComponent() {
  const analytics = useAnalytics();

  const handleProductClick = (product: Product) => {
    analytics.trackViewItem(product);
  };

  const handleSearch = (query: string, results: Product[]) => {
    analytics.trackSearch(query, results.length);
  };

  return <SearchInterface onProductClick={handleProductClick} onSearch={handleSearch} />;
}
```

### Authentication Integration
```typescript
// hooks/useAuth.ts - Automatic tracking integration
const signIn = () => {
  analytics.trackLogin('azure_ad');
  // ... authentication logic
};

const handleAuthSuccess = () => {
  analytics.trackLoginSuccess('azure_ad', organizationId);
  analytics.setUserProperties({
    user_type: 'authenticated',
    organization_id: organizationId,
  });
};
```

## Production Configuration

### Environment Variables
```bash
# Production Environment (AWS Amplify Console)
GA_TRACKING_ID=G-HTG0231TCQ
NODE_ENV=production

# Development Environment
GA_TRACKING_ID=G-HTG0231TCQ  # Same tracking ID for testing
NODE_ENV=development
```

### Feature Configuration
```typescript
// utils/analytics/ga-config.ts - Current feature flags
export const ANALYTICS_FEATURES = {
  SEARCH_TRACKING: true,
  PRODUCT_TRACKING: true,
  AUTHENTICATION_TRACKING: true,
  FILTER_TRACKING: true,
  PAGINATION_TRACKING: true,
  ERROR_TRACKING: true,
} as const;
```

### Domain Configuration
- **Production Domain**: varekatalog.byggern.no
- **Cookie Domain**: varekatalog.byggern.no
- **GA4 Property**: G-HTG0231TCQ (configured for production domain)
- **Cross-domain Tracking**: Properly configured for domain restrictions

## Monitoring and Validation

### Development Testing
- **GA4 DebugView**: Real-time event validation during development
- **Console Logging**: Detailed event debugging in development mode
- **Network Monitoring**: Request validation in browser DevTools

### Production Monitoring
- **Real-time Reports**: GA4 dashboard with live user tracking
- **Custom Events Report**: Business metric dashboard
- **Enhanced E-commerce Reports**: Product interaction analysis
- **Error Tracking**: Authentication and API failure monitoring

### Key Performance Indicators
- **User Engagement**: Search patterns, session duration, page views
- **Product Analytics**: Most viewed products, NOBB link click rates
- **Authentication Metrics**: Login success rates, user retention
- **Feature Adoption**: Filter usage, price visibility toggles
- **System Health**: Error rates, API response times

## Business Value Delivery

### Product Insights
- **Search Analytics**: Most searched Norwegian building supplies and categories
- **Product Performance**: View rates, interaction patterns, NOBB integration effectiveness
- **Supplier Analytics**: Brand preference analysis and supplier performance metrics
- **VVS-nummer Tracking**: Norwegian product code usage patterns

### User Experience Analytics
- **Authentication Patterns**: Azure AD integration success rates and user flows
- **Feature Utilization**: Filter adoption rates and search refinement behavior
- **Performance Monitoring**: Search response times and user satisfaction metrics
- **Error Analysis**: User-facing error patterns and resolution tracking

### Operational Intelligence
- **Catalog Health**: Product data completeness and coverage analysis
- **User Segmentation**: Authenticated vs anonymous behavior patterns
- **System Reliability**: Uptime monitoring and error rate analysis
- **Business Impact**: User engagement correlation with business outcomes

## Technical Specifications

### TypeScript Implementation
- **Strict Mode Compliance**: All analytics code follows TypeScript strict mode
- **Type Safety**: Complete type definitions for all event parameters
- **Interface Definitions**: Strongly typed analytics hook interface
- **Error Handling**: Type-safe error tracking with severity levels

### Performance Optimization
- **Memoized Functions**: useCallback implementation for React hook functions
- **Bundle Size**: Minimal impact with Next.js third-party optimizations
- **Lazy Loading**: GA4 script loading optimized for performance
- **Client-side Only**: No server-side tracking to maintain performance

### Norwegian Localization
- **Product Names**: Full Norwegian product name tracking
- **Category Mapping**: Norwegian building supply category structure
- **Currency**: NOK currency tracking for price analytics
- **Language Context**: Norwegian language context in all events

---

**Implementation Status**: ✅ Live and Fully Operational
**Last Updated**: September 29, 2025
**Production URL**: https://varekatalog.byggern.no/
**Tracking ID**: G-HTG0231TCQ