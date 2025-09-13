/**
 * Product search API endpoint for Varekatalog
 * Handles product search queries with Norwegian text support
 */

import { NextRequest, NextResponse } from 'next/server';

// Interface for products from backend API
interface ApiProduct {
  id: string;
  navn?: string;
  lh?: string;
  [key: string]: unknown;
}

// NO MORE MOCK DATA - All searches now use the real backend API

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try to call the real backend API first
    const externalApiUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (externalApiUrl) {
      try {
        console.log(`[Search API] Calling backend: ${externalApiUrl}/search`);
        
        // Extract Authorization header and forward it to backend
        const authHeader = request.headers.get('Authorization');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        // Forward Cognito access token if present
        if (authHeader) {
          headers['Authorization'] = authHeader;
          console.log(`[Search API] Forwarding auth token to backend (token length: ${authHeader.length})`);
        } else {
          console.log(`[Search API] No auth token found - using public access`);
        }
        
        const externalResponse = await fetch(`${externalApiUrl}/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (externalResponse.ok) {
          const externalData = await externalResponse.json();
          console.log(`[Search API] Backend returned ${externalData.results?.length || 0} products`);
          
          // Enhanced debug logging for LH field issues in development
          if (process.env.NODE_ENV === 'development' && externalData.results?.length > 0) {
            // Sample first few products for detailed analysis
            const sampleProducts = externalData.results.slice(0, 5);
            
            // Count LH field statistics
            const lhStats = {
              total: externalData.results.length,
              hasLH: 0,
              emptyString: 0,
              nullOrUndefined: 0,
              zeroValue: 0,
              validLH: 0
            };
            
            externalData.results.forEach((product: ApiProduct) => {
              if (product.lh) {
                lhStats.hasLH++;
                if (product.lh.trim() === "") {
                  lhStats.emptyString++;
                } else if (product.lh.trim() === "0") {
                  lhStats.zeroValue++;
                } else {
                  lhStats.validLH++;
                }
              } else {
                lhStats.nullOrUndefined++;
              }
            });
            
            console.log('[Search API] LH Field Analysis:', lhStats);
            
            // Log sample products
            sampleProducts.forEach((product: ApiProduct, index: number) => {
              console.log(`[Search API] Sample Product ${index + 1} LH data:`, {
                id: product.id,
                navn: product.navn?.substring(0, 30) + '...',
                lh: product.lh,
                lhType: typeof product.lh,
                lhLength: product.lh?.length,
                lhTrimmed: product.lh?.trim(),
                isEmpty: !product.lh || product.lh.trim() === "" || product.lh.trim() === "0"
              });
            });
          }
          
          // Transform backend response to match frontend expected format
          return NextResponse.json({
            success: true,
            query,
            total: externalData.count || externalData.results?.length || 0,
            returned: externalData.results?.length || 0,
            limit,
            offset,
            responseTime: `${Date.now() - startTime}ms`,
            timestamp: new Date().toISOString(),
            results: externalData.results || [],
            facets: externalData.facets || {},
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
    const externalApiUrl = process.env.NEXT_PUBLIC_EXTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (externalApiUrl) {
      try {
        console.log(`[Search API] POST calling backend: ${externalApiUrl}/search`);
        
        // Extract Authorization header and forward it to backend
        const authHeader = request.headers.get('Authorization');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };
        
        // Forward Cognito access token if present
        if (authHeader) {
          headers['Authorization'] = authHeader;
          console.log(`[Search API] Forwarding auth token to backend (token length: ${authHeader.length})`);
        } else {
          console.log(`[Search API] No auth token found - using public access`);
        }
        
        const externalResponse = await fetch(`${externalApiUrl}/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
          method: 'GET',
          headers,
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (externalResponse.ok) {
          const externalData = await externalResponse.json();
          console.log(`[Search API] Backend returned ${externalData.results?.length || 0} products`);
          
          // Enhanced debug logging for LH field issues in development
          if (process.env.NODE_ENV === 'development' && externalData.results?.length > 0) {
            // Sample first few products for detailed analysis
            const sampleProducts = externalData.results.slice(0, 5);
            
            // Count LH field statistics
            const lhStats = {
              total: externalData.results.length,
              hasLH: 0,
              emptyString: 0,
              nullOrUndefined: 0,
              zeroValue: 0,
              validLH: 0
            };
            
            externalData.results.forEach((product: ApiProduct) => {
              if (product.lh) {
                lhStats.hasLH++;
                if (product.lh.trim() === "") {
                  lhStats.emptyString++;
                } else if (product.lh.trim() === "0") {
                  lhStats.zeroValue++;
                } else {
                  lhStats.validLH++;
                }
              } else {
                lhStats.nullOrUndefined++;
              }
            });
            
            console.log('[Search API] LH Field Analysis:', lhStats);
            
            // Log sample products
            sampleProducts.forEach((product: ApiProduct, index: number) => {
              console.log(`[Search API] Sample Product ${index + 1} LH data:`, {
                id: product.id,
                navn: product.navn?.substring(0, 30) + '...',
                lh: product.lh,
                lhType: typeof product.lh,
                lhLength: product.lh?.length,
                lhTrimmed: product.lh?.trim(),
                isEmpty: !product.lh || product.lh.trim() === "" || product.lh.trim() === "0"
              });
            });
          }
          
          // Transform backend response to match frontend expected format
          return NextResponse.json({
            success: true,
            query,
            total: externalData.count || externalData.results?.length || 0,
            returned: externalData.results?.length || 0,
            limit,
            offset,
            timestamp: new Date().toISOString(),
            results: externalData.results || [],
            facets: externalData.facets || {},
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