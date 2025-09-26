import { NextResponse } from 'next/server';
import type { CatalogStats, CatalogStatsResponse } from '@/types/catalog-stats';

export async function GET() {
  try {
    const externalApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!externalApiUrl) {
      throw new Error('NEXT_PUBLIC_API_BASE_URL environment variable not configured');
    }

    const response = await fetch(`${externalApiUrl}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Backend API failed with status ${response.status}`);
    }

    const backendResponse: CatalogStatsResponse = await response.json();

    // Extract the data portion for the frontend
    const stats: CatalogStats = backendResponse.data;

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch catalog stats:', error);

    return NextResponse.json({
      success: false,
      error: 'Statistics temporarily unavailable',
      message: 'Backend service is not available. Please try again later.',
    }, {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}