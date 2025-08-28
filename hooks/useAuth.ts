/**
 * Authentication hook for Varekatalog using AWS Cognito OAuth
 * Implements OAuth 2.0/OpenID Connect with Azure AD integration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: CognitoUser | null;
  accessToken: string | null;
  error: string | null;
}

interface AuthContext {
  authState: AuthState;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

// OAuth configuration from environment (aligned with backend architecture)
const authConfig = {
  // Cognito User Pool configuration
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  
  // Azure AD OAuth configuration (matches backend)
  azureTenantId: process.env.NEXT_PUBLIC_AZURE_TENANT_ID!,
  azureClientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID!,
  
  // OAuth scopes (matches backend scope architecture)
  scopes: process.env.NEXT_PUBLIC_OAUTH_SCOPES || 'openid profile email varekatalog:search',
  
  // OAuth URLs
  authorizationUrl: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/oauth2/v2.0/authorize`,
  tokenUrl: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID}/oauth2/v2.0/token`,
  
  // Redirect URIs
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback',
};

const userPool = new CognitoUserPool({
  UserPoolId: authConfig.userPoolId,
  ClientId: authConfig.clientId,
});

export const useAuth = (): AuthContext => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
    error: null,
  });

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const currentUser = userPool.getCurrentUser();
        
        if (currentUser) {
          const session = await new Promise<CognitoUserSession>((resolve, reject) => {
            currentUser.getSession((error: Error | null, session: CognitoUserSession | null) => {
              if (error) {
                reject(error);
              } else if (session) {
                resolve(session);
              } else {
                reject(new Error('No session found'));
              }
            });
          });

          if (session.isValid()) {
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: currentUser,
              accessToken: session.getAccessToken().getJwtToken(),
              error: null,
            });
            return;
          }
        }
      } catch (error) {
        console.error('Auth state check failed:', error);
      }
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
      }));
    };

    checkAuthState();
  }, []);

  const signIn = useCallback(async (username: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = new CognitoUser({
        Username: username,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password,
      });

      const session = await new Promise<CognitoUserSession>((resolve, reject) => {
        user.authenticateUser(authDetails, {
          onSuccess: resolve,
          onFailure: reject,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          newPasswordRequired: (_userAttributes, _requiredAttributes) => {
            // Handle new password requirement if needed
            reject(new Error('New password required'));
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          mfaRequired: (_challengeName, _challengeParameters) => {
            // Handle MFA if needed
            reject(new Error('MFA required'));
          },
        });
      });

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: user,
        accessToken: session.getAccessToken().getJwtToken(),
        error: null,
      });
    } catch (error) {
      console.error('Sign in failed:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        currentUser.signOut();
      }
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: null,
      });
    } catch (error) {
      console.error('Sign out failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }));
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const currentUser = userPool.getCurrentUser();
      if (!currentUser) {
        throw new Error('No current user');
      }

      const session = await new Promise<CognitoUserSession>((resolve, reject) => {
        currentUser.getSession((error: Error | null, session: CognitoUserSession | null) => {
          if (error) {
            reject(error);
          } else if (session) {
            resolve(session);
          } else {
            reject(new Error('No session found'));
          }
        });
      });

      if (session.isValid()) {
        setAuthState(prev => ({
          ...prev,
          accessToken: session.getAccessToken().getJwtToken(),
          error: null,
        }));
      } else {
        throw new Error('Session invalid');
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        error: error instanceof Error ? error.message : 'Session refresh failed',
      }));
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      // If we have a current token and it's not expired, return it
      if (authState.accessToken && authState.user) {
        const session = await new Promise<CognitoUserSession>((resolve, reject) => {
          authState.user!.getSession((error: Error | null, session: CognitoUserSession | null) => {
            if (error) {
              reject(error);
            } else if (session) {
              resolve(session);
            } else {
              reject(new Error('No session found'));
            }
          });
        });

        if (session.isValid()) {
          return session.getAccessToken().getJwtToken();
        }
      }
      
      // Try to refresh session
      await refreshSession();
      return authState.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }, [authState.accessToken, authState.user, refreshSession]);

  return {
    authState,
    signIn,
    signOut,
    refreshSession,
    getAccessToken,
  };
};