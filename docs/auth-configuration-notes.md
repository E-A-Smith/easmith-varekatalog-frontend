# Authentication Configuration

## Current Status ✅ OPERATIONAL

### Authentication Architecture
**Provider**: AWS Cognito with Azure AD OIDC integration
**Status**: Fully operational in both DEV and PROD environments
**Updated**: September 2025

### Environment Configuration

#### Development Environment
```bash
NEXT_PUBLIC_API_BASE_URL=https://28svlvit82.execute-api.eu-west-1.amazonaws.com/dev
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_GggkvCmcK
NEXT_PUBLIC_COGNITO_CLIENT_ID=58hle80tfmljv7rbmf9o4tfmsf
NEXT_PUBLIC_COGNITO_DOMAIN=eas-varekatalog-auth-dev.auth.eu-west-1.amazoncognito.com
```

#### Production Environment
```bash
NEXT_PUBLIC_API_BASE_URL=https://17lf5fwwik.execute-api.eu-west-1.amazonaws.com/prod
NEXT_PUBLIC_COGNITO_USER_POOL_ID=eu-west-1_Y9lANGJGs
NEXT_PUBLIC_COGNITO_CLIENT_ID=3jur7ub2mvai5ar5969i3bmum1
NEXT_PUBLIC_COGNITO_DOMAIN=eas-varekatalog-auth-prod.auth.eu-west-1.amazoncognito.com
```

### Azure AD Integration Details
- **Tenant ID**: f0be9261-9717-4dc6-9ca2-b31924476526
- **Client ID**: 31fc9aa9-223e-4bc5-a371-7b0d56a13075
- **Identity Provider**: AzureAD (OIDC)
- **Authentication Flow**: OAuth 2.0 + PKCE
- **Status**: Active and fully functional