# Easmith Varekatalog Frontend

**Next.js 15+ TypeScript application for Byggern retail chain's digital product catalog.**

A modern, serverless web application providing real-time product lookup and inventory management for 80 store staff across Byggern retail locations with a 3,000-item warehouse catalog.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (recommended)
./scripts/start-dev.sh

# Alternative start
npm run dev
```

**Development URL**: http://localhost:3000
**Live Develop Environment**: https://develop.d226fk1z311q90.amplifyapp.com/

## 🛡️ Git Workflow & Branch Protection

**CRITICAL**: `main` branch is protected - **NO DIRECT PUSHES ALLOWED**

### Branch Structure
- **`develop`** → Active development, direct pushes allowed, auto-deploys to dev environment
- **`main`** → Production-ready code, PR-only updates, auto-deploys to production

### Developer Workflow

```bash
# ✅ Daily Development (work on develop)
git checkout develop
git pull origin develop
# Make your changes
git add .
git commit -m "feat: your feature description"
git push origin develop                    # Direct pushes allowed

# ✅ Production Deployment (PR required)
gh pr create --base main --head develop   # Only way to update main
```

### What You Cannot Do ❌
- ❌ Push directly to `main` branch
- ❌ Force push to `main`
- ❌ Merge PRs without required review
- ❌ Bypass conversation resolution

### Branch Protection Rules
- **Required**: 1 approving review
- **Required**: All conversations resolved
- **Blocked**: Direct pushes, force pushes, branch deletion

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 + React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4 with Byggern brand design system
- **State**: SWR for data fetching + Zustand for complex state
- **Authentication**: AWS Cognito OAuth 2.0 + PKCE + Azure AD integration
- **Deployment**: AWS Amplify with CloudFront CDN

### Project Structure
```
├── app/                 # Next.js App Router (Norwegian locale)
│   ├── api/            # API routes and auth callbacks
│   └── globals.css     # Tailwind v4 imports
├── components/         # Atomic design components
│   ├── ui/            # Basic UI components
│   ├── layout/        # Layout components
│   ├── search/        # Search functionality
│   └── auth/          # Authentication components
├── hooks/             # Custom React hooks
├── types/             # TypeScript definitions
├── utils/             # API client and utilities
└── public/           # Static assets and Byggern branding
```

## 🔧 Development Commands

```bash
# Essential Commands
./scripts/start-dev.sh           # Preferred development server
npm run build                    # Production build
npm run type-check              # TypeScript validation (strict mode)
npm run lint                    # ESLint check
npm test                        # Run tests
./scripts/validate-build.sh     # Full validation pipeline

# Git Workflow
gh pr create --base main --head develop  # Create production PR
gh pr list --base main                   # View current PRs
git branch --show-current                # Check current branch
```

## 🌐 Environment Configuration

### Development Environment
- **URL**: https://develop.d226fk1z311q90.amplifyapp.com/
- **API**: https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev
- **AWS Account**: 852634887748
- **Branch**: `develop` (auto-deploy)

### Production Environment
- **URL**: https://main.d1bvibntd0i61j.amplifyapp.com/
- **API**: https://17lf5fwwik.execute-api.eu-west-1.amazonaws.com/prod
- **AWS Account**: 785105558045
- **Branch**: `main` (PR-only updates)

## 🔐 Authentication

**OAuth 2.0 + OpenID Connect** with AWS Cognito and Azure AD integration

### Features
- **Progressive Enhancement**: Public data visible to all, sensitive data requires auth
- **Scope-Based Access**: `varekatalog/prices`, `varekatalog/inventory`
- **JWT Token Management**: Automatic refresh and session persistence
- **Data Masking**: Real-time permission-based data visibility

### Authentication Flow
1. User clicks login → Cognito Hosted UI
2. Azure AD OIDC authentication
3. JWT tokens with scopes returned
4. Frontend shows/hides data based on scopes

## 🎨 Design System

**Byggern Brand Authentic Design** - Based on byggern.no styling

### Brand Colors
```css
:root {
  --byggern-primary: #1E3A5F;    /* Brand blue */
  --byggern-orange: #FF6B35;     /* Accent orange */
  --byggern-gold: #d4af37;       /* Logo gold */
  --byggern-success: #3dcc4a;    /* Success green */
}
```

### Typography
- **Primary**: Inter (UI text)
- **Display**: National2 (brand headings)
- **Mono**: JetBrains Mono (code/technical)

## 🧪 Testing

```bash
npm test                    # Run Jest test suite
npm run test:watch         # Watch mode for development
```

**Testing Requirements**:
- Every component requires a `.test.tsx` file
- Jest + React Testing Library
- TypeScript strict mode compliance

## 📦 Build & Deployment

### Local Build Validation
```bash
./scripts/validate-build.sh    # Complete validation pipeline
npm run build                  # Production build only
```

### AWS Amplify Deployment
- **Develop Branch**: Auto-deploys to development environment
- **Main Branch**: Auto-deploys to production (after PR merge)
- **Build**: Node.js 20, npm, TypeScript compilation

### Environment Variables
**CRITICAL**: Configure in AWS Amplify Console (not .env files)
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_COGNITO_*` variables
- `NEXT_PUBLIC_AZURE_AD_*` variables

## 🚨 Troubleshooting

### Common Issues

**Build Failures**:
```bash
npm run type-check          # Check TypeScript errors
npm run lint                # Check ESLint issues
```

**Environment Issues**:
```bash
npm run validate-env        # Validate environment variables
```

**Git Workflow Issues**:
```
Error: Protected branch update failed for refs/heads/main
Solution: Use PR workflow instead of direct push
```

### Tailwind v4 Issues
- **CSS Import**: Use `@import "tailwindcss"` (not @tailwind directives)
- **PostCSS**: Requires `@tailwindcss/postcss` plugin
- **Config**: Colors defined in `tailwind.config.ts` with @theme directive

## 📋 Domain Knowledge

### Norwegian Building Supplies Context
- **VVS-nummer**: 8-digit product codes (plumbing/heating systems)
- **Anbrekk**: Partial quantity availability ("Ja"/"Nei")
- **LagerStatus**: Stock levels ("På lager", "Få igjen", "Utsolgt")
- **NOBB**: Norwegian building supplies database integration

### Performance Goals
- **Search Response**: <2 seconds
- **Authentication**: OAuth 2.0 with 8-hour sessions
- **Availability**: 99% uptime target
- **Users**: 80 store staff, 20 concurrent users

## 🔗 Related Repositories

- **Backend**: `/home/rydesp/dev/easmith-varekatalog-backend/`
- **Infrastructure**: AWS Lambda, DynamoDB, OpenSearch, API Gateway
- **Authentication**: AWS Cognito + Azure AD OIDC

## 📚 Documentation

- **CLAUDE.md**: Complete developer guide with architecture details
- **docs/**: Design specifications, API references, troubleshooting guides
- **Architecture**: See backend repository for system architecture documentation

---

## 🤝 Contributing

1. **Always work on `develop` branch**
2. **Create descriptive commits**: `feat:`, `fix:`, `docs:`, `refactor:`
3. **Test thoroughly** before creating PRs
4. **Create PR from develop to main** for production deployment
5. **Resolve all review comments** before merging

### Error Handling
If you see branch protection errors, you're likely trying to push to main:
```bash
git checkout develop        # Switch to develop
git push origin develop     # Push to allowed branch
```

**Remember**: This workflow protects production while enabling fast development iteration! 🚀