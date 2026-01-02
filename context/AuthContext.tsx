import { hasPermission as checkRolePermission } from '@/constants/roles';
import type { User as ApiUser } from '@/services/api/authApi';
import authApi, { getCurrentUser } from '@/services/api/authApi';
import { calculateExpiryTimestamp, clearTokens, getAccessToken, saveTokens } from '@/services/token.service';
import { UserType } from '@/types/auth';
import { Permission } from '@/utils/permissions';
import { deleteItem, setItem } from '@/utils/storage';
import { router } from 'expo-router';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string; // Legacy role field
  userType?: UserType; // Marketplace role: buyer, seller, company, contractor, architect, designer, supplier, admin
  admin?: number; // 1 if admin, 0 otherwise
  permissions?: Permission[];
  staffid?: number; // For Perfex CRM staff members
  global_roles?: string[]; // Global roles for multi-role support
  
  // Location data from registration
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  
  // Marketplace profile fields
  companyName?: string;
  companyLogo?: string;
  companyVerified?: boolean;
  sellerId?: string;
  licenseNumber?: string;
  certifications?: string[];
  rating?: number;
  reviewCount?: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string, 
    password: string, 
    name?: string, 
    role?: string, 
    phone?: string,
    location?: { latitude: number; longitude: number; address?: string }
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCode: (code: string) => Promise<void>; // OAuth 2.0 Authorization Code Flow
  signInWithGoogleToken: (credential: string, clientId?: string) => Promise<void>; // ID Token verification
  signInWithGoogleAccessToken: (accessToken: string) => Promise<void>; // Implicit Flow
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  editProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  hasPermission: (feature: string, capability: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasMarketplacePermission: (permission: string) => boolean; // New: Check marketplace role permissions
  switchRole: (newUserType: UserType) => Promise<void>; // New: Switch marketplace role
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Map backend API user to app User shape
  const mapUser = (apiUser: ApiUser): User => ({
    id: apiUser.id.toString(),
    email: apiUser.email,
    name: apiUser.name,
    phone: apiUser.phone || undefined,
    avatar: undefined, // Backend doesn't provide avatar yet
    role: apiUser.role,
    admin: apiUser.role === 'ADMIN' ? 1 : 0,
    permissions: undefined, // TODO: Add when backend supports
    staffid: undefined,
    global_roles: undefined,
    location: apiUser.location ? {
      latitude: apiUser.location.latitude,
      longitude: apiUser.location.longitude,
      address: apiUser.location.address,
    } : undefined,
  });

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadSession();
    
    // Setup logout callback for api.ts when token refresh fails
    (async () => {
      const { setLogoutCallback } = await import('../services/api');
      setLogoutCallback(async () => {
        console.log('[AuthContext] Auto-logout triggered by API');
        await signOut();
      });
    })();
  }, []);

  const loadSession = async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      // Set tokens in api.ts for automatic refresh
      const { setToken, setRefreshToken, getRefreshToken } = await import('../services/api');
      setToken(token);
      const refresh = await getRefreshToken();
      if (refresh) setRefreshToken(refresh);

      // Try to get current user profile from backend
      try {
        const apiUser = await authApi.getProfile(token);
        setState({
          user: mapUser(apiUser),
          loading: false,
          isAuthenticated: true,
        });
      } catch (userError) {
        console.warn('[Auth] Failed to get profile, clearing session');
        await clearTokens();
        setState({ user: null, loading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      await clearTokens();
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      console.log('[AuthContext] Signing in...');
      
      const response = await authApi.login({ email, password });
      
      // Store tokens securely using token service
      const expiresAt = calculateExpiryTimestamp('7d'); // 7 days for access token
      await saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt,
      });
      
      // Set tokens in api.ts for automatic refresh
      const { setToken, setRefreshToken } = await import('../services/api');
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      
      const user = mapUser(response.user);
      
      console.log('[AuthContext] Sign in successful');
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('[AuthContext] Sign in failed:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name?: string, 
    role?: string, 
    phone?: string,
    location?: { latitude: number; longitude: number; address?: string }
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      console.log('[AuthContext] Signing up with:', { role, phone, location });
      
      // Backend now accepts phone & location during registration
      const response = await authApi.register({
        email,
        password,
        name: name || email.split('@')[0],
        phone,
        location,
        role: role as any, // Send role to backend (must match Prisma Role enum)
      });

      // Store tokens securely using token service
      const expiresAt = calculateExpiryTimestamp('7d'); // 7 days for access token
      await saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt,
      });

      // Set tokens in api.ts for automatic refresh
      const { setToken, setRefreshToken } = await import('../services/api');
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      const user = mapUser(response.user);
      
      console.log('[AuthContext] Sign up successful');
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      // Send welcome messages from CSKH (async, no await)
      try {
        const { sendWelcomeMessages } = await import('@/services/welcome-message');
        sendWelcomeMessages(user.id).catch(err => 
          console.warn('Failed to send welcome messages:', err)
        );
      } catch (err) {
        console.warn('Welcome message service not available:', err);
      }
    } catch (error) {
      console.error('[AuthContext] Sign up failed:', error);
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('[AuthContext] Signing out...');
      
      // 1. Clear authentication tokens using token service
      await clearTokens();
      
      // Clear tokens from api.ts
      const { setToken, setRefreshToken } = await import('../services/api');
      setToken(null);
      setRefreshToken(null);
      
      // 2. Clear any cached user data
      await deleteItem('userData');
      
      // 3. TODO: Close WebSocket connection when enabled
      // socketManager.disconnect();
      
      // 4. TODO: Clear message/notification caches when integrated
      // await deleteItem('messages');
      // await deleteItem('notifications');
      
      console.log('[AuthContext] Successfully cleared all auth data');
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      // 5. Reset auth state
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });
      
      // 6. Navigate to login screen
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

  const updateAvatar = async (avatarUrl: string) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, avatar: avatarUrl };
    setState(prev => ({ ...prev, user: updatedUser }));

    // Persist to storage
    await setItem('user', JSON.stringify(updatedUser));
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...data };
    setState(prev => ({ ...prev, user: updatedUser }));

    // Persist to storage
    await setItem('user', JSON.stringify(updatedUser));
  };

  const editProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    try {
      const { apiFetch } = await import('../services/api');
      const updated = await apiFetch('/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (state.user) {
        const updatedUser = { ...state.user, ...data };
        setState(prev => ({ ...prev, user: updatedUser }));
        await setItem('user', JSON.stringify(updatedUser));
      }
      
      console.log('[AuthContext] Profile updated:', updated);
    } catch (error) {
      console.error('[AuthContext] Edit profile error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      const { apiFetch } = await import('../services/api');
      await apiFetch('/user/account', { method: 'DELETE' });
      
      // Sign out after successful deletion
      await signOut();
      
      console.log('[AuthContext] Account deleted successfully');
    } catch (error) {
      console.error('[AuthContext] Delete account error:', error);
      throw error;
    }
  };

  /**
   * Check marketplace role permissions
   * Example: hasMarketplacePermission('product.create')
   */
  const hasMarketplacePermission = (permission: string): boolean => {
    if (!state.user || !state.user.userType) return false;
    
    // Admin has all permissions
    if (state.user.userType === 'admin') return true;
    
    return checkRolePermission(state.user.userType, permission);
  };

  /**
   * Switch user's marketplace role
   * Example: switchRole('seller')
   */
  const switchRole = async (newUserType: UserType) => {
    if (!state.user) {
      throw new Error('User not authenticated');
    }

    // TODO: Call backend API to update user role
    // For now, update locally
    const updatedUser = { ...state.user, userType: newUserType };
    setState(prev => ({ ...prev, user: updatedUser }));

    // Persist to storage
    await setItem('user', JSON.stringify(updatedUser));
    
    console.log(`[AuthContext] User role switched to: ${newUserType}`);
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
        updateAvatar,
        updateProfile,
        editProfile,
        deleteAccount,
        hasPermission,
        hasRole,
        hasMarketplacePermission,
        switchRole,
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
