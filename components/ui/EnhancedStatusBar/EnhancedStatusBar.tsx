/**
 * Enhanced Status Bar Component for Varekatalog
 * Norwegian building supplies catalog with authentic Byggern design
 * 
 * Features:
 * - Online/offline status indicator
 * - Last sync time display
 * - Response time monitoring
 * - Customer view mode toggle
 * - Norwegian language support
 * - Professional appearance for retail environment
 */

'use client';

import { FC, useMemo } from 'react';
import { clsx } from 'clsx';
import { 
  EnhancedStatusBarProps, 
  StatusIndicatorProps, 
  MetricDisplayProps 
} from './types';

/**
 * Connection status indicator with visual feedback
 */
const ConnectionStatusIndicator: FC<StatusIndicatorProps> = ({ 
  status, 
  size = 'md', 
  showPulse = false 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusColors = {
    online: 'bg-byggern-success',
    offline: 'bg-semantic-error',
    syncing: 'bg-semantic-warning'
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div 
          className={clsx(
            'rounded-full',
            sizeClasses[size],
            statusColors[status]
          )}
        />
        {showPulse && status === 'online' && (
          <div 
            className={clsx(
              'absolute inset-0 rounded-full animate-ping',
              sizeClasses[size],
              'bg-byggern-success opacity-75'
            )}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Individual metric display component
 */
const MetricDisplay: FC<MetricDisplayProps> = ({ 
  icon, 
  label, 
  value, 
  status = 'good',
  className = '' 
}) => {
  const statusColors = {
    good: 'text-neutral-700',
    warning: 'text-semantic-warning',
    error: 'text-semantic-error'
  };

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="text-neutral-500" aria-hidden="true">
        {icon}
      </span>
      <span className="text-sm">
        <span className="text-neutral-600">{label}: </span>
        <span className={clsx('font-medium', statusColors[status])}>
          {value}
        </span>
      </span>
    </div>
  );
};

/**
 * Main Enhanced Status Bar Component
 */
export const EnhancedStatusBar: FC<EnhancedStatusBarProps> = ({
  connectionStatus,
  customerView,
  onCustomerViewToggle,
  className = '',
  showConnectionDetails = true,
  onlineLabel = 'Online',
  offlineLabel = 'Offline',
  lastSyncLabel = 'Last sync',
  responseLabel = 'Response',
  customerViewLabel = 'Kundevisning'
}) => {
  // Format last sync time
  const formattedLastSync = useMemo(() => {
    if (!connectionStatus.lastSync) return 'Aldri';
    
    const syncDate = typeof connectionStatus.lastSync === 'string' 
      ? new Date(connectionStatus.lastSync) 
      : connectionStatus.lastSync;
    
    // Format as HH:MM for Norwegian locale
    return syncDate.toLocaleTimeString('no', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, [connectionStatus.lastSync]);

  // Format response time
  const formattedResponseTime = useMemo(() => {
    if (typeof connectionStatus.responseTime !== 'number') return 'N/A';
    
    if (connectionStatus.responseTime < 1000) {
      return `${connectionStatus.responseTime}ms`;
    } else {
      return `${(connectionStatus.responseTime / 1000).toFixed(1)}s`;
    }
  }, [connectionStatus.responseTime]);

  // Determine response time status
  const responseTimeStatus = useMemo(() => {
    if (!connectionStatus.responseTime) return 'good';
    if (connectionStatus.responseTime < 500) return 'good';
    if (connectionStatus.responseTime < 2000) return 'warning';
    return 'error';
  }, [connectionStatus.responseTime]);

  // Handle customer view toggle
  const handleCustomerViewToggle = () => {
    if (onCustomerViewToggle) {
      onCustomerViewToggle();
    }
  };

  return (
    <div className={clsx(
      'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6',
      'px-4 py-3 bg-neutral-100 border-t border-neutral-200',
      'text-sm font-medium',
      className
    )}>
      {/* Left side - Connection and performance metrics */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Online status */}
        <div className="flex items-center gap-2">
          <ConnectionStatusIndicator 
            status={connectionStatus.isOnline ? 'online' : 'offline'}
            showPulse={connectionStatus.isOnline}
          />
          <span className={clsx(
            'text-sm font-medium',
            connectionStatus.isOnline 
              ? 'text-byggern-success' 
              : 'text-semantic-error'
          )}>
            🌐 {connectionStatus.isOnline ? onlineLabel : offlineLabel}
          </span>
        </div>

        {/* Connection details */}
        {showConnectionDetails && connectionStatus.isOnline && (
          <>
            {/* Last sync time */}
            <MetricDisplay
              icon="🔄"
              label={lastSyncLabel}
              value={formattedLastSync}
            />

            {/* Response time */}
            <MetricDisplay
              icon="⚡"
              label={responseLabel}
              value={formattedResponseTime}
              status={responseTimeStatus}
            />
          </>
        )}
      </div>

      {/* Right side - Customer view toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600">
          {customerViewLabel}:
        </span>
        <button
          onClick={handleCustomerViewToggle}
          className={clsx(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-md',
            'text-sm font-medium transition-colors',
            'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-byggern-primary focus-visible:ring-offset-1',
            customerView.isEnabled ? [
              'bg-byggern-success text-white border-byggern-success',
              'hover:bg-byggern-success/90'
            ] : [
              'bg-white text-neutral-700 border-neutral-300',
              'hover:bg-neutral-50 hover:border-neutral-400'
            ]
          )}
          aria-pressed={customerView.isEnabled}
          aria-label={`${customerViewLabel} er ${customerView.displayText.toLowerCase()}`}
        >
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-current/20">
            {customerView.isEnabled ? (
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          <span>{customerView.displayText}</span>
        </button>
      </div>
    </div>
  );
};