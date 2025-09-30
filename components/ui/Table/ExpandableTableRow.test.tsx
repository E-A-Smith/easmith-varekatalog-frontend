/**
 * Unit tests for ExpandableTableRow component
 * Tests expansion functionality, accessibility, and keyboard navigation
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { ExpandableTableRow } from './ExpandableTableRow';
import type { TableColumn, ExpandableConfig } from './types';

// Mock data for testing
interface TestProduct {
  id: string;
  name: string;
  description: string;
}

const mockRow: TestProduct = {
  id: '1',
  name: 'Test Product',
  description: 'Test description content',
};

const mockColumns: TableColumn<TestProduct>[] = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
];

const mockExpandableConfig: ExpandableConfig<TestProduct> = {
  expandedRowRender: (record) => <div>{record.description}</div>,
};

describe('ExpandableTableRow', () => {
  it('renders the row with data', () => {
    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={mockExpandableConfig}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getAllByText('Test description content')).toHaveLength(2);
  });

  it('renders expand icon when row is expandable', () => {
    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={mockExpandableConfig}
          />
        </tbody>
      </table>
    );

    const expandButton = screen.getByRole('button', { name: /vis detaljer/i });
    expect(expandButton).toBeInTheDocument();
  });

  it('does not render expand icon when row is not expandable', () => {
    const nonExpandableConfig: ExpandableConfig<TestProduct> = {
      ...mockExpandableConfig,
      rowExpandable: () => false,
    };

    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={nonExpandableConfig}
          />
        </tbody>
      </table>
    );

    const expandButton = screen.queryByRole('button', { name: /vis detaljer/i });
    expect(expandButton).not.toBeInTheDocument();
  });

  it('expands and collapses on icon click', () => {
    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={mockExpandableConfig}
          />
        </tbody>
      </table>
    );

    const expandButton = screen.getByRole('button', { name: /vis detaljer/i });

    // Initially collapsed - check button aria-expanded
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(expandButton);

    // Should show "Skjul detaljer" label after expansion
    expect(screen.getByRole('button', { name: /skjul detaljer/i })).toBeInTheDocument();
  });

  it('handles keyboard navigation (Enter key)', () => {
    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={{
              ...mockExpandableConfig,
              expandRowByClick: true,
            }}
          />
        </tbody>
      </table>
    );

    const row = screen.getAllByRole('button')[0]; // First button is the row itself when expandRowByClick is true

    // Press Enter to expand
    if (row) {
      fireEvent.keyDown(row, { key: 'Enter' });
    }

    // Should be expanded now
    expect(screen.getByRole('button', { name: /skjul detaljer/i })).toBeInTheDocument();
  });

  it('handles keyboard navigation (Space key)', () => {
    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={{
              ...mockExpandableConfig,
              expandRowByClick: true,
            }}
          />
        </tbody>
      </table>
    );

    const row = screen.getAllByRole('button')[0];

    // Press Space to expand
    if (row) {
      fireEvent.keyDown(row, { key: ' ' });
    }

    // Should be expanded now
    expect(screen.getByRole('button', { name: /skjul detaljer/i })).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={mockExpandableConfig}
          />
        </tbody>
      </table>
    );

    const expandButton = screen.getByRole('button', { name: /vis detaljer/i });

    // Check initial ARIA attributes
    expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    expect(expandButton).toHaveAttribute('aria-label', 'Vis detaljer');

    // Expand the row
    fireEvent.click(expandButton);

    // Check ARIA attributes after expansion
    const collapseButton = screen.getByRole('button', { name: /skjul detaljer/i });
    expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
    expect(collapseButton).toHaveAttribute('aria-label', 'Skjul detaljer');
  });

  it('calls onRowClick when row is clicked', () => {
    const mockOnRowClick = jest.fn();

    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={mockExpandableConfig}
            onRowClick={mockOnRowClick}
          />
        </tbody>
      </table>
    );

    const row = screen.getAllByRole('row')[0];
    if (row) {
      fireEvent.click(row);
    }

    expect(mockOnRowClick).toHaveBeenCalledWith(mockRow);
  });

  it('renders custom expand icon when provided', () => {
    const CustomExpandIcon = ({ expanded }: { expanded: boolean }) => (
      <div>{expanded ? '▼' : '▶'}</div>
    );

    const customConfig: ExpandableConfig<TestProduct> = {
      ...mockExpandableConfig,
      expandIcon: CustomExpandIcon,
    };

    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={customConfig}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('▶')).toBeInTheDocument();
  });

  it('initially renders as expanded when isInitiallyExpanded is true', () => {
    render(
      <table>
        <tbody>
          <ExpandableTableRow
            row={mockRow}
            rowIndex={0}
            columns={mockColumns}
            expandableConfig={mockExpandableConfig}
            isInitiallyExpanded={true}
          />
        </tbody>
      </table>
    );

    // Should show "Skjul detaljer" label since it's initially expanded
    expect(screen.getByRole('button', { name: /skjul detaljer/i })).toBeInTheDocument();
  });
});
