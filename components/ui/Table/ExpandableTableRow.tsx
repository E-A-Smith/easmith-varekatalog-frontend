/**
 * ExpandableTableRow component
 * Implements expandable row functionality with accessibility and animations
 */

import { useState, useId, type ReactNode } from 'react';
import { clsx } from 'clsx';
import type { TableColumn, ExpandableConfig } from './types';

interface ExpandableTableRowProps<T = Record<string, unknown>> {
  /** Row data */
  row: T;

  /** Row index */
  rowIndex: number;

  /** Table columns */
  columns: TableColumn<T>[];

  /** Expandable configuration */
  expandableConfig: ExpandableConfig<T>;

  /** Whether this row is initially expanded */
  isInitiallyExpanded?: boolean;

  /** Callback for row click */
  onRowClick?: ((row: T) => void) | undefined;

  /** Additional row class names */
  className?: string;
}

// Default expand icon component
const DefaultExpandIcon = ({ expanded, onExpand, ariaLabel = 'Utvid rad', className }: {
  expanded: boolean;
  onExpand: () => void;
  ariaLabel?: string;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onExpand}
    aria-label={ariaLabel}
    aria-expanded={expanded}
    className={clsx(
      'inline-flex items-center justify-center w-6 h-6 transition-colors rounded',
      'text-neutral-400 hover:text-byggern-primary hover:bg-neutral-100',
      'focus:outline-none focus:ring-2 focus:ring-byggern-primary focus:ring-offset-1',
      className
    )}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={clsx(
        'w-5 h-5 transition-transform duration-200',
        expanded && 'rotate-90'
      )}
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  </button>
);

export function ExpandableTableRow<T = Record<string, unknown>>({
  row,
  rowIndex,
  columns,
  expandableConfig,
  isInitiallyExpanded = false,
  onRowClick,
  className,
}: ExpandableTableRowProps<T>) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const expandedContentId = useId();

  // Check if row is expandable
  const canExpand = expandableConfig.rowExpandable
    ? expandableConfig.rowExpandable(row)
    : true;

  // Toggle expansion
  const handleToggleExpand = () => {
    if (canExpand) {
      setIsExpanded(!isExpanded);
    }
  };

  // Handler for expand icon click (stops propagation)
  const handleExpandIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click when clicking expand icon
    handleToggleExpand();
  };

  // Handle row click (if expandRowByClick is enabled)
  const handleRowClick = () => {
    if (expandableConfig.expandRowByClick && canExpand) {
      setIsExpanded(!isExpanded);
    }
    onRowClick?.(row);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (canExpand && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  const ExpandIcon = expandableConfig.expandIcon || DefaultExpandIcon;

  return (
    <>
      {/* Main table row */}
      <tr
        className={clsx(
          'border-b border-neutral-100 transition-colors',
          expandableConfig.expandRowByClick && canExpand && 'cursor-pointer',
          !expandableConfig.expandRowByClick && onRowClick && 'cursor-pointer hover:bg-neutral-50/50',
          className
        )}
        onClick={handleRowClick}
        onKeyDown={handleKeyDown}
        aria-expanded={canExpand ? isExpanded : undefined}
        aria-controls={canExpand ? expandedContentId : undefined}
        role={expandableConfig.expandRowByClick && canExpand ? 'button' : undefined}
        tabIndex={expandableConfig.expandRowByClick && canExpand ? 0 : undefined}
      >
        {/* Expand icon cell */}
        {canExpand && (
          <td className="px-4 py-2 text-sm">
            <div onClick={handleExpandIconClick}>
              <ExpandIcon
                expanded={isExpanded}
                onExpand={handleToggleExpand}
                ariaLabel={isExpanded ? 'Skjul detaljer' : 'Vis detaljer'}
              />
            </div>
          </td>
        )}

        {/* Data cells */}
        {columns.map((column) => {
          const value = (row as Record<string, unknown>)[column.key];
          return (
            <td
              key={`${rowIndex}-${column.key}`}
              className={clsx(
                'px-4 py-2 text-sm text-neutral-800',
                column.align === 'center' && 'text-center',
                column.align === 'right' && 'text-right'
              )}
              style={column.width ? { width: column.width } : undefined}
            >
              {column.render ? column.render(value, row) : (value as ReactNode)}
            </td>
          );
        })}
      </tr>

      {/* Expanded content row */}
      {canExpand && (
        <tr
          id={expandedContentId}
          className={clsx(
            'border-b border-neutral-100',
            expandableConfig.expandedRowClassName
          )}
          aria-hidden={!isExpanded}
        >
          <td
            colSpan={expandableConfig.expandedRowColSpan || (columns.length + 1)}
            className="p-0"
          >
            <div
              className={clsx(
                'grid transition-[grid-template-rows] duration-200 ease-in-out overflow-hidden',
                isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              )}
            >
              <div className="min-h-0">
                <div className="bg-neutral-50 px-6 py-4">
                  {expandableConfig.expandedRowRender(row, rowIndex)}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

ExpandableTableRow.displayName = 'ExpandableTableRow';
