# Fix Missing Kategori Field in Search API Response

## 🎯 Problem Statement

The frontend product catalog application has a "Quick Filters" feature that includes a category dropdown filter ("Alle kategorier"). However, this dropdown is always empty because the backend API is not returning a `kategori` field in the product search response, even though category data exists in the source data.

### Current Behavior
- Frontend requests products via POST to `/search` endpoint
- Backend returns product data WITHOUT any `kategori` field
- Frontend's category filter dropdown shows only "Alle kategorier" with no actual categories
- Users cannot filter products by category

### Expected Behavior
- Backend should include a `kategori` field in each product object
- Frontend should be able to extract unique categories from products
- Category filter dropdown should show all available categories

## 📁 Repository Context

**Backend Repository**: `/home/rydesp/dev/easmith-varekatalog-backend/`
- AWS Lambda-based search API
- OpenSearch/ElasticSearch for product data
- TypeScript/Node.js implementation
- Deployed to AWS API Gateway

**Frontend Repository**: `/home/rydesp/dev/easmith-varekatalog-frontend/`
- Next.js 15 application
- Already prepared to receive and display kategori field
- Quick Filters component expects categories from API response

## 🔍 Root Cause Analysis

### Investigation Results

1. **Source Data HAS Category Information**
   - Products in the database have `hovedgruppe` (main group) field
   - Products also have `undergruppe` (subgroup) field
   - These fields contain the category data but are not being exposed in the API

2. **Backend Product Mapper Missing Kategori**
   - File: `src/lambdas/search-api/src/product-mapper.ts`
   - The `StandardizedProduct` interface doesn't include a `kategori` field
   - The `mapProductToStandardFormat` function doesn't map category data
   - Only these fields are currently mapped:
     - Basic: id, navn, produsent, lagerstatus, anbrekk, etc.
     - Security-filtered: lagerantall, grunnpris, nettopris
     - Metadata: dataCompleteness, updatedAt, nobbUrl
   - **MISSING**: kategori field entirely

3. **Frontend Already Prepared**
   - Frontend's `transformBackendProduct` function already has code to map kategori
   - Product type accepts `kategori?: string`
   - QuickFilters component has `getUniqueCategories()` function ready
   - Everything is waiting for the backend to send the data

## 🛠️ Implementation Guide

### Files to Modify

#### 1. Update Product Mapper Types
**File**: `/home/rydesp/dev/easmith-varekatalog-backend/src/lambdas/search-api/src/product-mapper.ts`

**Current StandardizedProduct interface** (lines 8-31):
```typescript
export interface StandardizedProduct {
  // Always present fields (basic product info)
  id: string;
  navn: string;
  produsent: string | null;
  lagerstatus: 'På lager' | 'Utsolgt';
  anbrekk: 'Ja' | 'Nei';
  lh: string | null;
  nobbNumber: string;
  pakningAntall: number | null;
  prisenhet: string | null;
  
  // Security-filtered fields (null when unauthorized)
  lagerantall: number | null;
  grunnpris: number | null;
  nettopris: number | null;
  
  // Additional metadata (optional fields with undefined)
  dataCompleteness?: number | undefined;
  updatedAt?: number | undefined;
  nobbUrl?: string | undefined;
  _score?: number | undefined;
  _highlights?: { [key: string]: string[] } | undefined;
}
```

**ADD** after line 18 (after `prisenhet: string | null;`):
```typescript
  kategori: string | null;
```

#### 2. Update Product Mapping Function
**File**: Same file (`product-mapper.ts`)

**Current mapProductToStandardFormat function** (lines 63-88):
```typescript
export const mapProductToStandardFormat = (product: Product): StandardizedProduct => {
  return {
    // Basic fields - always present
    id: product.VVSnr,
    navn: product.varenavn || '',
    produsent: product.leverandørNavn || null,
    lagerstatus: mapStockStatus(product.lagerstatus, product.lagerantall),
    anbrekk: mapAnbrekkStatus(product.kanAnbrekke),
    lh: product.lh || null,
    nobbNumber: product.VVSnr,
    pakningAntall: product.pakningAntall || null,
    prisenhet: product.enhet || null,
    
    // Security-filtered fields - will be set to null if unauthorized
    lagerantall: product.lagerantall != null ? product.lagerantall : null,
    grunnpris: product.grunnpris != null ? product.grunnpris : null,
    nettopris: product.nettopris != null ? product.nettopris : null,
    
    // Metadata
    dataCompleteness: product.dataCompleteness,
    updatedAt: product.updatedAt,
    nobbUrl: product.nobbUrl,
    _score: product._score,
    _highlights: product._highlights
  };
};
```

**ADD** after line 74 (after `prisenhet: product.enhet || null,`):
```typescript
    kategori: product.hovedgruppe || product.undergruppe || null,
```

This will:
- Use `hovedgruppe` (main category) as the primary source for kategori
- Fall back to `undergruppe` (subcategory) if hovedgruppe is empty
- Return null if neither field has data

### Complete Fixed Function Should Look Like:
```typescript
export const mapProductToStandardFormat = (product: Product): StandardizedProduct => {
  return {
    // Basic fields - always present
    id: product.VVSnr,
    navn: product.varenavn || '',
    produsent: product.leverandørNavn || null,
    lagerstatus: mapStockStatus(product.lagerstatus, product.lagerantall),
    anbrekk: mapAnbrekkStatus(product.kanAnbrekke),
    lh: product.lh || null,
    nobbNumber: product.VVSnr,
    pakningAntall: product.pakningAntall || null,
    prisenhet: product.enhet || null,
    kategori: product.hovedgruppe || product.undergruppe || null,  // NEW LINE
    
    // Security-filtered fields - will be set to null if unauthorized
    lagerantall: product.lagerantall != null ? product.lagerantall : null,
    grunnpris: product.grunnpris != null ? product.grunnpris : null,
    nettopris: product.nettopris != null ? product.nettopris : null,
    
    // Metadata
    dataCompleteness: product.dataCompleteness,
    updatedAt: product.updatedAt,
    nobbUrl: product.nobbUrl,
    _score: product._score,
    _highlights: product._highlights
  };
};
```

## 🧪 Testing Instructions

### 1. Compile and Build
```bash
cd /home/rydesp/dev/easmith-varekatalog-backend/src/lambdas/search-api
npm run build
```

### 2. Test Locally (if test setup exists)
```bash
npm test
```

### 3. Deploy to Development Environment
Follow the existing deployment process for the Lambda function. This typically involves:
```bash
# Package the Lambda
cd /home/rydesp/dev/easmith-varekatalog-backend
./scripts/deploy-dev.sh  # or similar deployment script
```

### 4. Verify the Fix

#### Test via API directly:
```bash
# Test search endpoint
curl -X POST "https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "terrasse",
    "pagination": {
      "limit": 5,
      "offset": 0
    }
  }'
```

**Expected Response** should now include kategori field:
```json
{
  "products": [
    {
      "id": "60038505",
      "navn": "Distanseverktøy terrasse",
      "kategori": "Verktøy",  // <-- THIS FIELD SHOULD NOW APPEAR
      "lagerstatus": "På lager",
      "anbrekk": "Nei",
      // ... other fields
    }
  ]
}
```

#### Test in Frontend:
1. Navigate to frontend: http://localhost:3000
2. Search for "terrasse" or any product
3. Check the "Alle kategorier" dropdown
4. It should now show actual categories like "Verktøy", "Byggematerialer", etc.

## 📋 Validation Checklist

- [ ] StandardizedProduct interface includes `kategori: string | null;`
- [ ] mapProductToStandardFormat maps kategori from hovedgruppe/undergruppe
- [ ] TypeScript compilation succeeds without errors
- [ ] API response includes kategori field for each product
- [ ] Frontend category dropdown shows actual categories
- [ ] No regression in existing functionality

## 🎯 Success Criteria

1. **Backend Returns Kategori**: Every product in the API response has a kategori field (can be null for products without category)
2. **Categories Visible**: Frontend's "Alle kategorier" dropdown shows actual product categories
3. **Filtering Works**: Users can select a category to filter products
4. **No Breaking Changes**: All existing functionality continues to work

## 💡 Additional Context

### Why hovedgruppe/undergruppe?
The backend data model uses Norwegian terminology:
- `hovedgruppe` = Main group/category (e.g., "Verktøy" for tools)
- `undergruppe` = Subgroup/subcategory (more specific categorization)

We prioritize hovedgruppe as it provides the most useful high-level categorization for filtering.

### Security Considerations
The kategori field is NOT security-sensitive and should be available to all users (authenticated and unauthenticated). It's basic product metadata needed for navigation and filtering.

### Performance Impact
Adding this field has minimal performance impact:
- No additional database queries needed (data already fetched)
- Small increase in response payload size (few bytes per product)
- No additional processing beyond simple field mapping

## 🚨 Common Pitfalls to Avoid

1. **Don't add kategori to security filtering** - This field should always be visible
2. **Don't forget null handling** - Use `|| null` to ensure consistent null values
3. **Check both hovedgruppe and undergruppe** - Some products may only have one
4. **Maintain backwards compatibility** - Don't remove or rename existing fields

## 📝 Post-Implementation Notes

After implementing this fix:
1. Document the kategori field in API documentation
2. Consider adding kategori to search facets/aggregations for better filtering
3. Monitor for any products with missing categories that need data cleanup
4. Consider standardizing category names if inconsistent

---

*This document contains all information needed for an AI agent to independently implement the missing kategori field in the backend API. No additional context should be required.*

*Last Updated: 2025-01-07 - Issue identified through frontend testing*