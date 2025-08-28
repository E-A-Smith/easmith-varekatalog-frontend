/**
 * OAuth Callback Page for Varekatalog
 * Handles the OAuth authorization code exchange flow
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          setStatus('error');
          setError(`Authentisering feilet: ${errorDescription || error}`);
          return;
        }

        // Validate required parameters
        if (!code) {
          setStatus('error');
          setError('Mangler autorisasjonskode');
          return;
        }

        // Validate state parameter (CSRF protection)
        const storedState = sessionStorage.getItem('oauth_state');
        if (!state || state !== storedState) {
          setStatus('error');
          setError('Ugyldig state parameter - mulig CSRF-angrep');
          return;
        }

        // Clean up stored state
        sessionStorage.removeItem('oauth_state');

        // Exchange authorization code for access token
        const tokenResponse = await exchangeCodeForTokens(code);
        
        if (tokenResponse.access_token) {
          // Store tokens securely (implement proper token storage)
          await storeTokensSecurely(tokenResponse);
          
          setStatus('success');
          
          // Redirect to main application after successful authentication
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          throw new Error('Ingen tilgangstoken mottatt');
        }

      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Ukjent feil under autentisering');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  // Exchange authorization code for tokens
  async function exchangeCodeForTokens(code: string) {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
      code: code,
      redirect_uri: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback',
      scope: process.env.NEXT_PUBLIC_OAUTH_SCOPES || 'openid profile email varekatalog:search',
    });

    const response = await fetch(
      `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    return response.json();
  }

  // Store tokens securely (implement proper storage strategy)
  async function storeTokensSecurely(tokens: {
    access_token: string;
    refresh_token: string;
    id_token: string;
    expires_in: number;
    scope?: string;
  }) {
    // For now, store in sessionStorage (implement proper security later)
    // In production, should use HTTP-only cookies or secure storage
    sessionStorage.setItem('access_token', tokens.access_token);
    sessionStorage.setItem('refresh_token', tokens.refresh_token);
    sessionStorage.setItem('id_token', tokens.id_token);
    sessionStorage.setItem('token_expiry', (Date.now() + tokens.expires_in * 1000).toString());
    
    // Also store user scopes for frontend data filtering
    const scopes = tokens.scope?.split(' ') || [];
    sessionStorage.setItem('user_scopes', JSON.stringify(scopes));
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-byggern-blue border-t-transparent rounded-full mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-neutral-800 mb-2">
            Fullfører innlogging...
          </h1>
          <p className="text-neutral-600">
            Du blir omdirigert om litt
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl">✕</span>
          </div>
          <h1 className="text-xl font-semibold text-neutral-800 mb-2">
            Innlogging feilet
          </h1>
          <p className="text-red-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-byggern-blue text-white px-4 py-2 rounded hover:bg-byggern-blue/90"
          >
            Tilbake til startsiden
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <h1 className="text-xl font-semibold text-neutral-800 mb-2">
            Innlogging vellykket!
          </h1>
          <p className="text-neutral-600 mb-4">
            Du blir omdirigert til varekataloget...
          </p>
          <div className="animate-pulse h-1 bg-byggern-blue/30 rounded-full overflow-hidden">
            <div className="h-full bg-byggern-blue rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback return (should never be reached due to state management)
  return null;
}