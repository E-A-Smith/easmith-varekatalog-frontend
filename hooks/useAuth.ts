/**
 * Authentication hook for Varekatalog using AWS Cognito Hosted UI OAuth
 * Implements OAuth 2.0/OpenID Connect with Azure AD as identity provider through Cognito
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { OAuthScope, UserPermissions } from '@/types/product';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: CognitoUserInfo | null;
  accessToken: string | null;
  error: string | null;
  scopes: OAuthScope[];
  permissions: UserPermissions;
}

interface CognitoUserInfo {
  username: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  identities?: Array<{
    userId: string;
    providerName: string;
    providerType: string;
  }>;
}

interface AuthContext {
  authState: AuthState;
  signIn: () => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

// Cognito OAuth configuration (correct architecture)
const authConfig = {
  // Cognito OAuth domain (from backend configuration)
  cognitoDomain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'varekatalog-auth-dev.auth.eu-west-1.amazoncognito.com',
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  
  // OAuth scopes (Cognito resource server scopes)
  scopes: ['openid', 'profile', 'email', 'varekatalog/prices', 'varekatalog/inventory'],
  
  // Redirect URIs
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'http://localhost:3000/auth/callback',
  
  // OAuth endpoints (Cognito Hosted UI)
  get authorizationUrl() {
    return `https://${this.cognitoDomain}/oauth2/authorize`;
  },
  
  get tokenUrl() {
    return `https://${this.cognitoDomain}/oauth2/token`;
  },
  
  get logoutUrl() {
    return `https://${this.cognitoDomain}/logout`;
  }
};

// JWT token parsing and scope extraction (Phase 2)
interface JwtPayload {
  sub?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  'cognito:username'?: string;
  identities?: Array<{
    userId: string;
    providerName: string;
    providerType: string;
  }>;
  scope?: string;
  [key: string]: unknown;
}

const parseJwtPayload = (token: string): JwtPayload => {
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
    // Cognito puts scopes in the 'scope' claim as space-separated string
    const scopeString = payload.scope || '';
    const scopes = scopeString
      .split(' ')
      .filter((scope: string) => 
        // Filter for varekatalog scopes only
        scope.startsWith('varekatalog/')
      )
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

// PKCE utility functions for OAuth 2.0 security
const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const useAuth = (): AuthContext => {
  const [authState, setAuthState] = useState<AuthState>(getDefaultAuthState());

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check for stored Cognito tokens
        const accessToken = sessionStorage.getItem('cognito_access_token');
        const idToken = sessionStorage.getItem('cognito_id_token');
        const tokenExpiry = sessionStorage.getItem('cognito_token_expiry');
        
        if (accessToken && idToken && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          
          if (Date.now() < expiryTime) {
            // Token is still valid
            const userPayload = parseJwtPayload(idToken);
            const scopes = extractScopesFromToken(accessToken);
            const permissions = calculatePermissions(scopes);
            
            const userInfo: CognitoUserInfo = {
              username: userPayload['cognito:username'] || userPayload.sub || 'unknown',
              ...(userPayload.email && { email: userPayload.email }),
              ...(userPayload.given_name && { given_name: userPayload.given_name }),
              ...(userPayload.family_name && { family_name: userPayload.family_name }),
              ...(userPayload.identities && { identities: userPayload.identities }),
            };
            
            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: userInfo,
              accessToken,
              error: null,
              scopes,
              permissions,
            });
            return;
          } else {
            // Token expired, clear tokens (avoid circular dependency)
            sessionStorage.removeItem('cognito_access_token');
            sessionStorage.removeItem('cognito_id_token');
            sessionStorage.removeItem('cognito_refresh_token');
            sessionStorage.removeItem('cognito_token_expiry');
          }
        }
      } catch (error) {
        console.error('Auth state check failed:', error);
        // Clear invalid tokens
        sessionStorage.removeItem('cognito_access_token');
        sessionStorage.removeItem('cognito_id_token');
        sessionStorage.removeItem('cognito_refresh_token');
        sessionStorage.removeItem('cognito_token_expiry');
      }
      
      setAuthState({
        ...getDefaultAuthState(),
        isLoading: false,
      });
    };

    checkAuthState();
  }, []);

  const signIn = useCallback((): void => {
    try {
      // Generate PKCE parameters for security
      const codeVerifier = generateCodeVerifier();
      const state = generateCodeVerifier(); // Use same function for state parameter
      
      // Store PKCE verifier and state for callback
      sessionStorage.setItem('pkce_code_verifier', codeVerifier);
      sessionStorage.setItem('oauth_state', state);
      
      // Generate code challenge
      generateCodeChallenge(codeVerifier).then(codeChallenge => {
        const authParams = new URLSearchParams({
          response_type: 'code',
          client_id: authConfig.clientId,
          redirect_uri: authConfig.redirectUri,
          scope: authConfig.scopes.join(' '),
          state: state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          // Force Azure AD login through Cognito
          identity_provider: 'AzureAD'
        });

        const authUrl = `${authConfig.authorizationUrl}?${authParams.toString()}`;
        
        // Redirect to Cognito Hosted UI
        window.location.href = authUrl;
      }).catch(error => {
        console.error('Failed to generate OAuth parameters:', error);
        setAuthState(prev => ({
          ...prev,
          error: 'Failed to start authentication',
        }));
      });
      
    } catch (error) {
      console.error('Sign in failed:', error);
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }));
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      // Clear local tokens
      sessionStorage.removeItem('cognito_access_token');
      sessionStorage.removeItem('cognito_id_token');
      sessionStorage.removeItem('cognito_refresh_token');
      sessionStorage.removeItem('cognito_token_expiry');
      sessionStorage.removeItem('pkce_code_verifier');
      sessionStorage.removeItem('oauth_state');
      
      // Update state immediately
      setAuthState({
        ...getDefaultAuthState(),
        isLoading: false,
      });
      
      // Redirect to Cognito logout URL for complete logout
      const logoutParams = new URLSearchParams({
        client_id: authConfig.clientId,
        logout_uri: `${window.location.origin}/`,
      });
      
      const logoutUrl = `${authConfig.logoutUrl}?${logoutParams.toString()}`;
      window.location.href = logoutUrl;
      
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
      const refreshToken = sessionStorage.getItem('cognito_refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const tokenParams = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: authConfig.clientId,
        refresh_token: refreshToken,
      });

      const response = await fetch(authConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
      }

      const tokens = await response.json();
      
      // Store new tokens
      sessionStorage.setItem('cognito_access_token', tokens.access_token);
      sessionStorage.setItem('cognito_id_token', tokens.id_token);
      if (tokens.refresh_token) {
        sessionStorage.setItem('cognito_refresh_token', tokens.refresh_token);
      }
      sessionStorage.setItem('cognito_token_expiry', (Date.now() + tokens.expires_in * 1000).toString());

      // Update auth state
      const userPayload = parseJwtPayload(tokens.id_token);
      const scopes = extractScopesFromToken(tokens.access_token);
      const permissions = calculatePermissions(scopes);
      
      const userInfo: CognitoUserInfo = {
        username: userPayload['cognito:username'] || userPayload.sub || 'unknown',
        ...(userPayload.email && { email: userPayload.email }),
        ...(userPayload.given_name && { given_name: userPayload.given_name }),
        ...(userPayload.family_name && { family_name: userPayload.family_name }),
        ...(userPayload.identities && { identities: userPayload.identities }),
      };
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: userInfo,
        accessToken: tokens.access_token,
        error: null,
        scopes,
        permissions,
      });
      
    } catch (error) {
      console.error('Session refresh failed:', error);
      
      // Clear invalid tokens
      sessionStorage.removeItem('cognito_access_token');
      sessionStorage.removeItem('cognito_id_token');
      sessionStorage.removeItem('cognito_refresh_token');
      sessionStorage.removeItem('cognito_token_expiry');
      
      setAuthState({
        ...getDefaultAuthState(),
        isLoading: false,
        error: error instanceof Error ? error.message : 'Session refresh failed',
      });
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      // Check if current token is still valid
      const tokenExpiry = sessionStorage.getItem('cognito_token_expiry');
      const accessToken = sessionStorage.getItem('cognito_access_token');
      
      if (accessToken && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry, 10);
        
        if (Date.now() < expiryTime - 60000) { // Refresh 1 minute before expiry
          return accessToken;
        }
      }
      
      // Try to refresh session
      await refreshSession();
      return sessionStorage.getItem('cognito_access_token');
      
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }, [refreshSession]);

  return {
    authState,
    signIn,
    signOut,
    refreshSession,
    getAccessToken,
  };
};