// Add custom Jest matchers for testing-library
import '@testing-library/jest-dom';

// Extend Jest matchers
declare module 'expect' {
  interface Matchers<R = void> {
    toBeInTheDocument(): R;
    toHaveClass(className: string): R;
  }
}