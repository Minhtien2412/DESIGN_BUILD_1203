import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'khach-hang' | 'nha-thau' | 'thau-phu' | 'cong-ty';
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  
  // Actions
  setSession: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  clear: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: User) => void;
}

const SESSION_KEY = 'auth_session';

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isHydrated: false,
    
    setSession: async (accessToken: string, refreshToken: string, user: User) => {
      try {
        const sessionData = { user, accessToken, refreshToken };
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(sessionData));
        set({ user, accessToken, refreshToken });
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    },
    
    clear: async () => {
      try {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        set({ user: null, accessToken: null, refreshToken: null });
      } catch (error) {
        console.error('Failed to clear session:', error);
      }
    },
    
    hydrate: async () => {
      try {
        const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
        if (sessionData) {
          const { user, accessToken, refreshToken } = JSON.parse(sessionData);
          set({ user, accessToken, refreshToken, isHydrated: true });
        } else {
          set({ isHydrated: true });
        }
      } catch (error) {
        console.error('Failed to hydrate session:', error);
        set({ isHydrated: true });
      }
    },
    
    setUser: (user: User) => {
      set({ user });
    },
  }))
);

// Helper to get auth state outside React components
export const getAuthState = (): AuthState => {
  return useAuthStore.getState();
};

// Auth actions for external use
export const authActions = {
  setSession: async (accessToken: string, refreshToken: string, user: User) => {
    return useAuthStore.getState().setSession(accessToken, refreshToken, user);
  },
  clear: async () => {
    return useAuthStore.getState().clear();
  },
  hydrate: async () => {
    return useAuthStore.getState().hydrate();
  },
  setUser: (user: User) => {
    return useAuthStore.getState().setUser(user);
  },
};