/**
 * Product search API endpoint for Varekatalog
 * Handles product search queries with Norwegian text support
 */

import { NextRequest, NextResponse } from 'next/server';

// NO MORE MOCK DATA - All searches now use the real backend API

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try to call the real backend API first
    const externalApiUrl = process.env.EXTERNAL_API_URL;
    
    if (externalApiUrl) {
      try {
        console.log(`[Search API] Calling backend: ${externalApiUrl}/search`);
        const externalResponse = await fetch(`${externalApiUrl}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            // Note: For now using public access without OAuth token
            // TODO: Add OAuth token from session when authentication is implemented
          },
          body: JSON.stringify({
            query: query,
            pagination: {
              offset: offset,
              limit: limit
            }
          }),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (externalResponse.ok) {
          const externalData = await externalResponse.json();
          console.log(`[Search API] Backend returned ${externalData.products?.length || 0} products`);
          
          // Transform backend response to match frontend expected format
          return NextResponse.json({
            success: true,
            query,
            total: externalData.total || externalData.products?.length || 0,
            returned: externalData.products?.length || 0,
            limit,
            offset,
            responseTime: `${Date.now() - startTime}ms`,
            timestamp: new Date().toISOString(),
            results: externalData.products || [],
            meta: {
              source: 'backend-api',
              norwegianTextSupported: true,
              searchFields: ['navn', 'produsent', 'vvsnr', 'kategori', 'beskrivelse'],
              features: {
                fuzzySearch: true,
                exactMatch: true,
                pagination: true,
              }
            }
          });
        } else {
          console.warn(`[Search API] Backend API failed with status ${externalResponse.status}`);
          const errorText = await externalResponse.text();
          console.warn(`[Search API] Backend error response:`, errorText);
        }
      } catch (error) {
        console.error('[Search API] Backend API error:', error);
      }
    }

    // No backend API available - return error
    console.error('[Search API] No backend API configured or backend API failed');
    return NextResponse.json({
      success: false,
      error: 'Backend API unavailable',
      message: 'Search service is temporarily unavailable. Please try again later.',
      timestamp: new Date().toISOString(),
    }, { 
      status: 503,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      timestamp: new Date().toISOString(),
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // const startTime = Date.now(); // TODO: Add performance timing
    const body = await request.json();
    const { query = '', filters = {}, sort = {}, limit = 50, offset = 0 } = body;

    // Try to call the real backend API first
    const externalApiUrl = process.env.EXTERNAL_API_URL;
    
    if (externalApiUrl) {
      try {
        console.log(`[Search API] POST calling backend: ${externalApiUrl}/search`);
        const externalResponse = await fetch(`${externalApiUrl}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            // Note: For now using public access without OAuth token
            // TODO: Add OAuth token from session when authentication is implemented
          },
          body: JSON.stringify({
            query: query,
            filters: filters,
            sort: sort,
            pagination: {
              offset: offset,
              limit: limit
            }
          }),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (externalResponse.ok) {
          const externalData = await externalResponse.json();
          console.log(`[Search API] Backend returned ${externalData.products?.length || 0} products`);
          
          // Return backend response directly (already in correct format)
          return NextResponse.json(externalData);
        } else {
          console.warn(`[Search API] Backend API failed with status ${externalResponse.status}`);
          const errorText = await externalResponse.text();
          console.warn(`[Search API] Backend error response:`, errorText);
        }
      } catch (error) {
        console.error('[Search API] Backend API error:', error);
      }
    }

    // No backend API available - return error
    console.error('[Search API] No backend API configured or backend API failed');
    return NextResponse.json({
      success: false,
      error: 'Backend API unavailable',
      message: 'Search service is temporarily unavailable. Please try again later.',
      timestamp: new Date().toISOString(),
    }, { 
      status: 503,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('Search API POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}