# CLAUDE.md

**Easmith Varekatalog Frontend** - Next.js 15+ TypeScript application for Byggern retail chain's digital product catalog.

## 🚀 Essential Commands

```bash
./scripts/start-dev.sh           # PREFERRED: Development server (handles port conflicts)
npm run build                    # Production build
npm run type-check              # TypeScript validation (strict mode)
npm run lint                    # ESLint check
npm test                        # Run all tests
./scripts/validate-build.sh     # Full validation pipeline
tree -I 'node_modules|.next|.git' -L 3  # Repository overview
```

## 🏗️ Architecture

**Tech Stack**: Next.js 15 + React 19 + TypeScript 5 + Tailwind CSS v4 + SWR + Zustand

**Structure**:
- `app/` - Next.js App Router (Norwegian locale), API routes, auth callbacks
- `components/` - Atomic design: ui/, layout/, search/, auth/
- `hooks/` - useProductSearch, useApiStatus, useAuth (OAuth 2.0 + PKCE)
- `types/` - TypeScript definitions (Norwegian product model)
- `utils/` - API client with error handling

**Authentication**: AWS Cognito OAuth 2.0 + PKCE, Azure AD integration, JWT Bearer tokens

## 🔧 Critical Configuration

**PostCSS (Required for Tailwind v4)**:
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

**Path Aliases**:
```typescript
@/*           -> ./*
@/components  -> ./components
@/hooks       -> ./hooks  
@/types       -> ./types
@/utils       -> ./utils
```

## 🚨 FORBIDDEN / ✅ MANDATORY

**❌ FORBIDDEN**:
- `any` types
- Inline styles (use Tailwind only)
- Components over 200 lines
- `--turbopack` flag (incompatible with Tailwind v4)

**✅ MANDATORY**:
- TypeScript strict mode
- Component folder structure with barrel exports
- Norwegian language support (`lang="no"`)
- Tests for all components
- Error boundaries and ARIA attributes

## 📁 Component Structure

```
ComponentName/
├── ComponentName.tsx      # Main implementation
├── ComponentName.test.tsx # Tests (required)
├── types.ts              # Component-specific types
└── index.ts              # Export barrel
```

## 🎨 Design System

**Tailwind CSS v4 Architecture** - Single source of truth in `tailwind.config.ts`

**Brand Colors**:
```typescript
byggern: {
  primary: '#1E3A5F',    // Brand blue
  orange: '#FF6B35',     // Accent orange
  gold: '#d4af37',       // Logo gold
  success: '#3dcc4a',    // Success green
}
```

**Typography**:
```typescript
fontFamily: {
  sans: ['Inter', 'system-ui'],           # Primary UI
  display: ['National2', 'Helvetica'],    # Brand headings
  mono: ['JetBrains Mono', 'monospace'],  # Code/technical
}
```

## 🚨 Critical Troubleshooting

### Tailwind v4 Issues

**CSS Import**: Must use `@import "tailwindcss"` (not `@tailwind` directives)

**PostCSS Plugin**: Use `@tailwindcss/postcss` (not `tailwindcss`)

**NODE_ENV Warning**: Set `NODE_ENV=production` for builds or unset entirely

### AWS Amplify Environment Variables

**CRITICAL**: Environment variables must be configured in AWS Amplify Console (per branch), not .env files

**Root Cause**: Next.js processes environment variables BEFORE amplify.yml build scripts execute

**Solution**:
```bash
aws amplify update-branch --app-id APP_ID --branch-name develop \
  --environment-variables NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

## 🔗 Environment Configuration

**Local Development** (`.env.local`):
```bash
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_CLIENT_ID=vuuc11qdf11tnst6i3c7fhc6p
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_EIDmPWkK2
```

**AWS Amplify**: Configure variables directly in Amplify Console (branch-specific)

**Validation**: Built-in fail-fast validation via `npm run validate-env`

## 🎯 Domain Knowledge

**Norwegian Building Supplies Catalog**:
- **VVS-nummer**: 8-digit product codes
- **Anbrekk**: Partial quantity availability ("Ja"/"Nei")
- **LagerStatus**: Stock levels ("På lager", "Få igjen", "Utsolgt")
- **Performance Goal**: <2 second response time

## 🧪 Testing & Security

**Testing**: Jest + React Testing Library, every component requires `.test.tsx`

**Security Headers**: CSP, HSTS, X-Frame-Options configured in `next.config.ts`

**Build Validation**: `./scripts/validate-build.sh` for complete CI/CD pipeline

---

**Deployment**: AWS Amplify (`develop` branch → https://develop.d226fk1z311q90.amplifyapp.com/)
**Related**: Backend at `/home/rydesp/dev/varekatalog/` (infrastructure, Lambda functions)