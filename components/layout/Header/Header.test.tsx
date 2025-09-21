import { render, screen, fireEvent, act } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('renders the BYGGER\'N logo', () => {
    render(<Header />);

    expect(screen.getByLabelText('Byggern logo')).toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    const mockOnSearch = jest.fn();
    render(<Header onSearch={mockOnSearch} />);

    expect(screen.getByPlaceholderText('Søk etter produkter eller kategorier...')).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted', async () => {
    const mockOnSearch = jest.fn();
    render(<Header onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Søk etter produkter eller kategorier...');
    const submitButton = screen.getByRole('button', { name: 'Søk' });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(submitButton);
    });

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('calls onSearch when Enter key is pressed', async () => {
    const mockOnSearch = jest.fn();
    render(<Header onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Søk etter produkter eller kategorier...');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('does not render search when showSearch is false', () => {
    render(<Header showSearch={false} />);
    
    expect(screen.queryByPlaceholderText('Søk etter produkter eller kategorier...')).not.toBeInTheDocument();
  });

  it('has correct background styling', () => {
    render(<Header />);
    
    const header = screen.getByTestId('header-main');
    expect(header).toHaveClass('bg-byggern-header');
  });
});