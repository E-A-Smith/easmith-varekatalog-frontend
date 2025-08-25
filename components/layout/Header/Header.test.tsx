import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the BYGGER\'N logo', () => {
    render(<Header />);
    
    expect(screen.getByText('BYGGER\'N')).toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    render(<Header />);
    
    expect(screen.getByPlaceholderText('Søk etter produkter eller kategorier...')).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', () => {
    const mockOnSearch = jest.fn();
    render(<Header onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Søk etter produkter eller kategorier...');
    const submitButton = screen.getByRole('button', { name: 'Utfør søk' });
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('calls onSearch when Enter key is pressed', () => {
    const mockOnSearch = jest.fn();
    render(<Header onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Søk etter produkter eller kategorier...');
    
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('does not render search when showSearch is false', () => {
    render(<Header showSearch={false} />);
    
    expect(screen.queryByPlaceholderText('Søk etter produkter eller kategorier...')).not.toBeInTheDocument();
  });

  it('has correct background styling', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-byggern-header');
  });
});