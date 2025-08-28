#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Can be run standalone or integrated into build process
 * 
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate-env (add to package.json scripts)
 */

const path = require('path');
const fs = require('fs');

// Load environment variables from .env files
function loadEnvFiles() {
  const envFiles = ['.env.local', '.env.development', '.env.production'];
  const rootDir = path.join(__dirname, '..');
  
  for (const envFile of envFiles) {
    const envPath = path.join(rootDir, envFile);
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=');
          if (key && value && !process.env[key]) {
            process.env[key] = value;
          }
        }
      }
      
      console.log(`📄 Loaded environment file: ${envFile}`);
    }
  }
}

// Environment variable schema (simplified version for Node.js)
const REQUIRED_VARS = [
  {
    name: 'NEXT_PUBLIC_API_BASE_URL',
    description: 'Base URL for the product search API',
    example: 'https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev'
  },
  {
    name: 'NEXT_PUBLIC_API_ENDPOINT', 
    description: 'API endpoint for search operations',
    example: 'https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com/dev'
  },
  {
    name: 'NEXT_PUBLIC_REGION',
    description: 'AWS region for services',
    example: 'eu-west-1'
  },
  {
    name: 'NEXT_PUBLIC_COGNITO_CLIENT_ID',
    description: 'AWS Cognito User Pool Client ID',
    example: 'vuuc11qdf11tnst6i3c7fhc6p'
  },
  {
    name: 'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
    description: 'AWS Cognito User Pool ID',
    example: 'eu-west-1_EIDmPWkK2'
  },
  {
    name: 'NEXT_PUBLIC_AZURE_TENANT_ID',
    description: 'Azure AD Tenant ID',
    example: 'f0be9261-9717-4dc6-9ca2-b31924476526'
  },
  {
    name: 'NEXT_PUBLIC_AZURE_CLIENT_ID',
    description: 'Azure AD Client ID',
    example: '31fc9aa9-223e-4bc5-a371-7b0d56a13075'
  },
  {
    name: 'NEXT_PUBLIC_OAUTH_SCOPES',
    description: 'OAuth scopes for backend compatibility',
    example: 'openid profile email varekatalog:search varekatalog:prices varekatalog:inventory'
  }
];

function validateEnvironment() {
  console.log('🔍 Validating environment variables...\n');
  
  loadEnvFiles();
  
  const errors = [];
  const warnings = [];
  
  // Check required variables
  for (const varInfo of REQUIRED_VARS) {
    const value = process.env[varInfo.name];
    
    if (!value) {
      errors.push({
        variable: varInfo.name,
        message: `Missing required variable: ${varInfo.name}`,
        description: varInfo.description,
        example: varInfo.example
      });
    } else {
      console.log(`✅ ${varInfo.name}: Present`);
    }
  }
  
  // Report results
  console.log('');
  
  if (errors.length === 0) {
    console.log('🎉 All required environment variables are present!\n');
    
    if (warnings.length > 0) {
      console.log('⚠️  Warnings:');
      warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    
    return true;
  } else {
    console.log('❌ Environment validation failed!\n');
    
    console.log(`Found ${errors.length} error(s):\n`);
    
    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.message}`);
      console.log(`   Description: ${error.description}`);
      console.log(`   Example: ${error.example}\n`);
    });
    
    console.log('💡 How to fix:');
    console.log('  For local development:');
    console.log('    • Add missing variables to .env.local file');
    console.log('    • Copy from .env.development and customize as needed');
    console.log('');
    console.log('  For AWS Amplify deployment:');
    console.log('    • Configure variables in Amplify Console branch settings');
    console.log('    • Use: aws amplify update-branch --environment-variables KEY=VALUE');
    console.log('');
    
    return false;
  }
}

// Run validation
const isValid = validateEnvironment();

// Exit with appropriate code
process.exit(isValid ? 0 : 1);