/**
 * Button component for Varekatalog design system
 * Simplified version for Step 1.2 - incrementally building UI components
 */

import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

const buttonStyles = {
  base: 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-byggern-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    primary: 'bg-byggern-blue text-white hover:bg-byggern-blue/90 active:bg-byggern-blue/95 shadow-sm',
    secondary: 'bg-byggern-orange text-white hover:bg-byggern-orange/90 active:bg-byggern-orange/95 shadow-sm',
    outline: 'border border-byggern-blue bg-white text-byggern-blue hover:bg-byggern-blue/5 active:bg-byggern-blue/10',
    ghost: 'text-byggern-blue hover:bg-byggern-blue/10 active:bg-byggern-blue/15',
  },
  sizes: {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={clsx(
          buttonStyles.base,
          buttonStyles.variants[variant],
          buttonStyles.sizes[size],
          fullWidth && 'w-full',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
            <span>Laster...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';