/**
 * LoginButton Component Tests
 */

import { render, screen } from '@testing-library/react';
import { LoginButton } from './LoginButton';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    authState: {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      error: null,
    },
    signOut: jest.fn(),
  }),
}));

describe('LoginButton', () => {
  it('renders login button when not authenticated', () => {
    render(<LoginButton />);
    
    expect(screen.getByRole('button', { name: /🔒/i })).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('applies compact mode styles when compact prop is true', () => {
    render(<LoginButton compact />);
    
    const button = screen.getByRole('button', { name: /🔒/i });
    expect(button).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-test-class';
    const { container } = render(<LoginButton className={customClass} />);
    
    expect(container.firstChild).toHaveClass(customClass);
  });
});