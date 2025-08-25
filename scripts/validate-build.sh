#!/bin/bash

# Varekatalog Frontend Build Validation Script
# Validates the Next.js application before deployment

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"  # Gets the script's directory
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"  # Gets the frontend directory
cd "${FRONTEND_DIR}"  # Change to frontend directory

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validation steps
validate_dependencies() {
    log_info "Validating dependencies..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json not found in $(pwd)"
        return 1
    fi
    
    if [[ ! -f "package-lock.json" ]]; then
        log_warning "package-lock.json not found - consider running 'npm install'"
    fi
    
    if [[ ! -d "node_modules" ]]; then
        log_info "Installing dependencies..."
        npm ci --prefer-offline --no-audit
    fi
    
    log_success "Dependencies validated"
}

validate_environment() {
    log_info "Validating environment configuration..."
    
    if [[ ! -f ".env.local" && ! -f ".env.example" ]]; then
        log_warning "No environment configuration files found"
    fi
    
    # Source environment variables for validation
    if [[ -f ".env.local" ]]; then
        set -a
        source .env.local
        set +a
    fi
    
    # Check required environment variables
    local required_vars=("NEXT_PUBLIC_API_ENDPOINT" "NEXT_PUBLIC_REGION")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            missing_vars+=("${var}")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        log_warning "Missing environment variables (will use defaults):"
        printf ' - %s\n' "${missing_vars[@]}"
    fi
    
    log_success "Environment configuration validated"
}

validate_typescript() {
    if [[ "$SKIP_TYPES" == "true" ]]; then
        log_info "Skipping TypeScript validation"
        return 0
    fi

    log_info "Validating TypeScript configuration..."
    
    if ! npm run type-check; then
        log_error "TypeScript validation failed"
        return 1
    fi
    
    log_success "TypeScript validation passed"
}

validate_linting() {
    if [[ "$SKIP_LINT" == "true" ]]; then
        log_info "Skipping ESLint validation"
        return 0
    fi

    log_info "Running ESLint validation..."
    
    if ! npm run lint; then
        log_error "Linting validation failed"
        return 1
    fi
    
    log_success "Linting validation passed"
}

validate_build() {
    if [[ "$SKIP_BUILD" == "true" ]]; then
        log_info "Skipping production build"
        return 0
    fi

    log_info "Running production build..."
    
    # Clean previous build
    if [[ -d ".next" ]]; then
        rm -rf .next
        log_info "Cleaned previous build"
    fi
    
    # Run build
    if ! npm run build; then
        log_error "Production build failed"
        return 1
    fi
    
    # Check build output
    if [[ ! -d ".next" ]]; then
        log_error "Build output directory not found"
        return 1
    fi
    
    log_success "Production build completed successfully"
}

validate_security() {
    if [[ "$SKIP_SECURITY" == "true" ]]; then
        log_info "Skipping security checks"
        return 0
    fi

    log_info "Running security checks..."
    
    # Check for known vulnerabilities
    if ! npm audit --production --audit-level=moderate; then
        log_warning "Security audit found moderate or higher severity vulnerabilities"
        return 1
    fi
    
    log_success "Security checks passed"
}

# Cleanup function
cleanup() {
    local exit_code=$?
    
    if [[ $exit_code -ne 0 ]]; then
        log_error "Validation failed with exit code $exit_code"
    else
        log_success "All validations completed successfully"
    fi
    
    # Change back to the original directory
    cd - > /dev/null 2>&1 || true
    
    exit $exit_code
}

# Main validation function
main() {
    # Set up trap for cleanup
    trap cleanup EXIT
    
    log_info "Starting frontend validation in $(pwd)"
    
    # Run validations
    validate_dependencies
    validate_environment
    validate_typescript
    validate_linting
    validate_build
    validate_security
    
    return 0
}

# Script usage
usage() {
    echo "Usage: $(basename "$0") [options]"
    echo "Options:"
    echo "  -h, --help      Show this help message"
    echo "  --skip-build    Skip the production build step"
    echo "  --skip-lint     Skip the linting step"
    echo "  --skip-types    Skip TypeScript type checking"
    echo "  --skip-security Skip security checks"
    exit 0
}

# Parse command line arguments
SKIP_BUILD=false
SKIP_LINT=false
SKIP_TYPES=false
SKIP_SECURITY=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            ;;
        --skip-build)
            SKIP_BUILD=true
            ;;
        --skip-lint)
            SKIP_LINT=true
            ;;
        --skip-types)
            SKIP_TYPES=true
            ;;
        --skip-security)
            SKIP_SECURITY=true
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
    shift
done

# Run the main function
main "$@"