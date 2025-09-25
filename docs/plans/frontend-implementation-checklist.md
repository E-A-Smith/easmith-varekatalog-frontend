# Frontend Implementation Checklist: Catalog Statistics Welcome Screen

## 🚨 Prerequisites

**CRITICAL**: Do not start frontend implementation until backend is complete!

### ✅ Backend Readiness Checklist

Before starting frontend work, verify these backend requirements:

- [ ] Backend `/stats` endpoint deployed to DEV environment
- [ ] Endpoint responds successfully: `curl https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev/stats`
- [ ] Response includes all required fields: `totalProducts`, `totalCategories`, `totalSuppliers`, `lastStockUpdate`, `lastPriceUpdate`, `recentAdditions`
- [ ] CORS headers configured for frontend access
- [ ] Response time < 2 seconds
- [ ] Error handling returns proper HTTP status codes

**Test Command**:
```bash
curl -X GET https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev/stats
```

**Expected Response Format**:
```json
{
  "totalProducts": 9275,
  "totalCategories": 127,
  "totalSuppliers": 43,
  "lastStockUpdate": "2025-01-07T14:30:00Z",
  "lastPriceUpdate": "2025-01-06T22:00:00Z",
  "recentAdditions": 47
}
```

---

## 🏗️ Frontend Implementation Steps

### Phase 1: Foundation Components

#### Step 1: Create SVG Icon Components
**File**: `components/ui/icons/CatalogIcons.tsx`

- [ ] Create `ProductsIcon` component (stacked boxes SVG)
- [ ] Create `CategoriesIcon` component (grid squares SVG)
- [ ] Create `SuppliersIcon` component (building SVG)
- [ ] Create `CalendarIcon` component (calendar SVG)
- [ ] Create `LightbulbIcon` component (lightbulb SVG)
- [ ] Add proper TypeScript interfaces (`IconProps`)
- [ ] Test all icons render with different sizes
- [ ] Verify `currentColor` works with Tailwind classes

**File**: `components/ui/icons/index.ts`
- [ ] Add barrel export for all icons

**Validation**:
```typescript
// Test in browser console:
// Icons should render with orange color
<ProductsIcon size={32} className="text-byggern-orange" />
```

#### Step 2: Create Type Definitions
**File**: `types/catalog-stats.ts`

- [ ] Define `CatalogStats` interface matching backend response
- [ ] Define `StatCardProps` interface for component props
- [ ] Add JSDoc comments for all fields
- [ ] Ensure strict TypeScript compatibility

**Validation**:
```bash
npm run type-check
# Should pass without errors
```

### Phase 2: API Integration

#### Step 3: Create API Proxy Endpoint
**File**: `app/api/catalog-stats/route.ts`

- [ ] Import Next.js `NextResponse`
- [ ] Add proper error handling with try-catch
- [ ] Configure 10-second timeout with `AbortSignal`
- [ ] Return structured error responses (503 for backend unavailable)
- [ ] Add request/response logging
- [ ] Validate response structure from backend

**Environment Variable Check**:
- [ ] Verify `NEXT_PUBLIC_EXTERNAL_API_URL` is configured
- [ ] Test API proxy locally: `curl http://localhost:3000/api/catalog-stats`

**Validation**:
```bash
# Test proxy endpoint
npm run dev
curl http://localhost:3000/api/catalog-stats
```

#### Step 4: Create Data Fetching Hook
**File**: `hooks/useCatalogStats.ts`

- [ ] Import SWR for data fetching
- [ ] Configure 5-minute refresh interval
- [ ] Disable revalidateOnFocus (stats don't change frequently)
- [ ] Add proper TypeScript return types
- [ ] Handle loading, error, and success states

**Validation**:
```typescript
// Test in React component:
const { stats, isLoading, isError } = useCatalogStats();
console.log({ stats, isLoading, isError });
```

### Phase 3: UI Components

#### Step 5: Create StatCard Component
**File**: `components/catalog/StatCard/StatCard.tsx`

- [ ] Create loading skeleton with `animate-pulse`
- [ ] Implement Norwegian number formatting (`nb-NO` locale)
- [ ] Add hover effects with shadow transitions
- [ ] Support optional trend indicators (↑↓—)
- [ ] Add proper ARIA labels for accessibility
- [ ] Handle empty/null values gracefully

**File**: `components/catalog/StatCard/index.ts`
- [ ] Add barrel export

**Validation**:
- [ ] Test loading state
- [ ] Test with large numbers (45,678 → "45 678")
- [ ] Test responsive behavior on mobile
- [ ] Verify accessibility with screen reader

#### Step 6: Create Date Helper Utility
**File**: `utils/date-helpers.ts`

- [ ] Implement `formatDistanceToNow` function
- [ ] Handle Norwegian relative time format
- [ ] Support cases: "akkurat nå", "X minutter siden", "X timer siden", "i går", "X dager siden"
- [ ] Fallback to Norwegian date format for older dates
- [ ] Add proper TypeScript types

**Validation**:
```typescript
// Test cases:
formatDistanceToNow(new Date().toISOString()); // "akkurat nå"
formatDistanceToNow(new Date(Date.now() - 30*60*1000).toISOString()); // "30 minutter siden"
```

#### Step 7: Create Main CatalogStats Component
**File**: `components/catalog/CatalogStats/CatalogStats.tsx`

- [ ] Implement personalized greeting logic
- [ ] Add time-based greetings (God morgen/dag/kveld)
- [ ] Create responsive grid layout (mobile: 1 col, tablet: 2 col, desktop: 3 col)
- [ ] Add stats cards with proper icons and colors
- [ ] Implement "Last Updates" section with colored indicators
- [ ] Add search prompt at bottom
- [ ] Handle error states gracefully
- [ ] Use authentication context for personalization

**File**: `components/catalog/CatalogStats/index.ts`
- [ ] Add barrel export

**Features Checklist**:
- [ ] Personalized greeting works for authenticated users
- [ ] Fallback to generic greeting for non-authenticated users
- [ ] All three stat cards display correctly
- [ ] "Siste oppdateringer" section shows proper Norwegian timestamps
- [ ] Responsive grid works on all screen sizes
- [ ] Loading states show skeleton cards

### Phase 4: Integration

#### Step 8: Update Main Page
**File**: `app/page.tsx`

- [ ] Import `CatalogStats` component
- [ ] Replace empty state logic with conditional rendering
- [ ] Show `CatalogStats` when `!searchState.hasSearched`
- [ ] Keep existing "no results" state for empty search results
- [ ] Maintain existing table rendering for search results

**Logic Structure**:
```typescript
{!searchState.hasSearched ? (
  <CatalogStats />
) : filteredData.length === 0 ? (
  // No results message
) : (
  // Existing table rendering
)}
```

**Validation**:
- [ ] Fresh page load shows catalog stats
- [ ] Search removes stats and shows results
- [ ] Empty search shows "no results" message
- [ ] Clear search returns to stats view

### Phase 5: Testing & Quality

#### Step 9: Add Unit Tests
**File**: `components/catalog/StatCard/StatCard.test.tsx`

- [ ] Test rendering with all props
- [ ] Test loading state shows skeleton
- [ ] Test Norwegian number formatting (45678 → "45 678")
- [ ] Test trend indicators display correctly
- [ ] Test accessibility attributes

**File**: `components/catalog/CatalogStats/CatalogStats.test.tsx`

- [ ] Test authenticated user greeting
- [ ] Test non-authenticated user greeting
- [ ] Test time-based greetings
- [ ] Test error state handling
- [ ] Test responsive grid layout

**File**: `utils/date-helpers.test.ts`

- [ ] Test all Norwegian time formats
- [ ] Test edge cases (0 minutes, exactly 1 hour, etc.)
- [ ] Test date fallback for old timestamps

**Test Commands**:
```bash
npm test StatCard
npm test CatalogStats
npm test date-helpers
```

#### Step 10: Quality Assurance

**TypeScript Validation**:
```bash
npm run type-check
# Should pass without errors
```

**Linting**:
```bash
npm run lint
# Should pass without warnings
```

**Build Verification**:
```bash
npm run build
# Should complete successfully
```

**Responsive Testing**:
- [ ] Test at 375px width (mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1920px width (desktop)
- [ ] Verify grid layouts adapt correctly

**Performance Testing**:
- [ ] Page loads in < 2 seconds
- [ ] Stats load without blocking page render
- [ ] Subsequent visits use cached data

**Accessibility Testing**:
- [ ] Screen reader can navigate all statistics
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] All interactive elements have focus states
- [ ] Color contrast meets WCAG standards

---

## 🧪 Testing Scenarios

### User Journey Testing

**Scenario 1: First-time visitor**
1. [ ] Navigate to homepage
2. [ ] See welcome message and catalog stats
3. [ ] Stats cards show loading then data
4. [ ] Last updates show Norwegian relative times
5. [ ] Search prompt visible at bottom

**Scenario 2: Authenticated user**
1. [ ] Log in with Azure AD
2. [ ] Navigate to homepage
3. [ ] See personalized greeting with name and time-of-day
4. [ ] All stats display correctly
5. [ ] Log out and verify fallback to generic greeting

**Scenario 3: Search interaction**
1. [ ] Load homepage (stats visible)
2. [ ] Perform search
3. [ ] Stats disappear, search results appear
4. [ ] Clear search
5. [ ] Stats reappear

**Scenario 4: Error handling**
1. [ ] Simulate backend API failure
2. [ ] Error state shows gracefully
3. [ ] Page doesn't crash
4. [ ] User can still use search functionality

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Performance Benchmarks

- [ ] Initial page load: < 2 seconds
- [ ] Stats API call: < 1 second
- [ ] Lighthouse performance score: > 90
- [ ] No console errors or warnings

---

## 🚀 Deployment Checklist

### Environment Configuration

**Development Environment**:
- [ ] `NEXT_PUBLIC_EXTERNAL_API_URL` configured in Amplify Console
- [ ] Environment variable points to DEV backend: `https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev`

**Production Environment**:
- [ ] `NEXT_PUBLIC_EXTERNAL_API_URL` configured for PROD: `https://17lf5fwwik.execute-api.eu-west-1.amazonaws.com/prod`
- [ ] Backend PROD endpoint tested and working

### Pre-Deployment Testing

```bash
# Final validation pipeline
./scripts/validate-build.sh

# Manual checks
npm run type-check
npm run lint
npm run build
npm test
```

### Deployment Steps

1. [ ] Test in development environment
2. [ ] Create pull request from `develop` to `main`
3. [ ] Get required approvals
4. [ ] Merge to `main` branch
5. [ ] Verify automatic production deployment
6. [ ] Test production environment

### Post-Deployment Validation

**Production URLs**:
- [ ] Test primary URL: https://varekatalog.byggern.no/
- [ ] Test fallback URL: https://main.d1bvibntd0i61j.amplifyapp.com/
- [ ] Verify stats load correctly
- [ ] Check console for errors
- [ ] Test on mobile devices

---

## 🔧 Configuration Reference

### Environment Variables Required

```bash
# Development (.env.development)
NEXT_PUBLIC_API_BASE_URL=https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev
NEXT_PUBLIC_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_CLIENT_ID=58hle80tfmljv7rbmf9o4tfmsf
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_GggkvCmcK
NEXT_PUBLIC_COGNITO_DOMAIN=eas-varekatalog-auth-dev.auth.eu-west-1.amazoncognito.com

# Production (AWS Amplify Console)
NEXT_PUBLIC_API_BASE_URL=https://17lf5fwwik.execute-api.eu-west-1.amazonaws.com/prod
NEXT_PUBLIC_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_CLIENT_ID=3jur7ub2mvai5ar5969i3bmum1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_Y9lANGJGs
NEXT_PUBLIC_COGNITO_DOMAIN=eas-varekatalog-auth-prod.auth.eu-west-1.amazoncognito.com
```

### Brand Colors (Tailwind Config)

```typescript
colors: {
  byggern: {
    primary: '#1E3A5F',    // Brand blue
    orange: '#FF6B35',     // Accent orange (used for icons)
    gold: '#d4af37',       // Logo gold
    success: '#3dcc4a',    // Success green
  },
  semantic: {
    success: '#28A745',    // Update indicators
    info: '#17A2B8',       // Update indicators
    error: '#DC3545',      // Error states
  }
}
```

---

## ⚠️ Important Notes

### Norwegian Language Requirements
- [ ] All user-facing text in Norwegian (Bokmål)
- [ ] Number formatting uses space as thousand separator (45 678, not 45,678)
- [ ] Time format uses 24-hour clock (kl. 14:30, not 2:30 PM)
- [ ] Relative time phrases in Norwegian

### Design System Compliance
- [ ] Use Byggern brand colors from Tailwind config
- [ ] Follow existing component patterns
- [ ] Maintain 200-line component limit
- [ ] Use proper TypeScript strict mode

### Performance Requirements
- [ ] No `any` types allowed
- [ ] Component folder structure with barrel exports
- [ ] Tests required for all components
- [ ] Error boundaries and ARIA attributes

---

## 📞 Support & Resources

### Documentation References
- [Main Implementation Plan](./implement-catalog-stats-welcome-screen.md)
- [Backend Engineer Task](./backend-stats-endpoint-prompt.md)
- [CLAUDE.md Project Guide](../CLAUDE.md)

### Development Commands
```bash
./scripts/start-dev.sh           # Development server
npm run type-check              # TypeScript validation
npm run lint                    # ESLint check
npm test                        # Run all tests
./scripts/validate-build.sh     # Full validation pipeline
```

---

**Status**: Ready for implementation after backend completion
**Priority**: High
**Estimated Timeline**: 2-3 days after backend is ready
**Dependencies**: Backend `/stats` endpoint must be deployed and functional

*This checklist ensures systematic implementation of the catalog statistics welcome screen with proper quality gates and validation at each step.*