/**
 * Toolbar component for Varekatalog design system
 * Implements two-tier header: 28px subtitle + 56px main header = 84px total
 * Follows authentic Byggern brand guidelines with proper colors and typography
 */

import { FC } from 'react';
import { SearchBar } from '../../search';
import { ToolbarProps } from './types';

export const Toolbar: FC<ToolbarProps> = ({ 
  onSearch,
  className 
}) => {
  return (
    <div className={`sticky top-0 z-50 ${className || ''}`}>
      {/* Subtitle Bar - 28px height */}
      <div className="h-7 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center h-full">
            <span className="text-sm text-neutral-600 font-medium">
              Varekatalog for Løvenskiold Logistikk levert av Byggern
            </span>
          </div>
        </div>
      </div>

      {/* Main Header - 56px height with Byggern header background */}
      <div className="h-14 bg-byggern-header shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                {/* Authentic BYGGER'N Logo with brand yellow */}
                <div className="w-10 h-8 bg-byggern-yellow rounded-sm flex items-center justify-center">
                  <span className="text-byggern-header font-bold text-lg leading-none">&nbsp;</span>
                </div>
                <h1 className="text-xl font-bold text-white">
                  BYGGER&apos;N
                </h1>
              </div>
            </div>

            {/* Unified Search - Center */}
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar 
                onSearch={onSearch}
                placeholder="Søk etter produkter eller kategorier..."
                enableInstantSearch={true}
                size="sm"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;