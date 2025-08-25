/**
 * API Status component for monitoring backend connection
 * Step 3.1: Setup API client for backend connection
 */

'use client';

import { useApiStatus } from '../../hooks/useApiStatus';
import { Button } from '../ui';

interface ApiStatusProps {
  /** Show detailed status information */
  detailed?: boolean;
  
  /** Custom className */
  className?: string;
}

export const ApiStatus: React.FC<ApiStatusProps> = ({ 
  detailed = false, 
  className = '' 
}) => {
  const { isHealthy, lastCheck, checkHealth } = useApiStatus();

  const getStatusColor = () => {
    if (isHealthy === null) return 'text-gray-500';
    return isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = () => {
    if (isHealthy === null) return 'Sjekker tilkobling...';
    return isHealthy ? 'API tilkoblet' : 'API ikke tilgjengelig';
  };

  const getStatusIcon = () => {
    if (isHealthy === null) {
      return (
        <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full" />
      );
    }
    
    return (
      <div 
        className={`h-3 w-3 rounded-full ${
          isHealthy ? 'bg-green-600' : 'bg-red-600'
        }`} 
      />
    );
  };

  if (!detailed) {
    return (
      <div className={`flex items-center gap-2 text-xs ${className}`}>
        {getStatusIcon()}
        <span className={getStatusColor()}>{getStatusText()}</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900">
          API-tilkobling
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkHealth}
          className="text-xs"
        >
          Sjekk på nytt
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        {getStatusIcon()}
        <span className={`text-sm ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      {lastCheck && (
        <div className="text-xs text-gray-500">
          Sist sjekket: {lastCheck.toLocaleTimeString('nb-NO')}
        </div>
      )}
      
      {isHealthy === false && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-700">
            Kan ikke koble til backend-tjenestene. Dette kan skyldes:
          </p>
          <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
            <li>Backend-tjenester er ikke startet</li>
            <li>Nettverksproblemer</li>
            <li>Feil i API-konfigurasjonen</li>
          </ul>
        </div>
      )}
      
      {isHealthy && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-700">
            ✅ Backend-tjenester kjører normalt
          </p>
        </div>
      )}
    </div>
  );
};

ApiStatus.displayName = 'ApiStatus';