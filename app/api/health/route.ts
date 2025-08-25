/**
 * Health check API endpoint for Varekatalog
 * Returns system status and basic health information
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Basic health checks
    const healthChecks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: '1.0.0-dev',
      environment: process.env.NODE_ENV || 'development',
      build: 'Phase 1.2',
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
    };

    // Simulate response time for monitoring
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      ...healthChecks,
      responseTime: `${responseTime}ms`,
      services: {
        database: 'mock-ok', // Will be replaced with real DynamoDB check
        search: 'mock-ok',   // Will be replaced with real OpenSearch check
        nobb: 'active',      // External NOBB integration
      },
      features: {
        productSearch: true,
        nobbIntegration: true,
        norwegianTextSupport: true,
        directSearch: true,
        realTimeApi: false, // Still in development
      }
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

// Add CORS headers for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}