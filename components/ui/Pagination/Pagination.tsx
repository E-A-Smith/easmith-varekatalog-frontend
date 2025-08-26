/**
 * Pagination Component for Varekatalog
 * Norwegian building supplies catalog with authentic Byggern design
 * 
 * Features:
 * - Norwegian language support
 * - Responsive design (desktop-first)
 * - Accessible keyboard navigation
 * - Professional appearance matching Byggern brand
 */

'use client';

import { FC, useMemo } from 'react';
import { clsx } from 'clsx';
import { PaginationProps, PaginationButtonProps, PaginationNavigationProps } from './types';

/**
 * Individual pagination button component
 */
const PaginationButton: FC<PaginationButtonProps> = ({ 
  page, 
  isActive, 
  onClick, 
  disabled = false, 
  children, 
  className 
}) => {
  return (
    <button
      onClick={() => !disabled && onClick(page)}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3',
        'text-sm font-medium rounded-md transition-colors',
        'border border-neutral-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-byggern-primary focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive ? [
          'bg-byggern-primary text-white border-byggern-primary',
          'hover:bg-byggern-primary-hover'
        ] : [
          'bg-white text-neutral-700 hover:bg-neutral-50',
          'hover:border-neutral-400'
        ],
        className
      )}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Gå til side ${page}`}
    >
      {children}
    </button>
  );
};

/**
 * Navigation button (Previous/Next) component
 */
const PaginationNavigation: FC<PaginationNavigationProps> = ({ 
  direction, 
  disabled, 
  onClick, 
  label 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-2 px-4 h-10',
        'text-sm font-medium rounded-md transition-colors',
        'border border-neutral-300 bg-white text-neutral-700',
        'hover:bg-neutral-50 hover:border-neutral-400',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-byggern-primary focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-neutral-300'
      )}
      aria-label={label}
    >
      <span>{direction === 'previous' ? '◀ ' : ''}{label}{direction === 'next' ? ' ▶' : ''}</span>
    </button>
  );
};

/**
 * Main Pagination Component
 */
export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  onPageChange,
  className = '',
  itemLabel = 'products',
  previousLabel = 'Prev',
  nextLabel = 'Next'
}) => {
  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      // Show all pages if we have few pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination with ellipsis
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, currentPage + halfVisible);

      // Adjust if we're near the beginning or end
      if (currentPage <= halfVisible) {
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1;
      }

      // Always show first page
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Always show last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  }, [currentPage, totalPages]);


  return (
    <div className={clsx(
      'flex flex-col sm:flex-row items-center justify-between gap-4 p-4',
      'bg-white border-t border-neutral-200',
      className
    )}>
      {/* Combined item count, pagination controls, and export */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full">
        <div className="flex items-center gap-2 text-sm text-neutral-600 whitespace-nowrap">
          <span>Showing </span>
          <span className="font-medium text-neutral-900">
            {startItem}-{endItem}
          </span>
          <span> of </span>
          <span className="font-medium text-neutral-900">
            {totalItems}
          </span>
          <span> {itemLabel}</span>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* Previous button */}
            <PaginationNavigation
              direction="previous"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              label={previousLabel}
            />

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {pageNumbers.map((page, index) => (
                typeof page === 'number' ? (
                  <PaginationButton
                    key={page}
                    page={page}
                    isActive={page === currentPage}
                    onClick={onPageChange}
                  >
                    {page}
                  </PaginationButton>
                ) : (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex items-center justify-center min-w-[2.5rem] h-10 text-neutral-500"
                    aria-hidden="true"
                  >
                    {page}
                  </span>
                )
              ))}
            </div>

            {/* Next button */}
            <PaginationNavigation
              direction="next"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              label={nextLabel}
            />
          </div>
        )}

      </div>
    </div>
  );
};