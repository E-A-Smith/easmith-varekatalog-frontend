/**
 * Tests for Pagination component
 * Varekatalog - Norwegian building supplies catalog
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';
import type { PaginationProps } from './types';

const defaultProps: PaginationProps = {
  currentPage: 1,
  totalPages: 10,
  totalItems: 1247,
  itemsPerPage: 10,
  startItem: 1,
  endItem: 10,
  onPageChange: jest.fn(),
};

describe('Pagination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pagination info correctly in Norwegian', () => {
    render(<Pagination {...defaultProps} />);
    
    expect(screen.getByText(/Viser 1-10 av 1\s?247 produkter/)).toBeInTheDocument();
  });

  it('renders all page numbers when total pages <= 7', () => {
    render(<Pagination {...defaultProps} totalPages={5} />);
    
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByRole('button', { name: `Gå til side ${i}` })).toBeInTheDocument();
    }
  });

  it('renders pagination with ellipsis when many pages', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={20} />);
    
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('calls onPageChange when page button is clicked', () => {
    const mockOnPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Gå til side 2' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when next button is clicked', () => {
    const mockOnPageChange = jest.fn();
    render(<Pagination {...defaultProps} onPageChange={mockOnPageChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Neste' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange when previous button is clicked', () => {
    const mockOnPageChange = jest.fn();
    render(<Pagination {...defaultProps} currentPage={2} onPageChange={mockOnPageChange} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Forrige' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    
    expect(screen.getByRole('button', { name: 'Forrige' })).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={10} />);
    
    expect(screen.getByRole('button', { name: 'Neste' })).toBeDisabled();
  });

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByRole('button', { name: 'Gå til side 3' });
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('renders export button when showExport is true', () => {
    const mockOnExport = jest.fn();
    render(
      <Pagination 
        {...defaultProps} 
        showExport={true} 
        onExport={mockOnExport}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Eksporter alle resultater' })).toBeInTheDocument();
  });

  it('calls onExport when export button is clicked', () => {
    const mockOnExport = jest.fn();
    render(
      <Pagination 
        {...defaultProps} 
        showExport={true} 
        onExport={mockOnExport}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Eksporter alle resultater' }));
    expect(mockOnExport).toHaveBeenCalled();
  });

  it('shows loading state for export button', () => {
    render(
      <Pagination 
        {...defaultProps} 
        showExport={true} 
        onExport={jest.fn()}
        isLoading={true}
      />
    );
    
    expect(screen.getByText('Eksporterer...')).toBeInTheDocument();
  });

  it('does not render pagination controls when totalPages is 1', () => {
    render(<Pagination {...defaultProps} totalPages={1} />);
    
    expect(screen.queryByRole('button', { name: 'Forrige' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Neste' })).not.toBeInTheDocument();
  });

  it('formats large numbers with Norwegian locale', () => {
    render(
      <Pagination 
        {...defaultProps} 
        totalItems={123456}
        startItem={1}
        endItem={10}
      />
    );
    
    // Norwegian number formatting uses space as thousand separator
    expect(screen.getByText(/123\s?456/)).toBeInTheDocument();
  });

  it('supports custom labels', () => {
    render(
      <Pagination 
        {...defaultProps}
        itemLabel="elementer"
        previousLabel="Tilbake"
        nextLabel="Fremover"
        exportLabel="Last ned"
        showExport={true}
        onExport={jest.fn()}
      />
    );
    
    expect(screen.getByText(/elementer/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tilbake' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fremover' })).toBeInTheDocument();
    expect(screen.getByText('Last ned')).toBeInTheDocument();
  });

  it('handles keyboard navigation properly', () => {
    render(<Pagination {...defaultProps} />);
    
    const pageButton = screen.getByRole('button', { name: 'Gå til side 2' });
    pageButton.focus();
    
    expect(pageButton).toHaveFocus();
  });

  it('applies accessibility attributes correctly', () => {
    render(<Pagination {...defaultProps} currentPage={3} />);
    
    const currentPageButton = screen.getByRole('button', { name: 'Gå til side 3' });
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    
    const otherPageButton = screen.getByRole('button', { name: 'Gå til side 2' });
    expect(otherPageButton).not.toHaveAttribute('aria-current');
  });
});