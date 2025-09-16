import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript configuration
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  
  // Performance optimizations for AWS Amplify
  trailingSlash: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'api-dev.varekatalog.byggern.no',  // Legacy API domain
      'ruy0f0pr6j.execute-api.eu-west-1.amazonaws.com'  // AWS API Gateway
    ],
  },

  // Security headers (handled by Amplify/CloudFront)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api-dev.varekatalog.byggern.no https://ruy0f0pr6j.execute-api.eu-west-1.amazonaws.com https://*.amazonaws.com https://*.amazoncognito.com; frame-ancestors 'none';"
          }
        ]
      }
    ];
  },

  // Build optimization
  compiler: {
    removeConsole: true,
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@aws-sdk/client-cognito-identity-provider'],
  },

  // No API proxy needed - using local API routes directly
  async rewrites() {
    return [];
  },
};

export default nextConfig;