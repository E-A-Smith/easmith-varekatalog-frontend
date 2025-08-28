/**
 * Environment Variable Validation System
 * Implements fail-fast pattern for required environment variables
 * 
 * This module ensures all critical environment variables are present
 * before the application can start, preventing runtime errors and
 * providing clear feedback for configuration issues.
 */

interface EnvironmentSchema {
  /** Variable name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Is this variable required? */
  required: boolean;
  /** Environment where this variable is needed */
  environments: ('development' | 'production' | 'test')[];
  /** Validation pattern (optional) */
  pattern?: RegExp;
  /** Example value for documentation */
  example?: string;
}

/**
 * Complete environment variable schema for the application
 */
const ENVIRONMENT_SCHEMA: EnvironmentSchema[] = [
  // API Configuration
  {
    name: 'NEXT_PUBLIC_API_BASE_URL',
    description: 'Base URL for the product search API',
    required: true,
    environments: ['development', 'production'],
    pattern: /^https?:\/\/.+/,
    example: 'https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev'
  },
  {
    name: 'NEXT_PUBLIC_API_ENDPOINT',
    description: 'API endpoint for search operations',
    required: true,
    environments: ['development', 'production'],
    pattern: /^https?:\/\/.+/,
    example: 'https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev'
  },
  {
    name: 'NEXT_PUBLIC_REGION',
    description: 'AWS region for services',
    required: true,
    environments: ['development', 'production'],
    pattern: /^[a-z]{2}-[a-z]+-\d$/,
    example: 'eu-west-1'
  },

  // AWS Cognito Authentication
  {
    name: 'NEXT_PUBLIC_COGNITO_CLIENT_ID',
    description: 'AWS Cognito User Pool Client ID for authentication',
    required: true,
    environments: ['development', 'production'],
    pattern: /^[a-z0-9]{26}$/,
    example: 'vuuc11qdf11tnst6i3c7fhc6p'
  },
  {
    name: 'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
    description: 'AWS Cognito User Pool ID for authentication',
    required: true,
    environments: ['development', 'production'],
    pattern: /^[a-z]{2}-[a-z]+-\d_[A-Za-z0-9]{9}$/,
    example: 'eu-west-1_EIDmPWkK2'
  },

  // Azure AD OAuth Configuration
  {
    name: 'NEXT_PUBLIC_AZURE_TENANT_ID',
    description: 'Azure AD Tenant ID for OAuth integration',
    required: true,
    environments: ['development', 'production'],
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    example: 'f0be9261-9717-4dc6-9ca2-b31924476526'
  },
  {
    name: 'NEXT_PUBLIC_AZURE_CLIENT_ID',
    description: 'Azure AD Client ID for OAuth integration',
    required: true,
    environments: ['development', 'production'],
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    example: '31fc9aa9-223e-4bc5-a371-7b0d56a13075'
  },

  // OAuth Configuration
  {
    name: 'NEXT_PUBLIC_OAUTH_SCOPES',
    description: 'OAuth scopes for varekatalog backend compatibility',
    required: true,
    environments: ['development', 'production'],
    pattern: /^[\w\s:]+$/,
    example: 'openid profile email varekatalog:search varekatalog:prices varekatalog:inventory'
  },

  // Optional Development Features
  {
    name: 'NEXT_PUBLIC_ENABLE_DEVTOOLS',
    description: 'Enable development tools and debug panels',
    required: false,
    environments: ['development'],
    pattern: /^(true|false)$/,
    example: 'true'
  },
  {
    name: 'NEXT_PUBLIC_API_DEBUG',
    description: 'Enable API client debug logging',
    required: false,
    environments: ['development'],
    pattern: /^(true|false)$/,
    example: 'true'
  }
];

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

interface ValidationError {
  variable: string;
  type: 'missing' | 'invalid' | 'pattern_mismatch';
  message: string;
  suggestion: string | undefined;
}

/**
 * Validates all environment variables according to the schema
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const currentEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';

  // Get required variables for current environment
  const requiredVars = ENVIRONMENT_SCHEMA.filter(
    schema => schema.required && schema.environments.includes(currentEnv)
  );

  // Validate each required variable
  for (const schema of requiredVars) {
    const value = process.env[schema.name];

    if (!value) {
      errors.push({
        variable: schema.name,
        type: 'missing',
        message: `Missing required environment variable: ${schema.name}`,
        suggestion: schema.example ? `Expected format: ${schema.example}` : undefined
      });
      continue;
    }

    // Validate pattern if provided
    if (schema.pattern && !schema.pattern.test(value)) {
      errors.push({
        variable: schema.name,
        type: 'pattern_mismatch',
        message: `Invalid format for ${schema.name}: "${value}"`,
        suggestion: schema.example ? `Expected format: ${schema.example}` : undefined
      });
    }
  }

  // Check for optional variables and warn if missing in development
  if (currentEnv === 'development') {
    const optionalDevVars = ENVIRONMENT_SCHEMA.filter(
      schema => !schema.required && schema.environments.includes('development')
    );

    for (const schema of optionalDevVars) {
      if (!process.env[schema.name]) {
        warnings.push(
          `Optional development variable ${schema.name} not set (${schema.description})`
        );
      }
    }
  }

  const isValid = errors.length === 0;
  const errorMessages = errors.map(err => 
    err.suggestion ? `${err.message}. ${err.suggestion}` : err.message
  );

  const summary = isValid
    ? `✅ All ${requiredVars.length} required environment variables are valid for ${currentEnv}`
    : `❌ ${errors.length} environment variable error(s) found for ${currentEnv}`;

  return {
    isValid,
    errors: errorMessages,
    warnings,
    summary
  };
}

/**
 * Fail-fast environment validation
 * Throws an error if required environment variables are missing or invalid
 */
export function validateEnvironmentOrThrow(): void {
  const result = validateEnvironmentVariables();

  if (!result.isValid) {
    const errorReport = [
      '🚨 ENVIRONMENT VALIDATION FAILED',
      '',
      result.summary,
      '',
      '❌ Errors:',
      ...result.errors.map(error => `  • ${error}`),
      ''
    ];

    if (result.warnings.length > 0) {
      errorReport.push(
        '⚠️  Warnings:',
        ...result.warnings.map(warning => `  • ${warning}`),
        ''
      );
    }

    errorReport.push(
      '📝 Configuration Help:',
      '  • For local development: Add variables to .env.local',
      '  • For AWS Amplify deployment: Configure in branch environment settings',
      '  • Run: aws amplify update-branch --app-id APP_ID --branch-name BRANCH --environment-variables KEY=VALUE',
      '',
      '📖 See CLAUDE.md for complete environment variable documentation'
    );

    const errorMessage = errorReport.join('\n');
    
    // Log to console for better visibility
    console.error(errorMessage);
    
    throw new Error(`Environment validation failed: ${result.errors.length} error(s) found`);
  }

  // Log success and warnings
  console.log(result.summary);
  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }
}

/**
 * Get environment variable documentation for humans
 */
export function getEnvironmentDocumentation(): string {
  const currentEnv = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  const relevantVars = ENVIRONMENT_SCHEMA.filter(schema => 
    schema.environments.includes(currentEnv)
  );

  const requiredVars = relevantVars.filter(schema => schema.required);
  const optionalVars = relevantVars.filter(schema => !schema.required);

  const docs = [
    `# Environment Variables for ${currentEnv.toUpperCase()}`,
    '',
    `## Required Variables (${requiredVars.length})`,
    ''
  ];

  for (const schema of requiredVars) {
    docs.push(
      `### ${schema.name}`,
      `**Description:** ${schema.description}`,
      schema.example ? `**Example:** \`${schema.example}\`` : '',
      schema.pattern ? `**Pattern:** \`${schema.pattern.source}\`` : '',
      ''
    );
  }

  if (optionalVars.length > 0) {
    docs.push(
      `## Optional Variables (${optionalVars.length})`,
      ''
    );

    for (const schema of optionalVars) {
      docs.push(
        `### ${schema.name}`,
        `**Description:** ${schema.description}`,
        schema.example ? `**Example:** \`${schema.example}\`` : '',
        ''
      );
    }
  }

  return docs.join('\n');
}

/**
 * Runtime environment info for debugging
 */
export function getEnvironmentInfo() {
  const result = validateEnvironmentVariables();
  const currentEnv = process.env.NODE_ENV || 'development';
  
  return {
    environment: currentEnv,
    validation: result,
    loadedEnvFiles: {
      // This would show which .env files Next.js loaded
      note: 'Check Next.js build logs for "- Environments:" line'
    },
    availableVars: ENVIRONMENT_SCHEMA.map(schema => ({
      name: schema.name,
      required: schema.required,
      present: !!process.env[schema.name],
      environments: schema.environments
    }))
  };
}