# CLAUDE.md - Varekatalog Frontend Developer Quick Reference

**Easmith Varekatalog Frontend** - Next.js 15+ TypeScript application for Byggern retail chain's digital product catalog.

## 📋 Repository Structure

This is a **standalone frontend repository** extracted from the main varekatalog monorepo at `/home/rydesp/dev/varekatalog/`.

**Original Location**: `/home/rydesp/dev/varekatalog/src/frontend/`  
**New Location**: `/home/rydesp/dev/easmith-varekatalog-frontend/` (this repository)

## 🚀 Development Essentials

**Live Environment:**
- DEV: https://develop.d23xt6r6u1pris.amplifyapp.com/
- Branch: develop (auto-deploy enabled via AWS Amplify)

**Documentation References:**
- **🏗️ SYSTEM ARCHITECTURE**: See main repo `/docs/architecture/varekatalog-system-architecture.md`
- **📋 BUSINESS REQUIREMENTS**: See main repo `/docs/project/product-manager-output.md` 
- **🎨 DESIGN SYSTEM**: See main repo `/docs/design/` - UI/UX specifications, brand guidelines, component designs

## ⚡ Quick Commands

```bash
npm run dev         # Development server
npm run build       # Production build
npm run start       # Start production server
npm run type-check  # TypeScript validation
npm run lint        # ESLint check
npm run test        # Run tests (Jest + React Testing Library)

# Build validation script
./scripts/validate-build.sh           # Full validation
./scripts/validate-build.sh --help    # See all options
```

## 🔧 Critical Configuration

**PostCSS Config (EXACT):**
```javascript
// postcss.config.mjs
const config = { plugins: ["@tailwindcss/postcss"] };
```

**TypeScript Strict (REQUIRED):**
```json
{
  "strict": true,
  "exactOptionalPropertyTypes": true,
  "noUncheckedIndexedAccess": true
}
```

**Path Aliases:**
```typescript
@/*           -> ./*
@/components  -> ./components
@/hooks       -> ./hooks  
@/types       -> ./types
@/utils       -> ./utils
```

## 🚨 FORBIDDEN Practices
- ❌ `any` types (use proper TypeScript)
- ❌ Inline styles (use Tailwind classes)
- ❌ Components over 200 lines
- ❌ --turbopack flag (incompatible with Tailwind v4)
- ❌ console.log in production

## ✅ MANDATORY Practices
- ✅ TypeScript strict mode
- ✅ Export barrel files
- ✅ Error boundaries
- ✅ Norwegian language support
- ✅ Semantic HTML + ARIA

## 📁 Component Structure (MANDATORY)

```
ComponentName/
├── ComponentName.tsx      # Main implementation
├── ComponentName.test.tsx # Tests (required)
├── types.ts              # Component types
└── index.ts              # Export barrel
```

## 📚 Essential File References

**Configuration Files:**
- `/package.json` - Dependencies and scripts
- `/tsconfig.json` - TypeScript configuration  
- `/next.config.ts` - Next.js configuration
- `/amplify.yml` - AWS deployment pipeline
- `/jest.config.js` - Test configuration
- `/setupTests.ts` - Jest setup

**Key Implementation Files:**
- `/utils/api.ts` - API utilities
- `/components/ui/` - Design system components
- `/types/` - TypeScript definitions
- `/hooks/` - React hooks

## 🎯 Quick Context

**Product Goal**: Lightning-fast product lookup for store staff during customer interactions (<2 sec response)

**Current Status**: ✅ Phase 1 Complete - Standalone repository ready for independent deployment

**Emergency Protocol**: Production fixes via hotfix branch from main + full test suite + AWS Amplify deployment

## 🔗 Related Repositories

**Main Backend Repository**: `/home/rydesp/dev/varekatalog/`
- Infrastructure (CloudFormation/AWS SAM)
- Lambda functions
- Documentation
- AWS configurations

## 🚀 AWS Amplify Deployment

**Build Configuration**: `amplify.yml`
- Frontend-only deployment (no appRoot needed)
- Automatic builds on push to `develop`
- Built artifacts in `.next/` directory

**Environment Variables** (configure in Amplify Console):
- `NEXT_PUBLIC_API_ENDPOINT` - Backend API endpoint
- `NEXT_PUBLIC_REGION` - AWS region

---
*Standalone frontend repository. For complete system documentation, see main varekatalog repository at `/home/rydesp/dev/varekatalog/docs/`*