/**
 * LoginButton Component Tests
 */

import { render, screen } from '@testing-library/react';
import { LoginButton } from './LoginButton';

// Mock CognitoUser for authenticated tests
const mockUser = {
  getUsername: () => 'test@example.com'
};

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = jest.mocked(require('@/hooks/useAuth').useAuth);

describe('LoginButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login button when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      authState: {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: null,
      },
      signOut: jest.fn(),
    });

    render(<LoginButton />);
    
    expect(screen.getByRole('button', { name: /🔒/i })).toBeInTheDocument();
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('renders unlocked icon when authenticated', () => {
    mockUseAuth.mockReturnValue({
      authState: {
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        accessToken: 'mock-token',
        error: null,
      },
      signOut: jest.fn(),
    });

    render(<LoginButton />);
    
    expect(screen.getByText('🔓')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logg ut/i })).toBeInTheDocument();
  });

  it('applies compact mode styles when compact prop is true', () => {
    mockUseAuth.mockReturnValue({
      authState: {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: null,
      },
      signOut: jest.fn(),
    });

    render(<LoginButton compact />);
    
    const button = screen.getByRole('button', { name: /🔒/i });
    expect(button).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    mockUseAuth.mockReturnValue({
      authState: {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: null,
      },
      signOut: jest.fn(),
    });

    const customClass = 'custom-test-class';
    const { container } = render(<LoginButton className={customClass} />);
    
    expect(container.firstChild).toHaveClass(customClass);
  });
});