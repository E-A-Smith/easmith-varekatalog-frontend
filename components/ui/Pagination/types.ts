/**
 * TypeScript types for Pagination component
 * Varekatalog - Norwegian building supplies catalog
 */

export interface PaginationInfo {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  className?: string;
  // Norwegian language customization
  itemLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
}

export interface PaginationButtonProps {
  page: number;
  isActive: boolean;
  onClick: (page: number) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface PaginationNavigationProps {
  direction: 'previous' | 'next';
  disabled: boolean;
  onClick: () => void;
  label: string;
}