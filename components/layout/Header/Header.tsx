import { FC } from 'react';
import { SearchBar } from '../../search';
import { Logo } from '../../ui';
import { HeaderProps } from './types';

/**
 * Header Component for Varekatalog
 * Implements authentic Byggern main header with logo and search functionality
 * Height: 64px to match design specification
 */
export const Header: FC<HeaderProps> = ({ 
  onSearch,
  className,
  showSearch = true,
  testId = 'header-main'
}) => {
  return (
    <div 
      className={`h-16 bg-byggern-header shadow-sm ${className || ''}`}
      data-testid={testId}
    >
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex items-center gap-8 h-full">
          
          {/* Logo Section - Simple structure like byggern.no */}
          <div className="flex-shrink-0">
            <Logo height={40} />
          </div>

          {/* Search Section - Left aligned, fixed position */}
          {showSearch && onSearch && (
            <div className="flex-1 max-w-2xl">
              <SearchBar 
                onSearch={onSearch}
                placeholder="Søk etter produkter eller kategorier..."
                enableInstantSearch={true}
                size="sm"
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};