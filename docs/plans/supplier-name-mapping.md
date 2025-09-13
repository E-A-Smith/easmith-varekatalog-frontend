# Supplier Name Mapping Implementation Plan

## Overview
Replace 5-digit supplier codes with human-readable company names in the Leverandør quick filter dropdown, using the mapping data from `lovenskiold-supplier-mapping.json`.

## Context
- Current implementation displays 5-digit supplier codes (e.g., "10000", "10005") in the filter dropdown
- The mapping file provides 133 suppliers with 100% match rate from Løvenskiold's internal system
- Users would benefit from seeing company names (e.g., "Teknikk AS", "Luna Norge AS") instead of codes

## Implementation Strategy

### Data Source
- **File**: `docs/project/lovenskiold-supplier-mapping.json`
- **Structure**: Maps numeric codes to company names and web catalog IDs
- **Coverage**: 227 suppliers with 100% match rate (complete dataset)
- **Code Format**: Variable length numeric codes (3-7 digits: 146, 5043, 100006, etc.)
- **Updated**: 2025-09-12

### Technical Approach

1. **Mapping Utility**: Create centralized supplier code-to-name lookup
2. **API Enhancement**: Transform supplier codes to names during data processing
3. **Type Safety**: Add TypeScript definitions for supplier mapping
4. **Backward Compatibility**: Maintain original codes as metadata
5. **Performance**: Cache mapping for session duration

## Files to Modify

### New Files
- `utils/supplier-mapping.ts` - Supplier mapping utility module
- `utils/__tests__/supplier-mapping.test.ts` - Unit tests for mapping functions
- `docs/plans/supplier-name-mapping.md` - This implementation plan

### Modified Files
- `types/product.ts` - Add `produsentKode` field for original supplier code
- `utils/api.ts` - Transform supplier codes to names in API response processing
- `utils/filter-helpers.ts` - Update supplier filter extraction logic
- `app/page.tsx` - Update filter logic to handle both names and codes
- `components/search/QuickFilters/QuickFilters.tsx` - Display supplier names in dropdown
- `utils/__tests__/filter-helpers.test.ts` - Update tests for name-based filtering
- `components/search/QuickFilters/QuickFilters.test.tsx` - Update component tests

## Implementation Steps

### Phase 1: Foundation
1. Create supplier mapping utility with lookup functions
2. Update Product type to include supplier code field
3. Add comprehensive unit tests

### Phase 2: API Integration
1. Enhance API transformation to map codes to names
2. Update filter helper functions for supplier names
3. Ensure fallback handling for unmapped suppliers

### Phase 3: UI Updates
1. Update QuickFilters component to display supplier names
2. Maintain filter functionality with both names and codes
3. Update main page filter logic

### Phase 4: Testing & Documentation
1. Add integration tests for complete filter flow
2. Verify backward compatibility
3. Update component tests

## User Experience Improvements

### Before
```
Dropdown shows: "146", "5043", "100006", "100056", ...
```

### After  
```
Dropdown shows: "Ahlsell Norge AS", "3M Norge A/S", "Teknikk AS", "Luna Norge AS", ...
```

### Benefits
- **Readability**: Company names are more meaningful than numeric codes
- **Usability**: Users can find suppliers by familiar company names
- **Professional**: Displays proper business names instead of internal codes
- **Searchability**: Natural language names are easier to locate

## Technical Considerations

### Performance
- Load mapping once at application startup
- Cache transformed data for session duration
- Minimal impact on existing API calls

### Data Integrity
- 100% match rate ensures no data loss
- Fallback to original code if mapping fails
- Preserve original codes for debugging/admin needs

### Maintainability
- Centralized mapping logic in single utility module
- Clear separation between display names and internal codes
- Type-safe implementation with proper error handling

## Rollback Strategy
- Feature developed in separate branch
- Easy revert to `develop` branch if issues arise
- Minimal changes to existing data structures
- Backward compatibility maintained

## Success Criteria
- [ ] Supplier dropdown shows company names instead of codes
- [ ] All existing filter functionality continues to work
- [ ] No performance degradation
- [ ] Comprehensive test coverage
- [ ] Type-safe implementation
- [ ] Proper error handling for edge cases

## Timeline
- **Development**: 1-2 days
- **Testing**: 1 day  
- **Review & Merge**: 1 day
- **Total**: 3-4 days

---

**Branch**: `feature/supplier-name-mapping`
**Base**: `develop`
**Author**: Claude Code Assistant
**Created**: 2025-09-13