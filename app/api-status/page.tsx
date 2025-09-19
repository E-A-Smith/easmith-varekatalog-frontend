'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui';
import { Loader, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '@/utils/api';

// API status checking interface
interface ApiStatus {
  isConnected: boolean;
  responseTime: number | null;
  lastChecked: Date | null;
  error: string | null;
}

// Debug panel interfaces
interface DebugStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: unknown;
  error?: string;
  timestamp?: string;
}

interface DebugInfo {
  baseUrl: string;
  healthCheck: DebugStatus;
  searchTest: DebugStatus;
}

// Client-only component to avoid hydration mismatch
function BrowserInfo() {
  const [userAgent, setUserAgent] = useState('Loading...');

  useEffect(() => {
    setUserAgent(navigator.userAgent.split(' ')[0] || 'Unknown');
  }, []);

  return (
    <span className="text-sm text-neutral-800">
      {userAgent}
    </span>
  );
}

// Client-only component for screen resolution
function ScreenResolution() {
  const [resolution, setResolution] = useState('Loading...');

  useEffect(() => {
    setResolution(`${window.screen.width}x${window.screen.height}`);
  }, []);

  return (
    <span className="text-sm text-neutral-800">
      {resolution}
    </span>
  );
}

// Client-only component for viewport size
function ViewportSize() {
  const [viewport, setViewport] = useState('Loading...');

  useEffect(() => {
    const updateViewport = () => {
      setViewport(`${window.innerWidth}x${window.innerHeight}`);
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return (
    <span className="text-sm text-neutral-800">
      {viewport}
    </span>
  );
}

export default function ApiStatusPage() {
  const { authState, getAccessToken } = useAuth();
  
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isConnected: false,
    responseTime: null,
    lastChecked: null,
    error: null,
  });
  const [isChecking, setIsChecking] = useState(false);
  
  // Debug panel state
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    baseUrl: process.env.NEXT_PUBLIC_EXTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    healthCheck: { status: 'loading' },
    searchTest: { status: 'idle' }
  });
  const [testQuery, setTestQuery] = useState('terrassefornyer');

  // API endpoint check function
  const checkApiConnection = async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      // Simulate API call - replace with actual API endpoint when available
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (response.ok) {
        setApiStatus({
          isConnected: true,
          responseTime,
          lastChecked: new Date(),
          error: null,
        });
      } else {
        throw new Error(`API responded with status: ${response.status}`);
      }
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      setApiStatus({
        isConnected: false,
        responseTime,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Debug API functions
  const testHealthCheck = async () => {
    setDebugInfo(prev => ({
      ...prev,
      healthCheck: { status: 'loading' }
    }));

    try {
      const result = await apiClient.healthCheck();
      setDebugInfo(prev => ({
        ...prev,
        healthCheck: {
          status: 'success',
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        healthCheck: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const testSearch = async () => {
    setDebugInfo(prev => ({
      ...prev,
      searchTest: { status: 'loading' }
    }));

    try {
      const accessToken = await getAccessToken();
      
      const result = await apiClient.searchProducts({
        søketekst: testQuery.trim() || 'test',
        side: 1,
        sideStørrelse: 5,
        sortering: 'relevans'
      }, accessToken || undefined);
      
      setDebugInfo(prev => ({
        ...prev,
        searchTest: {
          status: 'success',
          data: {
            ...result,
            authStatus: accessToken ? 'authenticated' : 'anonymous',
            tokenPresent: !!accessToken,
            userScopes: authState.scopes || []
          },
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      setDebugInfo(prev => ({
        ...prev,
        searchTest: {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  // Check API on component mount
  useEffect(() => {
    checkApiConnection();
    testHealthCheck();
  }, []);

  const getStatusColor = () => {
    if (isChecking) return 'text-neutral-600';
    return apiStatus.isConnected ? 'text-semantic-success' : 'text-semantic-error';
  };

  const getStatusIcon = () => {
    if (isChecking) return <Loader className="w-4 h-4 animate-spin" />;
    return apiStatus.isConnected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (isChecking) return 'Sjekker tilkobling...';
    return apiStatus.isConnected ? 'Tilkoblet' : 'Ikke tilkoblet';
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">
            API-status
          </h1>
          <p className="text-neutral-600">
            Overvåk tilkoblingen til Varekatalog API og systemets ytelse
          </p>
        </div>

        {/* Main Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-800">
              API-tilkobling
            </h2>
            <Button 
              onClick={checkApiConnection}
              disabled={isChecking}
              size="sm"
              variant="outline"
            >
              {isChecking ? 'Sjekker...' : 'Sjekk på nytt'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Connection Status */}
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="text-4xl mb-2">{getStatusIcon()}</div>
              <div className={`text-lg font-semibold ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              <div className="text-sm text-neutral-500 mt-1">
                Tilkoblingsstatus
              </div>
            </div>

            {/* Response Time */}
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="text-2xl font-bold text-neutral-800 mb-2">
                {apiStatus.responseTime !== null ? `${apiStatus.responseTime}ms` : '—'}
              </div>
              <div className="text-sm text-neutral-500">
                Responstid
              </div>
            </div>

            {/* Last Checked */}
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <div className="text-sm font-medium text-neutral-800 mb-2">
                {apiStatus.lastChecked 
                  ? apiStatus.lastChecked.toLocaleTimeString('no-NO')
                  : '—'
                }
              </div>
              <div className="text-sm text-neutral-500">
                Sist sjekket
              </div>
            </div>
          </div>

          {/* Error Details */}
          {apiStatus.error && (
            <div className="mt-4 p-4 bg-semantic-error/10 border border-semantic-error/20 rounded-lg">
              <h3 className="text-sm font-semibold text-semantic-error mb-2">
                Feildetaljer:
              </h3>
              <p className="text-sm text-neutral-700 font-mono">
                {apiStatus.error}
              </p>
            </div>
          )}
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">
            Systeminformasjon
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">Miljø:</span>
                <span className="text-sm text-neutral-800">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">Versjon:</span>
                <span className="text-sm text-neutral-800">1.0.0-dev</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">Build:</span>
                <span className="text-sm text-neutral-800">Phase 1.1</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">Browser:</span>
                <BrowserInfo />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">Oppløsning:</span>
                <ScreenResolution />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">Viewport:</span>
                <ViewportSize />
              </div>
            </div>
          </div>
        </div>

        {/* Features Status */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">
            Funksjonstatus
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Produktsøk</span>
              <span className="text-semantic-success flex items-center gap-1">
                <Check className="w-4 h-4" /> Aktiv
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">NOBB-integrasjon</span>
              <span className="text-semantic-success flex items-center gap-1">
                <Check className="w-4 h-4" /> Aktiv
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Norsk tekststøtte</span>
              <span className="text-semantic-success flex items-center gap-1">
                <Check className="w-4 h-4" /> Aktiv
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Direktesøk</span>
              <span className="text-semantic-success flex items-center gap-1">
                <Check className="w-4 h-4" /> Aktiv
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Real-time API</span>
              <span className="text-semantic-warning flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Under utvikling
              </span>
            </div>
          </div>
        </div>

        {/* Debug Panels - Development Mode Only */}
        {process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true' && (
          <>
            {/* API Debug Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                API Debug Panel
              </h2>
              
              {/* Base URL */}
              <div className="mb-4">
                <strong>Base URL:</strong>
                <div className="font-mono text-sm bg-neutral-50 p-2 rounded mt-1">
                  {debugInfo.baseUrl}
                </div>
              </div>

              {/* Health Check */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <strong>Health Check:</strong>
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    debugInfo.healthCheck.status === 'loading' ? 'bg-yellow-500' :
                    debugInfo.healthCheck.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <button 
                    onClick={testHealthCheck}
                    disabled={debugInfo.healthCheck.status === 'loading'}
                    className="text-sm bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Test
                  </button>
                </div>
                
                {debugInfo.healthCheck.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                    <strong>Error:</strong> {debugInfo.healthCheck.error}
                  </div>
                )}
                
                {debugInfo.healthCheck.data !== undefined && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                    <strong>Success:</strong> 
                    <pre className="text-xs mt-1 whitespace-pre-wrap">
                      {typeof debugInfo.healthCheck.data === 'string' 
                        ? debugInfo.healthCheck.data 
                        : JSON.stringify(debugInfo.healthCheck.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Search Test */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <strong>Search Test:</strong>
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    debugInfo.searchTest.status === 'loading' ? 'bg-yellow-500' :
                    debugInfo.searchTest.status === 'success' ? 'bg-green-500' : 
                    debugInfo.searchTest.status === 'error' ? 'bg-red-500' : 'bg-neutral-300'
                  }`}></span>
                </div>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Enter search query..."
                    className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-byggern-primary"
                  />
                  <button 
                    onClick={testSearch}
                    disabled={debugInfo.searchTest.status === 'loading'}
                    className="text-sm bg-byggern-primary hover:bg-byggern-primary/90 text-white px-3 py-1 rounded disabled:opacity-50"
                  >
                    {debugInfo.searchTest.status === 'loading' ? 'Testing...' : 'Test Search'}
                  </button>
                </div>
                
                <div className="text-xs text-neutral-600 mb-2">
                  Query: &ldquo;{testQuery || 'test'}&rdquo; • Page: 1 • Size: 5 • Sort: relevance
                </div>
                
                {debugInfo.searchTest.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                    <strong>Error:</strong> {debugInfo.searchTest.error}
                  </div>
                )}
                
                {debugInfo.searchTest.data !== undefined && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-sm max-h-32 overflow-auto">
                    <strong>Results:</strong> 
                    <pre className="text-xs mt-1 whitespace-pre-wrap">
                      {typeof debugInfo.searchTest.data === 'string' 
                        ? debugInfo.searchTest.data 
                        : JSON.stringify(debugInfo.searchTest.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="text-xs text-neutral-500">
                <div>Build Mode: {process.env.NODE_ENV} | Debug Mode: {process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true' ? 'Development' : 'Production'}</div>
                <div className="mt-1">API Endpoint: {debugInfo.baseUrl}</div>
                <div className="mt-1">Auth Status: {authState.isAuthenticated ? `Logged in (${authState.scopes.length} scopes)` : 'Anonymous'}</div>
                {authState.isAuthenticated && (
                  <div className="mt-1">User Scopes: {authState.scopes.join(', ') || 'None'}</div>
                )}
              </div>
            </div>

            {/* Cognito Auth Test Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                🔐 Cognito Authentication Test
              </h2>

              <div className="space-y-4">
                {/* Current Configuration */}
                <div className="p-3 bg-neutral-50 rounded border">
                  <div className="text-sm font-medium text-neutral-600 mb-2">Current Configuration</div>
                  <div className="space-y-1 text-xs font-mono">
                    <div><strong>Domain:</strong> {process.env.NEXT_PUBLIC_COGNITO_DOMAIN}</div>
                    <div><strong>Client ID:</strong> {process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}</div>
                    <div><strong>User Pool:</strong> {process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}</div>
                    <div><strong>Redirect URI:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'N/A'}</div>
                  </div>
                </div>

                {/* Test Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={async () => {
                      // Test Direct Cognito (no Azure AD)
                      const generateCodeVerifier = () => {
                        const array = new Uint8Array(32);
                        crypto.getRandomValues(array);
                        return btoa(String.fromCharCode.apply(null, Array.from(array)))
                          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                      };

                      const generateCodeChallenge = async (verifier: string) => {
                        const encoder = new TextEncoder();
                        const data = encoder.encode(verifier);
                        const digest = await crypto.subtle.digest('SHA-256', data);
                        return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
                          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                      };

                      const codeVerifier = generateCodeVerifier();
                      const state = generateCodeVerifier();
                      const codeChallenge = await generateCodeChallenge(codeVerifier);

                      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
                      sessionStorage.setItem('oauth_state', state);

                      const authParams = new URLSearchParams({
                        response_type: 'code',
                        client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
                        redirect_uri: `${window.location.origin}/auth/callback`,
                        scope: 'openid profile email varekatalog/search varekatalog/prices varekatalog/inventory',
                        state: state,
                        code_challenge: codeChallenge,
                        code_challenge_method: 'S256'
                        // NO identity_provider parameter
                      });

                      const authUrl = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize?${authParams.toString()}`;

                      alert(`🔍 DIRECT COGNITO TEST\n\nURL: ${authUrl}\n\nLength: ${authUrl.length} chars\n\nClick OK to test...`);
                      window.location.href = authUrl;
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded text-sm font-medium"
                  >
                    🔵 Test Direct Cognito
                    <div className="text-xs opacity-90 mt-1">Built-in authentication only</div>
                  </button>

                  <button
                    onClick={async () => {
                      // Test Cognito + Azure AD
                      const generateCodeVerifier = () => {
                        const array = new Uint8Array(32);
                        crypto.getRandomValues(array);
                        return btoa(String.fromCharCode.apply(null, Array.from(array)))
                          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                      };

                      const generateCodeChallenge = async (verifier: string) => {
                        const encoder = new TextEncoder();
                        const data = encoder.encode(verifier);
                        const digest = await crypto.subtle.digest('SHA-256', data);
                        return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
                          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                      };

                      const codeVerifier = generateCodeVerifier();
                      const state = generateCodeVerifier();
                      const codeChallenge = await generateCodeChallenge(codeVerifier);

                      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
                      sessionStorage.setItem('oauth_state', state);

                      const authParams = new URLSearchParams({
                        response_type: 'code',
                        client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
                        redirect_uri: `${window.location.origin}/auth/callback`,
                        scope: 'openid profile email varekatalog/search varekatalog/prices varekatalog/inventory',
                        state: state,
                        code_challenge: codeChallenge,
                        code_challenge_method: 'S256',
                        identity_provider: 'AzureAD'
                      });

                      const authUrl = `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/oauth2/authorize?${authParams.toString()}`;

                      alert(`🔍 AZURE AD TEST\n\nURL: ${authUrl}\n\nLength: ${authUrl.length} chars\n\nClick OK to test...`);
                      window.location.href = authUrl;
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded text-sm font-medium"
                  >
                    🔴 Test Azure AD + Cognito
                    <div className="text-xs opacity-90 mt-1">Enterprise SSO authentication</div>
                  </button>
                </div>

                {/* Debug Info */}
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-sm font-medium text-yellow-800 mb-1">📋 Debug Instructions</div>
                  <div className="text-xs text-yellow-700">
                    <p className="mb-1">1. <strong>Direct Cognito Test:</strong> Should work if basic Cognito is configured correctly</p>
                    <p className="mb-1">2. <strong>Azure AD Test:</strong> Will show unauthorized_client if Azure AD redirect URIs don&apos;t match</p>
                    <p>3. Check browser Network tab for failed requests during authentication</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Debug Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">
                Auth Debug Panel
              </h2>
              
              <div className="space-y-3">
                {/* Authentication Status */}
                <div className="p-2 bg-neutral-50 rounded border">
                  <div className="text-xs font-medium text-neutral-600 mb-1">Status</div>
                  <div className={`text-sm font-semibold ${authState.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                    {authState.isLoading ? 'Loading...' : authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </div>
                </div>

                {/* OAuth Scopes */}
                <div className="p-2 bg-neutral-50 rounded border">
                  <div className="text-xs font-medium text-neutral-600 mb-1">
                    OAuth Scopes ({authState.scopes.length})
                  </div>
                  {authState.scopes.length > 0 ? (
                    <div className="space-y-1">
                      {authState.scopes.map((scope) => (
                        <div key={scope} className="text-xs">
                          <span className="font-mono text-green-700 bg-green-50 px-1 rounded">
                            {scope}
                          </span>
                          <div className="text-neutral-600 mt-0.5">
                            {scope === 'varekatalog/prices' ? 'Price information (Grunnpris, Nettopris)' : 
                             scope === 'varekatalog/inventory' ? 'Stock quantities (Lagerantall)' : 
                             'Unknown scope'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-500 italic">No scopes available</div>
                  )}
                </div>

                {/* Permissions */}
                <div className="p-2 bg-neutral-50 rounded border">
                  <div className="text-xs font-medium text-neutral-600 mb-1">Permissions</div>
                  <div className="space-y-1 text-xs">
                    <div className="text-green-600">
                      Search: ✓ (Always Public)
                    </div>
                    <div className={`${authState.permissions.canViewPrices ? 'text-green-600' : 'text-red-600'}`}>
                      View Prices: {authState.permissions.canViewPrices ? '✓ (Premium)' : '✗ (Login Required)'}
                    </div>
                    <div className={`${authState.permissions.canViewInventory ? 'text-green-600' : 'text-red-600'}`}>
                      View Inventory: {authState.permissions.canViewInventory ? '✓ (Premium)' : '✗ (Login Required)'}
                    </div>
                  </div>
                </div>

                {/* Token Info */}
                {authState.accessToken && (
                  <div className="p-2 bg-neutral-50 rounded border">
                    <div className="text-xs font-medium text-neutral-600 mb-1">Access Token</div>
                    <div className="text-xs font-mono text-neutral-700 break-all">
                      {authState.accessToken.substring(0, 50)}...
                    </div>
                  </div>
                )}

                {/* Error Info */}
                {authState.error && (
                  <div className="p-2 bg-red-50 rounded border border-red-200">
                    <div className="text-xs font-medium text-red-600 mb-1">Error</div>
                    <div className="text-xs text-red-700">{authState.error}</div>
                  </div>
                )}

                {/* Data Masking Preview */}
                <div className="p-2 bg-blue-50 rounded border">
                  <div className="text-xs font-medium text-neutral-600 mb-1">Data Masking Preview</div>
                  <div className="space-y-1 text-xs">
                    <div>
                      Stock Quantities: {authState.permissions.canViewInventory ? 
                        <span className="text-green-600">Visible</span> : 
                        <span className="text-red-600">****</span>
                      }
                    </div>
                    <div>
                      Prices: {authState.permissions.canViewPrices ? 
                        <span className="text-green-600">Visible</span> : 
                        <span className="text-red-600">****</span>
                      }
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t text-xs text-neutral-500">
                  Phase 2: OAuth Integration (Search Public + Premium Features)
                </div>
              </div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => typeof window !== 'undefined' && (window.location.href = '/')}
            variant="outline"
          >
            ← Tilbake til hovedside
          </Button>
        </div>
      </div>
    </div>
  );
}