# Double Transformation Bug Pattern - Troubleshooting Guide

**Document Version**: 1.0  
**Date**: September 6, 2025  
**Status**: Active  

## Overview

This document describes a critical bug pattern that occurred in the Varekatalog frontend where data transformations were applied twice, causing incorrect values to be displayed to users. Understanding this pattern will help prevent and quickly diagnose similar issues in the future.

## Incident Summary

### The Problem
Product 23631013's `anbrekk` field was displaying `"Nei"` in the frontend, but the user expected it to show `"Ja"` based on the source data (`kanAnbrekke: "1"` in DynamoDB).

### Root Cause
A **double transformation** was occurring:
1. **Backend transformation** (correct): `kanAnbrekke: "1"` → `anbrekk: "Ja"`
2. **Frontend transformation** (incorrect): `anbrekk: "Ja"` → `"Ja" === "1" ? "Ja" : "Nei"` → `"Nei"`

## Data Flow Analysis

### Expected Data Flow
```
DynamoDB → Backend API → Frontend API Client → UI Component
"1"     →    "Ja"     →       "Ja"         →    "Ja" ✅
```

### Actual Broken Data Flow  
```
DynamoDB → Backend API → Frontend API Client → UI Component
"1"     →    "Ja"     →   "Ja" → "Nei"      →   "Nei" ❌
```

## Technical Details

### Backend Implementation (Correct)
**File**: `/src/lambdas/search-api/src/product-mapper.ts`  
**Line**: 57

```typescript
const mapAnbrekkStatus = (kanAnbrekke?: string): 'Ja' | 'Nei' => {
  return kanAnbrekke === '1' || kanAnbrekke === 'true' ? 'Ja' : 'Nei';
};
```

### Frontend Implementation (Buggy)
**File**: `/utils/api.ts`  
**Line**: 43 (before fix)

```typescript
// ❌ WRONG: Double transformation
anbrekk: backendProduct.anbrekk === '1' ? 'Ja' : 'Nei',
```

The frontend was expecting raw database values (`'1'`) but the backend was already providing user-friendly values (`'Ja'`).

### Frontend Implementation (Fixed)
**File**: `/utils/api.ts`  
**Line**: 43 (after fix)

```typescript
// ✅ CORRECT: Pass through backend value
anbrekk: (backendProduct.anbrekk === 'Ja' || backendProduct.anbrekk === 'Nei') 
  ? backendProduct.anbrekk 
  : 'Nei',
```

## How to Identify This Pattern

### Symptoms
1. **Data appears incorrect in UI** despite being correct in database
2. **API responses show correct values** when tested directly  
3. **Frontend receives correct data** but displays wrong values
4. **Boolean/enum fields are most susceptible** to this pattern

### Diagnostic Steps

#### Step 1: Trace the Data Flow
```bash
# 1. Check source data in database
aws dynamodb scan --table-name TABLE_NAME \
  --filter-expression "ID = :id" \
  --expression-attribute-values '{":id":{"S":"PRODUCT_ID"}}'

# 2. Check backend API response
curl -X POST "https://api-url/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "PRODUCT_ID"}' | jq '.products[0].FIELD_NAME'

# 3. Check frontend transformation
# Look for transformation logic in utils/api.ts or similar files
```

#### Step 2: Identify Transformation Points
1. **Database → Backend**: Check mapper files (e.g., `product-mapper.ts`)
2. **Backend → Frontend**: Check API client transformation (e.g., `api.ts`)
3. **Frontend → UI**: Check component prop processing

#### Step 3: Look for Multiple Transformations
Search for similar transformation logic:
```bash
# Search for field transformation patterns
grep -r "fieldName.*===.*?" src/
grep -r "transform.*Product" src/
grep -r "map.*Status" src/
```

## Prevention Strategies

### 1. Single Source of Truth Principle
- **Rule**: Each data transformation should happen in exactly ONE place
- **Best Practice**: Backend handles business logic transformations, frontend passes through

### 2. API Contract Documentation
Document what format each API returns:

```typescript
// Document expected API response format
interface ProductApiResponse {
  id: string;
  navn: string;
  anbrekk: 'Ja' | 'Nei'; // ← Already transformed by backend
  lagerstatus: 'På lager' | 'Utsolgt'; // ← Already transformed by backend
}
```

### 3. Type Safety
Use strict TypeScript types to catch mismatches:

```typescript
// Use specific types instead of `string`
type AnbrekkStatus = 'Ja' | 'Nei';
type LagerStatus = 'På lager' | 'Utsolgt' | 'NA';
```

### 4. Integration Testing
Test the complete data flow end-to-end:

```typescript
describe('Product data flow', () => {
  it('should preserve anbrekk value from API to UI', async () => {
    // Mock API response
    mockApi.mockResolvedValue({ anbrekk: 'Ja' });
    
    // Render component
    const component = render(<ProductTable />);
    
    // Verify final displayed value
    expect(component.getByText('Ja')).toBeInTheDocument();
  });
});
```

## Quick Fix Checklist

When you encounter similar issues:

- [ ] **Identify transformation points** - Where is data being modified?
- [ ] **Check for duplicate logic** - Is the same transformation happening twice?
- [ ] **Verify API contracts** - What format does the API actually return?
- [ ] **Test with real data** - Use actual API responses, not assumptions
- [ ] **Update type definitions** - Ensure types match actual API responses
- [ ] **Add integration tests** - Prevent regression

## Common Fields Susceptible to This Pattern

Based on this codebase, watch out for similar issues with:

- **Boolean mappings**: `kanAnbrekke` ('1' ↔ 'Ja'), `kanPakkeOpp` ('1' ↔ 'Ja')  
- **Status enums**: `lagerstatus` (numbers ↔ 'På lager'/'Utsolgt')
- **Category mappings**: Product categories (IDs ↔ display names)
- **Price formatting**: Raw cents ↔ formatted currency
- **Date formats**: Timestamps ↔ localized date strings

## Related Files

- **Backend mapper**: `/src/lambdas/search-api/src/product-mapper.ts`
- **Frontend API client**: `/utils/api.ts`  
- **Type definitions**: `/types/product.ts`
- **Original bug report**: `/docs/project/fix-anbrekk-field-issue.md`

## Contact & Escalation

If you encounter a similar issue:

1. **Check CloudWatch Logs**: `/aws/lambda/varekatalog-search-api-dev`
2. **Test API directly**: Use curl/Postman to verify backend responses
3. **Review this document**: Follow the diagnostic steps above
4. **Document the solution**: Update this guide with new patterns discovered

---

**Tags**: #data-transformation #bug-pattern #frontend #backend #api-integration  
**Last Updated**: September 6, 2025  
**Next Review**: December 6, 2025