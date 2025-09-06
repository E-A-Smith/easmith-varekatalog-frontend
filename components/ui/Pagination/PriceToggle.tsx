/**
 * Price Toggle Component for Varekatalog
 * Allows authenticated users to hide/show price columns for privacy
 * Norwegian language support with toggle icons
 */

import { FC } from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';

interface PriceToggleProps {
  isVisible: boolean;
  onChange: (visible: boolean) => void;
  className?: string;
}

export const PriceToggle: FC<PriceToggleProps> = ({ 
  isVisible, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="text-sm text-neutral-600">
        {isVisible ? 'Vis priser' : 'Skjul priser'}
      </span>
      <button
        onClick={() => onChange(!isVisible)}
        className="relative w-12 h-6 transition-colors focus:outline-none focus:ring-2 focus:ring-byggern-primary focus:ring-offset-2"
        aria-label={isVisible ? 'Skjul priser' : 'Vis priser'}
        role="switch"
        aria-checked={isVisible}
      >
        <Image
          src={isVisible ? '/toggle-on.svg' : '/toggle-off.svg'}
          alt=""
          width={48}
          height={24}
          className="w-full h-full"
        />
      </button>
    </div>
  );
};