/**
 * Unit Tests for QuickFilters Component
 * Tests for dynamic filter options and controlled/uncontrolled behavior
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QuickFilters } from './QuickFilters';
import { FilterState } from './types';

// Mock the filter helpers
jest.mock('@/utils/filter-helpers', () => ({
  validateFilterValue: jest.fn((value, options) => {
    if (options.includes(value)) return value;
    return options[0] || '-';
  })
}));

describe('QuickFilters', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnFiltersReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default fallback options when no props provided', () => {
      render(<QuickFilters onFiltersChange={mockOnFiltersChange} />);
      
      const supplierSelect = screen.getByRole('combobox', { name: /supplier/i });
      const categorySelect = screen.getByRole('combobox', { name: /category/i });
      
      expect(supplierSelect).toBeInTheDocument();
      expect(categorySelect).toBeInTheDocument();
      expect(supplierSelect).toHaveDisplayValue('-');
      expect(categorySelect).toHaveDisplayValue('-');
    });

    it('should render with provided dynamic options', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema', 'Würth'];
      const categoryOptions = ['Alle kategorier', 'Sikkerhet', 'Beslag'];
      
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
          categoryOptions={categoryOptions}
        />
      );
      
      // Check that options are available in the selects
      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      const categorySelect = screen.getByDisplayValue('Alle kategorier');
      
      expect(supplierSelect).toBeInTheDocument();
      expect(categorySelect).toBeInTheDocument();
      
      // Open supplier dropdown and check options
      fireEvent.click(supplierSelect);
      expect(screen.getByText('Biltema')).toBeInTheDocument();
      expect(screen.getByText('Würth')).toBeInTheDocument();
    });

    it('should display "-" when empty options provided', () => {
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={['-']}
          categoryOptions={['-']}
        />
      );
      
      const supplierSelect = screen.getByRole('combobox', { name: /supplier/i });
      const categorySelect = screen.getByRole('combobox', { name: /category/i });
      
      expect(supplierSelect).toBeInTheDocument();
      expect(categorySelect).toBeInTheDocument();
      expect(supplierSelect).toHaveDisplayValue('-');
      expect(categorySelect).toHaveDisplayValue('-');
    });
  });

  describe('Filter Change Handling', () => {
    it('should call onFiltersChange when supplier filter changes', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema', 'Würth'];
      
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
          categoryOptions={['Alle kategorier']}
        />
      );
      
      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      fireEvent.change(supplierSelect, { target: { value: 'Biltema' } });
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        supplier: 'Biltema',
        category: 'Alle kategorier',
        stock: 'Alle'
      });
    });

    it('should call onFiltersChange when category filter changes', () => {
      const categoryOptions = ['Alle kategorier', 'Sikkerhet', 'Beslag'];
      
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={['Alle leverandører']}
          categoryOptions={categoryOptions}
        />
      );
      
      const categorySelect = screen.getByDisplayValue('Alle kategorier');
      fireEvent.change(categorySelect, { target: { value: 'Sikkerhet' } });
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        supplier: 'Alle leverandører',
        category: 'Sikkerhet',
        stock: 'Alle'
      });
    });
  });

  describe('Controlled Mode', () => {
    it('should use provided filter state in controlled mode', () => {
      const controlledFilters: FilterState = {
        supplier: 'Biltema',
        category: 'Sikkerhet',
        stock: 'På lager'
      };
      
      const supplierOptions = ['Alle leverandører', 'Biltema', 'Würth'];
      const categoryOptions = ['Alle kategorier', 'Sikkerhet', 'Beslag'];
      
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
          categoryOptions={categoryOptions}
          filters={controlledFilters}
        />
      );
      
      expect(screen.getByDisplayValue('Biltema')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sikkerhet')).toBeInTheDocument();
    });

    it('should call onFiltersReset when controlled filters become invalid', async () => {
      const controlledFilters: FilterState = {
        supplier: 'InvalidSupplier',
        category: 'InvalidCategory',
        stock: 'Alle'
      };
      
      const supplierOptions = ['Alle leverandører', 'Biltema'];
      const categoryOptions = ['Alle kategorier', 'Sikkerhet'];
      
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          onFiltersReset={mockOnFiltersReset}
          supplierOptions={supplierOptions}
          categoryOptions={categoryOptions}
          filters={controlledFilters}
        />
      );
      
      // The useEffect should trigger onFiltersReset with validated values
      // We need to wait for the effect to run
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockOnFiltersReset).toHaveBeenCalledWith({
        supplier: 'Alle leverandører', // Validated to first option
        category: 'Alle kategorier',   // Validated to first option
        stock: 'Alle'
      });
    });
  });

  describe('Uncontrolled Mode', () => {
    it('should manage internal state when no controlled filters provided', () => {
      const supplierOptions = ['Alle leverandører', 'Biltema', 'Würth'];
      
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
          categoryOptions={['Alle kategorier']}
        />
      );
      
      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      fireEvent.change(supplierSelect, { target: { value: 'Biltema' } });
      
      // Should update internal state and call onChange
      expect(mockOnFiltersChange).toHaveBeenCalled();
      expect(screen.getByDisplayValue('Biltema')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined options gracefully', () => {
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
        />
      );
      
      // Should fall back to minimal options
      const supplierSelect = screen.getByRole('combobox', { name: /supplier/i });
      const categorySelect = screen.getByRole('combobox', { name: /category/i });
      expect(supplierSelect).toBeInTheDocument();
      expect(categorySelect).toBeInTheDocument();
      expect(supplierSelect).toHaveDisplayValue('-');
      expect(categorySelect).toHaveDisplayValue('-');
    });

    it('should handle single option arrays', () => {
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={['OnlySupplier']}
          categoryOptions={['OnlyCategory']}
        />
      );
      
      expect(screen.getByDisplayValue('OnlySupplier')).toBeInTheDocument();
      expect(screen.getByDisplayValue('OnlyCategory')).toBeInTheDocument();
    });

    it('should handle empty string options', () => {
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={['']}
          categoryOptions={['']}
        />
      );
      
      // Empty strings should still be rendered
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2); // supplier and category selects
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels and IDs', () => {
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={['Alle leverandører', 'Biltema']}
          categoryOptions={['Alle kategorier', 'Sikkerhet']}
        />
      );
      
      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      const categorySelect = screen.getByDisplayValue('Alle kategorier');
      
      expect(supplierSelect).toHaveAttribute('id', 'supplier-filter');
      expect(supplierSelect).toHaveAttribute('name', 'supplier');
      expect(categorySelect).toHaveAttribute('id', 'category-filter');
      expect(categorySelect).toHaveAttribute('name', 'category');
    });

    it('should be keyboard navigable', () => {
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={['Alle leverandører', 'Biltema']}
          categoryOptions={['Alle kategorier', 'Sikkerhet']}
        />
      );
      
      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      
      // Should be focusable
      supplierSelect.focus();
      expect(document.activeElement).toBe(supplierSelect);
      
      // Should handle keyboard events
      fireEvent.keyDown(supplierSelect, { key: 'ArrowDown' });
      // Note: Actual keyboard navigation behavior depends on browser implementation
      // We're just testing that the element receives the event
    });
  });

  describe('Norwegian Locale', () => {
    it('should handle Norwegian characters in options', () => {
      const supplierOptions = ['Alle leverandører', 'Øst Leverandør', 'Åse Byggvarer'];
      
      render(
        <QuickFilters 
          onFiltersChange={mockOnFiltersChange}
          supplierOptions={supplierOptions}
          categoryOptions={['Alle kategorier']}
        />
      );
      
      const supplierSelect = screen.getByDisplayValue('Alle leverandører');
      fireEvent.click(supplierSelect);
      
      expect(screen.getByText('Øst Leverandør')).toBeInTheDocument();
      expect(screen.getByText('Åse Byggvarer')).toBeInTheDocument();
    });
  });
});