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
        <div className="flex items-center justify-between h-full">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Logo height={40} className="flex-shrink-0" />
          </div>

          {/* Search Section - Center */}
          {showSearch && onSearch && (
            <div className="flex-1 max-w-2xl mx-8">
              <SearchBar 
                onSearch={onSearch}
                placeholder="🔍 Søk etter produkter eller kategorier..."
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