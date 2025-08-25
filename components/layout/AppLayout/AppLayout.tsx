import { FC } from 'react';
import { Header, SubHeader } from '../';
import { AppLayoutProps } from './types';

/**
 * AppLayout Component for Varekatalog
 * 
 * Main layout component that includes the complete header structure:
 * - SubHeader (36px): Organization branding
 * - Header (56px): Logo and search
 * - Content area with proper spacing
 */
export const AppLayout: FC<AppLayoutProps> = ({
  children,
  onSearch,
  searchQuery,
  showSearch = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-neutral-50 ${className}`}>
      <SubHeader />
      <Header 
        {...(onSearch && { onSearch })}
        {...(searchQuery && { searchQuery })}
        showSearch={showSearch}
      />
      <main>
        {children}
      </main>
    </div>
  );
};