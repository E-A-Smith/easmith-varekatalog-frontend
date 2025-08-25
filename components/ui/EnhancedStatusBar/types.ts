/**
 * TypeScript types for EnhancedStatusBar component
 * Varekatalog - Norwegian building supplies catalog
 */

export interface ConnectionStatus {
  isOnline: boolean;
  lastSync?: Date | string;
  responseTime?: number; // in milliseconds
  quality?: 'excellent' | 'good' | 'poor' | 'offline';
}

export interface CustomerViewStatus {
  isEnabled: boolean;
  displayText: string; // 'PÅ' | 'AV'
}

export interface EnhancedStatusBarProps {
  connectionStatus: ConnectionStatus;
  customerView: CustomerViewStatus;
  onCustomerViewToggle?: () => void;
  className?: string;
  showConnectionDetails?: boolean;
  // Norwegian language customization
  onlineLabel?: string;
  offlineLabel?: string;
  lastSyncLabel?: string;
  responseLabel?: string;
  customerViewLabel?: string;
}

export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'syncing';
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export interface MetricDisplayProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: 'good' | 'warning' | 'error';
  className?: string;
}