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
      'y53p9uarcj.execute-api.eu-west-1.amazonaws.com'  // AWS API Gateway
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api-dev.varekatalog.byggern.no https://y53p9uarcj.execute-api.eu-west-1.amazonaws.com https://*.amazonaws.com; frame-ancestors 'none';"
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

  // API proxy for development only (production uses direct API calls)
  async rewrites() {
    // Only enable proxy in development - production should call API directly
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT || process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiEndpoint) {
      console.warn('No API endpoint configured for proxy rewrites');
      return [];
    }
    
    return [
      // API proxy for development environment
      {
        source: '/api/:path*',
        destination: `${apiEndpoint}/:path*`,
      },
    ];
  },
};

export default nextConfig;