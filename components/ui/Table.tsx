/**
 * Table component for Varekatalog design system
 * Step 2.2: Enhanced with TypeScript types system support
 */

import { forwardRef } from 'react';
import { clsx } from 'clsx';

// Define local type for table column
interface ProductTableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: Product) => React.ReactNode;
}

// Define local Product interface
interface Product {
  id: string;
  navn: string;
  beskrivelse?: string;
  pris: number;
  lagerStatus: string;
  vvsnr?: string;
  anbrekk?: string;
  kategori?: string;
  produsent?: string;
  bildeUrl?: string;
  vekt?: number;
  enhet?: string;
}

interface TableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

const tableStyles = {
  base: 'w-full border-collapse rounded-lg overflow-hidden shadow-soft',
  header: 'border-b border-neutral-200 bg-neutral-50',
  headerCell: 'px-4 py-3 text-left text-sm font-semibold text-neutral-800',
  row: 'border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors',
  cell: 'px-4 py-3 text-sm text-neutral-800',
  clickableRow: 'cursor-pointer hover:bg-byggern-blue/5',
};

function TableInner<T = Record<string, unknown>>(
  {
    data,
    columns,
    loading = false,
    emptyMessage = 'Ingen data tilgjengelig',
    onRowClick,
    className,
    ...props
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>
) {
  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-spin h-6 w-6 border-2 border-byggern-blue border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-sm text-neutral-500">Laster data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-sm text-neutral-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <table
        ref={ref}
        className={clsx(tableStyles.base, className)}
        {...props}
      >
        <thead className={tableStyles.header}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx(
                  tableStyles.headerCell,
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right'
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={clsx(
                tableStyles.row,
                onRowClick && tableStyles.clickableRow
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = (row as Record<string, unknown>)[column.key];
                return (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className={clsx(
                      tableStyles.cell,
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right'
                    )}
                  >
                    {column.render ? column.render(value, row) : (value as React.ReactNode)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Table = forwardRef(TableInner) as <T = Record<string, unknown>>(
  props: TableProps<T> & { ref?: React.ForwardedRef<HTMLTableElement> }
) => ReturnType<typeof TableInner>;

// Specialized Product Table props for enhanced type safety
interface ProductTableProps {
  data: Product[];
  columns: ProductTableColumn[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (product: Product) => void;
  className?: string;
}

// Specialized ProductTable component with enhanced type safety
export const ProductTable = forwardRef<HTMLTableElement, ProductTableProps>(
  ({ data, columns, loading, emptyMessage, onRowClick, className, ...props }, ref) => {
    // Convert ProductTableColumn[] to TableColumn<Product>[] for type compatibility
    const tableColumns: TableColumn<Product>[] = columns.map(col => ({
      key: col.key as string,
      label: col.label,
      ...(col.align && { align: col.align }),
      ...(col.render && { render: (value: unknown, product: Product) => col.render!(value, product) })
    }));

    return (
      <Table<Product>
        ref={ref}
        data={data}
        columns={tableColumns}
        {...(loading !== undefined && { loading })}
        {...(emptyMessage && { emptyMessage })}
        {...(onRowClick && { onRowClick })}
        {...(className && { className })}
        {...props}
      />
    );
  }
);

ProductTable.displayName = 'ProductTable';