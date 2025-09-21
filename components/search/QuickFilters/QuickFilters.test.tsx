/**
 * QuickFilters Component Tests
 * Tests the supplier filter functionality while category filter is hidden
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { QuickFilters } from './QuickFilters';

describe('QuickFilters', () => {
  const mockOnFiltersChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render supplier filter with default fallback when no props provided', () => {
      render(<QuickFilters onFiltersChange={mockOnFiltersChange} />);

      const supplierSelect = screen.getByRole('combobox', { name: /supplier/i });

      expect(supplierSelect).toBeInTheDocument();
      expect(supplierSelect).toHaveDisplayValue('-');

      // Category filter should not be visible yet
      expect(screen.queryByRole('combobox', { name: /category/i })).not.toBeInTheDocument();
    });

    it('should render with provided supplier options', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema', 'Würth'];

      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
        />
      );

      const supplierSelect = screen.getByDisplayValue('Alle leverandører');

      expect(supplierSelect).toBeInTheDocument();
      expect(supplierSelect).toHaveDisplayValue('Alle leverandører');

      // Category filter should not be visible yet
      expect(screen.queryByRole('combobox', { name: /category/i })).not.toBeInTheDocument();
    });

    it('should display "-" when empty supplier options provided', () => {
      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={[]}
        />
      );

      const supplierSelect = screen.getByRole('combobox', { name: /supplier/i });

      expect(supplierSelect).toBeInTheDocument();
      expect(supplierSelect).toHaveDisplayValue('-');
    });
  });

  describe('Supplier Filter Functionality', () => {
    it('should call onFiltersChange when supplier filter changes', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema', 'Würth'];

      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
        />
      );

      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      fireEvent.change(supplierSelect, { target: { value: 'Biltema' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        supplier: 'Biltema',
        category: '-',
        stock: 'Alle'
      });
    });

    it('should manage internal state when no controlled filters provided', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema'];

      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
        />
      );

      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      fireEvent.change(supplierSelect, { target: { value: 'Biltema' } });

      expect(supplierSelect).toHaveDisplayValue('Biltema');
    });
  });

  describe('Controlled Mode', () => {
    it('should use provided filter state in controlled mode', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema'];
      const controlledFilters = {
        supplier: 'Biltema',
        category: 'Alle kategorier',
        stock: 'Alle'
      };

      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
          filters={controlledFilters}
        />
      );

      const supplierSelect = screen.getByDisplayValue('Biltema');
      expect(supplierSelect).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined supplier options gracefully', () => {
      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
        />
      );

      const supplierSelect = screen.getByRole('combobox', { name: /supplier/i });

      expect(supplierSelect).toBeInTheDocument();
      expect(supplierSelect).toHaveDisplayValue('-');
    });

    it('should handle single supplier option arrays', () => {
      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={['Only Option']}
        />
      );

      const supplierSelect = screen.getByDisplayValue('Only Option');
      expect(supplierSelect).toBeInTheDocument();
    });

    it('should handle empty string in supplier options', () => {
      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={['']}
        />
      );

      // Empty strings should still be rendered
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(1); // Only supplier select should be visible
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels and IDs for supplier filter', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema'];

      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
        />
      );

      const supplierSelect = screen.getByDisplayValue('Alle leverandører');

      expect(supplierSelect).toHaveAttribute('id', 'supplier-filter');
      expect(supplierSelect).toHaveAttribute('name', 'supplier');
      expect(supplierSelect).toHaveAttribute('aria-label', 'Supplier filter');
    });

    it('should be keyboard navigable', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema'];

      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
        />
      );

      const supplierSelect = screen.getByDisplayValue('Alle leverandører');

      // Should be focusable
      supplierSelect.focus();
      expect(document.activeElement).toBe(supplierSelect);
    });
  });

  describe('Norwegian Locale', () => {
    it('should handle Norwegian characters in supplier options', () => {
      const supplierOptions = ['Alle leverandører', 'Rørkjøp', 'Würth'];

      render(
        <QuickFilters
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
        />
      );

      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      fireEvent.change(supplierSelect, { target: { value: 'Rørkjøp' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        supplier: 'Rørkjøp',
        category: '-',
        stock: 'Alle'
      });
    });
  });
});