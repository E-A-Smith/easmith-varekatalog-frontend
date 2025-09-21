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

## 🛡️ Git Workflow & Branch Protection

**CRITICAL**: `main` branch is protected - **NO DIRECT PUSHES ALLOWED**

```bash
# ✅ Development workflow (daily work)
git checkout develop
git push origin develop          # Direct pushes allowed to develop

# ✅ Production deployment
gh pr create --base main --head develop    # Only way to update main

# ❌ BLOCKED: Direct push to main
git push origin main            # ERROR: Protected branch update failed
```

**Branch Rules**:
- `develop` → Open for direct pushes (development environment)
- `main` → Protected, PR-only (production environment)
- **Required**: 1 approving review + resolved conversations

See [README.md](./README.md) for complete workflow guidelines and project overview.

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

**Local Development** (`.env.development`):
```bash
NEXT_PUBLIC_API_BASE_URL=https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev
NEXT_PUBLIC_REGION=eu-west-1
NEXT_PUBLIC_COGNITO_CLIENT_ID=58hle80tfmljv7rbmf9o4tfmsf
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_GggkvCmcK
NEXT_PUBLIC_COGNITO_DOMAIN=eas-varekatalog-auth-dev.auth.eu-west-1.amazoncognito.com
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

## 🌐 Deployment Configuration

### Development Environment
- **Amplify App**: `d226fk1z311q90` → https://develop.d226fk1z311q90.amplifyapp.com/
- **Branch**: `develop`
- **Account**: 852634887748

### Production Environment
- **Name**: `easmith-varekatalog-frontend`
- **App ID**: `d1bvibntd0i61j`
- **Production URL**: https://main.d1bvibntd0i61j.amplifyapp.com
- **App ARN**: `arn:aws:amplify:eu-west-1:785105558045:apps/d1bvibntd0i61j`
- **Branch**: `main`
- **Account**: 785105558045
**Related**: Backend at `/home/rydesp/dev/easmith-varekatalog-backend/` (infrastructure, Lambda functions)

## 🔗 AWS Accounts

**Development Account**: 852634887748
**Production Account**: 785105558045
**Region**: eu-west-1

---

## 🔄 Infrastructure Status (September 19, 2025)

**✅ COMPLETED - Azure AD Authentication Fully Restored:**
- Backend stack recreation completed (September 18, 2025)
- All AWS resource IDs updated to new infrastructure
- Azure AD OIDC identity provider configured in Cognito User Pool
- Authentication flow fully functional with enterprise Azure AD integration
- Cognito domain aligned with existing Azure AD redirect URI configuration

**✅ COMPLETED - Infrastructure Cleanup (September 19, 2025):**
- DEV user pool renamed to match architecture documentation (`eas-varekatalog-users-dev`)
- Duplicate PROD user pool removed (`eu-west-1_AxAujtTCJ`)
- OAuth scopes verified and aligned across both environments
- Production Cognito configuration fully documented

**✅ COMPLETED - Authentication Fix (September 19, 2025):**
- **CRITICAL**: Fixed `SupportedIdentityProviders` configuration in both environments
- DEV: Changed from `null` to `["AzureAD"]`
- PROD: Changed from `["COGNITO"]` to `["AzureAD"]`
- Root cause: Cognito clients were not configured to redirect to Azure AD identity provider
- Authentication flow now works correctly with Azure AD OIDC integration

**✅ VERIFIED - Authentication Success (September 19, 2025):**
- **DEV**: https://develop.d226fk1z311q90.amplifyapp.com/ - Authentication working ✅
- **PROD**: https://main.d1bvibntd0i61j.amplifyapp.com/ - Authentication working ✅
- **PROD Environment Variables**: Configured missing Amplify env vars for PROD
- **Azure AD Integration**: Both environments successfully authenticating via Azure AD OIDC
- **All component names verified and documented accurately**

**✅ CORRECTED - API Gateway Configuration (September 19, 2025):**
- **CRITICAL FIX**: DEV API Gateway corrected from non-existent `ruy0f0pr6j` to working `28svlvit82`
- **DEV Environment Variables**: Updated Amplify and local config with correct API Gateway ID
- **Documentation Alignment**: All CLAUDE.md files and system architecture updated with verified IDs
- **Component Names**: 100% accuracy achieved across all documentation

**Current Infrastructure:**
- **API Gateway**: `28svlvit82.execute-api.eu-west-1.amazonaws.com/dev` (varekatalog-api-dev) ✅ CORRECTED
- **Cognito Domain**: `eas-varekatalog-auth-dev.auth.eu-west-1.amazoncognito.com`
- **User Pool**: `eu-west-1_GggkvCmcK` (eas-varekatalog-users-dev)
- **Client**: `58hle80tfmljv7rbmf9o4tfmsf` (varekatalog-client-dev)
- **Amplify**: `d226fk1z311q90.amplifyapp.com`

**PRODUCTION Infrastructure:**
- **API Gateway**: `17lf5fwwik.execute-api.eu-west-1.amazonaws.com/prod` (production)
- **Cognito Domain**: `eas-varekatalog-auth-prod.auth.eu-west-1.amazoncognito.com`
- **User Pool**: `eu-west-1_Y9lANGJGs` (eas-varekatalog-users-prod)
- **Client**: `3jur7ub2mvai5ar5969i3bmum1` (eas-varekatalog-client-prod)
- **Amplify**: `d1bvibntd0i61j.amplifyapp.com`

**Azure AD Integration:**
- **Client ID**: `31fc9aa9-223e-4bc5-a371-7b0d56a13075`
- **Tenant ID**: `f0be9261-9717-4dc6-9ca2-b31924476526`
- **Identity Provider**: AzureAD (OIDC) configured in Cognito
- **Status**: Active with proper redirect URI alignment
**OpenSearch Infrastructure:**
- **Domain Name**: `eas-dev-varekatalog`
- **Domain Endpoint**: `search-eas-dev-varekatalog-3krcwwbqhnaakuc262vionkxl4.eu-west-1.es.amazonaws.com`
- **Index Name**: `eas-varekatalog-products`
- **Instance Type**: t3.small.elasticsearch (1 instance)
- **Features**: Full-text search, faceted search, Norwegian product catalogs