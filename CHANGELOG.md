# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-01-03

### Added
- **Dynamic Filter Values Feature** - Filters now populate dynamically based on search results and catalog data
  - Filter options (suppliers/categories) update in real-time based on current dataset
  - Improved UX: Only show suppliers/categories that exist in current results
  - Norwegian locale sorting support for filter options (æ, ø, å)
  - Performance optimized with memoization using `useMemo`
  - Enhanced error handling: Display only "Alle leverandører"/"Alle kategorier" when no valid options available (replaces static fallbacks)
  - New utility functions: `getUniqueSuppliers()`, `getUniqueCategories()`, `validateFilterValue()`
  - Comprehensive unit tests with >90% coverage including edge cases

- **Comprehensive User Stories Documentation** (`docs/project/user-stories.md`)
  - 5 detailed user personas with authentication contexts
  - 12 search-focused user stories with acceptance criteria
  - Authentication-aware search experience specifications
  - Complete coverage of public, basic staff, and full staff access levels
  - Mobile/responsive search experience requirements
  - Priority levels (P0/P1/P2) for development planning

### Changed
- Updated project documentation structure with dedicated user story specifications
- **BREAKING**: QuickFilters component now requires dynamic options via props (no static fallbacks)
- Simplified `applyFilters` function to use consistent Norwegian default values ("Alle leverandører"/"Alle kategorier")

---

## [Previous] - 2024-12-28

### Added
- Environment variable configuration files (`.env.local`, `.env.development`, `.env.production`)
- AWS API Gateway endpoint configuration
- AWS Cognito authentication environment variables
- Production-ready bash scripting for `scripts/start-dev.sh`
- Environment-conditional API proxy configuration

### Changed
- **BREAKING**: Migrated all environment variables from AWS Amplify Console to config files
- Updated API endpoint from legacy `api-dev.varekatalog.byggern.no` to AWS API Gateway
- Environment variable naming consistency in `utils/api.ts`
- Next.js proxy configuration now disabled in production builds
- CSP security headers updated to allow new AWS API Gateway domain

### Deprecated
- Legacy API endpoint: `https://api-dev.varekatalog.byggern.no`

### Removed
- All environment variables from AWS Amplify Console (moved to version-controlled files)

### Security
- Updated Content Security Policy to allow AWS API Gateway domain
- Maintained security headers while supporting new backend infrastructure

### Technical Debt
- Resolved environment variable naming inconsistencies
- Implemented 2024 Next.js best practices for environment management
- Added graceful process termination and PID validation to development scripts

---

## Environment Management Policy Change (2024-12-28)

**Decision**: All environment variables must be managed through version-controlled files, not AWS Amplify Console.

**Rationale**:
- Version control integration ensures configuration changes are tracked and reviewable
- Automatic branch-based environment resolution eliminates manual configuration
- Consistency between local development and deployed environments
- Improved developer experience with self-documenting environment setup

**Implementation**:
- `develop` branch automatically uses `.env.development`
- `main/master` branch automatically uses `.env.production`
- `.env.local` available for local development overrides (gitignored)
- AWS Amplify Console variables removed entirely (except for truly secret values)

**Exception**: Only truly secret variables (API keys, passwords) should be configured in Amplify Console if they cannot be version controlled securely.