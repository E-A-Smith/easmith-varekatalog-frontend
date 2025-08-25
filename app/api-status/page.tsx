'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../components/ui';

// API status checking interface
interface ApiStatus {
  isConnected: boolean;
  responseTime: number | null;
  lastChecked: Date | null;
  error: string | null;
}

export default function ApiStatusPage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    isConnected: false,
    responseTime: null,
    lastChecked: null,
    error: null,
  });
  const [isChecking, setIsChecking] = useState(false);

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

  // Check API on component mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  const getStatusColor = () => {
    if (isChecking) return 'text-neutral-600';
    return apiStatus.isConnected ? 'text-semantic-success' : 'text-semantic-error';
  };

  const getStatusIcon = () => {
    if (isChecking) return '⏳';
    return apiStatus.isConnected ? '✅' : '❌';
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
                <span className="text-sm text-neutral-800">
                  {typeof window !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'SSR'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">Oppløsning:</span>
                <span className="text-sm text-neutral-800">
                  {typeof window !== 'undefined' 
                    ? `${window.screen.width}x${window.screen.height}` 
                    : '—'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-600">Viewport:</span>
                <span className="text-sm text-neutral-800">
                  {typeof window !== 'undefined' 
                    ? `${window.innerWidth}x${window.innerHeight}` 
                    : '—'
                  }
                </span>
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
              <span className="text-semantic-success">✅ Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">NOBB-integrasjon</span>
              <span className="text-semantic-success">✅ Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Norsk tekststøtte</span>
              <span className="text-semantic-success">✅ Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Direktesøk</span>
              <span className="text-semantic-success">✅ Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <span className="text-sm font-medium text-neutral-700">Real-time API</span>
              <span className="text-semantic-warning">⚠️ Under utvikling</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            ← Tilbake til hovedside
          </Button>
        </div>
      </div>
    </div>
  );
}