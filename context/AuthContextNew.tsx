/**
 * Authentication Context - Unified Version
 *
 * Sử dụng authService mới, xóa các phương thức cũ bị lỗi
 * Backend: https://baotienweb.cloud/api/v1
 * VPS: root@103.200.20.100 (baotienweb-api)
 *
 * Supported Auth Methods:
 * 1. Email/Password (JWT)
 * 2. Phone/OTP (Zalo Integration)
 * 3. Zalo Mini App SDK
 * 4. Trusted Device (30-day auto-login)
 */

import { hasPermission as checkRolePermission } from "@/constants/roles";
import {
    authService,
    AuthUser,
    SendOTPResult
} from "@/services/auth/authService";
import {
    clearTokens,
    getAccessToken
} from "@/services/token.service";
import { UserType } from "@/types/auth";
import { Permission } from "@/utils/permissions";
import { deleteItem, setItem } from "@/utils/storage";
import { router } from "expo-router";
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

// ==================== TYPES ====================

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  userType?: UserType;
  admin?: number;
  permissions?: Permission[];
  staffid?: number;
  global_roles?: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  // Marketplace fields
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

interface OTPResult {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthContextType extends AuthState {
  // Email/Password Auth
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name?: string,
    role?: string,
    phone?: string,
    location?: { latitude: number; longitude: number; address?: string }
  ) => Promise<void>;

  // OTP Auth
  sendOTP: (
    phone: string,
    channel?: "sms" | "voice" | "viber" | "zalo"
  ) => Promise<SendOTPResult>;
  verifyOTP: (
    phone: string,
    otp: string,
    sessionId?: string
  ) => Promise<OTPResult>;

  // Trusted Device
  checkTrustedDevice: (
    phone: string
  ) => Promise<{ trusted: boolean; daysRemaining?: number }>;
  autoLoginWithTrustedDevice: (phone: string) => Promise<OTPResult>;

  // Phone Registration
  registerWithPhone: (
    phone: string,
    name: string,
    email?: string,
    password?: string
  ) => Promise<void>;

  // Zalo Mini App
  signInWithZalo: (
    zaloUserId: string,
    accessToken: string,
    userInfo: { name: string; avatar?: string; phone?: string }
  ) => Promise<void>;

  // Session
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;

  // Profile
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;

  // Permissions
  hasPermission: (feature: string, capability: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasMarketplacePermission: (permission: string) => boolean;
  switchRole: (newUserType: UserType) => Promise<void>;
}

// ==================== CONTEXT ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  // Map AuthUser to User
  const mapUser = useCallback(
    (authUser: AuthUser): User => ({
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      phone: authUser.phone,
      avatar: authUser.avatar,
      role: authUser.role,
      admin: authUser.role === "ADMIN" ? 1 : 0,
      location: authUser.location,
    }),
    []
  );

  // Load session on mount
  useEffect(() => {
    loadSession();
    setupLogoutCallback();
  }, []);

  const setupLogoutCallback = async () => {
    try {
      const { setLogoutCallback } = await import("../services/api");
      setLogoutCallback(async () => {
        console.log("[AuthContext] Auto-logout triggered by API");
        await signOut();
      });
    } catch (error) {
      console.warn("[AuthContext] Could not setup logout callback:", error);
    }
  };

  const loadSession = async () => {
    try {
      const token = await getAccessToken();

      if (!token) {
        setState({ user: null, loading: false, isAuthenticated: false });
        return;
      }

      // Set tokens in api.ts for automatic refresh
      const { setToken, setRefreshToken } = await import("../services/api");
      const { getRefreshToken } = await import("../services/token.service");

      setToken(token);
      const refresh = await getRefreshToken();
      if (refresh) setRefreshToken(refresh);

      // Get current user profile
      const authUser = await authService.getCurrentUser();

      if (authUser) {
        setState({
          user: mapUser(authUser),
          loading: false,
          isAuthenticated: true,
        });
      } else {
        console.warn("[AuthContext] No user found, clearing session");
        await clearTokens();
        setState({ user: null, loading: false, isAuthenticated: false });
      }
    } catch (error) {
      console.error("[AuthContext] Failed to load session:", error);
      await clearTokens();
      setState({ user: null, loading: false, isAuthenticated: false });
    }
  };

  // ============ EMAIL/PASSWORD AUTH ============

  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] Signing in...");

      const result = await authService.login({ email, password });

      if (!result.success || !result.user) {
        throw new Error(result.message);
      }

      const user = mapUser(result.user);

      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      console.log("[AuthContext] Sign in successful");

      // Sync with Perfex CRM (async, non-blocking)
      syncWithPerfex(user);
    } catch (error) {
      console.error("[AuthContext] Sign in failed:", error);
      setState((prev) => ({ ...prev, loading: false }));
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
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] Signing up...");

      const result = await authService.register({
        email,
        password,
        name: name || email.split("@")[0],
        phone,
        role: role as any,
        location,
      });

      if (!result.success || !result.user) {
        throw new Error(result.message);
      }

      const user = mapUser(result.user);

      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      console.log("[AuthContext] Sign up successful");

      // Send welcome messages (async)
      sendWelcomeMessage(user.id);
    } catch (error) {
      console.error("[AuthContext] Sign up failed:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  // ============ OTP AUTH ============

  const sendOTP = async (
    phone: string,
    channel: "sms" | "voice" | "viber" | "zalo" = "sms"
  ): Promise<SendOTPResult> => {
    console.log("[AuthContext] Sending OTP to:", phone);
    return authService.sendOTP({ phone, channel });
  };

  const verifyOTP = async (
    phone: string,
    otp: string,
    sessionId?: string
  ): Promise<OTPResult> => {
    try {
      console.log("[AuthContext] Verifying OTP for:", phone);

      const result = await authService.verifyOTP({ phone, otp, sessionId });

      if (result.success && result.user) {
        const user = mapUser(result.user);

        setState({
          user,
          loading: false,
          isAuthenticated: true,
        });

        // Persist user data
        await setItem("userData", JSON.stringify(user));

        return {
          success: true,
          message: result.message,
          isNewUser: result.isNewUser,
          user,
          accessToken: result.tokens?.accessToken,
          refreshToken: result.tokens?.refreshToken,
        };
      }

      return {
        success: result.success,
        message: result.message,
        isNewUser: result.isNewUser,
      };
    } catch (error: any) {
      console.error("[AuthContext] Verify OTP error:", error);
      return {
        success: false,
        message: error.message || "Mã OTP không đúng. Vui lòng thử lại.",
      };
    }
  };

  // ============ TRUSTED DEVICE ============

  const checkTrustedDevice = async (phone: string) => {
    return authService.checkTrustedDevice(phone);
  };

  const autoLoginWithTrustedDevice = async (
    phone: string
  ): Promise<OTPResult> => {
    try {
      console.log("[AuthContext] Auto-login attempt for:", phone);

      const result = await authService.autoLoginWithTrustedDevice(phone);

      if (result.success && result.user) {
        const user = mapUser(result.user);

        setState({
          user,
          loading: false,
          isAuthenticated: true,
        });

        await setItem("userData", JSON.stringify(user));

        return {
          success: true,
          message: result.message,
          user,
          accessToken: result.tokens?.accessToken,
          refreshToken: result.tokens?.refreshToken,
        };
      }

      return {
        success: false,
        message:
          result.message ||
          "Thiết bị không được tin tưởng. Vui lòng xác thực OTP.",
      };
    } catch (error: any) {
      console.error("[AuthContext] Auto-login error:", error);
      return {
        success: false,
        message: error.message || "Không thể đăng nhập tự động.",
      };
    }
  };

  // ============ PHONE REGISTRATION ============

  const registerWithPhone = async (
    phone: string,
    name: string,
    email?: string,
    password?: string
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] Registering with phone:", phone);

      const result = await authService.registerWithPhone({
        phone,
        name,
        email,
        password,
      });

      if (!result.success || !result.user) {
        throw new Error(result.message);
      }

      const user = mapUser(result.user);

      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      await setItem("userData", JSON.stringify(user));
      console.log("[AuthContext] Phone registration successful");
    } catch (error) {
      console.error("[AuthContext] Phone registration failed:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  // ============ ZALO MINI APP ============

  const signInWithZalo = async (
    zaloUserId: string,
    accessToken: string,
    userInfo: { name: string; avatar?: string; phone?: string }
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] Signing in with Zalo:", zaloUserId);

      const result = await authService.loginWithZalo({
        zaloUserId,
        accessToken,
        userInfo: {
          id: zaloUserId,
          name: userInfo.name,
          avatar: userInfo.avatar,
          phone: userInfo.phone,
        },
      });

      if (!result.success || !result.user) {
        throw new Error(result.message);
      }

      const user = mapUser(result.user);

      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      await setItem("userData", JSON.stringify(user));
      console.log("[AuthContext] Zalo sign in successful");
    } catch (error) {
      console.error("[AuthContext] Zalo sign in failed:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  // ============ SESSION MANAGEMENT ============

  const signOut = async () => {
    try {
      console.log("[AuthContext] Signing out...");

      const currentPhone = state.user?.phone;

      // Clear auth tokens
      await authService.logout();

      // Clear user data
      await deleteItem("userData");

      // Clear trusted device
      if (currentPhone) {
        await authService.clearTrustedDevice(currentPhone);
      }

      // Clear Perfex sync data
      try {
        const dataSyncModule = await import("../services/dataSyncService");
        dataSyncModule.dataSyncService.clearSyncData();
      } catch (syncError) {
        // Silent fail
      }

      console.log("[AuthContext] Successfully signed out");
    } catch (error) {
      console.error("[AuthContext] Sign out error:", error);
    } finally {
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      // Navigate to login
      try {
        router.replace("/(auth)/login" as any);
      } catch (routerError) {
        console.warn("[AuthContext] Router navigation failed:", routerError);
      }
    }
  };

  const refreshUser = async () => {
    try {
      const authUser = await authService.getCurrentUser();

      if (authUser) {
        const user = mapUser(authUser);
        setState((prev) => ({
          ...prev,
          user,
          isAuthenticated: true,
        }));
      } else {
        await signOut();
      }
    } catch (error) {
      console.error("[AuthContext] Failed to refresh user:", error);
      await signOut();
    }
  };

  // ============ PROFILE MANAGEMENT ============

  const updateAvatar = async (avatarUrl: string) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, avatar: avatarUrl };
    setState((prev) => ({ ...prev, user: updatedUser }));
    await setItem("userData", JSON.stringify(updatedUser));
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...data };
    setState((prev) => ({ ...prev, user: updatedUser }));
    await setItem("userData", JSON.stringify(updatedUser));
  };

  const deleteAccount = async () => {
    try {
      const { apiFetch } = await import("../services/api");
      await apiFetch("/user/account", { method: "DELETE" });
      await signOut();
      console.log("[AuthContext] Account deleted successfully");
    } catch (error) {
      console.error("[AuthContext] Delete account error:", error);
      throw error;
    }
  };

  // ============ PERMISSIONS ============

  const hasPermission = (feature: string, capability: string): boolean => {
    if (!state.user) return false;

    // Admin has all permissions
    if (
      state.user.admin === 1 ||
      state.user.role === "ADMIN" ||
      state.user.role === "admin"
    ) {
      return true;
    }

    if (!state.user.permissions || state.user.permissions.length === 0) {
      return false;
    }

    const featurePermission = state.user.permissions.find(
      (p) => p.feature === feature
    );
    return featurePermission?.capabilities.includes(capability as any) ?? false;
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!state.user || !state.user.role) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.some(
      (r) => state.user!.role?.toLowerCase() === r.toLowerCase()
    );
  };

  const hasMarketplacePermission = (permission: string): boolean => {
    if (!state.user || !state.user.userType) return false;
    if (state.user.userType === "admin") return true;
    return checkRolePermission(state.user.userType, permission);
  };

  const switchRole = async (newUserType: UserType) => {
    if (!state.user) {
      throw new Error("User not authenticated");
    }

    // TODO: Call backend API to update user role
    const updatedUser = { ...state.user, userType: newUserType };
    setState((prev) => ({ ...prev, user: updatedUser }));
    await setItem("userData", JSON.stringify(updatedUser));
    console.log(`[AuthContext] User role switched to: ${newUserType}`);
  };

  // ============ HELPERS ============

  const syncWithPerfex = async (user: User) => {
    setTimeout(async () => {
      try {
        const dataSyncModule = await import("../services/dataSyncService");
        const { dataSyncService } = dataSyncModule;
        await dataSyncService.initialize();
        await dataSyncService.syncUserAfterLogin({
          id: user.id,
          email: user.email,
          name: user.name || "",
          role: user.role || "CLIENT",
          phone: user.phone,
        });
      } catch (syncError) {
        console.warn("[AuthContext] Perfex sync skipped:", syncError);
      }
    }, 100);
  };

  const sendWelcomeMessage = async (userId: string) => {
    try {
      const { sendWelcomeMessages } =
        await import("@/services/welcome-message");
      sendWelcomeMessages(userId).catch((err) =>
        console.warn("Failed to send welcome messages:", err)
      );
    } catch (err) {
      console.warn("Welcome message service not available:", err);
    }
  };

  // ============ RENDER ============

  return (
    <AuthContext.Provider
      value={{
        ...state,
        // Auth
        signIn,
        signUp,
        sendOTP,
        verifyOTP,
        checkTrustedDevice,
        autoLoginWithTrustedDevice,
        registerWithPhone,
        signInWithZalo,
        signOut,
        refreshUser,
        // Profile
        updateAvatar,
        updateProfile,
        deleteAccount,
        // Permissions
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

// ==================== HOOK ====================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
