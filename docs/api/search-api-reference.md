# Search API Reference

## Overview

The Varekatalog Search API provides OpenSearch-powered product search functionality for Norwegian building supplies. The API uses a progressive enhancement approach with both authenticated and public access modes.

## Base Configuration

- **API Gateway URL**: `https://ruy0f0pr6j.execute-api.eu-west-1.amazonaws.com/dev`
- **Frontend Proxy**: `/api` (via Next.js API routes to avoid CORS)
- **OpenSearch Domain**: `eas-dev-varekatalog`
- **OpenSearch Index**: `eas-varekatalog-products`
- **Authentication**: Optional JWT Bearer token (Cognito OAuth 2.0 + PKCE)

## Backend Data Structure

The API works with this backend product format which gets transformed to frontend format:

```typescript
interface BackendProduct {
  id: string;
  navn: string;            // Product name
  vvsnr: string;           // VVS number
  anbrekk: string;         // "Ja"/"Nei" - Partial quantity availability
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
```

## Endpoints

### 1. Product Search

**Endpoint**: `POST /search`
**Authentication**: Optional (JWT Bearer token for price/inventory data)

#### Request Body

```json
{
  "query": "string",           // Search term (required)
  "limit": 50,                // Results per page (default: 50, max: 50)
  "offset": 0,                // Skip results (for pagination)
  "filters": {                // Optional filters object
    "kategori": "string",     // Category filter
    "lagerstatus": "string",  // Stock status filter
    "produsent": "string",    // Supplier filter
    "anbrekk": "string"       // Partial quantity filter
  },
  "sort": {                   // Optional sort configuration
    "field": "_score",        // Sort field
    "order": "desc"           // Sort order
  }
}
```

#### Response Structure

The API returns products after backend transformation. The response structure varies but typically includes:

```json
{
  "products": [              // Or "results" field depending on backend response
    {
      "id": "string",
      "navn": "Product Name",
      "vvsnr": "12345678",
      "lagerstatus": "På lager", // "På lager", "Utsolgt", "NA"
      "anbrekk": "Nei",          // "Ja" or "Nei"
      "lh": "LH123456",          // Can be null if not available
      "nobbNumber": "12345678",
      "pakningAntall": 1,
      "prisenhet": "STK",
      "lagerantall": 150,        // null when not authenticated
      "grunnpris": 299.99,       // null when not authenticated
      "nettopris": 269.99,       // null when not authenticated
      "produsent": "Supplier Name", // Mapped from numeric codes
      "produsentKode": "12345",     // Original numeric code if applicable
      "kategori": "VVS",
      "beskrivelse": "Product description",
      "ean": "1234567890123",
      "enhet": "STK",
      "pris": {                     // Legacy format for compatibility
        "salgspris": 269.99,
        "valuta": "NOK",
        "inkludertMva": true
      }
    }
  ],
  "success": true,            // Optional success indicator
  "total": 150,              // Optional total count
  "responseTime": "245ms"    // Optional performance metric
}
```

### 2. Get Single Product

**Endpoint**: `GET /products/{id}`
**Authentication**: Optional

Get detailed information about a specific product by ID.

#### Response

Same structure as individual product in search results above.

### 3. Health Check

**Endpoint**: `GET /health`
**Authentication**: None

Basic health check for API connectivity.

#### Response

```json
{
  "status": "healthy"
}
```

## Authentication & Authorization

### Progressive Enhancement Model

The API supports progressive enhancement:

1. **Public Access**: Basic product info (name, VVS number, category, description)
2. **Authenticated Access**: Price and inventory data (grunnpris, nettopris, lagerantall)

### Authenticated Fields

These fields are **null** for unauthenticated requests:
- `lagerantall` (stock quantity)
- `grunnpris` (base price)
- `nettopris` (net price)

### Stock Status Calculation

The frontend calculates `lagerstatus` from `lagerantall`:
- `lagerantall === null` → `"NA"` (not authenticated)
- `lagerantall > 0` → `"På lager"`
- `lagerantall === 0` → `"Utsolgt"`

### JWT Token Usage

```typescript
// Include JWT token for authenticated requests
const headers = {
  'Authorization': `Bearer ${accessToken}`
};
```

## Frontend Integration

### API Client Usage

```typescript
import { apiClient } from '@/utils/api';

// Search products
const query = {
  søketekst: 'rør',
  sideStørrelse: 10,
  side: 1,
  sortering: 'relevans'
};

const products = await apiClient.searchProducts(query, accessToken);
```

### Error Handling

The API client handles these OpenSearch-specific errors:

```typescript
// Common error patterns
if (error.message.includes('index_not_found_exception')) {
  // OpenSearch index eas-varekatalog-products not found
}

if (error.message.includes('illegal_argument_exception')) {
  // OpenSearch configuration error (e.g., fielddata issue)
}

if (error.message.includes('search_phase_execution_exception')) {
  // Invalid search parameters
}
```

## Data Transformations

### Supplier Name Mapping

The API automatically maps numeric supplier codes to display names:

```typescript
// Backend: produsent: "12345" (numeric code)
// Frontend: produsent: "Supplier Display Name"
//           produsentKode: "12345" (original code preserved)
```

### LH Field Handling

The `lh` field (Løvenskjold number) requires special handling:

```typescript
// Valid LH values are non-empty, non-zero strings
// Empty or "0" values are converted to null
lh: (backendProduct.lh && backendProduct.lh.trim() !== "0")
  ? backendProduct.lh.trim()
  : null
```

## Performance Considerations

### Request Limits

- **Maximum results per request**: 50 products
- **Pagination**: Use `offset` for subsequent pages
- **Timeout**: 10 seconds per request

### Optimization Tips

1. **Use specific search terms**: Avoid single-character searches
2. **Apply filters**: Reduce result sets with category/status filters
3. **Pagination**: Don't request large result sets at once
4. **Caching**: Frontend implements client-side result caching

## Troubleshooting

### Common Issues

1. **Empty Search Results**
   - Check OpenSearch index status
   - Verify search query syntax
   - Confirm API Gateway connectivity

2. **Missing Price/Inventory Data**
   - Verify JWT token is valid and not expired
   - Check required OAuth scopes (`varekatalog/prices`, `varekatalog/inventory`)
   - Confirm user has appropriate permissions

3. **LH Field Issues**
   - LH field may be null/empty for some products
   - This is expected behavior - not all products have LH codes
   - Frontend handles gracefully with null checks

4. **Supplier Name Display**
   - Numeric codes are automatically mapped to display names
   - Original codes preserved in `produsentKode` field
   - Unmapped codes display as-is

### API Response Debugging

Enable debug logging in development:

```typescript
// Set environment variable for API debug logs
process.env.NEXT_PUBLIC_API_DEBUG = 'true';
```

This will log:
- Request payloads
- Response data
- Transformation steps
- Error details

## Environment Configuration

### Local Development

Frontend connects through Next.js API proxy:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=/api
```

### Direct Backend Access

For testing direct backend connection, use `NEXT_PUBLIC_EXTERNAL_API_URL`:

```bash
# .env.local
NEXT_PUBLIC_EXTERNAL_API_URL=https://ruy0f0pr6j.execute-api.eu-west-1.amazonaws.com/dev
```

**Note**: The API route will use `NEXT_PUBLIC_EXTERNAL_API_URL` first, then fall back to `NEXT_PUBLIC_API_BASE_URL`. Direct backend access may have CORS restrictions in browser environments.