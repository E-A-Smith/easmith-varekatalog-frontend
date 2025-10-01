# CLAUDE.md

**Easmith Varekatalog Frontend** - Next.js 15 TypeScript application for Byggern retail chain's digital product catalog.

## 📋 Related Documentation

**Backend Project**: `/home/rydesp/dev/easmith-varekatalog-backend/` - AWS infrastructure, Lambda functions, API implementation
**Backend CLAUDE.md**: `/home/rydesp/dev/easmith-varekatalog-backend/CLAUDE.md` - Backend developer reference

## 🚀 Essential Commands

```bash
./scripts/start-dev.sh           # Development server (handles port conflicts)
npm run build                    # Production build
npm run type-check              # TypeScript validation (strict mode)
npm run lint                    # ESLint check
npm test                        # Run all tests
./scripts/validate-build.sh     # Full validation pipeline
tree -I 'node_modules|.next|.git' -L 3  # Repository overview
```

## 🛡️ Git Workflow

**Branch Protection**:
- `main` → Protected, PR-only (production deployments)
- `develop` → Open for direct pushes (development deployments)

**Workflow**:
```bash
git checkout develop
git push origin develop          # Auto-deploys to DEV

gh pr create --base main --head develop  # Deploy to PROD via PR
```

## 🏗️ Architecture

**Tech Stack**: Next.js 15 + React 19 + TypeScript 5 + Tailwind CSS v4 + SWR + Zustand

**Structure**:
- `app/` - Next.js App Router, API routes, auth callbacks
- `components/` - UI components (atomic design pattern)
- `hooks/` - useProductSearch, useApiStatus, useAuth
- `types/` - TypeScript definitions (Norwegian product model)
- `utils/` - API client with error handling

**Authentication**: AWS Cognito OAuth 2.0 + PKCE, Azure AD OIDC integration

## 🔧 Critical Configuration

**PostCSS** (Required for Tailwind v4):
```javascript
// postcss.config.mjs
const config = { plugins: ["@tailwindcss/postcss"] };
```

**TypeScript** (Strict Mode):
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

## 🚨 Coding Standards

**Forbidden**:
- `any` types
- Inline styles (use Tailwind only)
- Components over 200 lines
- `--turbopack` flag (incompatible with Tailwind v4)

**Mandatory**:
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

## 🌐 AWS Infrastructure (Verified 2025-09-30)

### Development Environment
**Account**: 852634887748
**Region**: eu-west-1

**Amplify**:
- App ID: `d226fk1z311q90`
- Branch: `develop`
- URL: https://develop.d226fk1z311q90.amplifyapp.com/

**API Gateway**:
- ID: `28svlvit82`
- URL: https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev

**Cognito**:
- User Pool: `eu-west-1_GggkvCmcK` (eas-varekatalog-users-dev)
- Client: `58hle80tfmljv7rbmf9o4tfmsf` (varekatalog-client-dev)
- Domain: `eas-varekatalog-auth-dev.auth.eu-west-1.amazoncognito.com`

### Production Environment
**Account**: 785105558045
**Region**: eu-west-1

**Amplify**:
- App ID: `d1bvibntd0i61j`
- Branch: `main`
- URL (Primary): https://varekatalog.byggern.no/
- URL (Fallback): https://main.d1bvibntd0i61j.amplifyapp.com/

**API Gateway**:
- ID: `17lf5fwwik`
- URL: https://17lf5fwwik.execute-api.eu-west-1.amazonaws.com/prod

**Cognito**:
- User Pool: `eu-west-1_Y9lANGJGs` (eas-varekatalog-users-prod)
- Client: `3jur7ub2mvai5ar5969i3bmum1` (eas-varekatalog-client-prod)
- Domain: `eas-varekatalog-auth-prod.auth.eu-west-1.amazoncognito.com`

## 🔐 Azure AD Integration

**Tenant ID**: `f0be9261-9717-4dc6-9ca2-b31924476526`
**Application ID**: `31fc9aa9-223e-4bc5-a371-7b0d56a13075`

Configured as OIDC identity provider in both Cognito user pools.

## 🔗 Local Development Environment Variables

**File**: `.env.development`
```bash
NEXT_PUBLIC_API_BASE_URL=https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev
NEXT_PUBLIC_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_CLIENT_ID=58hle80tfmljv7rbmf9o4tfmsf
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_GggkvCmcK
NEXT_PUBLIC_COGNITO_DOMAIN=eas-varekatalog-auth-dev.auth.eu-west-1.amazoncognito.com
```

**File**: `.env.production`
```bash
NEXT_PUBLIC_API_BASE_URL=https://17lf5fwwik.execute-api.eu-west-1.amazonaws.com/prod
NEXT_PUBLIC_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_CLIENT_ID=3jur7ub2mvai5ar5969i3bmum1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_Y9lANGJGs
NEXT_PUBLIC_COGNITO_DOMAIN=eas-varekatalog-auth-prod.auth.eu-west-1.amazoncognito.com
```

**AWS Amplify**: Environment variables must also be configured in Amplify Console (per branch) as Next.js processes them before build scripts execute.

## 🎯 Domain Knowledge

**Norwegian Building Supplies**:
- **VVS-nummer**: 8-digit product codes
- **Anbrekk**: Partial quantity availability ("Ja"/"Nei")
- **LagerStatus**: Stock levels ("På lager", "Utsolgt", "NA")

## 🧪 Testing & Security

**Testing**: Jest + React Testing Library, every component requires `.test.tsx`
**Security Headers**: CSP, HSTS, X-Frame-Options configured in `next.config.ts`
**Validation**: `npm run validate-env` for environment variable checking

---

*Last verified: 2025-09-30*
*All infrastructure IDs verified via AWS CLI*
