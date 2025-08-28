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
- Environment variables: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_API_ENDPOINT`, `NEXT_PUBLIC_REGION`
- Development proxy in `next.config.ts` (disabled in production)
- AWS Cognito authentication configured

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

### **Tailwind-Based Design System Architecture**
**Design Philosophy**: "Single Source of Truth with Authentic Byggern Brand Excellence"

The design system is now fully integrated into Tailwind CSS configuration, providing a unified, maintainable design token system that ensures consistency across the entire application.

**Design System Architecture**:
```
📁 Design Token Management
├── tailwind.config.ts     ← Single source of truth for ALL design tokens
├── app/globals.css        ← Essential base styles & accessibility utilities only
└── components/            ← Use Tailwind utility classes exclusively
```

**Authentic Byggern Brand Colors** (source of truth in `tailwind.config.ts`):
```typescript
colors: {
  byggern: {
    primary: '#1E3A5F',      // Original brand blue (restored as source of truth)
    blue: '#1E3A5F',         // Legacy compatibility
    orange: '#FF6B35',       // Original accent orange
    gold: '#d4af37',         // Logo gold
    yellow: '#FFDC32',       // Authentic yellow from website
    success: '#3dcc4a',      // Success green
    header: '#4D4D4D',       // Header background gray
  },
  semantic: {
    success: '#28A745',      // Semantic success (from original globals.css)
    warning: '#FFC107',      // Semantic warning
    error: '#DC3545',        // Semantic error
    info: '#17A2B8',         // Semantic info
  },
  neutral: {
    50: '#F8F9FA',  // Complete neutral scale from original design
    100: '#E9ECEF', // through 900 for consistent grayscale
    // ... (full scale in tailwind.config.ts)
  }
}
```

**Professional Typography System**:
```typescript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],     // Primary UI font
  display: ['National2', 'Helvetica Neue'],       // Byggern brand headings
  body: ['Roboto', 'Arial', 'sans-serif'],        // Body text (legacy)
  mono: ['JetBrains Mono', 'monospace'],          // Code/technical content
}
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px - Original design scale
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
  // ... (complete scale in tailwind.config.ts)
}
```

**Design Token Usage** (Tailwind utility classes):
```jsx
// Brand Colors
<button className="bg-byggern-primary hover:bg-byggern-primary/90">
<span className="text-byggern-orange">
<div className="border-byggern-gold">

// Semantic Colors  
<div className="text-semantic-error bg-semantic-success/10">
<span className="text-semantic-warning">

// Neutral Scale
<div className="bg-neutral-50 text-neutral-700 border-neutral-200">
<header className="bg-neutral-800 text-neutral-100">

// Typography
<h1 className="font-display text-2xl font-bold">
<p className="font-sans text-base text-neutral-600">
```

## 🚨 TROUBLESHOOTING: Critical Tailwind v4 Configuration

### **Common Issues & Solutions**

**Issue 1: Tailwind CSS not loading (styles appear as black/white)**
```css
// ❌ WRONG (Tailwind v3 syntax)
@tailwind base;
@tailwind components;
@tailwind utilities;

// ✅ CORRECT (Tailwind v4 syntax)
@import "tailwindcss";
```

**Issue 2: PostCSS Plugin Error**
```bash
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin
```
**Solution**: Use `@tailwindcss/postcss` plugin in `postcss.config.mjs`:
```javascript
const config = {
  plugins: ["@tailwindcss/postcss"],
};
export default config;
```

**Issue 3: "This site can't be reached" on localhost:3000**
**Solution**: Try alternative URLs:
- `http://127.0.0.1:3000` (instead of localhost)
- `http://10.255.255.254:3000` (network address)
- Clear browser cache and try incognito mode

**Issue 4: Server starts but crashes on page load**
**Cause**: Mixing Tailwind v3 and v4 syntax
**Solution**: Ensure consistent v4 configuration across all files

**Design System Migration Benefits**:
- ✅ **Single Source of Truth**: All design tokens centralized in `tailwind.config.ts`
- ✅ **Original Design Preserved**: `#1E3A5F` and `#FF6B35` restored as authentic Byggern colors
- ✅ **Eliminated Conflicts**: No more CSS custom property vs Tailwind config mismatches
- ✅ **Performance**: Reduced globals.css by 64% (220 → 79 lines)
- ✅ **Maintainability**: Clean separation between design tokens and base styles
- ✅ **Type Safety**: Tailwind config provides TypeScript autocompletion

**CRITICAL: Tailwind CSS v4 Requirements**:
- ⚠️ **CSS Import Syntax Change**: Must use `@import "tailwindcss"` instead of `@tailwind` directives
- ⚠️ **PostCSS Plugin**: Requires `@tailwindcss/postcss` package, not traditional `tailwindcss` plugin
- ⚠️ **Breaking Changes**: v4 completely redesigned CSS import system
- ⚠️ **Browser Connectivity**: localhost may require `127.0.0.1:3000` instead of `localhost:3000`

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
- **Auto-deploy branch**: `develop` → https://develop.d226fk1z311q90.amplifyapp.com/
- **Environment Stage**: DEVELOPMENT (loads .env.development correctly)
- **Build artifacts**: `.next/` directory
- **Security headers**: CSP, HSTS configured in `next.config.ts`

**Environment Variables Configuration**:

**Local Development** (`.env.local` - not committed):
```bash
# API Configuration - Local Development (uses built-in Next.js API routes)
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_API_ENDPOINT=/api
NEXT_PUBLIC_REGION=eu-west-1

# AWS Cognito Authentication - DEV Environment
NEXT_PUBLIC_COGNITO_CLIENT_ID=vuuc11qdf11tnst6i3c7fhc6p
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_EIDmPWkK2

# External AWS API Gateway (requires authentication)
# EXTERNAL_API_URL=https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev
```

**AWS Amplify Deployment Strategy** (Updated 2024):
```bash
# ✅ DECISION: ALL environment variables moved to config files
# ❌ NO variables configured in Amplify Console
# ✅ Automatic environment resolution based on branch deployment
```

**Environment Management Philosophy**:
- **Version Controlled**: All environment configs are part of the codebase
- **Branch-Based**: `develop` branch uses `.env.development`, `main` uses `.env.production`
- **Local Override**: `.env.local` overrides deployed environment for local development
- **Single Source of Truth**: No duplicate configuration in Amplify Console
- **Developer Experience**: New developers get correct config with `git clone`
- **Deployment vs Development**: Different endpoints for local testing vs deployed integration

**Environment File Structure** (Following 2024 Best Practices):
- `.env.local` - Local development overrides (uses Next.js API routes with mock data)
- `.env.development` - AWS Amplify dev deployment (uses AWS API Gateway DEV stage)  
- `.env.production` - AWS Amplify production deployment (uses AWS API Gateway PROD stage)
- API proxy disabled (uses direct API calls)

**Migration Completed**: All Amplify Console environment variables removed (2024-12-28)

**⚠️ CRITICAL: Environment Variable Policy**:
- **PUBLIC VARIABLES**: Use `NEXT_PUBLIC_*` prefix and store in `.env.*` files (version controlled)
- **SECRET VARIABLES**: Use plain names (no `NEXT_PUBLIC_*`) and store in AWS Amplify Console only
- **SECURITY**: API keys, passwords, and tokens must NEVER be in version-controlled files

**API Access Configuration**:
- ✅ **Current Status**: AWS API Gateway configured for public access (no authentication required)
- ✅ **API Endpoints**: `https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev`
- ✅ **Method**: POST requests to `/search` endpoint with JSON payload
- ⚠️ **Future**: If API keys are added, follow server-side proxy pattern above
- **BRANCH MAPPING**: 
  - `develop` branch → `.env.development` 
  - `main`/`master` branch → `.env.production`
- **VERIFICATION**: Check Amplify build logs for "Loaded env from .env.{environment}" confirmation

**For New Environments/Branches**:
1. Create corresponding `.env.{environment}` file
2. Let Next.js automatic environment resolution handle the rest
3. No manual Amplify Console configuration needed

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