'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api';

interface ApiDebugInfo {
  baseUrl: string;
  healthCheck: {
    status: 'loading' | 'success' | 'error';
    data?: unknown;
    error?: string;
    timestamp?: string;
  };
  searchTest: {
    status: 'idle' | 'loading' | 'success' | 'error';
    data?: unknown;
    error?: string;
    timestamp?: string;
  };
}

export const ApiDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<ApiDebugInfo>({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    healthCheck: { status: 'loading' },
    searchTest: { status: 'idle' }
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    testHealthCheck();
  }, []);

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
      const result = await apiClient.searchProducts({
        søketekst: 'test',
        side: 1,
        sideStørrelse: 5,
        sortering: 'relevans'
      });
      
      setDebugInfo(prev => ({
        ...prev,
        searchTest: {
          status: 'success',
          data: result,
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

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-byggern-primary text-white px-3 py-1 rounded text-sm hover:bg-byggern-primary/90"
      >
        Debug API
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-neutral-200 rounded-lg shadow-lg p-4 max-w-lg max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-lg">API Debug Panel</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-neutral-500 hover:text-neutral-700"
        >
          ✕
        </button>
      </div>

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
        
{debugInfo.healthCheck.data ? (
          <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
            <strong>Success:</strong> 
            <pre className="text-xs mt-1 whitespace-pre-wrap">
              {JSON.stringify(debugInfo.healthCheck.data, null, 2)}
            </pre>
          </div>
        ) : null}
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
          <button 
            onClick={testSearch}
            disabled={debugInfo.searchTest.status === 'loading'}
            className="text-sm bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded disabled:opacity-50"
          >
            Test Search
          </button>
        </div>
        
        {debugInfo.searchTest.error && (
          <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
            <strong>Error:</strong> {debugInfo.searchTest.error}
          </div>
        )}
        
{debugInfo.searchTest.data ? (
          <div className="bg-green-50 border border-green-200 rounded p-2 text-sm max-h-32 overflow-auto">
            <strong>Results:</strong> 
            <pre className="text-xs mt-1 whitespace-pre-wrap">
              {JSON.stringify(debugInfo.searchTest.data, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>

      <div className="text-xs text-neutral-500">
        <div>Build Mode: {process.env.NODE_ENV} | Debug Mode: {process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true' ? 'Development' : 'Production'}</div>
        <div className="mt-1">API Endpoint: {debugInfo.baseUrl}</div>
      </div>
    </div>
  );
};