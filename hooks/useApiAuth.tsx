/**
 * Simplified Auth Hook for Backend API Integration
 * Uses services/authApi.ts and utils/secureStorage.ts
 * 
 * Usage:
 * - For new API-based login/register: use this hook
 * - For existing demo/local auth: use original AuthContext
 */

import { login as apiLogin, logout as apiLogout, register as apiRegister, getCurrentUser, type AuthResponse, type User } from '@/services/authApi';
import { loadJWT, removeJWT, saveJWT } from '@/utils/secureStorage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ApiAuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const ApiAuthContext = createContext<ApiAuthContextType | undefined>(undefined);

export function ApiAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from stored JWT on mount
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      setLoading(true);
      const token = await loadJWT();
      
      if (token) {
        // Fetch current user with stored token
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      // Clear invalid token
      await removeJWT();
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: AuthResponse = await apiLogin({ email, password });
      
      // Save JWT to secure storage
      await saveJWT(response.accessToken);
      
      // Set user
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const newUser = await apiRegister({
        email,
        password,
        fullName,
      });
      
      // After registration, automatically sign in
      await signIn(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Call backend logout
      await apiLogout('');
      
      // Clear JWT from secure storage
      await removeJWT();
      
      // Clear user state
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local state even if API call fails
      await removeJWT();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      // Token might be invalid, sign out
      await signOut();
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: ApiAuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
    clearError,
  };

  return (
    <ApiAuthContext.Provider value={value}>
      {children}
    </ApiAuthContext.Provider>
  );
}

export function useApiAuth() {
  const context = useContext(ApiAuthContext);
  if (context === undefined) {
    throw new Error('useApiAuth must be used within ApiAuthProvider');
  }
  return context;
}
