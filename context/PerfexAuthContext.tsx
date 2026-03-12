/**
 * Perfex CRM Authentication Context
 * Context chuyên biệt cho Perfex CRM authentication
 * Có thể dùng song song hoặc thay thế AuthContext gốc
 *
 * @author ThietKeResort Team
 * @created 2025-12-30
 */

import PerfexAuthService, {
    PerfexAuthError,
    PerfexAuthUser,
} from "@/services/perfexAuth";
import { router } from "expo-router";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

// ==================== TYPES ====================

interface PerfexAuthState {
  user: PerfexAuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  authProvider: "perfex" | null;
}

interface PerfexAuthContextType extends PerfexAuthState {
  // Auth actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;

  // Profile actions
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<ProfileUpdateData>) => Promise<void>;

  // Helpers
  isStaff: () => boolean;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
  getCustomerId: () => string | null;
  getContactId: () => string | null;
}

interface SignUpData {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface ProfileUpdateData {
  firstname: string;
  lastname: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

// ==================== CONTEXT ====================

// Global state to prevent duplicate session loads
let perfexSessionLoaded = false;
let perfexSessionLoading = false;

const PerfexAuthContext = createContext<PerfexAuthContextType | undefined>(
  undefined,
);

export function PerfexAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PerfexAuthState>({
    user: null,
    loading: !perfexSessionLoaded, // Don't show loading if already loaded
    isAuthenticated: false,
    authProvider: null,
  });

  // Load session on mount - DEFERRED and with global deduplication
  useEffect(() => {
    // Skip if already loaded or loading
    if (perfexSessionLoaded || perfexSessionLoading) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    const frameId = requestAnimationFrame(() => {
      loadSession();
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  const loadSession = async () => {
    // Double check with global state
    if (perfexSessionLoaded || perfexSessionLoading) {
      return;
    }
    perfexSessionLoading = true;

    try {
      console.log("[PerfexAuthContext] Loading session...");
      const user = await PerfexAuthService.getCurrentUser();

      perfexSessionLoaded = true;
      perfexSessionLoading = false;

      if (user) {
        console.log("[PerfexAuthContext] Session loaded:", user.email);
        setState({
          user,
          loading: false,
          isAuthenticated: true,
          authProvider: "perfex",
        });
      } else {
        console.log("[PerfexAuthContext] No session found");
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
          authProvider: null,
        });
      }
    } catch (error) {
      perfexSessionLoading = false;
      console.error("[PerfexAuthContext] Failed to load session:", error);
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
        authProvider: null,
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[PerfexAuthContext] Signing in...");

      const response = await PerfexAuthService.login(email, password);

      console.log(
        "[PerfexAuthContext] Sign in successful:",
        response.user.email,
      );
      setState({
        user: response.user,
        loading: false,
        isAuthenticated: true,
        authProvider: "perfex",
      });
    } catch (error: any) {
      console.error("[PerfexAuthContext] Sign in failed:", error);
      setState((prev) => ({ ...prev, loading: false }));

      // Re-throw with user-friendly message
      if (error instanceof PerfexAuthError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[PerfexAuthContext] Signing up...");

      const response = await PerfexAuthService.register(data);

      console.log(
        "[PerfexAuthContext] Sign up successful:",
        response.user.email,
      );
      setState({
        user: response.user,
        loading: false,
        isAuthenticated: true,
        authProvider: "perfex",
      });
    } catch (error: any) {
      console.error("[PerfexAuthContext] Sign up failed:", error);
      setState((prev) => ({ ...prev, loading: false }));

      if (error instanceof PerfexAuthError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("[PerfexAuthContext] Signing out...");

      await PerfexAuthService.logout();

      console.log("[PerfexAuthContext] Sign out successful");
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
        authProvider: null,
      });

      // Navigate to login
      try {
        router.replace("/(auth)/login" as any);
      } catch (routerError) {
        console.warn(
          "[PerfexAuthContext] Router navigation failed:",
          routerError,
        );
      }
    } catch (error) {
      console.error("[PerfexAuthContext] Sign out error:", error);
      // Still clear state even on error
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
        authProvider: null,
      });
    }
  };

  const refreshUser = async () => {
    try {
      const user = await PerfexAuthService.getCurrentUser();
      if (user) {
        setState((prev) => ({
          ...prev,
          user,
          isAuthenticated: true,
        }));
      }
    } catch (error) {
      console.error("[PerfexAuthContext] Failed to refresh user:", error);
    }
  };

  const updateProfile = async (data: Partial<ProfileUpdateData>) => {
    try {
      const updatedUser = await PerfexAuthService.updateProfile(data);
      setState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error: any) {
      console.error("[PerfexAuthContext] Update profile failed:", error);
      if (error instanceof PerfexAuthError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  // Helper functions
  const isStaff = () => state.user?.isStaff === true;
  const isAdmin = () => state.user?.role === "admin";
  const isCustomer = () => state.user?.role === "customer";
  const getCustomerId = () => state.user?.customerId || null;
  const getContactId = () => state.user?.contactId || null;

  return (
    <PerfexAuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        refreshUser,
        updateProfile,
        isStaff,
        isAdmin,
        isCustomer,
        getCustomerId,
        getContactId,
      }}
    >
      {children}
    </PerfexAuthContext.Provider>
  );
}

// ==================== HOOKS ====================

export function usePerfexAuth() {
  const context = useContext(PerfexAuthContext);
  if (!context) {
    throw new Error("usePerfexAuth must be used within PerfexAuthProvider");
  }
  return context;
}

/**
 * Hook để lấy thông tin user với type safety
 */
export function usePerfexUser() {
  const { user, isAuthenticated, loading } = usePerfexAuth();
  return { user, isAuthenticated, loading };
}

/**
 * Hook kiểm tra quyền admin
 */
export function usePerfexIsAdmin() {
  const { isAdmin } = usePerfexAuth();
  return isAdmin();
}

/**
 * Hook kiểm tra quyền staff
 */
export function usePerfexIsStaff() {
  const { isStaff } = usePerfexAuth();
  return isStaff();
}

export default PerfexAuthContext;
