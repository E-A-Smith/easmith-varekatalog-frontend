/**
 * TypeScript types for Table component with expandable rows support
 * Follows TanStack Table and Ant Design expandable patterns
 */

import type { ReactNode } from 'react';

// Basic table column definition
export interface TableColumn<T = Record<string, unknown>> {
  /** Column key matching data property */
  key: string;

  /** Display label for column header */
  label: string;

  /** Text alignment */
  align?: 'left' | 'center' | 'right';

  /** Column width (CSS value) */
  width?: string;

  /** Custom render function for cell content */
  render?: (value: unknown, row: T) => ReactNode;
}

// Props for expand icon component
export interface ExpandIconProps {
  /** Whether the row is currently expanded */
  expanded: boolean;

  /** Callback to toggle expansion state */
  onExpand: () => void;

  /** ARIA label for accessibility */
  ariaLabel?: string;

  /** Additional CSS classes */
  className?: string;
}

// Configuration for expandable table functionality
export interface ExpandableConfig<T = Record<string, unknown>> {
  /** Render function for expanded content */
  expandedRowRender: (record: T, index: number) => ReactNode;

  /** Determine if a row can be expanded (optional) */
  rowExpandable?: (record: T) => boolean;

  /** Default expanded row keys */
  defaultExpandedRowKeys?: string[];

  /** Custom expand icon component (optional) */
  expandIcon?: (props: ExpandIconProps) => ReactNode;

  /** Column span for expanded content (defaults to all columns) */
  expandedRowColSpan?: number;

  /** Enable expand on full row click (default: false, only icon click) */
  expandRowByClick?: boolean;

  /** Custom class for expanded content row */
  expandedRowClassName?: string;
}

// Base table props
export interface TableProps<T = Record<string, unknown>> {
  /** Table data array */
  data: T[];

  /** Column definitions */
  columns: TableColumn<T>[];

  /** Loading state */
  loading?: boolean;

  /** Message to display when no data */
  emptyMessage?: string;

  /** Row click handler */
  onRowClick?: (row: T) => void;

  /** Additional CSS classes */
  className?: string;

  /** Expandable configuration (optional) */
  expandable?: ExpandableConfig<T>;
}

// State for managing expanded rows
export interface ExpandedRowsState {
  /** Set of expanded row identifiers */
  expandedKeys: Set<string>;

  /** Toggle expansion for a specific row */
  toggleRow: (key: string) => void;

  /** Expand all rows */
  expandAll: () => void;

  /** Collapse all rows */
  collapseAll: () => void;

  /** Check if a specific row is expanded */
  isExpanded: (key: string) => boolean;
}
