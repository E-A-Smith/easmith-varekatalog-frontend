/**
 * Authentication hook for Varekatalog using AWS Cognito OAuth
 * Implements OAuth 2.0/OpenID Connect with Azure AD integration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserSession } from 'amazon-cognito-identity-js';
import type { OAuthScope, UserPermissions } from '@/types/product';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: CognitoUser | null;
  accessToken: string | null;
  error: string | null;
  // NEW: OAuth scope-based permissions (Phase 2)
  scopes: OAuthScope[];
  permissions: UserPermissions;
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
  
  // OAuth scopes (only premium features - search is public)
  scopes: process.env.NEXT_PUBLIC_OAUTH_SCOPES || 'openid profile email varekatalog/prices varekatalog/inventory',
  
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

// JWT token parsing and scope extraction (Phase 2)
const parseJwtPayload = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      throw new Error('Invalid JWT format');
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse JWT payload:', error);
    return {};
  }
};

const extractScopesFromToken = (token: string): OAuthScope[] => {
  try {
    const payload = parseJwtPayload(token);
    // Azure AD puts scopes in the 'scp' claim as space-separated string
    const scopeString = payload.scp || '';
    const scopes = scopeString
      .split(' ')
      .filter((scope: string) => 
        // Handle both formats: full API format and short format
        scope.includes('varekatalog.prices') || 
        scope.includes('varekatalog.inventory') ||
        scope.startsWith('varekatalog/')
      )
      .map((scope: string) => {
        // Normalize to short format for internal use
        if (scope.includes('varekatalog.prices')) return 'varekatalog/prices';
        if (scope.includes('varekatalog.inventory')) return 'varekatalog/inventory';
        return scope;
      })
      .filter((scope: string): scope is OAuthScope => 
        ['varekatalog/prices', 'varekatalog/inventory'].includes(scope)
      );
    
    return scopes;
  } catch (error) {
    console.error('Failed to extract scopes from token:', error);
    return [];
  }
};

const calculatePermissions = (scopes: OAuthScope[]): UserPermissions => {
  return {
    canSearch: true, // Search is always public - no authentication required
    canViewPrices: scopes.includes('varekatalog/prices'),
    canViewInventory: scopes.includes('varekatalog/inventory'),
  };
};

const getDefaultAuthState = (): AuthState => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null,
  error: null,
  scopes: [],
  permissions: {
    canSearch: true, // Search is always public
    canViewPrices: false,
    canViewInventory: false,
  },
});

export const useAuth = (): AuthContext => {
  const [authState, setAuthState] = useState<AuthState>(getDefaultAuthState());

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
            const accessToken = session.getAccessToken().getJwtToken();
            const scopes = extractScopesFromToken(accessToken);
            const permissions = calculatePermissions(scopes);
            
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: currentUser,
              accessToken,
              error: null,
              scopes,
              permissions,
            });
            return;
          }
        }
      } catch (error) {
        console.error('Auth state check failed:', error);
      }
      
      setAuthState({
        ...getDefaultAuthState(),
        isLoading: false,
      });
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

      const accessToken = session.getAccessToken().getJwtToken();
      const scopes = extractScopesFromToken(accessToken);
      const permissions = calculatePermissions(scopes);
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: user,
        accessToken,
        error: null,
        scopes,
        permissions,
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
        ...getDefaultAuthState(),
        isLoading: false,
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
        const accessToken = session.getAccessToken().getJwtToken();
        const scopes = extractScopesFromToken(accessToken);
        const permissions = calculatePermissions(scopes);
        
        setAuthState(prev => ({
          ...prev,
          accessToken,
          error: null,
          scopes,
          permissions,
        }));
      } else {
        throw new Error('Session invalid');
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setAuthState({
        ...getDefaultAuthState(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Session refresh failed',
      });
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