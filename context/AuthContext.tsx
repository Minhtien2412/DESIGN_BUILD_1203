import ENV from '@/config/env';
import { apiFetch, clearToken as clearApiToken, setAuthToken } from '@/services/api';
import { Permission } from '@/utils/permissions';
import { clearToken as clearStorageToken, getToken, setToken as setStorageToken } from '@/utils/storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  admin?: number; // 1 if admin, 0 otherwise
  permissions?: Permission[];
  staffid?: number; // For Perfex CRM staff members
  global_roles?: string[]; // Global roles for multi-role support
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string, role?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCode: (code: string) => Promise<void>; // OAuth 2.0 Authorization Code Flow
  signInWithGoogleToken: (credential: string, clientId?: string) => Promise<void>; // ID Token verification
  signInWithGoogleAccessToken: (accessToken: string) => Promise<void>; // Implicit Flow
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (feature: string, capability: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Normalize backend user into app's User shape
  const mapUser = (u: any): User => ({
    id: u?.id || u?.staffid?.toString(),
    email: u?.email,
    name: u?.name ?? u?.full_name ?? u?.fullName ?? (`${u?.firstname || ''} ${u?.lastname || ''}`.trim() || undefined),
    phone: u?.phone ?? u?.phonenumber ?? undefined,
    avatar: u?.avatar ?? u?.profile_image ?? undefined,
    role: u?.role?.name ?? u?.role ?? undefined,
    admin: u?.admin ?? (u?.role?.name === 'Administrator' ? 1 : 0),
    permissions: u?.permissions ?? undefined,
    staffid: u?.staffid ?? undefined,
  });

  // Helper functions to sync tokens between storage and API
  const setToken = async (token: string) => {
    await setStorageToken(token);
    setAuthToken(token);
  };

  const clearToken = async () => {
    await clearStorageToken();
    clearApiToken();
  };

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const token = await getToken();
      if (!token) {
        // Silent: no token is expected for first-time users
        setState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      // Set token in API service for authenticated requests
      setAuthToken(token);

      // Health check first to detect database issues
      try {
        const health = await apiFetch('/health');
        if (health?.database === 'disconnected') {
          console.warn('[Auth] ⚠️  Database offline - using cached session');
          // Use cached token without /auth/me call
          setState({
            user: { id: 'cached', email: 'cached@offline', name: 'Cached User (DB Offline)' },
            loading: false,
            isAuthenticated: true,
          });
          return;
        }
      } catch (healthErr) {
        console.warn('[Auth] Health check failed, attempting /auth/me anyway');
      }

      // Support both nested { success, data: {...user} } and flat user responses
      const res = await apiFetch<any>('/auth/me');
      const rawUser = res?.data ?? res ?? null;
      const userData: User | null = rawUser ? mapUser(rawUser) : null;

      if (!userData) {
        throw new Error('Invalid session response');
      }

      setState({
        user: userData,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      // Silent handling for auth errors - user is simply not authenticated
      if (error instanceof Error && error.message && 
          (error.message.includes('401') || error.message.includes('403') || 
           error.message.includes('No token') || error.message.includes('Unauthorized'))) {
        // Don't log - this is expected behavior
      } else {
        console.error('Failed to load session:', error);
      }
      await clearToken();
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] signIn starting...');
      const response = await apiFetch<{ token: string; user: User; data?: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Handle both direct response and nested data response
  const token = response.token || response.data?.token;
  const user = mapUser(response.user || response.data?.user);

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      await setToken(token);
      console.log('[AuthContext] Setting state isAuthenticated=true');
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });
      console.log('[AuthContext] State updated successfully');
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name?: string, role?: string) => {
    try {
      console.log('[AuthContext] signUp starting...');
      const response = await apiFetch<{ token: string; user: User; data?: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          email,
          password,
          fullName: name || email.split('@')[0], // Server expects fullName
          role: role || 'client', // Default to a valid role expected by server
        }),
      });

      // Handle both direct response and nested data response
      const token = response.token || response.data?.token;
      const user = mapUser(response.user || response.data?.user);

      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      await setToken(token);
      console.log('[AuthContext] Setting state isAuthenticated=true');
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });
      console.log('[AuthContext] State updated successfully');
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    } finally {
      await clearToken();
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
    }
  };

  const refreshUser = async () => {
    try {
      const res = await apiFetch<any>('/auth/me');
      const rawUser = res?.data ?? res ?? null;
      const userData: User | null = rawUser ? mapUser(rawUser) : null;
      if (!userData) throw new Error('Invalid session response');
      setState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await signOut();
    }
  };

  // Social providers - OAuth 2.0 Authorization Code Flow (Recommended)
  // This follows best practices from @react-oauth/google
  const signInWithGoogle = async () => {
    try {
      if (!ENV.ENABLE_SOCIAL_GOOGLE) {
        throw new Error('�ang nh?p Google dang t?t trong c?u h�nh m�i tru?ng');
      }

      // This will be called from the login screen with the actual Google OAuth flow
      // The UI component should use useGoogleLogin hook with flow: 'auth-code'
      throw new Error('Please use the Google Sign-In button which implements full OAuth flow');
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    }
  };

  // Method 1: OAuth with Authorization Code (RECOMMENDED - Most secure)
  // Backend exchanges code for tokens (access_token, refresh_token, id_token)
  const signInWithGoogleCode = async (code: string) => {
    try {
      // Send authorization code to backend
      // Backend will exchange it with Google for tokens
      const response = await apiFetch<{ token?: string; user?: User; data?: any }>('/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const authToken = response.token || response.data?.token;
      const user = mapUser(response.user || response.data?.user);
      
      if (!authToken || !user) {
        throw new Error('Invalid response from server');
      }

      await setToken(authToken);
      setState({ user, loading: false, isAuthenticated: true });
    } catch (error) {
      const status = (error as any)?.status;
      if (status === 404) {
        throw new Error('�ang nh?p Google chua du?c b?t tr�n m�y ch?');
      }
      console.error('Google OAuth Code Exchange failed:', error);
      throw error;
    }
  };

  // Method 2: OAuth with ID Token/Credential (Alternative - Good for simple use cases)
  // Frontend gets credential JWT, backend verifies with Google
  const signInWithGoogleToken = async (credential: string, clientId?: string) => {
    try {
      // Send Google ID Token to backend for verification
      const response = await apiFetch<{ token?: string; user?: User; data?: any }>('/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: credential, // Backend expects 'idToken' field
        }),
      });

      const authToken = response.token || response.data?.token;
      const user = mapUser(response.user || response.data?.user);
      
      if (!authToken || !user) {
        throw new Error('Invalid response from server');
      }

      await setToken(authToken);
      setState({ user, loading: false, isAuthenticated: true });
    } catch (error) {
      const status = (error as any)?.status;
      if (status === 404) {
        throw new Error('�ang nh?p Google chua du?c b?t tr�n m�y ch?');
      }
      console.error('Google OAuth Token Verification failed:', error);
      throw error;
    }
  };

  // Method 3: Implicit Flow with Access Token (Legacy - Less secure)
  // Used when you need to fetch user info from Google APIs directly
  const signInWithGoogleAccessToken = async (accessToken: string) => {
    try {
      // Backend can verify access token or we can fetch user info from Google
      const response = await apiFetch<{ token?: string; user?: User; data?: any }>('/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken }),
      });

      const authToken = response.token || response.data?.token;
      const user = mapUser(response.user || response.data?.user);
      
      if (!authToken || !user) {
        throw new Error('Invalid response from server');
      }

      await setToken(authToken);
      setState({ user, loading: false, isAuthenticated: true });
    } catch (error) {
      console.error('Google OAuth Access Token failed:', error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      if (!ENV.ENABLE_SOCIAL_FACEBOOK) {
        throw new Error('�ang nh?p Facebook dang t?t trong c?u h�nh m�i tru?ng');
      }
      const response = await apiFetch<{ token?: string; user?: User; data?: any }>(ENV.AUTH_FACEBOOK_PATH || '/auth/facebook', {
        method: 'POST',
        body: JSON.stringify({ access_token: 'mock_fb_token' }),
      });

      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user;
      if (!token || !user) throw new Error('Invalid response from server');

      await setToken(token);
      setState({ user, loading: false, isAuthenticated: true });
    } catch (error) {
      const status = (error as any)?.status;
      if (status === 404) {
        throw new Error('�ang nh?p Facebook chua du?c b?t tr�n m�y ch?');
      }
      console.error('Facebook sign-in failed:', error);
      throw error;
    }
  };

  const hasPermission = (feature: string, capability: string): boolean => {
    if (!state.user) return false;
    
    // Admin has all permissions
    if (state.user.admin === 1 || state.user.role === 'admin' || state.user.role === 'Administrator') {
      return true;
    }

    // Check user permissions
    if (!state.user.permissions || state.user.permissions.length === 0) {
      return false;
    }

    const featurePermission = state.user.permissions.find(p => p.feature === feature);
    if (!featurePermission) return false;

    return featurePermission.capabilities.includes(capability as any);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!state.user || !state.user.role) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => state.user!.role?.toLowerCase() === r.toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithGoogleCode,
        signInWithGoogleToken,
        signInWithGoogleAccessToken,
        signInWithFacebook,
        signOut,
        refreshUser,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
