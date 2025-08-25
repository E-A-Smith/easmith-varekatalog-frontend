# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Easmith Varekatalog Frontend** - Next.js 15+ TypeScript application for Byggern retail chain's digital product catalog.

## 📋 Repository Context

This is a **standalone frontend repository** extracted from the main varekatalog monorepo at `/home/rydesp/dev/varekatalog/`.

**Original Location**: `/home/rydesp/dev/varekatalog/src/frontend/`  
**New Location**: `/home/rydesp/dev/easmith-varekatalog-frontend/` (this repository)

## 🚀 Development Commands

```bash
# Essential commands
npm run dev         # Development server (Next.js 15)
npm run build       # Production build
npm run start       # Start production server
npm run type-check  # TypeScript validation (strict mode)
npm run lint        # ESLint check

# Testing (Jest + React Testing Library)
npm test            # Run all tests
npm test -- --watch # Run tests in watch mode
npm test ComponentName.test.tsx  # Run specific test

# Build validation
./scripts/validate-build.sh           # Full validation pipeline
./scripts/validate-build.sh --help    # See validation options
./scripts/validate-build.sh --skip-build --skip-security  # Quick validation

# Development utilities
tree -I 'node_modules|.next|.git' -L 3  # Repository overview
```

## 🏗️ Architecture Overview

**Tech Stack**: Next.js 15 + React 19 + TypeScript 5 + Tailwind CSS v4 + SWR + Zustand

**Core Architecture Pattern**:
```
app/                    # Next.js App Router (Norwegian locale)
├── api/               # API routes (/health, /search)
├── layout.tsx         # Root layout with fonts (Inter + JetBrains Mono)
└── page.tsx          # Main search interface

components/            # Atomic design pattern
├── ui/               # Base design system components
├── layout/           # Layout components (Header, SubHeader, AppLayout)
└── search/           # Search-specific components

hooks/                # Custom React hooks
├── useProductSearch.ts  # Main search logic with API fallback
└── useApiStatus.ts     # API health monitoring

types/                # TypeScript definitions
├── product.ts        # Complete product data model (Norwegian)
└── index.ts          # Type exports

utils/                # Utilities
└── api.ts            # API client with error handling
```

**State Management**: 
- **SWR** for API data fetching and caching
- **Zustand** for global state (when needed)
- **React hooks** for component-local state

**API Integration**:
- `utils/api.ts` provides `SimpleApiClient` with timeout handling
- Mock data fallback in `useProductSearch` hook when API unavailable
- Environment variables: `NEXT_PUBLIC_API_ENDPOINT`, `NEXT_PUBLIC_REGION`

## 🔧 Critical Configuration Requirements

**PostCSS (EXACT - Required for Tailwind v4)**:
```javascript
// postcss.config.mjs
const config = { plugins: ["@tailwindcss/postcss"] };
```

**TypeScript (Ultra-Strict)**:
```json
{
  "strict": true,
  "exactOptionalPropertyTypes": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
}
```

**Path Aliases** (configured in tsconfig.json and jest.config.js):
```typescript
@/*           -> ./*
@/components  -> ./components
@/hooks       -> ./hooks  
@/types       -> ./types
@/utils       -> ./utils
```

## 🚨 FORBIDDEN Practices
- ❌ `any` types (strict TypeScript enforced)
- ❌ Inline styles (use Tailwind classes only)
- ❌ Components over 200 lines
- ❌ --turbopack flag (incompatible with Tailwind v4)
- ❌ console.log in production (removed by Next.js compiler)

## ✅ MANDATORY Practices
- ✅ TypeScript strict mode with ultra-strict settings
- ✅ Component folder structure with barrel exports
- ✅ Norwegian language support (`lang="no"`)
- ✅ Tests for all components (Jest + React Testing Library)
- ✅ Error boundaries and proper error handling
- ✅ Semantic HTML with ARIA attributes

## 📁 Component Structure (MANDATORY)

```
ComponentName/
├── ComponentName.tsx      # Main implementation
├── ComponentName.test.tsx # Tests (required)
├── types.ts              # Component-specific types
└── index.ts              # Export barrel
```

**Example barrel export** (`components/ui/index.ts`):
```typescript
export { Button } from './Button';
export { Input } from './Input';
export { Table } from './Table';
// etc.
```

## 🎨 DESIGN SYSTEM & UI GUIDELINES

### **Authentic Byggern Brand Implementation**
**Design Philosophy**: "Authentic Byggern Brand Excellence with Desktop-First Efficiency"

Based on official Byggern website analysis, the design system implements authentic brand elements while optimizing for retail staff productivity in customer-facing environments.

**Official Color Palette** (extracted from Byggern.no):
```css
/* Primary Brand Colors */
--byggern-primary: #216ba5;        /* Official brand blue */
--byggern-primary-hover: #1d5d90;  /* Hover state */
--byggern-orange: #ff6803;         /* Accent orange */
--byggern-gold: #d4af37;          /* Logo gold */
--byggern-yellow: #FFDC32;        /* Authentic yellow from website */
--byggern-success: #3dcc4a;       /* Success green */
--byggern-header: #4D4D4D;        /* Header background gray */

/* Status Colors */
--byggern-text-primary: #141414;   /* Main text */
--byggern-text-secondary: #4d4d4d; /* Secondary text */
--byggern-border: #aeaeae;         /* Border color */
```

**Official Typography System**:
```css
/* Authentic Byggern fonts from website analysis */
--font-heading: 'National2', 'Helvetica Neue', helvetica, arial, sans-serif;
--font-body: 'Roboto', Arial, sans-serif;

/* Font weights and sizes aligned with brand standards */
--font-normal: 400;
--font-medium: 500;
--font-bold: 700;
```

**Interface Layout Architecture** (PC-First 1920x1080 with responsive support):

**Two-Tier Header System** (Authentic Byggern structure):
- **Sub Header**: 36px height - "Varekatalog for Løvenskiold Logistikk levert av Byggern"
- **Main Header**: 56px height - "BYGGER'N" logo in gold + search input + menu icons
- **Quick Filters**: 36px height - Norwegian filter controls (leverandører, kategorier, lager)

**Professional Table Layout**:
- **Dense Information Display**: Optimized for rapid product scanning
- **Visual Status System**: Color-coded stock indicators (● green, × red)
- **Norwegian Terminology**: Complete localization for retail staff
- **Keyboard Navigation**: Full accessibility support with tab order

**Enhanced Bottom Section** (✅ IMPLEMENTED):
- **Pagination Bar**: "Showing 1-10 of 1,247 produkter • [◀ Forrige] [1][2][3]...[125] [Neste ▶] • [📊 Eksporter]"
- **Enhanced Status Bar**: "🌐 Online • Last sync: 14:30 • Response: 0.3s • Kundevisning: AV/PÅ"

**New Components Implemented**:
- `components/ui/Pagination/` - Complete pagination with Norwegian labels and export functionality
- `components/ui/EnhancedStatusBar/` - Professional status tracking with customer view toggle
- Integrated pagination logic with 10 items per page and smooth scrolling
- Real-time connection status monitoring and performance metrics display

**Visual Status Indicators**:
- **På lager**: `●` Green circle (byggern-success #3dcc4a)
- **Utsolgt**: `×` Red cross (semantic-error #DC3545)
- **Få igjen**: `▲` Orange triangle (byggern-orange #ff6803)
- **Anbrekk Status**: "Ja/Nei" with clear typography

**Responsive Strategy**:
```css
mobile: 0px → 639px    /* Card layout, touch-optimized controls */
tablet: 640px → 767px  /* Condensed table, larger touch targets */
desktop: 768px → 1919px /* Full information density */
wide: 1920px+          /* Maximum productivity layout */
```

**Norwegian Language Standards**:
- **Complete Localization**: All interface elements in Norwegian
- **Search Placeholder**: "Søk etter produkter eller kategorier..."
- **Filter Labels**: "Alle leverandører", "Alle kategorier", "Lager: Alle"  
- **Status Messages**: "Online", "Kundevisning: AV/PÅ"
- **Actions**: "Vis", "Skjul", "Eksporter", "Forrige", "Neste"
- **Product Count**: "produkter" instead of generic "items"

**Design System Achievements**:
- **Brand Authenticity**: Official colors (#216ba5 vs generic #1E3A5F)
- **Professional Credibility**: Two-tier navigation matching Byggern.no
- **Retail Optimization**: <1 second search, customer view controls
- **Accessibility**: WCAG AA compliance with Norwegian character support (æ, ø, å)

## 🎯 Product Domain Knowledge

**Core Entity**: Norwegian building supplies product catalog
- **VVS-nummer**: 8-digit product codes (primary identifier)
- **Anbrekk**: Partial quantity availability ("Ja"/"Nei")
- **LagerStatus**: Stock levels in Norwegian ("På lager", "Få igjen", etc.)
- **Categories**: Building supplies categories (Sikkerhet, Beslag, Festing, etc.)

**Search Performance Goal**: <2 second response time for store staff during customer interactions

**API Fallback Strategy**: `useProductSearch` hook includes mock Norwegian product data when API unavailable

## 🔗 AWS Amplify Deployment

**Configuration**: `amplify.yml` for frontend-only deployment
- **Node.js Version**: 20 LTS (AWS Amplify compatibility - Node.js 22 not yet supported)
- **Local Development**: Node.js 22 LTS supported for local development
- **Auto-deploy branch**: `develop` → https://develop.d23xt6r6u1pris.amplifyapp.com/
- **Build artifacts**: `.next/` directory
- **Security headers**: CSP, HSTS configured in `next.config.ts`

**Environment Variables** (set in Amplify Console):
```
NEXT_PUBLIC_API_ENDPOINT=https://api-dev.varekatalog.byggern.no
NEXT_PUBLIC_REGION=eu-west-1
```

## 🧪 Testing Strategy

**Test Setup**: `setupTests.ts` + `jest.config.js` with Next.js integration
```bash
# Test patterns
npm test                    # All tests
npm test Header             # Component tests
npm test -- --coverage     # Coverage report
```

**Test Requirements**: Every component must have corresponding `.test.tsx` file

## 🔒 Security & Performance

**Security Headers**: Configured in `next.config.ts`
- CSP with specific domains allowed
- X-Frame-Options: DENY
- HSTS enabled

**Performance Optimizations**:
- Tree-shaking for `lucide-react` and AWS SDK
- Image optimization with AVIF/WebP
- Console removal in production
- Package import optimization

**Build Validation**: `./scripts/validate-build.sh` runs complete CI/CD pipeline locally

---

**Related Repositories**: Main backend at `/home/rydesp/dev/varekatalog/` contains infrastructure (CloudFormation), Lambda functions, and complete system documentation.