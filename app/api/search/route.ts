/**
 * Product search API endpoint for Varekatalog
 * Handles product search queries with Norwegian text support
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock product data - will be replaced with real database queries
const mockProducts = [
  { 
    id: '1',
    navn: 'Gipsplate 12,5mm 120x240cm', 
    vvsnr: '98765432', 
    lagerstatus: 'På lager' as const, 
    anbrekk: 'Nei' as const, 
    produsent: 'Gyproc', 
    pris: { salgspris: 450, valuta: 'NOK' as const, inkludertMva: true },
    kategori: 'Byggematerialer' as const,
    beskrivelse: 'Standard gipsplate for innervegger'
  },
  { 
    id: '2',
    navn: 'Isolasjon steinull 50mm', 
    vvsnr: '13579246', 
    lagerstatus: 'Få igjen' as const, 
    anbrekk: 'Nei' as const, 
    produsent: 'Rockwool', 
    pris: { salgspris: 125.5, valuta: 'NOK' as const, inkludertMva: true },
    kategori: 'Isolasjon' as const,
    beskrivelse: 'Brannsikker steinull isolasjon'
  },
  { 
    id: '3',
    navn: 'Rørkryss 15mm messing', 
    vvsnr: '24681357', 
    lagerstatus: 'På lager' as const, 
    anbrekk: 'Ja' as const, 
    produsent: 'Uponor', 
    pris: { salgspris: 89.9, valuta: 'NOK' as const, inkludertMva: true },
    kategori: 'Rør og koblingsutstyr' as const,
    beskrivelse: 'Rørkryss i messing for varme- og kjølesystemer'
  },
  { 
    id: '4',
    navn: 'Parkett eik natur 14x140mm', 
    vvsnr: '14725836', 
    lagerstatus: 'Utsolgt' as const, 
    anbrekk: 'Nei' as const, 
    produsent: 'Tarkett', 
    pris: { salgspris: 699, valuta: 'NOK' as const, inkludertMva: true },
    kategori: 'Gulv' as const,
    beskrivelse: 'Naturlig eikeparkett med børstet overflate'
  },
  { 
    id: '5',
    navn: 'Vernebriller klar polykarbonat', 
    vvsnr: '63749281', 
    lagerstatus: 'På lager' as const, 
    anbrekk: 'Ja' as const, 
    produsent: '3M', 
    pris: { salgspris: 245, valuta: 'NOK' as const, inkludertMva: true },
    kategori: 'Sikkerhet' as const,
    beskrivelse: 'Verneutstyr for øyne med anti-dugg behandling'
  },
  { 
    id: '6',
    navn: 'Skrue treskrue 50mm galvanisert', 
    vvsnr: '12345678', 
    lagerstatus: 'På lager' as const, 
    anbrekk: 'Ja' as const, 
    produsent: 'Biltema', 
    pris: { salgspris: 35.9, valuta: 'NOK' as const, inkludertMva: true },
    kategori: 'Skruer og bolter' as const,
    beskrivelse: 'Galvaniserte skruer for utendørs bruk'
  },
  { 
    id: '7',
    navn: 'Beslag vinkelbeslag 90° stål', 
    vvsnr: '87654321', 
    lagerstatus: 'På lager' as const, 
    anbrekk: 'Nei' as const, 
    produsent: 'Würth', 
    pris: { salgspris: 89.5, valuta: 'NOK' as const, inkludertMva: true },
    kategori: 'Beslag' as const,
    beskrivelse: 'Solid vinkelbeslag i forsinket stål'
  }
];

// Norwegian text normalization function
function normalizeNorwegianText(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Search function with Norwegian text support
function searchProducts(query: string) {
  if (!query || query.trim().length === 0) {
    return mockProducts;
  }

  const normalizedQuery = normalizeNorwegianText(query);
  const queryTerms = normalizedQuery.split(/\s+/).filter(term => term.length > 0);

  return mockProducts.filter(product => {
    // Search in multiple fields
    const searchableText = [
      product.navn,
      product.produsent,
      product.vvsnr,
      product.kategori,
      product.beskrivelse
    ].join(' ');

    const normalizedText = normalizeNorwegianText(searchableText);

    // Check if any query term matches
    return queryTerms.some(term => 
      normalizedText.includes(term) || 
      product.vvsnr.includes(term) // Direct VVS number match
    );
  });
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Perform search
    const results = searchProducts(query);
    
    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      query,
      total: results.length,
      returned: paginatedResults.length,
      limit,
      offset,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      results: paginatedResults,
      meta: {
        norwegianTextSupported: true,
        searchFields: ['navn', 'produsent', 'vvsnr', 'kategori', 'beskrivelse'],
        features: {
          fuzzySearch: true,
          exactMatch: true,
          pagination: true,
        }
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
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
    const startTime = Date.now();
    const body = await request.json();
    const { query = '', filters = {}, sort = {}, limit = 50, offset = 0 } = body;

    // Perform search with filters (simplified implementation)
    let results = searchProducts(query);
    
    // Apply basic filters
    if (filters.lagerstatus) {
      results = results.filter(p => p.lagerstatus === filters.lagerstatus);
    }
    if (filters.produsent) {
      results = results.filter(p => p.produsent.toLowerCase().includes(filters.produsent.toLowerCase()));
    }
    
    // Apply basic sorting
    if (sort.field) {
      results.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sort.field] as string;
        const bVal = (b as Record<string, unknown>)[sort.field] as string;
        
        if (sort.direction === 'desc') {
          return bVal.localeCompare(aVal);
        }
        return aVal.localeCompare(bVal);
      });
    }
    
    // Apply pagination
    const paginatedResults = results.slice(offset, offset + limit);
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      query,
      filters,
      sort,
      total: results.length,
      returned: paginatedResults.length,
      limit,
      offset,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      results: paginatedResults,
    }, {
      status: 200,
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