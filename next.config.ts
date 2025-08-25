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
    domains: ['api-dev.varekatalog.byggern.no'],
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api-dev.varekatalog.byggern.no https://*.amazonaws.com; frame-ancestors 'none';"
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

  // PWA-like caching for offline support
  async rewrites() {
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
    if (!apiEndpoint) {
      return [];
    }
    return [
      // API proxy for development
      {
        source: '/api/:path*',
        destination: `${apiEndpoint}/:path*`,
      },
    ];
  },
};

export default nextConfig;