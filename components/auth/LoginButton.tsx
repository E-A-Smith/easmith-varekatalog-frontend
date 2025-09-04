/**
 * LoginButton Component for Varekatalog
 * 
 * Displays authentication status and provides login/logout functionality
 * Uses the authentication hook for OAuth integration
 */

'use client';

import { FC } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { clsx } from 'clsx';

interface LoginButtonProps {
  className?: string;
  compact?: boolean;
}

export const LoginButton: FC<LoginButtonProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const { authState, signIn, signOut } = useAuth();
  const { isAuthenticated, isLoading, user, error } = authState;

  // Show loading state
  if (isLoading) {
    return (
      <div className={clsx('flex items-center', className)}>
        <div className="animate-spin h-4 w-4 border-2 border-byggern-blue border-t-transparent rounded-full" />
        <span className="ml-2 text-xs text-neutral-600">
          {compact ? 'Auth...' : 'Autentiserer...'}
        </span>
      </div>
    );
  }

  // Show authenticated state with logout option
  if (isAuthenticated && user) {
    return (
      <div className={clsx('flex items-center gap-2', className)}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" title="Innlogget" />
          {!compact && (
            <span className="text-xs text-neutral-700 font-medium">
              {user.given_name || user.username}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="h-6 px-2 text-xs"
        >
          Logg ut
        </Button>
      </div>
    );
  }

  // Show login button for unauthenticated state
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {error && !compact && (
        <span className="text-xs text-red-600" title={error}>
          Auth feil
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={signIn}
        className="h-6 px-2 text-xs border-byggern-blue/20 text-byggern-blue hover:bg-byggern-blue/5"
      >
        🔒
      </Button>
    </div>
  );
};