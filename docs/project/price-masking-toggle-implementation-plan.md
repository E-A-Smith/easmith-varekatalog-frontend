# Price Masking Toggle Implementation Plan

**Document Version**: 1.0  
**Date**: September 4, 2025  
**Status**: Ready for Implementation  
**Priority**: High - Enhanced Privacy Feature  

## Instructions for Executing Agent

**CRITICAL**: Before starting implementation, ensure you have:
1. **Read and understood** this complete document
2. **Verified** the development server is running (`npm run dev`)
3. **Checked** that authentication is working (useAuth hook is functional)
4. **Located** the toggle icon SVGs at `/public/toggle-on.svg` and `/public/toggle-off.svg`

### Required Context for Execution
- **Technology Stack**: Next.js 15, React 19, TypeScript 5, Tailwind CSS v4
- **Authentication System**: AWS Cognito with Azure AD integration via useAuth hook
- **Component Architecture**: Atomic design pattern with TypeScript strict mode
- **Norwegian Language**: All UI text must be in Norwegian
- **Design System**: Follow existing Byggern brand colors and Tailwind utility classes

### Key Files You Will Modify
1. `components/ui/Pagination/types.ts` - Type definitions
2. `components/ui/Pagination/Pagination.tsx` - Main pagination component
3. `app/page.tsx` - Main page with table and state management
4. `components/ui/Pagination/index.ts` - Export barrel (if creating new component)

### Development Workflow
1. Create new branch: `git checkout -b feature/price-masking-toggle`
2. Make incremental changes with testing after each step
3. Use TypeScript strict mode - no `any` types allowed
4. Follow existing code patterns and conventions
5. Test in multiple states (logged in/out, toggle on/off)

---

## Problem Statement

Currently, authenticated users can see all price information (Enhetspris and Nettopris columns) with no option to hide sensitive pricing data when showing the screen to others. This feature adds a toggle button to temporarily mask price information for privacy during presentations or screen sharing.

---

## Solution Architecture

### Feature Overview
Add a price visibility toggle button to the pagination bar that:
- **Only appears** when user is authenticated (uses existing `useAuth` hook)
- **Default state**: ON (prices visible)
- **Toggle OFF**: Masks price columns with "****"
- **Position**: Right side of pagination bar
- **Visual**: Uses existing toggle SVG icons
- **Language**: Norwegian labels

---

## Detailed Implementation Plan

### Step 1: Update Pagination Component Types
**File**: `components/ui/Pagination/types.ts`

Add the following optional props to `PaginationProps` interface:
```typescript
export interface PaginationProps {
  // ... existing props ...
  
  // Price masking feature (optional)
  isAuthenticated?: boolean;
  showPriceToggle?: boolean;
  isPriceVisible?: boolean;
  onPriceToggleChange?: (visible: boolean) => void;
}
```

**Validation**: TypeScript compilation should pass without errors.

---

### Step 2: Create Price Toggle Component
**File**: `components/ui/Pagination/PriceToggle.tsx` (NEW FILE)

Create a new component with this structure:
```typescript
import { FC } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

interface PriceToggleProps {
  isVisible: boolean;
  onChange: (visible: boolean) => void;
  className?: string;
}

export const PriceToggle: FC<PriceToggleProps> = ({ 
  isVisible, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="text-sm text-neutral-600">
        {isVisible ? 'Vis priser' : 'Skjul priser'}
      </span>
      <button
        onClick={() => onChange(!isVisible)}
        className="relative w-12 h-6 transition-colors focus:outline-none focus:ring-2 focus:ring-byggern-primary focus:ring-offset-2"
        aria-label={isVisible ? 'Skjul priser' : 'Vis priser'}
        role="switch"
        aria-checked={isVisible}
      >
        <Image
          src={isVisible ? '/toggle-on.svg' : '/toggle-off.svg'}
          alt=""
          width={48}
          height={24}
          className="w-full h-full"
        />
      </button>
    </div>
  );
};
```

**Export in barrel file** `components/ui/Pagination/index.ts`:
```typescript
export { PriceToggle } from './PriceToggle';
```

---

### Step 3: Update Pagination Component Layout
**File**: `components/ui/Pagination/Pagination.tsx`

1. Import the PriceToggle component:
```typescript
import { PriceToggle } from './PriceToggle';
```

2. Modify the main return statement to include the toggle (around line 147):
```typescript
return (
  <div className={clsx(
    'flex flex-col sm:flex-row items-center justify-between gap-4 p-4',
    'bg-white border-t border-neutral-200',
    className
  )}>
    {/* Combined item count, pagination controls */}
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full">
      {/* ... existing pagination content ... */}
    </div>
    
    {/* Price Toggle - Only show when authenticated */}
    {isAuthenticated && showPriceToggle && onPriceToggleChange && (
      <PriceToggle
        isVisible={isPriceVisible ?? true}
        onChange={onPriceToggleChange}
        className="ml-auto"
      />
    )}
  </div>
);
```

---

### Step 4: Integrate Authentication and State in Main Page
**File**: `app/page.tsx`

1. Import the useAuth hook at the top:
```typescript
import { useAuth } from '@/hooks/useAuth';
```

2. Add authentication and price visibility state (after line 246):
```typescript
// Authentication state
const { authState } = useAuth();
const { isAuthenticated } = authState;

// Price visibility state (only relevant when authenticated)
const [showPrices, setShowPrices] = useState(true);
```

3. Update the Pagination component props (around line 463):
```typescript
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  startItem={startItem}
  endItem={endItem}
  onPageChange={handlePageChange}
  itemLabel="produkter"
  previousLabel="Forrige"
  nextLabel="Neste"
  className="border-t"
  // New props for price masking
  isAuthenticated={isAuthenticated}
  showPriceToggle={true}
  isPriceVisible={showPrices}
  onPriceToggleChange={setShowPrices}
/>
```

---

### Step 5: Update Table Columns for Price Masking
**File**: `app/page.tsx`

Modify the price column renderers (around lines 318-335):

For 'enhetspris' column:
```typescript
{ 
  key: 'enhetspris', 
  label: 'Prisenhet',
  align: 'right' as const,
  render: (value: unknown, _item: unknown) => {
    // Mask prices when toggle is OFF and user is authenticated
    if (isAuthenticated && !showPrices) {
      return <span className="text-neutral-400">****</span>;
    }
    // Original logic for null masking
    if (value === null) {
      return <span className="text-neutral-400">****</span>;
    }
    return `kr ${value}`;
  }
},
```

For 'nettopris' column:
```typescript
{ 
  key: 'nettopris', 
  label: 'Nettopris',
  align: 'right' as const,
  render: (value: unknown, _item: unknown) => {
    // Mask prices when toggle is OFF and user is authenticated
    if (isAuthenticated && !showPrices) {
      return <span className="text-neutral-400">****</span>;
    }
    // Original logic for null masking
    if (value === null) {
      return <span className="text-neutral-400">****</span>;
    }
    return `kr ${value}`;
  }
},
```

---

## Testing & Verification Plan

### Functional Testing Checklist

#### 1. Authentication State Testing
- [ ] **Not Logged In**: Toggle should NOT appear in pagination bar
- [ ] **Logged In**: Toggle should appear on right side of pagination bar
- [ ] **Logout**: Toggle should disappear when user logs out

#### 2. Toggle Functionality Testing
- [ ] **Default State**: Toggle is ON (showing prices) when first logged in
- [ ] **Toggle Click**: Clicking toggle switches between ON/OFF states
- [ ] **Visual Feedback**: Toggle icon changes from green (on) to gray (off)
- [ ] **Label Update**: Text changes between "Vis priser" and "Skjul priser"

#### 3. Price Masking Testing
- [ ] **Toggle ON**: Enhetspris and Nettopris show actual values (e.g., "kr 89.50")
- [ ] **Toggle OFF**: Enhetspris and Nettopris show "****" for all products
- [ ] **NULL Values**: NULL prices show "****" regardless of toggle state
- [ ] **Other Columns**: Non-price columns remain unaffected by toggle

#### 4. Persistence Testing
- [ ] **Pagination**: Toggle state persists when changing pages
- [ ] **Filtering**: Toggle state persists when applying filters
- [ ] **Search**: Toggle state persists during search operations
- [ ] **Page Refresh**: Toggle resets to ON after page refresh (expected behavior)

#### 5. Responsive Design Testing
- [ ] **Desktop (1920px)**: Toggle appears on right side, well-spaced
- [ ] **Tablet (768px)**: Toggle remains visible and functional
- [ ] **Mobile (375px)**: Toggle stacks appropriately if needed

#### 6. Accessibility Testing
- [ ] **Keyboard Navigation**: Toggle can be activated with keyboard (Space/Enter)
- [ ] **Screen Reader**: Proper ARIA labels ("Vis priser"/"Skjul priser")
- [ ] **Focus States**: Visible focus ring when tabbing to toggle
- [ ] **Role**: Toggle has role="switch" and aria-checked state

### Browser Testing
Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if on macOS)
- [ ] Edge (latest)

### Performance Testing
- [ ] **Toggle Speed**: Instant response when clicking toggle
- [ ] **No Re-render Issues**: Only price columns update, not entire table
- [ ] **Memory**: No memory leaks when toggling repeatedly

---

## Edge Cases & Error Handling

### Handle These Scenarios
1. **Rapid Toggle Clicking**: Debounce or ensure state updates correctly
2. **Authentication Timeout**: Toggle should disappear if session expires
3. **Missing Icons**: Fallback to text-only toggle if SVGs fail to load
4. **State Sync**: Ensure toggle state doesn't conflict with authentication state

---

## Code Quality Requirements

### TypeScript Requirements
- ✅ NO `any` types - use proper type definitions
- ✅ All props must have interfaces defined
- ✅ Use strict null checks
- ✅ Proper return type annotations

### React Best Practices
- ✅ Use functional components with hooks
- ✅ Proper dependency arrays in useEffect/useCallback
- ✅ Avoid unnecessary re-renders
- ✅ Clean up effects properly

### Tailwind CSS Requirements
- ✅ Use existing utility classes from design system
- ✅ Follow responsive design patterns (mobile-first)
- ✅ Use clsx for conditional classes
- ✅ NO inline styles

---

## Documentation Update Requirements

**CRITICAL**: After successful implementation and testing, the executing agent MUST update the following documentation:

### 1. Update CLAUDE.md
**File**: `/CLAUDE.md`
Add a new section under "## 🎨 DESIGN SYSTEM & UI GUIDELINES" describing:
- Price masking toggle feature
- Authentication-based visibility
- Norwegian language labels used

### 2. Update Feature Documentation
**File**: Create `/docs/features/price-masking-toggle.md`
Document:
- Feature purpose and use cases
- Technical implementation details
- Component architecture
- State management approach
- Testing procedures

### 3. Update Component README
**File**: `/components/ui/Pagination/README.md` (create if doesn't exist)
Include:
- New props documentation
- PriceToggle sub-component usage
- Example code snippets
- Integration with authentication

### 4. Update Type Definitions Documentation
Add JSDoc comments to all new interfaces and types explaining:
- Purpose of each prop
- Expected values
- Default behaviors
- Authentication requirements

### 5. Update Changelog
**File**: `/CHANGELOG.md` (create if doesn't exist)
Add entry:
```markdown
## [Date] - Feature: Price Masking Toggle
- Added price visibility toggle for authenticated users
- Toggle appears in pagination bar (right side)
- Masks Enhetspris and Nettopris columns when toggled off
- Norwegian language support ("Vis priser"/"Skjul priser")
- Integrated with existing authentication system
```

---

## Success Criteria

The implementation is considered successful when:
1. ✅ All functional tests pass
2. ✅ TypeScript compilation has zero errors
3. ✅ Toggle only appears for authenticated users
4. ✅ Price masking works correctly in both states
5. ✅ UI matches existing design system
6. ✅ All documentation is updated
7. ✅ Code follows project conventions
8. ✅ Feature works across all supported browsers

---

## Rollback Plan

If implementation causes issues:
1. `git checkout develop` - Return to develop branch
2. `git branch -D feature/price-masking-toggle` - Delete feature branch
3. Document issues encountered for future reference
4. Consider alternative approaches (e.g., separate button outside pagination)

---

**END OF IMPLEMENTATION PLAN**

**REMINDER**: Update all documentation after successful implementation!