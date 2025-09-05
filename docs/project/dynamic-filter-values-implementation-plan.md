# Dynamic Filter Values Implementation Plan

**Document Version**: 1.0  
**Date**: September 4, 2025  
**Status**: Ready for Implementation  
**Priority**: Medium - UX Improvement Feature  

## Instructions for Executing Agent

**CRITICAL**: Before starting implementation, ensure you have:
1. **Read and understood** this complete document
2. **Verified** the development server is running (`npm run dev`)
3. **Examined** the current static filter implementation in `components/search/QuickFilters/QuickFilters.tsx`
4. **Located** the main page filter logic in `app/page.tsx` around lines 340-370

### Required Context for Execution
- **Technology Stack**: Next.js 15, React 19, TypeScript 5, Tailwind CSS v4
- **Component Architecture**: Atomic design pattern with TypeScript strict mode
- **Norwegian Language**: All UI text must remain in Norwegian
- **Filter Behavior**: Currently static arrays, need to become dynamic based on data
- **Data Flow**: Search results OR catalog products → extract unique values → populate filters

### Key Files You Will Modify
1. `utils/filter-helpers.ts` - NEW utility functions for extracting unique values
2. `components/search/QuickFilters/types.ts` - Add dynamic options props
3. `components/search/QuickFilters/QuickFilters.tsx` - Accept and use dynamic options
4. `app/page.tsx` - Calculate and pass dynamic options
5. **Testing files** - Update tests for new dynamic behavior

### Development Workflow
1. Create new branch: `git checkout -b feature/dynamic-filter-values`
2. Make incremental changes with testing after each step
3. Use TypeScript strict mode - no `any` types allowed
4. Follow existing code patterns and Norwegian language conventions
5. Test with both search results and local catalog data

---

## Problem Statement

Currently, the Quick Filters dropdowns (Suppliers and Categories) show static, hardcoded lists that don't reflect what's actually available in the current search results or catalog. This leads to:
- **User Confusion**: Filters show options that don't exist in current results
- **Poor UX**: Users can select filters that result in 0 products
- **Outdated Data**: New suppliers/categories in the API won't appear automatically
- **Inefficient Filtering**: Users waste time on non-existent options

---

## Solution Architecture

### Feature Overview
Transform static filter dropdowns to dynamically populate based on:
- **Search Results**: When user has performed a search, show only suppliers/categories from results
- **Catalog Data**: When showing full catalog, show options from local catalog products
- **Real-time Updates**: Filter options update immediately when search results change
- **Norwegian Locale**: Maintain alphabetical sorting with Norwegian language support

### Technical Approach
1. **Utility Functions**: Create helper functions to extract unique values from product arrays
2. **Props-based Options**: Pass dynamic options to QuickFilters as props
3. **Fallback Strategy**: Use static defaults if dynamic calculation fails
4. **Performance Optimization**: Memoize calculations to prevent unnecessary re-renders
5. **State Management**: Handle filter resets when options change

---

## Detailed Implementation Plan

### Step 1: Create Filter Helper Utilities
**File**: `utils/filter-helpers.ts` (NEW FILE)

Create utility functions for extracting unique values:

```typescript
import { Product } from '@/types/product';

/**
 * Extracts unique supplier names from a product array
 * @param products Array of products to extract suppliers from
 * @returns Sorted array of unique supplier names with "Alle leverandører" first
 */
export function getUniqueSuppliers(products: Product[]): string[] {
  if (!products || products.length === 0) {
    return ['Alle leverandører'];
  }
  
  const uniqueSuppliers = new Set<string>();
  
  products.forEach(product => {
    if (product.produsent && product.produsent.trim()) {
      uniqueSuppliers.add(product.produsent.trim());
    }
  });
  
  const sortedSuppliers = Array.from(uniqueSuppliers).sort((a, b) => 
    a.localeCompare(b, 'no', { numeric: true, sensitivity: 'base' })
  );
  
  return ['Alle leverandører', ...sortedSuppliers];
}

/**
 * Extracts unique category names from a product array  
 * @param products Array of products to extract categories from
 * @returns Sorted array of unique category names with "Alle kategorier" first
 */
export function getUniqueCategories(products: Product[]): string[] {
  if (!products || products.length === 0) {
    return ['Alle kategorier'];
  }
  
  const uniqueCategories = new Set<string>();
  
  products.forEach(product => {
    if (product.kategori && product.kategori.trim()) {
      uniqueCategories.add(product.kategori.trim());
    }
  });
  
  const sortedCategories = Array.from(uniqueCategories).sort((a, b) => 
    a.localeCompare(b, 'no', { numeric: true, sensitivity: 'base' })
  );
  
  return ['Alle kategorier', ...sortedCategories];
}

/**
 * Validates if a filter value exists in the provided options
 * @param currentValue Current filter selection
 * @param availableOptions Array of available options
 * @returns Valid filter value or default "Alle" option
 */
export function validateFilterValue(currentValue: string, availableOptions: string[]): string {
  if (availableOptions.includes(currentValue)) {
    return currentValue;
  }
  // Return the default "Alle" option (first in array)
  return availableOptions[0] || 'Alle';
}
```

**Validation**: Test functions work correctly with empty arrays, null values, and mixed data.

---

### Step 2: Update QuickFilters Component Types
**File**: `components/search/QuickFilters/types.ts`

Add optional props for dynamic filter options:

```typescript
export interface QuickFiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
  className?: string;
  
  // NEW: Dynamic filter options
  supplierOptions?: string[];
  categoryOptions?: string[];
  
  // NEW: Current filter state (for controlled behavior)
  filters?: FilterState;
  
  // NEW: Callback when filters need to be reset due to invalid options
  onFiltersReset?: (resetFilters: FilterState) => void;
}
```

**Validation**: TypeScript compilation should pass without errors.

---

### Step 3: Update QuickFilters Component Implementation  
**File**: `components/search/QuickFilters/QuickFilters.tsx`

Modify the component to accept and use dynamic options:

1. **Import utilities**:
```typescript
import { validateFilterValue } from '@/utils/filter-helpers';
```

2. **Update component props and logic**:
```typescript
export const QuickFilters: FC<QuickFiltersProps> = ({
  onFiltersChange,
  className,
  supplierOptions,
  categoryOptions,
  filters: controlledFilters,
  onFiltersReset
}) => {
  // Use controlled filters if provided, otherwise use internal state
  const [internalFilters, setInternalFilters] = useState<FilterState>({
    supplier: 'Alle leverandører',
    category: 'Alle kategorier', 
    stock: 'Alle'
  });
  
  const filters = controlledFilters || internalFilters;
  
  // Fallback to static options if dynamic ones not provided
  const defaultSupplierOptions = [
    'Alle leverandører',
    'Biltema', 'Würth', 'Bostik', 'DeWalt', 'Essve', 'Flügger',
    'Glava', 'Gyproc', 'Rockwool', 'Uponor', 'Tarkett'
  ];
  
  const defaultCategoryOptions = [
    'Alle kategorier',
    'Sikkerhet', 'Beslag', 'Festing', 'Skruer og bolter',
    'Byggematerialer', 'Isolasjon', 'Rør og koblingsutstyr'
  ];
  
  const currentSupplierOptions = supplierOptions || defaultSupplierOptions;
  const currentCategoryOptions = categoryOptions || defaultCategoryOptions;
  
  // Validate current filter values against available options
  useEffect(() => {
    const validatedSupplier = validateFilterValue(filters.supplier, currentSupplierOptions);
    const validatedCategory = validateFilterValue(filters.category, currentCategoryOptions);
    
    if (validatedSupplier !== filters.supplier || validatedCategory !== filters.category) {
      const resetFilters = {
        ...filters,
        supplier: validatedSupplier,
        category: validatedCategory
      };
      
      if (controlledFilters && onFiltersReset) {
        onFiltersReset(resetFilters);
      } else {
        setInternalFilters(resetFilters);
        onFiltersChange?.(resetFilters);
      }
    }
  }, [currentSupplierOptions, currentCategoryOptions, filters.supplier, filters.category]);
```

3. **Update select elements to use dynamic options**:
```typescript
// Replace static supplierOptions array with currentSupplierOptions
{currentSupplierOptions.map(option => (
  <option key={option} value={option}>{option}</option>
))}

// Replace static categoryOptions array with currentCategoryOptions  
{currentCategoryOptions.map(option => (
  <option key={option} value={option}>{option}</option>
))}
```

---

### Step 4: Update Main Page to Calculate Dynamic Options
**File**: `app/page.tsx`

1. **Import utilities**:
```typescript
import { getUniqueSuppliers, getUniqueCategories, validateFilterValue } from '@/utils/filter-helpers';
```

2. **Add memoized calculations after `baseData` definition** (around line 378):
```typescript
// Calculate dynamic filter options based on current data
const supplierOptions = useMemo(() => {
  return getUniqueSuppliers(baseData);
}, [baseData]);

const categoryOptions = useMemo(() => {
  return getUniqueCategories(baseData);
}, [baseData]);

// Validate current filter values against available options
const validatedFilters = useMemo(() => {
  return {
    supplier: validateFilterValue(filters.supplier, supplierOptions),
    category: validateFilterValue(filters.category, categoryOptions),
    stock: filters.stock // Stock options remain static
  };
}, [filters, supplierOptions, categoryOptions]);

// Update filters if validation changed them
useEffect(() => {
  if (validatedFilters.supplier !== filters.supplier || 
      validatedFilters.category !== filters.category) {
    setFilters(validatedFilters);
  }
}, [validatedFilters, filters]);
```

3. **Update QuickFilters component usage** (around line 417):
```typescript
<QuickFilters 
  supplierOptions={supplierOptions}
  categoryOptions={categoryOptions}
  filters={filters}
  onFiltersChange={(newFilters) => {
    setFilters(newFilters);
    resetPagination();
  }}
  onFiltersReset={(resetFilters) => {
    setFilters(resetFilters);
    resetPagination();
  }}
/>
```

4. **Update filter application to use validated filters**:
```typescript
const filteredData = applyFilters(baseData, validatedFilters);
```

---

### Step 5: Update applyFilters Function
**File**: `app/page.tsx`

Modify the `applyFilters` function to accept filters as a parameter:

```typescript
const applyFilters = (data: Product[], filterState: FilterState) => {
  let filteredData = [...data];
  
  // Filter by supplier
  if (filterState.supplier !== 'Alle leverandører') {
    filteredData = filteredData.filter(product => 
      product.produsent?.toLowerCase() === filterState.supplier.toLowerCase()
    );
  }
  
  // Filter by category
  if (filterState.category !== 'Alle kategorier') {
    filteredData = filteredData.filter(product => 
      product.kategori?.toLowerCase() === filterState.category.toLowerCase()
    );
  }
  
  // Filter by stock status
  if (filterState.stock !== 'Alle') {
    filteredData = filteredData.filter(product => 
      product.lagerstatus === filterState.stock
    );
  }
  
  // Always sort by name alphabetically
  filteredData.sort((a, b) => a.navn.localeCompare(b.navn, 'no'));
  
  return filteredData;
};
```

---

## Testing & Verification Plan

### Functional Testing Checklist

#### 1. Initial Load Testing
- [ ] **Catalog Data**: Filters populated with unique suppliers/categories from local catalog
- [ ] **Alphabetical Order**: Options sorted correctly with Norwegian locale
- [ ] **"Alle" Options**: Default options appear first in each dropdown
- [ ] **No Duplicates**: Each supplier/category appears only once

#### 2. Search Results Testing  
- [ ] **Search Updates**: Filters update when search returns different products
- [ ] **Subset Filtering**: Search with limited results shows only relevant filter options
- [ ] **Empty Search**: Graceful handling when search returns 0 results
- [ ] **Mixed Results**: Search returning products with different suppliers/categories

#### 3. Filter State Management Testing
- [ ] **Valid Selection**: Previously selected filters remain if still available
- [ ] **Invalid Reset**: Filters reset to "Alle" when selected option no longer exists
- [ ] **Filter Application**: Filtering still works correctly with dynamic options
- [ ] **Pagination Reset**: Page resets to 1 when filters change

#### 4. Performance Testing
- [ ] **Large Datasets**: No lag with 1000+ products (test with large mock data)
- [ ] **Rapid Searches**: Smooth transitions during fast search queries
- [ ] **Memory Usage**: No memory leaks during repeated filter updates
- [ ] **Re-render Optimization**: Memoization prevents unnecessary calculations

#### 5. Edge Case Testing
- [ ] **Missing Data**: Products with null/undefined suppliers or categories
- [ ] **Empty Arrays**: Graceful handling of empty product arrays
- [ ] **Single Option**: Dropdowns work correctly when only one unique value exists
- [ ] **Special Characters**: Norwegian characters (æ, ø, å) sort correctly

#### 6. Integration Testing
- [ ] **API Results**: Works correctly with real API search results
- [ ] **Local Catalog**: Works correctly with local catalog data
- [ ] **Mixed Sources**: Handles switching between API and local data
- [ ] **Authentication**: Dynamic filters work in both authenticated and non-authenticated states

### Browser Testing
Test in the following browsers:
- [ ] Chrome (latest) - Primary development browser
- [ ] Firefox (latest) - Alternative rendering engine  
- [ ] Safari (if available) - WebKit engine testing
- [ ] Edge (latest) - Microsoft browser compatibility

### Mobile Testing
- [ ] **Mobile Chrome**: Touch interaction with dropdowns
- [ ] **Mobile Safari**: iOS-specific dropdown behavior
- [ ] **Responsive Design**: Filters work on small screens (375px width)

---

## Edge Cases & Error Handling

### Handle These Scenarios
1. **API Returns Malformed Data**: Products with missing supplier/category fields
2. **Network Failures**: Fallback to static options when API fails
3. **Empty Search Results**: Show default options or "no options available"
4. **Rapid Filter Changes**: Debounce or queue filter updates to prevent race conditions
5. **Invalid Filter State**: Reset invalid selections gracefully
6. **Norwegian Characters**: Ensure proper sorting of æ, ø, å in supplier/category names

### Error Recovery
```typescript
// Example error handling in filter helpers
export function getUniqueSuppliers(products: Product[]): string[] {
  try {
    if (!products || !Array.isArray(products)) {
      console.warn('getUniqueSuppliers: Invalid products array, using defaults');
      return ['Alle leverandører'];
    }
    
    // ... implementation
  } catch (error) {
    console.error('Error extracting unique suppliers:', error);
    return ['Alle leverandører']; // Fallback
  }
}
```

---

## Code Quality Requirements

### TypeScript Requirements
- ✅ NO `any` types - use proper Product interface types
- ✅ All utility functions must have proper type annotations
- ✅ Use strict null checks for data validation
- ✅ Generic types for reusable filter functions

### React Best Practices
- ✅ Use `useMemo` for expensive calculations
- ✅ Use `useCallback` for filter change handlers
- ✅ Proper dependency arrays in hooks
- ✅ Avoid unnecessary re-renders with React.memo if needed

### Performance Requirements
- ✅ Filter calculation must complete in <50ms for 1000 products
- ✅ Use memoization to prevent recalculation on every render
- ✅ Debounce rapid filter changes if necessary
- ✅ Efficient Set operations for uniqueness

---

## Testing Implementation

### Unit Tests Required
Create or update these test files:

1. **Filter Helpers Tests** (`utils/__tests__/filter-helpers.test.ts`):
```typescript
describe('getUniqueSuppliers', () => {
  it('should return unique suppliers sorted alphabetically', () => {
    const products = [
      { produsent: 'Würth', kategori: 'Beslag' },
      { produsent: 'Biltema', kategori: 'Sikkerhet' },
      { produsent: 'Würth', kategori: 'Festing' }
    ];
    
    const result = getUniqueSuppliers(products);
    expect(result).toEqual(['Alle leverandører', 'Biltema', 'Würth']);
  });
  
  it('should handle empty array gracefully', () => {
    const result = getUniqueSuppliers([]);
    expect(result).toEqual(['Alle leverandører']);
  });
});
```

2. **QuickFilters Component Tests** (`components/search/QuickFilters/QuickFilters.test.tsx`):
```typescript
describe('QuickFilters with dynamic options', () => {
  it('should use provided supplier options', () => {
    const supplierOptions = ['Alle leverandører', 'TestSupplier'];
    render(<QuickFilters supplierOptions={supplierOptions} />);
    
    const select = screen.getByDisplayValue('Alle leverandører');
    fireEvent.click(select);
    expect(screen.getByText('TestSupplier')).toBeInTheDocument();
  });
});
```

---

## Documentation Update Requirements

**CRITICAL**: After successful implementation and testing, the executing agent MUST update the following documentation:

### 1. Update CLAUDE.md
**File**: `/CLAUDE.md`
Add section under "## 🎯 Product Domain Knowledge" describing:
- Dynamic filter behavior based on search results
- Performance optimizations with memoization
- Norwegian locale handling for sorting

### 2. Create Utility Documentation
**File**: `utils/README.md` (create if doesn't exist)
Document:
- `filter-helpers.ts` utility functions
- Performance characteristics
- Usage examples and edge cases
- Norwegian locale sorting behavior

### 3. Update Component Documentation
**File**: `components/search/QuickFilters/README.md`
Include:
- New dynamic props documentation
- Migration guide from static to dynamic usage
- Performance considerations
- Testing examples

### 4. Update Feature Documentation  
**File**: `docs/features/dynamic-filters.md` (NEW)
Create comprehensive feature documentation:
- Feature overview and benefits
- Technical implementation details
- Performance benchmarks
- User experience improvements

### 5. Add JSDoc Comments
Add comprehensive JSDoc comments to:
- All new utility functions in `filter-helpers.ts`
- Updated props interfaces in `types.ts`
- Modified component methods in `QuickFilters.tsx`

Example JSDoc format:
```typescript
/**
 * Extracts unique supplier names from product array with Norwegian locale sorting
 * 
 * @param products - Array of Product objects to analyze
 * @returns Sorted array with "Alle leverandører" first, followed by unique suppliers
 * @throws {Error} When products is not a valid array
 * 
 * @example
 * ```typescript
 * const products = [
 *   { produsent: 'Würth', kategori: 'Beslag' },
 *   { produsent: 'Biltema', kategori: 'Sikkerhet' }
 * ];
 * const suppliers = getUniqueSuppliers(products);
 * // Returns: ['Alle leverandører', 'Biltema', 'Würth']
 * ```
 */
```

### 6. Update Changelog
**File**: `/CHANGELOG.md`
Add entry:
```markdown
## [Date] - Feature: Dynamic Filter Values
- Filters now populate dynamically based on search results and catalog data
- Improved UX: Only show suppliers/categories that exist in current dataset  
- Added Norwegian locale sorting for filter options
- Performance optimized with memoization
- Enhanced error handling for malformed data
- Fallback to static defaults when dynamic calculation fails
```

### 7. Update Type Definitions Documentation
Add comprehensive type documentation in `types.ts`:
```typescript
/**
 * Props for QuickFilters component supporting dynamic filter options
 * 
 * @interface QuickFiltersProps
 * @property {string[]} [supplierOptions] - Dynamic supplier options extracted from data
 * @property {string[]} [categoryOptions] - Dynamic category options extracted from data  
 * @property {FilterState} [filters] - Controlled filter state from parent component
 * @property {Function} [onFiltersReset] - Callback when filters reset due to invalid options
 */
```

---

## Success Criteria

The implementation is considered successful when:

### Functional Success
1. ✅ Filters populate dynamically from search results and catalog data
2. ✅ Norwegian locale sorting works correctly (æ, ø, å)
3. ✅ Filter options update immediately when search results change  
4. ✅ Invalid filter selections reset gracefully to "Alle" options
5. ✅ All existing filter functionality continues to work

### Performance Success
6. ✅ Filter calculation completes in <50ms for 1000+ products
7. ✅ No unnecessary re-renders or calculations
8. ✅ Smooth UI transitions during filter updates
9. ✅ No memory leaks during repeated searches

### Quality Success  
10. ✅ TypeScript compilation with zero errors
11. ✅ All unit tests pass with >90% coverage
12. ✅ Code follows project conventions and patterns
13. ✅ All documentation updated as required

### Browser Success
14. ✅ Works correctly in Chrome, Firefox, Safari, Edge
15. ✅ Mobile responsive design maintained
16. ✅ Accessibility standards preserved

---

## Rollback Plan

If implementation causes issues:

### Immediate Rollback
1. `git checkout develop` - Return to develop branch
2. `git branch -D feature/dynamic-filter-values` - Delete feature branch
3. Verify application works with static filters
4. Document specific issues encountered

### Partial Rollback Options
1. **Keep utilities, revert component changes** - If helper functions work but component integration fails
2. **Disable dynamic mode** - Add feature flag to toggle between static/dynamic modes
3. **Fallback to static defaults** - Ensure static options always work if dynamic fails

### Alternative Approaches
If complete rollback needed, consider:
1. **Hybrid approach**: Dynamic options with manual refresh button
2. **Lazy loading**: Load options on dropdown click instead of automatically
3. **Server-side filtering**: Move filter option calculation to API level

---

**END OF IMPLEMENTATION PLAN**

**REMINDER FOR EXECUTING AGENT**: 
1. ✅ Follow each step in exact order
2. ✅ Test thoroughly after each step  
3. ✅ Update ALL documentation as specified
4. ✅ Ensure Norwegian locale support throughout
5. ✅ Maintain existing functionality while adding dynamic behavior

**FINAL NOTE**: This implementation improves user experience by showing only relevant filter options, reduces confusion, and provides better performance through memoization. The fallback strategy ensures the application remains functional even if dynamic calculation fails.