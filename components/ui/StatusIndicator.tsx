/**
 * Status Indicator component for Varekatalog design system
 * Phase 1.4: Implements color-coded status bullets per ASCII specification
 * 
 * Visual indicators:
 * ● (filled circle) - På lager (in stock) - Green
 * ● (filled circle) - Få igjen (low stock) - Yellow/Orange  
 * × (cross) - Utsolgt (out of stock) - Red
 */

import { clsx } from 'clsx';
import type { LagerStatus } from '@/types/product';

interface StatusIndicatorProps {
  /** Norwegian stock status */
  status: LagerStatus | 'in-stock' | 'low-stock' | 'out-of-stock' | 'available' | 'unavailable';
  /** Optional text to display next to indicator */
  text?: string;
  /** Size of the indicator */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string | undefined;
  /** Show only the visual indicator without text */
  visualOnly?: boolean;
}

// Map Norwegian stock statuses to visual types
const mapNorwegianStatus = (status: LagerStatus | string): 'filled-circle' | 'cross' => {
  switch (status) {
    case 'På lager':
    case 'in-stock':
    case 'available':
      return 'filled-circle';
    case 'Få igjen':
    case 'low-stock':
      return 'filled-circle';
    case 'Utsolgt':
    case 'out-of-stock':
    case 'unavailable':
      return 'cross';
    case 'Bestillingsvare':
    case 'Utgått':
    case 'Ikke tilgjengelig':
      return 'cross';
    default:
      return 'filled-circle';
  }
};

// Map Norwegian stock statuses to colors
const mapStatusColor = (status: LagerStatus | string): string => {
  switch (status) {
    case 'På lager':
    case 'in-stock':
    case 'available':
      return 'text-green-600'; // Green for in stock
    case 'Få igjen':
    case 'low-stock':
      return 'text-amber-500'; // Amber/orange for low stock
    case 'Utsolgt':
    case 'out-of-stock':
    case 'unavailable':
      return 'text-red-600'; // Red for out of stock
    case 'Bestillingsvare':
      return 'text-blue-600'; // Blue for special order
    case 'Utgått':
    case 'Ikke tilgjengelig':
      return 'text-neutral-400'; // Gray for discontinued/unavailable
    default:
      return 'text-neutral-600';
  }
};

const statusSizes = {
  sm: 'text-xs',
  md: 'text-sm', 
  lg: 'text-base',
};

export function StatusIndicator({ 
  status, 
  text, 
  size = 'md', 
  className,
  visualOnly = false
}: StatusIndicatorProps) {
  const visualType = mapNorwegianStatus(status);
  const colorClass = mapStatusColor(status);
  const sizeClass = statusSizes[size];

  const renderIndicator = () => {
    if (visualType === 'cross') {
      // Render × symbol for out of stock
      return (
        <span 
          className={clsx(
            'font-bold leading-none select-none',
            colorClass,
            sizeClass
          )}
          aria-hidden="true"
        >
          ×
        </span>
      );
    } else {
      // Render ● symbol for in stock / low stock
      return (
        <span 
          className={clsx(
            'font-bold leading-none select-none',
            colorClass,
            sizeClass
          )}
          aria-hidden="true"
        >
          ●
        </span>
      );
    }
  };

  if (visualOnly) {
    return (
      <div className={clsx('flex items-center justify-center', className)}>
        {renderIndicator()}
      </div>
    );
  }

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {renderIndicator()}
      {text && (
        <span 
          className={clsx(
            'text-sm font-medium',
            colorClass
          )}
        >
          {text}
        </span>
      )}
    </div>
  );
}

export default StatusIndicator;