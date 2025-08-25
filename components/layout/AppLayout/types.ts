import { ReactNode } from 'react';

export interface AppLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  showSearch?: boolean;
  className?: string;
}