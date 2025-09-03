# Implementation Plan: Authentication-Based Data Masking in Product Table

## Overview
Implementation plan for data masking in the product table based on authentication status, following the design specification in `docs/design/varekatalog-design-specification.md`. 

**Key Point**: This is **not** about two different table layouts - it's the **same table structure** with sensitive data fields masked (****) when users are not authenticated.

## Instructions for Executing Agent

**CRITICAL**: Before starting implementation, you MUST read and understand the following files to have complete context:

### **Required Reading - Frontend Context:**
1. **`/home/rydesp/dev/easmith-varekatalog-frontend/CLAUDE.md`** - Complete project context, tech stack, coding standards, and development guidelines
2. **`/home/rydesp/dev/easmith-varekatalog-frontend/docs/design/varekatalog-design-specification.md`** - Visual design specification with exact table layouts (logged in vs not logged in variants)
3. **`/home/rydesp/dev/easmith-varekatalog-frontend/app/page.tsx`** - Current main page implementation with existing table structure
4. **`/home/rydesp/dev/easmith-varekatalog-frontend/hooks/useAuth.ts`** - Existing authentication hook with AWS Cognito integration
5. **`/home/rydesp/dev/easmith-varekatalog-frontend/types/product.ts`** - Current Product type definitions
6. **`/home/rydesp/dev/easmith-varekatalog-frontend/components/ui/Table.tsx`** - Table component structure and capabilities

### **Required Reading - Backend Integration Context:**
7. **`/home/rydesp/dev/easmith-varekatalog-backend/docs/architecture/oauth-system-architecture-documentation.md`** - Complete OAuth 2.0 system architecture (AWS Cognito + Azure AD)
8. **`/home/rydesp/dev/easmith-varekatalog-backend/docs/project/api-endpoints-reference.md`** - API endpoints, authentication requirements, and OAuth scopes
9. **`/home/rydesp/dev/easmith-varekatalog-backend/docs/architecture/oauth-technical-specifications.md`** - Technical OAuth implementation details and JWT token structure

### **Key Integration Points to Understand:**
- **Authentication Architecture**: AWS Cognito User Pool (eu-west-1_EIDmPWkK2) with Azure AD identity provider
- **API Gateway**: `https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev`
- **OAuth Scopes**: `varekatalog/prices`, `varekatalog/inventory` (controls sensitive data access)
- **Public Search**: Product search is always public, no authentication required
- **JWT Authorization**: Bearer tokens with scope-based permissions for sensitive data only
- **Data Masking Strategy**: Same table layout, sensitive fields show "****" when not authorized
- **Norwegian Localization**: Complete interface in Norwegian language

**IMPORTANT UPDATE**: Search functionality is fully public and does not require authentication. The `varekatalog/search` scope is for backend logging only, not access control.

### **Current State Verification:**
Before starting, verify the current working state:
1. Run `npm run dev` to see existing table implementation
2. Check authentication hook functionality
3. Review current Product type structure
4. Understand existing component architecture

### **Development Guidelines:**
- **Follow CLAUDE.md**: TypeScript strict mode, component structure, Norwegian language
- **Design Compliance**: Match exact table layouts from design specification
- **Authentication Integration**: Use OAuth scopes for conditional data display
- **Testing Strategy**: Test all authentication states (no auth, partial scopes, full scopes)
- **Error Handling**: Graceful degradation for authentication failures

### **Implementation Sequence:**
Execute phases in exact order - each phase builds on the previous one:
- **Phase 1**: Visual table layout (all columns, simulated not-logged-in state)
- **Phase 2**: Authentication integration with OAuth scopes
- **Phase 3**: Header authentication feedback
- **Phase 4**: Status bar integration

**IMPORTANT**: Do not skip the required reading - the OAuth architecture and design specifications are essential for correct implementation.

## Current State Analysis

### Existing Components
- **Authentication System**: AWS Cognito integration via `hooks/useAuth.ts`
  - Provides `isAuthenticated` state
  - Handles login/logout functionality
  - Manages access tokens

- **Table Component**: Generic table in `components/ui/Table.tsx`
  - Currently displays all columns unconditionally
  - Supports custom column rendering

- **EnhancedStatusBar**: Component exists at `components/ui/EnhancedStatusBar/`
  - Has customer view toggle functionality
  - Not currently integrated in main page
  - Includes connection status indicators

- **Main Page**: `app/page.tsx`
  - Uses `useAuth` hook
  - Displays product table with all columns
  - Missing customer view state management

## Requirements from Design Specification

### Professional Table Layout (from section "Main Interface - Professional Table Layout")
- **Price Visibility**: Toggle for customer-facing scenarios
- **Customer View Mode**: "Kundevisning: AV/PÅ" toggle
- **Status Bar**: Shows online status, sync time, response time, and customer view toggle

### Column Visibility Rules (Updated from Design Specification)

#### Always Visible Columns
1. **Status** (●/×) - Stock availability indicator
2. **Product Name** - Product name
3. **Supplier** - Supplier/manufacturer
4. **LH** - Product SKU/code (internal reference)
5. **🔗NOBB** - NOBB external link
6. **Anbr** - Partial quantity indicator (Ja/Nei)
7. **# i pakning** - Package quantity
8. **Prisenhet** - Price unit (STK, POS, etc.)

#### Authentication-Dependent Columns (Masked with **** when not logged in)
1. **Lagerantall** - Stock quantity
   - Shows actual numbers when logged in
   - Shows **** when not logged in

2. **Grunnpris** - Base price
   - Shows actual price when logged in
   - Shows **** when not logged in

3. **Nettopris** - Net price  
   - Shows actual price when logged in
   - Shows **** when not logged in

#### Key Changes from Original Plan
- NOBB link is always visible (not authentication-dependent)
- Price masking uses **** instead of hiding entire columns
- More detailed column structure with specific pricing fields
- Package quantity and price unit always visible

## Implementation Plan

### Phase 1: Implement Full Table Layout (Not Logged In State)
**File: `app/page.tsx`**

Focus on creating the complete table structure first, showing all columns as per the design specification. This allows visual inspection and testing before adding authentication logic.

1. Update the Product type to include all required fields
2. Update mock data to include all new fields
3. Replace current table columns with complete 10-column layout
4. Show "****" for sensitive fields (simulating not logged in state)

**Goals for Phase 1:**
- Visual verification of complete table layout
- Ensure all columns display correctly
- Test responsive behavior with full column set
- Validate Norwegian language labels

### Phase 2: Complete Integration with Authentication
**Objective**: Integrate OAuth authentication with data masking and scope-based access control

Based on the backend OAuth architecture using AWS Cognito + Azure AD, this phase implements complete authentication integration with the table display.

#### **Task 2.1: Update Product Type Definitions**
**File: `types/product.ts`**

**Subtasks:**
1. Add new required fields to Product interface
2. Update LagerStatus type for new status values
3. Add OAuth scope-related types
4. Update mock data structure

```typescript
interface Product {
  // Existing fields
  id: string;
  navn: string;
  produsent: string;
  lagerstatus: LagerStatus;
  anbrekk: 'Ja' | 'Nei';
  
  // New fields from backend API
  lh: string;              // Internal LH code
  nobbNumber: string;      // NOBB external reference
  pakningAntall: number;   // Package quantity
  prisenhet: string;       // Price unit (STK, POS, etc.)
  
  // OAuth scope-dependent fields
  lagerantall?: number;    // Stock quantity (inventory scope)
  grunnpris?: number;      // Base price (prices scope)
  nettopris?: number;      // Net price (prices scope)
}

// OAuth scopes from backend (CORRECTED: Search is public)
type OAuthScope = 'varekatalog/prices' | 'varekatalog/inventory';
```

#### **Task 2.2: Enhance useAuth Hook Integration**
**File: `hooks/useAuth.ts`**

**Subtasks:**
1. Add OAuth scope parsing from JWT token
2. Add user permissions checking functions
3. Implement token validation status tracking
4. Add scope-based data access helpers

```typescript
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: CognitoUser | null;
  accessToken: string | null;
  scopes: OAuthScope[];        // New: Parsed from JWT
  permissions: UserPermissions; // New: Scope-based permissions
  error: string | null;
}

interface UserPermissions {
  canViewPrices: boolean;     // Requires 'varekatalog/prices' scope
  canViewInventory: boolean;  // Requires 'varekatalog/inventory' scope  
  canSearch: boolean;         // Always true - search is public
}
```

#### **Task 2.3: Create Scope-Based Column Rendering**
**File: `app/page.tsx`**

**Subtasks:**
1. Implement `getTableColumns` function with OAuth scope logic
2. Create conditional rendering based on user permissions
3. Add loading states for authentication checks
4. Implement data masking with "****" for unauthorized fields

```typescript
const getTableColumns = (authState: AuthState) => {
  const { isAuthenticated, permissions } = authState;
  
  return [
    // Always visible columns
    { key: 'lagerstatus', label: '', render: StatusIndicator },
    { key: 'navn', label: 'Product Name' },
    { key: 'produsent', label: 'Supplier' },
    { key: 'lh', label: 'LH', align: 'center' },
    { key: 'nobb-link', label: '🔗NOBB', render: NOBBLink },
    { key: 'anbrekk', label: 'Anbr', align: 'center' },
    { key: 'pakningAntall', label: '# i pakning', align: 'center' },
    
    // OAuth scope-dependent columns
    { 
      key: 'lagerantall', 
      label: 'Lagerantall',
      render: (value: unknown) => permissions.canViewInventory 
        ? value 
        : <span className="text-neutral-400">****</span>
    },
    { key: 'prisenhet', label: 'Prisenhet', align: 'center' },
    {
      key: 'grunnpris',
      label: 'Grunnpris', 
      render: (value: unknown) => permissions.canViewPrices
        ? `kr ${(value as number).toFixed(2)}`
        : <span className="text-neutral-400">****</span>
    },
    {
      key: 'nettopris',
      label: 'Nettopris',
      render: (value: unknown) => permissions.canViewPrices
        ? `kr ${(value as number).toFixed(2)}`
        : <span className="text-neutral-400">****</span>
    }
  ];
};
```

#### **Task 2.4: Update Mock Data for Testing**
**File: `app/page.tsx`**

**Subtasks:**
1. Expand mock product data with all required fields
2. Add realistic Norwegian product data
3. Include various price ranges and stock levels
4. Add different product categories for filtering tests

```typescript
const catalogProducts: Product[] = [
  {
    id: '1',
    navn: 'SKRUE TRESKRUE 50MM GALVANISERT',
    produsent: 'BILTEMA',
    lagerstatus: 'På lager',
    anbrekk: 'Ja',
    lh: '123456',
    nobbNumber: '41033994',
    pakningAntall: 5,
    lagerantall: 333,
    prisenhet: 'STK',
    grunnpris: 450.00,
    nettopris: 562.50,
    kategori: 'Skruer og bolter'
  },
  // ... additional realistic product data
];
```

#### **Task 2.5: Implement Authentication State Testing**
**File: `app/page.tsx`**

**Subtasks:**
1. Add authentication status display for debugging
2. Create manual authentication toggle for development
3. Add scope permission indicators
4. Implement loading states during auth checks

```typescript
// Development helper for testing auth states
const AuthDebugPanel = () => (
  process.env.NODE_ENV === 'development' && (
    <div className="p-4 bg-yellow-50 border border-yellow-200 mb-4">
      <h3>Auth Debug (Dev Only)</h3>
      <p>Authenticated: {authState.isAuthenticated ? 'Yes' : 'No'}</p>
      <p>Scopes: {authState.scopes.join(', ')}</p>
      <p>Can View Prices: {authState.permissions.canViewPrices ? 'Yes' : 'No'}</p>
      <p>Can View Inventory: {authState.permissions.canViewInventory ? 'Yes' : 'No'}</p>
    </div>
  )
);
```

#### **Task 2.6: API Integration Preparation**
**File: `utils/api.ts`**

**Subtasks:**
1. Update API client to include OAuth authorization headers
2. Add scope-based API endpoint selection
3. Implement JWT token refresh logic
4. Add error handling for authentication failures

```typescript
const apiClient = {
  async searchProducts(query: string, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, limit: 20, offset: 0 })
    });
    
    return response.json();
  }
};
```

#### **Testing Checklist for Phase 2:**

**Authentication States:**
- [x] Not authenticated: Shows basic product info with masked sensitive data (****)
- [x] Public search: Always works regardless of authentication status
- [x] Authenticated with prices scope only: Shows pricing data, masks inventory
- [x] Authenticated with inventory scope only: Shows stock levels, masks prices
- [x] Authenticated with both scopes: Shows complete data (prices + inventory)

**Data Display:**
- [ ] Price masking works correctly (kr XXX.XX vs ****)
- [ ] Inventory masking works correctly (numbers vs ****)
- [ ] NOBB links functional in all states
- [ ] Column alignment and formatting consistent

**Error Handling:**
- [ ] Invalid tokens handled gracefully
- [ ] Expired tokens trigger re-authentication
- [ ] Network errors display appropriate messages
- [ ] Loading states show during auth checks

```typescript
const getTableColumns = (isAuthenticated: boolean, customerViewEnabled: boolean) => {
  return [
    // Always visible columns
    { 
      key: 'lagerstatus', 
      label: '', 
      align: 'center',
      render: (value: unknown) => <StatusIndicator status={value as LagerStatus} />
    },
    { key: 'navn', label: 'Product Name' },
    { key: 'produsent', label: 'Supplier' },
    { key: 'lh', label: 'LH', align: 'center' },
    { 
      key: 'nobb-link', 
      label: '🔗NOBB', 
      align: 'center',
      render: (value: unknown, row: unknown) => (
        <NOBBLink nobbNumber={(row as Product).nobbNumber || ''} />
      )
    },
    { key: 'anbrekk', label: 'Anbr', align: 'center' },
    { key: 'pakningAntall', label: '# i pakning', align: 'center' },
    
    // Stock quantity - masked when not authenticated
    { 
      key: 'lagerantall', 
      label: 'Lagerantall', 
      align: 'right',
      render: (value: unknown) => 
        isAuthenticated ? value : <span className="text-neutral-400">****</span>
    },
    
    { key: 'prisenhet', label: 'Prisenhet', align: 'center' },
    
    // Base price - masked when not authenticated
    { 
      key: 'grunnpris', 
      label: 'Grunnpris', 
      align: 'right',
      render: (value: unknown) => 
        isAuthenticated 
          ? <span>kr {(value as number).toFixed(2)}</span>
          : <span className="text-neutral-400">****</span>
    },
    
    // Net price - masked when not authenticated  
    { 
      key: 'nettopris', 
      label: 'Nettopris', 
      align: 'right',
      render: (value: unknown) => 
        isAuthenticated 
          ? <span>kr {(value as number).toFixed(2)}</span>
          : <span className="text-neutral-400">****</span>
    }
  ];
};
```

### Phase 3: Add Visual Authentication Feedback in Header
**File: `components/layout/Header.tsx`**

Add authentication state indicators to the header to show login/logout status.

1. Import and use `useAuth` hook in Header component
2. Show login button (🔒) when not authenticated  
3. Display user info/logout when authenticated
4. Update sub-header to show authentication status

**Goals for Phase 3:**
- Clear visual feedback for current authentication state
- Professional login/logout functionality
- Consistent with Byggern brand styling

### Phase 4: Integrate EnhancedStatusBar Component
**File: `app/page.tsx`**

Final phase to add the status bar with customer view toggle functionality.

1. Import EnhancedStatusBar component
2. Add customer view state management
3. Add connection status tracking
4. Position status bar at bottom of interface
5. Connect customer view toggle handler

**Goals for Phase 4:**
- Complete the professional retail interface
- Add customer view toggle functionality
- Monitor connection and performance status

```typescript
<EnhancedStatusBar
  connectionStatus={connectionStatus}
  customerView={{
    isEnabled: customerViewEnabled,
    displayText: customerViewEnabled ? 'PÅ' : 'AV'
  }}
  onCustomerViewToggle={() => setCustomerViewEnabled(!customerViewEnabled)}
/>
```

## Testing Checklist

### Scenario 1: Not Logged In
- [ ] All columns are visible but sensitive data shows ****
- [ ] Stock quantity (Lagerantall) shows ****
- [ ] Base price (Grunnpris) shows ****
- [ ] Net price (Nettopris) shows ****
- [ ] NOBB links are still functional
- [ ] Login button is visible in header
- [ ] Customer view toggle is disabled/hidden

### Scenario 2: Logged In - Customer View OFF
- [ ] All columns show actual data
- [ ] Stock quantities display real numbers
- [ ] Prices display in NOK format (kr XXX.XX)
- [ ] User info/logout visible in header
- [ ] Customer view toggle shows "AV"
- [ ] All authentication-dependent data is visible

### Scenario 3: Logged In - Customer View ON
- [ ] Same as logged in scenario (no change in this design)
- [ ] Customer view toggle shows "PÅ"
- [ ] Toggle button has active state styling
- [ ] Note: In this design, customer view doesn't hide prices from authenticated users

### Scenario 4: Connection Status
- [ ] Online/offline indicator works correctly
- [ ] Last sync time updates after searches
- [ ] Response time shows actual API response times
- [ ] Status bar is responsive on mobile/tablet

## File Changes Summary

### Files to Modify
1. **`app/page.tsx`**
   - Add customer view state
   - Add connection status state
   - Implement column filtering logic
   - Integrate EnhancedStatusBar
   - Update table columns dynamically

### Files to Review (may need updates)
1. **`components/layout/Header.tsx`**
   - Add login/logout button visibility
   - Show user authentication status

2. **`components/ui/EnhancedStatusBar/types.ts`**
   - Verify type definitions are complete

## Implementation Priority

1. **High Priority**
   - Column visibility logic based on auth state
   - Customer view toggle functionality
   - Integration of EnhancedStatusBar

2. **Medium Priority**
   - Visual authentication indicators in header
   - Connection status tracking

3. **Low Priority**
   - Animation transitions for column show/hide
   - Additional customer view mode indicators

## Notes

- The EnhancedStatusBar component already exists with customer view toggle functionality
- Authentication state is available via `useAuth` hook  
- Design specification emphasizes professional appearance for retail environment
- Norwegian language support is already implemented in components
- Consider adding localStorage persistence for customer view preference

## Updated Product Type Requirements

Based on the new table structure, the Product type needs additional fields:

```typescript
interface Product {
  // Existing fields
  id: string;
  navn: string;
  produsent: string;
  lagerstatus: LagerStatus;
  anbrekk: 'Ja' | 'Nei';
  
  // New fields required by updated design
  lh: string;              // LH code (internal reference)
  nobbNumber: string;      // NOBB reference number
  pakningAntall: number;   // Package quantity
  lagerantall: number;     // Stock quantity
  prisenhet: string;       // Price unit (STK, POS, etc.)
  grunnpris: number;       // Base price
  nettopris: number;       // Net price
}
```

## Key Design Changes Impact

1. **Masking vs Hiding**: Instead of hiding entire columns, sensitive data is masked with ****
2. **More Detailed Pricing**: Three price-related fields (Lagerantall, Grunnpris, Nettopris)
3. **Always-Visible NOBB**: NOBB links are functional for all users
4. **Consistent Layout**: Table structure remains the same, only content changes

## Success Criteria

1. **Functional Requirements**
   - Single table layout with data masking based on authentication
   - Public search functionality (no authentication required)
   - Customer view toggle works correctly when authenticated  
   - Sensitive data masking (****) follows specified rules

2. **User Experience**
   - Smooth transitions between states
   - Clear visual feedback for current mode
   - Professional appearance maintained
   - Search always available for anonymous users

3. **Technical Requirements**
   - No performance degradation
   - TypeScript strict mode compliance
   - Responsive design maintained

## Implementation Status (COMPLETED)

**Phase 1**: ✅ Complete table layout with simulated authentication
**Phase 2**: ✅ Real OAuth integration with corrected public search

### **Corrected OAuth Scope Understanding:**
- **`varekatalog/search`**: Backend logging scope only - **NOT required for frontend access**
- **`varekatalog/prices`**: Required for price visibility (Grunnpris, Nettopris)  
- **`varekatalog/inventory`**: Required for stock quantity visibility (Lagerantall)
- **Public Access**: Search and basic product information always available

### **Final Authentication Matrix:**

| Auth State | Search | Basic Data | Lagerantall | Grunnpris/Nettopris |
|------------|--------|------------|-------------|---------------------|
| **None** | ✅ Public | ✅ Visible | **** | **** |
| **Inventory Only** | ✅ Public | ✅ Visible | ✅ Visible | **** |
| **Prices Only** | ✅ Public | ✅ Visible | **** | ✅ Visible |
| **Both Scopes** | ✅ Public | ✅ Visible | ✅ Visible | ✅ Visible |

**Development Server**: http://localhost:3001
**Debug Panel**: 🔑 Auth Debug button (when NEXT_PUBLIC_ENABLE_DEVTOOLS=true)