import { clearAuthTokens, getAccessToken, getRefreshToken } from '@/services/apiClient';
import { getCurrentUser, login, logout, register } from '@/services/authApi';
import { handleApiError } from '@/utils/errorHandler';
import { Permission } from '@/utils/permissions';
import { router } from 'expo-router';
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
    role: u?.role?.name ?? u?.role ?? u?.roleName ?? undefined,
    admin: u?.admin ?? (u?.role?.name === 'Administrator' ? 1 : 0),
    permissions: u?.permissions ?? undefined,
    staffid: u?.staffid ?? undefined,
  });

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
      const token = await getAccessToken();
      if (!token) {
        // Silent: no token is expected for first-time users
        setState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      // Try to get current user from backend
      try {
        const user = await getCurrentUser();
        setState({
          user: mapUser(user),
          loading: false,
          isAuthenticated: true,
        });
      } catch (userError) {
        console.warn('[Auth] Failed to get current user, clearing session');
        await clearAuthTokens();
        setState({ user: null, loading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      await clearAuthTokens();
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      console.log('[AuthContext] Signing in...');
      
      const response = await login({ email, password });
      
      const user = mapUser(response.user);
      
      console.log('[AuthContext] Sign in successful');
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('[AuthContext] Sign in failed:', error);
      const errorInfo = handleApiError(error);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorInfo.message);
    }
  };

  const signUp = async (email: string, password: string, name?: string, role?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      console.log('[AuthContext] Signing up...');
      
      const response = await register({
        email,
        password,
        fullName: name || email.split('@')[0],
        role: (role as any) || 'client',
      });

      const user = mapUser(response.user);
      
      console.log('[AuthContext] Sign up successful');
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('[AuthContext] Sign up failed:', error);
      const errorInfo = handleApiError(error);
      setState(prev => ({ ...prev, loading: false }));
      throw new Error(errorInfo.message);
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await logout(refreshToken).catch(() => {
          console.warn('[AuthContext] Logout API call failed, proceeding with local cleanup');
        });
      }
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      await clearAuthTokens();
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
      
      // Navigate to login screen
      try {
        router.replace('/(auth)/login' as any);
      } catch (routerError) {
        console.warn('[AuthContext] Router navigation failed:', routerError);
      }
    }
  };

  const refreshUser = async () => {
    try {
      const user = await getCurrentUser();
      const userData = mapUser(user);
      setState(prev => ({
        ...prev,
        user: userData,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
      await signOut();
    }
  };

  // Social authentication - Currently not implemented in backend API v2.0
  // These are stub implementations that throw errors
  const signInWithGoogle = async () => {
    throw new Error('Google Sign-In chưa được implement. Vui lòng sử dụng email/password.');
  };

  const signInWithGoogleCode = async (code: string) => {
    throw new Error('Google OAuth chưa được implement. Vui lòng sử dụng email/password.');
  };

  const signInWithGoogleToken = async (credential: string, clientId?: string) => {
    throw new Error('Google Token Sign-In chưa được implement. Vui lòng sử dụng email/password.');
  };

  const signInWithGoogleAccessToken = async (accessToken: string) => {
    throw new Error('Google Access Token Sign-In chưa được implement. Vui lòng sử dụng email/password.');
  };

  const signInWithFacebook = async () => {
    throw new Error('Facebook Sign-In chưa được implement. Vui lòng sử dụng email/password.');
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
