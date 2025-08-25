/**
 * NOBB Link component for external product database integration
 * Implements secure external links per design specification
 */

import { ExternalLinkIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface NOBBLinkProps {
  vvsNumber: string | number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NOBBLink({ vvsNumber, className, size = 'sm' }: NOBBLinkProps) {
  // Convert to string and validate VVS number
  const vvsStr = String(vvsNumber).trim();
  
  if (!vvsStr || vvsStr === '0' || vvsStr === '') {
    return (
      <span className="text-neutral-400 text-xs">
        Ikke tilgjengelig
      </span>
    );
  }

  const nobbUrl = `https://nobb.no/item/${vvsStr}`;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5',
  };

  return (
    <a
      href={nobbUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        'inline-flex items-center gap-1 bg-byggern-blue text-white rounded-md font-medium hover:bg-byggern-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-byggern-blue focus:ring-offset-2',
        sizeClasses[size],
        className
      )}
      title={`Åpne ${vvsStr} i NOBB (Norsk produktdatabase)`}
    >
      <span>NOBB</span>
      <ExternalLinkIcon className={iconSizes[size]} aria-hidden="true" />
      <span className="sr-only">Åpner i ny fane</span>
    </a>
  );
}

export default NOBBLink;