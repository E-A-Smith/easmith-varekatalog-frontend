/**
 * Development Authentication Debug Panel
 * Allows testing different OAuth scope scenarios in development
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { OAuthScope } from '@/types/product';

interface AuthDebugPanelProps {
  className?: string;
}

export function AuthDebugPanel({ className }: AuthDebugPanelProps) {
  const { authState } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  if (process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS !== 'true') {
    return null;
  }

  const togglePanel = () => setIsExpanded(!isExpanded);

  const scopeDescriptions: Record<OAuthScope, string> = {
    'varekatalog/prices': 'Price information (Grunnpris, Nettopris)',
    'varekatalog/inventory': 'Stock quantities (Lagerantall)'
  };

  return (
    <div className={`fixed bottom-16 right-4 z-50 ${className}`}>
      {!isExpanded ? (
        <button
          onClick={togglePanel}
          className="bg-byggern-primary text-white px-3 py-1 rounded text-sm hover:bg-byggern-primary/90"
        >
          Debug Auth
        </button>
      ) : (
        <div className="bg-white border-2 border-neutral-200 rounded-lg shadow-lg p-4 max-w-lg max-h-96 overflow-auto z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Auth Debug Panel</h3>
            <button
              onClick={togglePanel}
              className="text-neutral-500 hover:text-neutral-700"
            >
              ✕
            </button>
          </div>

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
                        {scopeDescriptions[scope]}
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
          </div>

          <div className="mt-3 pt-2 border-t text-xs text-neutral-500">
            Phase 2: OAuth Integration (Search Public + Premium Features)
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthDebugPanel;