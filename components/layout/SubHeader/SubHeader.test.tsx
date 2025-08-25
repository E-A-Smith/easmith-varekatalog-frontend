import { render, screen } from '@testing-library/react';
import { SubHeader } from './SubHeader';

describe('SubHeader', () => {
  it('renders the organization branding text', () => {
    render(<SubHeader />);
    
    expect(screen.getByText('Varekatalog for Løvenskiold Logistikk levert av Byggern')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<SubHeader className="test-class" />);
    
    const subHeader = screen.getByText('Varekatalog for Løvenskiold Logistikk levert av Byggern').parentElement;
    expect(subHeader).toHaveClass('test-class');
  });

  it('has correct height styling', () => {
    render(<SubHeader />);
    
    const subHeader = screen.getByText('Varekatalog for Løvenskiold Logistikk levert av Byggern').parentElement;
    expect(subHeader).toHaveClass('h-9');
  });
});