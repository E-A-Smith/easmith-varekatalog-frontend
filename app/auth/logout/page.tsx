/**
 * OAuth Logout Page for Varekatalog  
 * Handles user logout and session cleanup
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLogout() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Clear all stored tokens and user data
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token'); 
        sessionStorage.removeItem('id_token');
        sessionStorage.removeItem('token_expiry');
        sessionStorage.removeItem('user_scopes');
        sessionStorage.removeItem('oauth_state');

        // Also clear any localStorage items
        localStorage.removeItem('auth_user');

        // Construct Azure AD logout URL
        const logoutParams = new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
          post_logout_redirect_uri: `${window.location.origin}/`,
        });

        const logoutUrl = `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/oauth2/v2.0/logout?${logoutParams.toString()}`;

        // Small delay to ensure cleanup is complete
        setTimeout(() => {
          // Redirect to Azure AD logout to clear SSO session
          window.location.href = logoutUrl;
        }, 1000);

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