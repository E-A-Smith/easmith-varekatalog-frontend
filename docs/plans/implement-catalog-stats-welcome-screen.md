# Implement Catalog Statistics Welcome Screen

## 🎯 Problem Statement

Currently, when users visit the Varekatalog frontend without performing a search, they see a minimal placeholder message:
- "Søk etter produkter for å se resultater"
- "Bruk søkefeltet ovenfor for å finne produkter i katalogen"

This empty state provides no value to users and misses an opportunity to showcase important catalog information such as:
- When stock levels were last updated
- When prices were last updated
- Total number of products, categories, and suppliers
- Fun facts and statistics about the catalog

## 📋 Requirements

### User Stories
As a **warehouse employee**, I want to:
- See when stock levels were last updated so I know if the data is current
- View total product count to understand catalog scope
- Check data completeness to trust the information

As a **purchasing manager**, I want to:
- Know when prices were last updated for accurate budgeting
- See supplier count for vendor diversity insights
- View category breakdown for procurement planning

### Functional Requirements
1. Display catalog statistics in an engaging card-based layout
2. Show last update timestamps for stock and prices
3. Present fun facts that rotate or change
4. Maintain responsive design (mobile, tablet, desktop)
5. Use Norwegian language throughout
6. Load statistics without blocking initial page render

## 🏗️ Current Architecture

### Repository Structure
```
/home/rydesp/dev/easmith-varekatalog-frontend/
├── app/
│   ├── page.tsx                 # Main page with search interface
│   └── api/
│       ├── health/route.ts      # Health check endpoint
│       └── search/route.ts      # Product search endpoint
├── components/
│   ├── ui/                      # Reusable UI components
│   ├── layout/                  # Layout components
│   └── search/                  # Search-specific components
├── hooks/
│   └── useProductSearch.ts      # Product search hook
├── types/
│   └── product.ts              # TypeScript definitions
└── utils/
    └── api.ts                  # API client
```

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **State Management**: React hooks + SWR for data fetching
- **Language**: TypeScript 5 (strict mode)
- **UI Library**: Custom components with Byggern brand colors

### Design System Colors
```typescript
// From tailwind.config.ts
colors: {
  byggern: {
    primary: '#1E3A5F',    // Brand blue
    orange: '#FF6B35',     // Accent orange
    gold: '#d4af37',       // Logo gold
    yellow: '#FFDC32',     // Brand yellow
    success: '#3dcc4a',    // Success green
  },
  semantic: {
    success: '#28A745',
    warning: '#FFC107',
    error: '#DC3545',
    info: '#17A2B8',
  },
  neutral: {
    // Full grayscale palette 50-900
  }
}
```

## 🎨 Design Specifications

### Welcome Screen Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ Velkommen til varekatalogen for Løvenskiold Logistikk       │
│ Levert av Byggern                                           │
│                                                             │
│ "Søk etter produkter for å se resultater"                   │
│ "Bruk søkefeltet ovenfor for å finne produkter i katalogen" │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌────────────┬────────────┬────────────┐
│    [📦]    │    [🏷️]    │    [🏭]    │
│ Produkter  │ Kategorier │Leverandører│
│  45 678    │    127     │     43     │
└────────────┴────────────┴────────────┘

Note: [📦], [🏷️], [🏭] represent custom SVG icons (see implementation)

┌─────────────────────────────────────────────────────┐
│ [📅] Siste oppdateringer                            │
│                                                      │
│ • Lagernivå: 2 timer siden (kl. 14:30)             │
│ • Priser: I går kl. 22:00                          │
└─────────────────────────────────────────────────────┘


```

### Responsive Breakpoints
- **Mobile** (< 640px): Stack all cards vertically
- **Tablet** (640px - 1024px): 3 cards in a row (may wrap to 2+1)
- **Desktop** (> 1024px): 3 columns for stat cards

## 📁 Implementation Plan
### Step 0: Prompt backend team to implement API endpoint

Do not start on Step 7 (Update Main Page) before the backend team has implemented the API endpoint. We will not use mock data.

### Step 1: Create SVG Icon Components
**File**: `components/ui/icons/CatalogIcons.tsx`
```typescript
'use client';

import { FC } from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const ProductsIcon: FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M12 2L2 7l10 5 10-5-10-5z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinejoin="round"
    />
    <path 
      d="m2 17 10 5 10-5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinejoin="round"
    />
    <path 
      d="m2 12 10 5 10-5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinejoin="round"
    />
  </svg>
);

export const CategoriesIcon: FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <rect 
      x="3" 
      y="3" 
      width="7" 
      height="7" 
      rx="1" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <rect 
      x="14" 
      y="3" 
      width="7" 
      height="7" 
      rx="1" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <rect 
      x="14" 
      y="14" 
      width="7" 
      height="7" 
      rx="1" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <rect 
      x="3" 
      y="14" 
      width="7" 
      height="7" 
      rx="1" 
      stroke="currentColor" 
      strokeWidth="2"
    />
  </svg>
);

export const SuppliersIcon: FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M3 21h18" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M5 21V7l8-4v18" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M19 21V11l-6-4" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M9 9v12" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M15 15v6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export const CalendarIcon: FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <rect 
      x="3" 
      y="4" 
      width="18" 
      height="18" 
      rx="2" 
      ry="2" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <line 
      x1="16" 
      y1="2" 
      x2="16" 
      y2="6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <line 
      x1="8" 
      y1="2" 
      x2="8" 
      y2="6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <line 
      x1="3" 
      y1="10" 
      x2="21" 
      y2="10" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);

export const LightbulbIcon: FC<IconProps> = ({ className = "", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M9 21h6" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M12 17V3" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <circle 
      cx="12" 
      cy="12" 
      r="9" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    <path 
      d="M8 12h8" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <path 
      d="M10 16h4" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
    />
  </svg>
);
```

**File**: `components/ui/icons/index.ts`
```typescript
export {
  ProductsIcon,
  CategoriesIcon,
  SuppliersIcon,
  CalendarIcon,
  LightbulbIcon
} from './CatalogIcons';
```

### Step 2: Create Type Definitions
**File**: `types/catalog-stats.ts`
```typescript
export interface CatalogStats {
  totalProducts: number;
  totalCategories: number;
  totalSuppliers: number;
  lastStockUpdate: string;   // ISO 8601 timestamp
  lastPriceUpdate: string;   // ISO 8601 timestamp
  recentAdditions: number;   // Products added in last 7 days
  popularProducts: Array<{
    name: string;
    searches: number;
  }>;
  funFact: string;           // Random fun fact in Norwegian
}

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}
```

### Step 2: Create API Proxy Endpoint
**File**: `app/api/catalog-stats/route.ts`

⚠️ **DEPENDENCY**: This step requires the backend `/stats` endpoint to be implemented first. See Backend Requirements section.

```typescript
import { NextResponse } from 'next/server';
import type { CatalogStats } from '@/types/catalog-stats';

export async function GET() {
  try {
    const externalApiUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL;
    
    if (!externalApiUrl) {
      throw new Error('NEXT_PUBLIC_EXTERNAL_API_URL environment variable not configured');
    }
    
    const response = await fetch(`${externalApiUrl}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Backend API failed with status ${response.status}`);
    }
    
    const stats: CatalogStats = await response.json();
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch catalog stats:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Statistics temporarily unavailable',
      message: 'Backend service is not available. Please try again later.',
    }, { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

### Step 3: Create Stats Hook
**File**: `hooks/useCatalogStats.ts`
```typescript
import useSWR from 'swr';
import type { CatalogStats } from '@/types/catalog-stats';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useCatalogStats() {
  const { data, error, isLoading } = useSWR<CatalogStats>(
    '/api/catalog-stats',
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      revalidateOnFocus: false,
      fallbackData: undefined
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error
  };
}
```

### Step 4: Create StatCard Component
**File**: `components/catalog/StatCard/StatCard.tsx`
```typescript
'use client';

import { FC } from 'react';
import type { StatCardProps } from '@/types/catalog-stats';

export const StatCard: FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtext,
  trend,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-6 animate-pulse">
        <div className="h-8 w-8 bg-neutral-200 rounded mb-3"></div>
        <div className="h-4 bg-neutral-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-neutral-200 rounded w-32"></div>
      </div>
    );
  }

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format numbers with Norwegian thousand separator
      return val.toLocaleString('nb-NO');
    }
    return val;
  };

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 hover:shadow-medium transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-shrink-0">{icon}</div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded ${
            trend === 'up' ? 'bg-semantic-success/10 text-semantic-success' :
            trend === 'down' ? 'bg-semantic-error/10 text-semantic-error' :
            'bg-neutral-100 text-neutral-600'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        )}
      </div>
      <p className="text-sm text-neutral-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-neutral-900">{formatValue(value)}</p>
      {subtext && (
        <p className="text-xs text-neutral-500 mt-1">{subtext}</p>
      )}
    </div>
  );
};
```

### Step 5: Create CatalogStats Component
**File**: `components/catalog/CatalogStats/CatalogStats.tsx`
```typescript
'use client';

import { FC } from 'react';
import { StatCard } from '../StatCard/StatCard';
import { useCatalogStats } from '@/hooks/useCatalogStats';
import { formatDistanceToNow } from '@/utils/date-helpers';
import { useAuth } from '@/hooks/useAuth';
import { 
  ProductsIcon, 
  CategoriesIcon, 
  SuppliersIcon, 
  CalendarIcon, 
  LightbulbIcon 
} from '@/components/ui/icons';

export const CatalogStats: FC = () => {
  const { stats, isLoading, isError } = useCatalogStats();
  const { authState } = useAuth();
  const { isAuthenticated, user } = authState;

  // Generate personalized greeting
  const getGreeting = (): string => {
    if (isAuthenticated && user) {
      const hour = new Date().getHours();
      const timeGreeting = 
        hour < 10 ? 'God morgen' :
        hour < 17 ? 'God dag' :
        'God kveld';
      
      const name = user.given_name || user.username || '';
      return `${timeGreeting}, ${name}!`;
    }
    return 'Velkommen til Varekatalogen';
  };

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-semantic-error">Kunne ikke laste katalogstatistikk</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Welcome Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-neutral-900 mb-2">
          {getGreeting()}
        </h2>
        <p className="text-lg text-neutral-600">
          Din komplette byggevareløsning med over 45 000 produkter
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<ProductsIcon size={32} className="text-byggern-orange" />}
          label="Produkter"
          value={stats?.totalProducts || 0}
          loading={isLoading}
        />
        <StatCard
          icon={<CategoriesIcon size={32} className="text-byggern-orange" />}
          label="Kategorier"
          value={stats?.totalCategories || 0}
          loading={isLoading}
        />
        <StatCard
          icon={<SuppliersIcon size={32} className="text-byggern-orange" />}
          label="Leverandører"
          value={stats?.totalSuppliers || 0}
          loading={isLoading}
        />
      </div>

      {/* Last Updates Section */}
      <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
          <CalendarIcon size={20} className="text-byggern-orange mr-2" />
          Siste oppdateringer
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-semantic-success rounded-full mr-3"></span>
            <span className="text-sm text-neutral-700">
              <strong>Lagernivå:</strong> {stats ? formatDistanceToNow(stats.lastStockUpdate) : '...'} 
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-semantic-info rounded-full mr-3"></span>
            <span className="text-sm text-neutral-700">
              <strong>Priser:</strong> {stats ? formatDistanceToNow(stats.lastPriceUpdate) : '...'}
            </span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-byggern-orange rounded-full mr-3"></span>
            <span className="text-sm text-neutral-700">
              <strong>Nye produkter:</strong> {stats?.recentAdditions || 0} lagt til denne uken
            </span>
          </div>
        </div>
      </div>

      {/* Fun Fact Section */}
      <div className="bg-byggern-primary/5 rounded-lg p-6 border border-byggern-primary/20">
        <h3 className="text-lg font-semibold text-byggern-primary mb-3 flex items-center">
          <LightbulbIcon size={20} className="text-byggern-orange mr-2" />
          Visste du at?
        </h3>
        <p className="text-neutral-700">
          {stats?.funFact || 'Laster interessante fakta...'}
        </p>
      </div>

      {/* Search Prompt */}
      <div className="text-center mt-8">
        <p className="text-neutral-600">
          Bruk søkefeltet ovenfor for å finne produkter i katalogen
        </p>
      </div>
    </div>
  );
};
```

### Step 6: Create Date Helper Utility
**File**: `utils/date-helpers.ts`
```typescript
export function formatDistanceToNow(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'akkurat nå';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minutt' : 'minutter'} siden`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'time' : 'timer'} siden`;
  if (diffDays === 1) return 'i går';
  if (diffDays < 7) return `${diffDays} dager siden`;
  
  // Format as date for older updates
  return date.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
```

### Step 7: Update Main Page
**File**: `app/page.tsx`

Find the section that shows the empty state message (around line where it says "Søk etter produkter for å se resultater") and replace it with:

```typescript
// Add import at the top of the file
import { CatalogStats } from '@/components/catalog/CatalogStats';

// Replace the empty state section:
{!searchState.hasSearched ? (
  <CatalogStats />
) : filteredData.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-neutral-600">
      Ingen produkter funnet
    </p>
    <p className="text-sm text-neutral-500 mt-2">
      Prøv et annet søkeord eller juster filtrene
    </p>
  </div>
) : (
  // Existing table rendering...
)}
```

### Step 8: Add Barrel Exports
**File**: `components/catalog/StatCard/index.ts`
```typescript
export { StatCard } from './StatCard';
export type { StatCardProps } from '@/types/catalog-stats';
```

**File**: `components/catalog/CatalogStats/index.ts`
```typescript
export { CatalogStats } from './CatalogStats';
```

### Step 9: Add Tests
**File**: `components/catalog/StatCard/StatCard.test.tsx`
```typescript
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { ProductsIcon } from '@/components/ui/icons';

describe('StatCard', () => {
  it('renders with all props', () => {
    render(
      <StatCard
        icon={<ProductsIcon size={32} />}
        label="Produkter"
        value={45678}
        subtext="Totalt i katalogen"
      />
    );
    
    expect(screen.getByText('Produkter')).toBeInTheDocument();
    expect(screen.getByText('45 678')).toBeInTheDocument(); // Norwegian formatting
    expect(screen.getByText('Totalt i katalogen')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <StatCard
        icon={<ProductsIcon size={32} />}
        label="Produkter"
        value={0}
        loading={true}
      />
    );
    
    expect(screen.queryByText('Produkter')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
```

## 🧪 Testing Instructions

### 1. Verify Component Rendering
```bash
npm run dev
# Navigate to http://localhost:3000
# Should see catalog stats instead of empty message
```

### 2. Run Unit Tests
```bash
npm test StatCard
npm test CatalogStats
```

### 3. Test Responsive Design
- Open Chrome DevTools
- Test at 375px (mobile), 768px (tablet), 1920px (desktop)
- Verify grid layout adjusts correctly

### 4. Verify API Endpoint
```bash
curl http://localhost:3000/api/catalog-stats
# Should return JSON with all statistics
```

## ✅ Success Criteria

1. **Visual**: Stats cards display with proper icons, numbers, and labels
2. **Data**: All statistics show real data from backend API
3. **Timestamps**: Last update times display in Norwegian relative format
4. **Responsive**: Layout works on mobile, tablet, and desktop
5. **Performance**: Stats load without blocking initial render
6. **Accessibility**: Screen readers can navigate statistics
7. **Error Handling**: Graceful fallback if backend API fails

## 🔧 Configuration Notes

### Environment Variables
Required environment variable for backend API connection:
```bash
NEXT_PUBLIC_EXTERNAL_API_URL=https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev
```

This must be configured before the frontend can connect to the backend statistics endpoint.

### Dependencies
```json
{
  "dependencies": {
    "swr": "^2.2.0"  // Already installed in project
  }
}
```

### TypeScript Configuration
Project already has strict TypeScript enabled. All new code must pass type checking.

## 📚 Future Enhancements

After initial implementation, consider:
1. Connect to real backend statistics API
2. Add charts/graphs for visual data representation
3. Implement real-time updates via WebSocket
4. Add export functionality for statistics
5. Create admin view with more detailed metrics
6. Add filtering by date range
7. Implement caching strategy for better performance

## 🚨 Important Notes

1. **Norwegian Language**: All user-facing text must be in Norwegian (Bokmål)
2. **Number Formatting**: Use Norwegian locale (space as thousand separator)
3. **Time Format**: Use 24-hour clock (kl. 14:30, not 2:30 PM)
4. **Brand Colors**: Use Byggern colors from Tailwind config
5. **Backend Dependency**: Frontend implementation requires backend `/stats` endpoint to be completed first
6. **Real Data Only**: No mock data allowed - must connect to actual backend API

---

## 🔌 BACKEND REQUIREMENTS

### Overview
The frontend implementation requires a backend API endpoint to provide real catalog statistics. The frontend cannot be completed without this backend endpoint. This section describes what the backend team needs to implement.

### Backend Repository
**Location**: `/home/rydesp/dev/easmith-varekatalog-backend/`
**Technology**: AWS Lambda with Node.js/TypeScript
**Database**: DynamoDB for products, OpenSearch for search

### Required API Endpoint

#### Endpoint Details
**URL**: `POST /stats` or `GET /stats`  
**Authentication**: Public endpoint (no authentication required)  
**Response Format**: JSON

#### Response Schema
```typescript
interface CatalogStatsResponse {
  // Core Statistics
  totalProducts: number;        // Total count of products in catalog
  totalCategories: number;      // Unique count of hovedgruppe/undergruppe
  totalSuppliers: number;       // Unique count of leverandørNavn
  
  // Update Timestamps
  lastStockUpdate: string;      // ISO 8601 timestamp of last lagerantall update
  lastPriceUpdate: string;      // ISO 8601 timestamp of last price update
  
  // Recent Activity
  recentAdditions: number;      // Products added in last 7 days
  
  // Popular Items (optional, for fun facts)
  popularProducts?: Array<{
    name: string;              // Product name (varenavn)
    searches: number;           // Search count in last 30 days
  }>;
  
  // Fun Fact (optional)
  funFact?: string;             // Random interesting fact in Norwegian
}
```

#### Example Response
```json
{
  "totalProducts": 45678,
  "totalCategories": 127,
  "totalSuppliers": 43,
  "lastStockUpdate": "2025-01-07T14:30:00Z",
  "lastPriceUpdate": "2025-01-06T22:00:00Z",
  "recentAdditions": 47,
  "popularProducts": [
    {
      "name": "Terrassebord Royal",
      "searches": 234
    },
    {
      "name": "Skrue rustfri 4x40",
      "searches": 189
    }
  ],
  "funFact": "Katalogen inneholder produkter fra 43 norske leverandører!"
}
```

### Implementation Guide for Backend Team

#### Step 1: Create Lambda Handler
**File**: `src/lambdas/stats-api/index.ts`

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Client } from '@opensearch-project/opensearch';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const stats = await collectCatalogStats();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(stats)
    };
  } catch (error) {
    console.error('Failed to collect catalog stats:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function collectCatalogStats() {
  // Implementation details below
}
```

#### Step 2: Implement Data Collection

##### Total Products Count
```typescript
// OpenSearch query
const productCount = await opensearchClient.count({
  index: 'varekatalog-products'
});
// OR DynamoDB scan
const productCount = await dynamoClient.scan({
  TableName: 'varekatalog-products-dev',
  Select: 'COUNT'
});
```

##### Unique Categories Count
```typescript
// OpenSearch aggregation
const categoriesAgg = await opensearchClient.search({
  index: 'varekatalog-products',
  body: {
    size: 0,
    aggs: {
      unique_categories: {
        cardinality: {
          field: 'hovedgruppe.keyword'
        }
      }
    }
  }
});
```

##### Unique Suppliers Count
```typescript
// OpenSearch aggregation
const suppliersAgg = await opensearchClient.search({
  index: 'varekatalog-products',
  body: {
    size: 0,
    aggs: {
      unique_suppliers: {
        cardinality: {
          field: 'leverandørNavn.keyword'
        }
      }
    }
  }
});
```

##### Last Update Timestamps
```typescript
// Option 1: Store in DynamoDB metadata table
const metadata = await dynamoClient.getItem({
  TableName: 'catalog-metadata',
  Key: { id: { S: 'last-updates' } }
});

// Option 2: Query from S3 file timestamps
const s3Response = await s3Client.listObjectsV2({
  Bucket: 'varekatalog-data',
  Prefix: 'stock-updates/',
  MaxKeys: 1
});
const lastStockUpdate = s3Response.Contents[0].LastModified;

// Option 3: CloudWatch metrics
const metricsResponse = await cloudWatchClient.getMetricStatistics({
  Namespace: 'Varekatalog',
  MetricName: 'LastStockUpdate',
  // ...
});
```

##### Recent Additions (Last 7 Days)
```typescript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const recentProducts = await opensearchClient.search({
  index: 'varekatalog-products',
  body: {
    size: 0,
    query: {
      range: {
        createdAt: {
          gte: sevenDaysAgo.toISOString()
        }
      }
    }
  }
});
```

##### Popular Products (Optional)
```typescript
// If you're tracking searches in CloudWatch or DynamoDB
const popularProducts = await dynamoClient.query({
  TableName: 'search-analytics',
  IndexName: 'by-count',
  ScanIndexForward: false,
  Limit: 3,
  KeyConditionExpression: 'period = :period',
  ExpressionAttributeValues: {
    ':period': { S: 'last-30-days' }
  }
});
```

#### Step 3: Generate Fun Facts
```typescript
function generateFunFact(stats: any): string {
  const facts = [
    `Katalogen inneholder produkter fra ${stats.totalSuppliers} norske leverandører!`,
    `Over ${Math.floor(stats.totalProducts * 0.05)} produkter kan leveres som anbrekk.`,
    `${stats.recentAdditions} nye produkter ble lagt til denne uken.`,
    `Den største kategorien inneholder over ${Math.floor(stats.totalProducts / stats.totalCategories * 1.5)} produkter.`,
    `Katalogen har ${stats.totalCategories} forskjellige produktkategorier.`
  ];
  
  return facts[Math.floor(Math.random() * facts.length)];
}
```

#### Step 4: Add Caching Layer
```typescript
import { createHash } from 'crypto';

const CACHE_TTL = 5 * 60; // 5 minutes

async function getCachedStats() {
  const cacheKey = 'catalog-stats';
  
  // Try to get from ElastiCache/Redis
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Generate fresh stats
  const stats = await collectCatalogStats();
  
  // Cache for 5 minutes
  await redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(stats));
  
  return stats;
}
```

### Performance Considerations

1. **Caching is Critical**: Stats don't change frequently, cache for 5-15 minutes
2. **Use Aggregations**: Don't count items one by one, use database aggregations
3. **Parallel Queries**: Run independent queries in parallel using Promise.all()
4. **Pre-compute**: Consider running a scheduled Lambda to pre-compute stats

### Deployment Requirements

#### Infrastructure (CloudFormation/Terraform)
```yaml
CatalogStatsFunction:
  Type: AWS::Lambda::Function
  Properties:
    FunctionName: varekatalog-stats-api
    Runtime: nodejs18.x
    Handler: index.handler
    MemorySize: 256
    Timeout: 10
    Environment:
      Variables:
        OPENSEARCH_DOMAIN: !Ref OpenSearchDomain
        DYNAMODB_TABLE: !Ref ProductsTable
        CACHE_ENABLED: true

StatsApiRoute:
  Type: AWS::ApiGatewayV2::Route
  Properties:
    ApiId: !Ref HttpApi
    RouteKey: GET /stats
    Target: !Sub integrations/${StatsApiIntegration}
```

#### IAM Permissions Required
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:GetItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/varekatalog-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "es:ESHttpGet",
        "es:ESHttpPost"
      ],
      "Resource": "arn:aws:es:*:*:domain/varekatalog/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::varekatalog-data/*"
    }
  ]
}
```

### Testing the Backend Implementation

#### Unit Tests
```typescript
describe('CatalogStats Lambda', () => {
  it('should return all required fields', async () => {
    const response = await handler({} as APIGatewayProxyEvent);
    const body = JSON.parse(response.body);
    
    expect(body).toHaveProperty('totalProducts');
    expect(body).toHaveProperty('totalCategories');
    expect(body).toHaveProperty('totalSuppliers');
    expect(body).toHaveProperty('lastStockUpdate');
    expect(body).toHaveProperty('lastPriceUpdate');
  });
  
  it('should return valid ISO timestamps', async () => {
    const response = await handler({} as APIGatewayProxyEvent);
    const body = JSON.parse(response.body);
    
    expect(new Date(body.lastStockUpdate).toISOString()).toBe(body.lastStockUpdate);
    expect(new Date(body.lastPriceUpdate).toISOString()).toBe(body.lastPriceUpdate);
  });
});
```

#### Integration Test
```bash
# Test the deployed endpoint
curl -X GET https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev/stats

# Expected response format
{
  "totalProducts": 45678,
  "totalCategories": 127,
  "totalSuppliers": 43,
  "lastStockUpdate": "2025-01-07T14:30:00Z",
  "lastPriceUpdate": "2025-01-06T22:00:00Z",
  "recentAdditions": 47
}
```

### Monitoring & Alerts

#### CloudWatch Metrics to Track
- Lambda execution duration
- API response time
- Cache hit ratio
- Error rate

#### Suggested Alarms
- Alert if stats endpoint takes > 3 seconds
- Alert if error rate > 1%
- Alert if cache is not working (all requests are cache misses)

### Integration Steps Between Teams

**Prerequisites**: Backend team must complete the `/stats` endpoint implementation first.

**Backend Team Completion Checklist**:
1. ✅ Lambda function deployed and accessible
2. ✅ API Gateway route configured (`GET /stats`)
3. ✅ All required statistics are returned in correct format
4. ✅ CORS headers configured for frontend access
5. ✅ Endpoint tested and returning valid data

**Frontend Team Integration Steps** (After backend complete):
1. **Configure Environment Variables**:
```bash
# Add to AWS Amplify Console or .env.local
NEXT_PUBLIC_EXTERNAL_API_URL=https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev
```

2. **Test Backend Connection**:
```bash
# Verify backend is working
curl https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev/stats
```

3. **Deploy Frontend**: Frontend API proxy will automatically connect to backend

### Timeline & Dependencies

**Phase 1: Backend Implementation** (Estimated 2-3 days - MUST BE COMPLETED FIRST):
1. Create Lambda function structure (Day 1)
2. Implement data collection queries (Day 1-2)
3. Add caching layer (Day 2)
4. Deploy and test endpoint (Day 2-3)
5. Verify CORS and accessibility (Day 3)

**Phase 2: Frontend Implementation** (Estimated 2-3 days - STARTS AFTER BACKEND COMPLETE):
1. Create SVG icons and components (Day 1)
2. Implement CatalogStats components (Day 1-2)
3. Create API proxy endpoint (Day 2)
4. Add error handling and loading states (Day 2)
5. Test integration with backend (Day 3)
6. Deploy and verify (Day 3)

**Total Timeline**: 4-6 days (sequential, not parallel)

### Success Criteria for Backend

✅ Endpoint responds in < 2 seconds  
✅ All required fields are present  
✅ Timestamps are valid ISO 8601 format  
✅ Numbers are accurate (match actual database counts)  
✅ Cache is working (subsequent calls are faster)  
✅ Error handling returns graceful fallbacks  
✅ CORS headers allow frontend access  

---

## 👤 PERSONALIZATION FEATURE

### Simple Personal Greeting

The implementation includes a minimal personalization feature that makes the welcome screen warmer for authenticated users while keeping the exact same UI structure.

### How It Works

When a user is **not logged in**:
```
Velkommen til Varekatalogen
Din komplette byggevareløsning med over 45 000 produkter
```

When a user **is logged in**, the greeting changes based on time of day:

**Morning (before 10:00):**
```
God morgen, Ola!
Din komplette byggevareløsning med over 45 000 produkter
```

**Day (10:00-17:00):**
```
God dag, Ola!
Din komplette byggevareløsning med over 45 000 produkter
```

**Evening (after 17:00):**
```
God kveld, Ola!
Din komplette byggevareløsning med over 45 000 produkter
```

### Implementation Details

- Uses existing `useAuth()` hook to access user information
- Prioritizes `user.given_name` from Cognito token
- Falls back to `user.username` if no first name available
- Time-based greeting using Norwegian conventions
- Zero impact on UI layout - same design for all users
- Graceful fallback to generic welcome if not authenticated

This simple touch adds warmth without complexity, making users feel recognized when they log in.

---

*This document provides complete instructions for both frontend and backend implementation of the catalog statistics feature. The backend team must complete their implementation first, then the frontend team can integrate and deploy.*

*Implementation Order: Backend → Frontend → Integration*

*Last Updated: 2025-01-07*