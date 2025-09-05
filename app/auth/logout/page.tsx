/**
 * Cognito OAuth Logout Page for Varekatalog  
 * Handles user logout and session cleanup via AWS Cognito
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLogout() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear all Cognito tokens and user data
        sessionStorage.removeItem('cognito_access_token');
        sessionStorage.removeItem('cognito_id_token');
        sessionStorage.removeItem('cognito_refresh_token');
        sessionStorage.removeItem('cognito_token_expiry');
        sessionStorage.removeItem('pkce_code_verifier');
        sessionStorage.removeItem('oauth_state');

        // Also clear any legacy localStorage items
        localStorage.removeItem('auth_user');

        // Construct Cognito logout URL with correct parameters
        const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'varekatalog-auth-dev.auth.eu-west-1.amazoncognito.com';
        const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '';
        
        const logoutParams = new URLSearchParams({
          client_id: clientId,
          logout_uri: `${window.location.origin}/`,
          redirect_uri: `${window.location.origin}/`,
        });

        const logoutUrl = `https://${cognitoDomain}/logout?${logoutParams.toString()}`;

        // Small delay to ensure cleanup is complete
        setTimeout(() => {
          // Redirect to Cognito logout to clear SSO session (which will clear Azure AD session)
          if (typeof window !== 'undefined') {
            window.location.href = logoutUrl;
          }
        }, 500);

      } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails, redirect to home page
        router.push('/');
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-neutral-300 border-t-byggern-blue rounded-full mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-neutral-800 mb-2">
          Logger ut...
        </h1>
        <p className="text-neutral-600">
          Du blir omdirigert om litt
        </p>
      </div>
    </div>
  );
}