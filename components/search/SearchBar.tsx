/**
 * SearchBar component for Varekatalog
 * Step 4.1: Enhanced search with Norwegian text support and real-time API integration
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Input, Button } from '../ui';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  enableInstantSearch?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Søk etter produkter, VVS-nummer, leverandører...',
  className,
  enableInstantSearch = false,
  size = 'md'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Norwegian text normalization handled by backend API
  // Local fallback ensures Norwegian characters work in mock data

  const handleSearch = useCallback(async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) {
      onSearch(''); // Clear results
      return;
    }
    
    setIsSearching(true);
    try {
      await onSearch(searchTerm.trim());
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, onSearch]);

  // Instant search with debouncing
  useEffect(() => {
    if (!enableInstantSearch) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for delayed search
    debounceTimerRef.current = setTimeout(() => {
      if (searchQuery.trim().length >= 2 || searchQuery.trim().length === 0) {
        // Call onSearch directly to avoid dependency on handleSearch
        const searchTerm = searchQuery.trim();
        if (searchTerm || searchTerm === '') {
          onSearch(searchTerm);
        }
      }
    }, 500); // 500ms delay for Norwegian typing

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, enableInstantSearch, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Clear debounce timer and search immediately
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      handleSearch();
    }
  };


  // Size-based styling
  const sizeClasses = {
    sm: {
      container: 'space-y-1',
      button: 'sm',
      input: 'sm',
      helper: 'text-xs'
    },
    md: {
      container: 'space-y-3', 
      button: 'md',
      input: 'md',
      helper: 'text-xs'
    },
    lg: {
      container: 'space-y-4',
      button: 'lg', 
      input: 'lg',
      helper: 'text-sm'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`w-full ${currentSize.container} ${className || ''}`}>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            fullWidth
            size={currentSize.input as 'sm' | 'md' | 'lg'}
          />
        </div>
        
        <Button
          onClick={() => handleSearch()}
          disabled={!searchQuery.trim() || isSearching}
          isLoading={isSearching}
          variant="primary"
          size={currentSize.button as 'sm' | 'md' | 'lg'}
        >
          {isSearching ? 'Søker...' : 'Søk'}
        </Button>
      </div>
      
      {size !== 'sm' && (
        <>
          <div className={`${currentSize.helper} text-gray-500`}>
            Søk etter produktnavn, VVS-nummer, EAN eller leverandør
            {enableInstantSearch && (
              <span className="ml-2 text-blue-600">• Direktesøk aktivert</span>
            )}
          </div>
          
          {searchQuery.length >= 1 && searchQuery.length < 2 && enableInstantSearch && (
            <div className={`${currentSize.helper} text-amber-600`}>
              Skriv minst 2 tegn for automatisk søk
            </div>
          )}
        </>
      )}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';