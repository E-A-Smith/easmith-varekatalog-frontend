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