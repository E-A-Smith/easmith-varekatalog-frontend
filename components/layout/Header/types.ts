import { HTMLAttributes } from 'react';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /**
   * Additional CSS classes for the header
   */
  className?: string;
  
  /**
   * Whether to show the search functionality
   * @default true
   */
  showSearch?: boolean;
  
  /**
   * Callback when search is toggled (mobile)
   */
  onSearchToggle?: () => void;
  
  /**
   * Callback when menu is toggled
   */
  onMenuToggle?: () => void;
  
  /**
   * Number of items in cart (for badge display)
   * @default 0
   */
  cartItemCount?: number;
  
  /**
   * Search callback function
   */
  onSearch?: (query: string) => void;
  
  /**
   * Current search query value
   */
  searchQuery?: string;
  
  /**
   * Test ID for automated testing
   */
  testId?: string | undefined;
}