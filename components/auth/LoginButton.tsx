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
  const { authState, signOut } = useAuth();
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
              {user.getUsername()}
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
        onClick={handleLogin}
        className="h-6 px-2 text-xs border-byggern-blue/20 text-byggern-blue hover:bg-byggern-blue/5"
      >
        🔒 Logg inn
      </Button>
    </div>
  );

  // OAuth login handler
  function handleLogin() {
    try {
      // Generate OAuth authorization URL with Azure AD integration
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
        redirect_uri: `${window.location.origin}/auth/callback`,
        scope: process.env.NEXT_PUBLIC_OAUTH_SCOPES || 'openid profile email varekatalog:search',
        state: generateStateParameter(),
        prompt: 'login',
        // Use Azure AD as identity provider (as per backend configuration)
        identity_provider: 'AzureAD'
      });

      const authUrl = `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/oauth2/v2.0/authorize?${authParams.toString()}`;
      
      // Store state in session storage for CSRF protection
      sessionStorage.setItem('oauth_state', authParams.get('state') || '');
      
      // Redirect to Azure AD OAuth authorization endpoint
      window.location.href = authUrl;
      
    } catch (error) {
      console.error('OAuth login error:', error);
      alert('Login feil - kontakt IT-support');
    }
  }

  // Generate cryptographically secure state parameter for CSRF protection
  function generateStateParameter(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
};