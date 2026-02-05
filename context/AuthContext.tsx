import { hasPermission as checkRolePermission } from "@/constants/roles";
import type { User as ApiUser } from "@/services/api/authApi";
import authApi, { getCurrentUser } from "@/services/api/authApi";
import {
    calculateExpiryTimestamp,
    clearTokens,
    getAccessToken,
    saveTokens,
} from "@/services/token.service";
import { UserType } from "@/types/auth";
import { Permission } from "@/utils/permissions";
import { deleteItem, setItem } from "@/utils/storage";
import { router } from "expo-router";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

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
  accessToken?: string | null;
}

// OTP Authentication types
interface SendOTPResult {
  success: boolean;
  message: string;
  sessionId?: string;
  expiresIn?: number;
  cooldownRemaining?: number;
}

interface VerifyOTPResult {
  success: boolean;
  message: string;
  isNewUser?: boolean;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

// Return type for signIn function (for biometric setup)
interface SignInResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 2FA Types
interface TwoFASendOtpResult {
  success: boolean;
  message: string;
}

interface TwoFALoginRequestResult {
  success: boolean;
  message: string;
  tempToken?: string;
}

interface TwoFAVerifyResult {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthContextType extends AuthState {
  signIn: (
    email: string,
    password: string,
    isBiometricLogin?: boolean,
  ) => Promise<SignInResult | undefined>;
  // Biometric Authentication - restore session from stored tokens
  restoreSessionFromBiometric: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<boolean>;
  signUp: (
    email: string,
    password: string,
    name?: string,
    role?: string,
    phone?: string,
    location?: { latitude: number; longitude: number; address?: string },
  ) => Promise<void>;
  // 2FA Authentication
  twoFARegisterSendOtp: (email: string) => Promise<TwoFASendOtpResult>;
  twoFARegisterVerify: (
    email: string,
    otp: string,
    password: string,
    name: string,
    phone?: string,
  ) => Promise<TwoFAVerifyResult>;
  twoFARegisterResendOtp: (email: string) => Promise<TwoFASendOtpResult>;
  twoFALoginRequestOtp: (
    email: string,
    password: string,
  ) => Promise<TwoFALoginRequestResult>;
  twoFALoginVerify: (
    email: string,
    tempToken: string,
    otp: string,
  ) => Promise<TwoFAVerifyResult>;
  twoFALoginResendOtp: (email: string) => Promise<TwoFASendOtpResult>;
  // OTP Authentication
  sendOTP: (
    phone: string,
    channel?: "sms" | "voice" | "viber",
  ) => Promise<SendOTPResult>;
  verifyOTP: (
    phone: string,
    otp: string,
    sessionId?: string,
  ) => Promise<VerifyOTPResult>;
  checkTrustedDevice: (
    phone: string,
  ) => Promise<{ trusted: boolean; daysRemaining?: number }>;
  autoLoginWithTrustedDevice: (phone: string) => Promise<VerifyOTPResult>;
  signInWithPhone: (
    phone: string,
    name?: string,
    email?: string,
  ) => Promise<void>;
  registerWithPhone: (
    phone: string,
    name: string,
    email?: string,
    password?: string,
  ) => Promise<void>;
  // Social Login
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleCode: (code: string) => Promise<void>; // OAuth 2.0 Authorization Code Flow
  signInWithGoogleToken: (
    credential: string,
    clientId?: string,
  ) => Promise<void>; // ID Token verification
  signInWithGoogleAccessToken: (accessToken: string) => Promise<void>; // Implicit Flow
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  editProfile: (data: {
    name?: string;
    phone?: string;
    avatar?: string;
  }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  hasPermission: (feature: string, capability: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  hasMarketplacePermission: (permission: string) => boolean; // New: Check marketplace role permissions
  switchRole: (newUserType: UserType) => Promise<void>; // New: Switch marketplace role
  // Aliases for backward compatibility
  login: (
    email: string,
    password: string,
    isBiometricLogin?: boolean,
  ) => Promise<SignInResult | undefined>; // Alias for signIn
  sessionId?: string; // Current session ID for device management
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global state to prevent duplicate session loads across re-mounts
let authSessionLoaded = false;
let authSessionLoading = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  // Map backend API user to app User shape
  const mapUser = (apiUser: ApiUser): User => ({
    id: apiUser.id.toString(),
    email: apiUser.email,
    name: apiUser.name,
    phone: apiUser.phone || undefined,
    avatar: undefined, // Backend doesn't provide avatar yet
    role: apiUser.role,
    admin: apiUser.role === "ADMIN" ? 1 : 0,
    permissions: undefined, // TODO: Add when backend supports
    staffid: undefined,
    global_roles: undefined,
    location: apiUser.location
      ? {
          latitude: apiUser.location.latitude,
          longitude: apiUser.location.longitude,
          address: apiUser.location.address,
        }
      : undefined,
  });

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: !authSessionLoaded, // Don't show loading if already loaded
    isAuthenticated: false,
    accessToken: null,
  });

  // Keep accessToken in sync with token service
  useEffect(() => {
    const syncToken = async () => {
      if (state.isAuthenticated) {
        const token = await getAccessToken();
        if (token && token !== state.accessToken) {
          setState((prev) => ({ ...prev, accessToken: token }));
        }
      }
    };
    syncToken();
  }, [state.isAuthenticated]);

  useEffect(() => {
    // Skip if already loaded or loading
    if (authSessionLoaded || authSessionLoading) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    // Defer loadSession to avoid blocking startup
    // Use requestAnimationFrame to let UI render first
    const frameId = requestAnimationFrame(() => {
      loadSession();
    });

    // Setup logout callback and token persistor for api.ts (deferred)
    const timeoutId = setTimeout(async () => {
      const { setLogoutCallback, setTokenPersistor } =
        await import("../services/api");

      // Auto-logout when token refresh fails
      setLogoutCallback(async () => {
        console.log("[AuthContext] Auto-logout triggered by API");
        await signOut();
      });

      // Persist new token when refresh succeeds (for persistent login)
      setTokenPersistor(async (newToken: string | null) => {
        if (newToken) {
          console.log(
            "[AuthContext] Persisting refreshed token for persistent login",
          );
          const { getRefreshToken } = await import("../services/api");
          const currentRefresh = getRefreshToken();
          const expiresAt = calculateExpiryTimestamp("30d");
          await saveTokens({
            accessToken: newToken,
            refreshToken: currentRefresh || "",
            expiresAt,
          });
        }
      });
    }, 500);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, []);

  const loadSession = async () => {
    // Double check with global state
    if (authSessionLoaded || authSessionLoading) {
      return;
    }
    authSessionLoading = true;

    try {
      const token = await getAccessToken();
      if (!token) {
        authSessionLoaded = true;
        authSessionLoading = false;
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
          accessToken: null,
        });
        return;
      }

      // Set tokens in api.ts for automatic refresh
      const { setToken, setRefreshToken, getRefreshToken } =
        await import("../services/api");
      setToken(token);
      const refresh = await getRefreshToken();
      if (refresh) setRefreshToken(refresh);

      // Try to get current user profile from backend
      try {
        const apiUser = await authApi.getProfile(token);
        authSessionLoaded = true;
        authSessionLoading = false;
        setState({
          user: mapUser(apiUser),
          loading: false,
          isAuthenticated: true,
          accessToken: token,
        });
      } catch (userError) {
        console.warn("[Auth] Failed to get profile, clearing session");
        await clearTokens();
        authSessionLoaded = true;
        authSessionLoading = false;
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
          accessToken: null,
        });
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      await clearTokens();
      authSessionLoading = false;
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
        accessToken: null,
      });
    }
  };

  const signIn = async (
    email: string,
    password: string,
    isBiometricLogin: boolean = false,
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] Signing in...", { isBiometricLogin });

      const response = await authApi.login({ email, password });

      // Store tokens securely using token service
      // Use 30 days for persistent login (will auto-refresh if needed)
      const expiresAt = calculateExpiryTimestamp("30d");
      await saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt,
      });

      // Set tokens in api.ts for automatic refresh
      const { setToken, setRefreshToken } = await import("../services/api");
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      const user = mapUser(response.user);

      console.log("[AuthContext] Sign in successful");
      setState({
        user,
        loading: false,
        isAuthenticated: true,
        accessToken: response.accessToken,
      });

      // Đồng bộ với Perfex CRM sau khi đăng nhập thành công (async, không block)
      // Sử dụng setTimeout để defer, tránh lỗi fetch trên web development
      setTimeout(async () => {
        try {
          const dataSyncModule = await import("../services/dataSyncService");
          const { dataSyncService } = dataSyncModule;
          await dataSyncService.initialize();
          const syncResult = await dataSyncService.syncUserAfterLogin({
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role || "CLIENT",
            phone: user.phone,
          });
          console.log(
            "[AuthContext] Perfex sync result:",
            syncResult.linkedAccounts ? "linked" : "not linked",
          );
        } catch (syncError) {
          // Silent fail - sync không quan trọng với luồng đăng nhập
          console.warn(
            "[AuthContext] Perfex sync skipped:",
            syncError instanceof Error ? syncError.message : "unknown error",
          );
        }
      }, 100);

      // Return user and tokens for biometric setup
      return {
        user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
    } catch (error) {
      console.error("[AuthContext] Sign in failed:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  /**
   * Restore session from biometric-stored tokens
   * Used when user authenticates with fingerprint/Face ID
   */
  const restoreSessionFromBiometric = async (
    accessToken: string,
    refreshToken: string,
  ): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] Restoring session from biometric...");

      // Store tokens
      const expiresAt = calculateExpiryTimestamp("7d");
      await saveTokens({
        accessToken,
        refreshToken,
        expiresAt,
      });

      // Set tokens in api.ts
      const { setToken, setRefreshToken } = await import("../services/api");
      setToken(accessToken);
      setRefreshToken(refreshToken);

      // Fetch user profile with stored token
      const userResponse = await authApi.getProfile(accessToken);
      const user = mapUser(userResponse);

      console.log("[AuthContext] Biometric session restored successfully");
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      return true;
    } catch (error) {
      console.error("[AuthContext] Biometric session restore failed:", error);
      // Clear invalid tokens
      await clearTokens();
      setState((prev) => ({ ...prev, loading: false }));
      return false;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name?: string,
    role?: string,
    phone?: string,
    location?: { latitude: number; longitude: number; address?: string },
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] Signing up with:", { role, phone, location });

      // Backend now accepts phone & location during registration
      const response = await authApi.register({
        email,
        password,
        name: name || email.split("@")[0],
        phone,
        location,
        role: role as any, // Send role to backend (must match Prisma Role enum)
      });

      // Store tokens securely using token service
      const expiresAt = calculateExpiryTimestamp("7d"); // 7 days for access token
      await saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt,
      });

      // Set tokens in api.ts for automatic refresh
      const { setToken, setRefreshToken } = await import("../services/api");
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      const user = mapUser(response.user);

      console.log("[AuthContext] Sign up successful");
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      // Send welcome messages from CSKH (async, no await)
      try {
        const { sendWelcomeMessages } =
          await import("@/services/welcome-message");
        sendWelcomeMessages(user.id).catch((err) =>
          console.warn("Failed to send welcome messages:", err),
        );
      } catch (err) {
        console.warn("Welcome message service not available:", err);
      }
    } catch (error) {
      console.error("[AuthContext] Sign up failed:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log("[AuthContext] Signing out...");

      // Get current user phone before clearing
      const currentPhone = state.user?.phone;

      // 1. Clear authentication tokens using token service
      await clearTokens();

      // Clear tokens from api.ts
      const { setToken, setRefreshToken } = await import("../services/api");
      setToken(null);
      setRefreshToken(null);

      // 2. Clear any cached user data
      await deleteItem("userData");

      // 3. Clear trusted device (optional - user có thể chọn giữ lại)
      // Nếu muốn xóa trusted device khi logout, uncomment dòng sau:
      if (currentPhone) {
        try {
          const { trustedDeviceService } =
            await import("../services/trustedDeviceService");
          await trustedDeviceService.removeTrustedDevice(currentPhone);
          console.log(
            "[AuthContext] Cleared trusted device for:",
            currentPhone,
          );
        } catch (trustError) {
          console.warn(
            "[AuthContext] Could not clear trusted device:",
            trustError,
          );
        }
      }

      // 4. Clear Perfex CRM sync data (non-blocking)
      try {
        const dataSyncModule = await import("../services/dataSyncService");
        dataSyncModule.dataSyncService.clearSyncData();
        console.log("[AuthContext] Cleared Perfex CRM sync data");
      } catch (syncError) {
        // Silent fail - không ảnh hưởng đăng xuất
        console.warn("[AuthContext] Sync data clear skipped");
      }

      // 5. Clear biometric credentials (optional - ask user if they want to keep)
      // For now, we keep biometric enabled so user can login quickly next time
      // If user wants to clear biometric, they can do it in Settings
      // Uncomment below to clear on every logout:
      // try {
      //   const { biometricAuth } = await import('../services/biometricAuthService');
      //   await biometricAuth.clearCredentials();
      //   console.log('[AuthContext] Cleared biometric credentials');
      // } catch (bioError) {
      //   console.warn('[AuthContext] Biometric clear failed:', bioError);
      // }

      // 6. TODO: Close WebSocket connection when enabled
      // socketManager.disconnect();

      // 6. TODO: Clear message/notification caches when integrated
      // await deleteItem('messages');
      // await deleteItem('notifications');

      console.log("[AuthContext] Successfully cleared all auth data");
    } catch (error) {
      console.error("[AuthContext] Logout error:", error);
    } finally {
      // 7. Reset auth state
      setState({
        user: null,
        loading: false,
        isAuthenticated: false,
      });

      // 8. Navigate to login screen
      try {
        router.replace("/(auth)/login" as any);
      } catch (routerError) {
        console.warn("[AuthContext] Router navigation failed:", routerError);
      }
    }
  };

  const refreshUser = async () => {
    try {
      const user = await getCurrentUser();
      const userData = mapUser(user);
      setState((prev) => ({
        ...prev,
        user: userData,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error("[AuthContext] Failed to refresh user:", error);
      await signOut();
    }
  };

  // Social authentication - Currently not implemented in backend API v2.0
  // These are stub implementations that throw errors
  const signInWithGoogle = async () => {
    throw new Error(
      'Vui lòng sử dụng nút "Đăng nhập với Google" trên màn hình đăng nhập.',
    );
  };

  const signInWithGoogleCode = async (code: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Send authorization code to backend
      const response = await authApi.post("/auth/google/code", { code });

      if (response.accessToken && response.user) {
        // Save tokens
        await saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: calculateExpiryTimestamp(response.expiresIn || 3600),
        });

        // Update state with user
        setState({
          user: response.user,
          loading: false,
          isAuthenticated: true,
        });
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signInWithGoogleToken = async (
    credential: string,
    clientId?: string,
  ) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Send ID token to backend for verification
      const response = await authApi.post("/auth/google/token", {
        credential,
        clientId,
      });

      if (response.accessToken && response.user) {
        // Save tokens
        await saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: calculateExpiryTimestamp(response.expiresIn || 3600),
        });

        // Update state with user
        setState({
          user: response.user,
          loading: false,
          isAuthenticated: true,
        });
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signInWithGoogleAccessToken = async (accessToken: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      // Send Google access token to backend
      const response = await authApi.post("/auth/google", {
        token: accessToken,
      });

      if (response.accessToken && response.user) {
        // Save tokens
        await saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: calculateExpiryTimestamp(response.expiresIn || 3600),
        });

        // Update state with user
        setState({
          user: response.user,
          loading: false,
          isAuthenticated: true,
        });
      }
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    throw new Error(
      "Facebook Sign-In chưa được implement. Vui lòng sử dụng email/password.",
    );
  };

  const hasPermission = (feature: string, capability: string): boolean => {
    if (!state.user) return false;

    // Admin has all permissions
    if (
      state.user.admin === 1 ||
      state.user.role === "admin" ||
      state.user.role === "Administrator"
    ) {
      return true;
    }

    // Check user permissions
    if (!state.user.permissions || state.user.permissions.length === 0) {
      return false;
    }

    const featurePermission = state.user.permissions.find(
      (p) => p.feature === feature,
    );
    if (!featurePermission) return false;

    return featurePermission.capabilities.includes(capability as any);
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!state.user || !state.user.role) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.some(
      (r) => state.user!.role?.toLowerCase() === r.toLowerCase(),
    );
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, avatar: avatarUrl };
    setState((prev) => ({ ...prev, user: updatedUser }));

    // Persist to storage
    await setItem("user", JSON.stringify(updatedUser));
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...data };
    setState((prev) => ({ ...prev, user: updatedUser }));

    // Persist to storage
    await setItem("user", JSON.stringify(updatedUser));
  };

  const editProfile = async (data: {
    name?: string;
    phone?: string;
    avatar?: string;
  }) => {
    try {
      const { apiFetch } = await import("../services/api");
      const updated = await apiFetch("/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (state.user) {
        const updatedUser = { ...state.user, ...data };
        setState((prev) => ({ ...prev, user: updatedUser }));
        await setItem("user", JSON.stringify(updatedUser));
      }

      console.log("[AuthContext] Profile updated:", updated);
    } catch (error) {
      console.error("[AuthContext] Edit profile error:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      const { apiFetch } = await import("../services/api");
      await apiFetch("/user/account", { method: "DELETE" });

      // Sign out after successful deletion
      await signOut();

      console.log("[AuthContext] Account deleted successfully");
    } catch (error) {
      console.error("[AuthContext] Delete account error:", error);
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
    if (state.user.userType === "admin") return true;

    return checkRolePermission(state.user.userType, permission);
  };

  /**
   * Switch user's marketplace role
   * Example: switchRole('seller')
   */
  const switchRole = async (newUserType: UserType) => {
    if (!state.user) {
      throw new Error("User not authenticated");
    }

    // TODO: Call backend API to update user role
    // For now, update locally
    const updatedUser = { ...state.user, userType: newUserType };
    setState((prev) => ({ ...prev, user: updatedUser }));

    // Persist to storage
    await setItem("user", JSON.stringify(updatedUser));

    console.log(`[AuthContext] User role switched to: ${newUserType}`);
  };

  // ============================================
  // OTP AUTHENTICATION
  // ============================================

  /**
   * Kiểm tra thiết bị có được trust không (không cần OTP)
   *
   * @returns { trusted: true, daysRemaining: N } nếu device trusted
   * @returns { trusted: false } nếu cần OTP
   */
  const checkTrustedDevice = async (
    phone: string,
  ): Promise<{
    trusted: boolean;
    daysRemaining?: number;
    deviceName?: string;
  }> => {
    try {
      const { trustedDeviceService } =
        await import("../services/trustedDeviceService");

      // Format phone
      let formattedPhone = phone.replace(/[\s\-\(\)\.]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "84" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("84")) {
        formattedPhone = "84" + formattedPhone;
      }

      const trusted =
        await trustedDeviceService.checkTrustedDevice(formattedPhone);

      if (trusted) {
        return {
          trusted: true,
          daysRemaining: trustedDeviceService.getDaysRemaining(trusted),
          deviceName: trusted.deviceName,
        };
      }

      return { trusted: false };
    } catch (error) {
      console.error("[AuthContext] Check trusted device error:", error);
      return { trusted: false };
    }
  };

  /**
   * Auto-login với trusted device (không cần OTP)
   * Chỉ hoạt động nếu:
   * 1. Cùng thiết bị (deviceId match)
   * 2. Còn trong thời hạn 30 ngày
   */
  const autoLoginWithTrustedDevice = async (
    phone: string,
  ): Promise<VerifyOTPResult> => {
    try {
      console.log("[AuthContext] Attempting auto-login for phone:", phone);
      const { trustedDeviceService } =
        await import("../services/trustedDeviceService");
      const { setToken, setRefreshToken } = await import("../services/api");

      // Format phone
      let formattedPhone = phone.replace(/[\s\-\(\)\.]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "84" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("84")) {
        formattedPhone = "84" + formattedPhone;
      }

      // Try auto-login
      const tokens = await trustedDeviceService.autoLogin(formattedPhone);

      if (!tokens) {
        return {
          success: false,
          message: "Thiết bị không được tin tưởng. Vui lòng xác thực OTP.",
        };
      }

      // Save tokens
      const expiresAt = calculateExpiryTimestamp("7d");
      await saveTokens({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt,
      });

      setToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);

      // Get current user info
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const user: User = {
            id: currentUser.id?.toString() || formattedPhone,
            email:
              currentUser.email || `phone_${formattedPhone}@baotienweb.cloud`,
            name: currentUser.name,
            phone: currentUser.phone || formattedPhone,
            role: currentUser.role || "CLIENT",
            avatar: (currentUser as any).avatar || undefined,
          };

          setState({
            user,
            loading: false,
            isAuthenticated: true,
          });

          await setItem("userData", JSON.stringify(user));

          console.log("[AuthContext] Auto-login successful for:", user.phone);

          return {
            success: true,
            message: "Đăng nhập tự động thành công",
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
        }
      } catch (userError) {
        console.warn("[AuthContext] Could not get user info:", userError);
      }

      // Fallback: login successful but no user info
      return {
        success: true,
        message: "Đăng nhập tự động thành công",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error: any) {
      console.error("[AuthContext] Auto-login error:", error);
      return {
        success: false,
        message:
          error.message ||
          "Không thể đăng nhập tự động. Vui lòng xác thực OTP.",
      };
    }
  };

  /**
   * Send OTP to phone number
   * Uses backend API: POST /zalo/send-otp
   */
  const sendOTP = async (
    phone: string,
    channel: "sms" | "voice" | "viber" = "sms",
  ): Promise<SendOTPResult> => {
    try {
      console.log("[AuthContext] Sending OTP to:", phone);
      const { apiFetch } = await import("../services/api");

      // Format phone to 84xxxxxxxxx
      let formattedPhone = phone.replace(/[\s\-\(\)\.]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "84" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("84")) {
        formattedPhone = "84" + formattedPhone;
      }

      const response = await apiFetch<SendOTPResult>("/zalo/send-otp", {
        method: "POST",
        data: {
          phone: formattedPhone,
          channel,
        },
      });

      console.log("[AuthContext] OTP sent:", response);
      return response;
    } catch (error: any) {
      console.error("[AuthContext] Send OTP error:", error);
      return {
        success: false,
        message: error.message || "Không thể gửi OTP. Vui lòng thử lại.",
      };
    }
  };

  /**
   * Verify OTP and login/register
   * Uses backend API: POST /zalo/verify-otp
   *
   * Sau khi OTP verify thành công:
   * - Lưu thiết bị vào trusted devices (không cần OTP trong 30 ngày)
   * - Nếu đổi thiết bị hoặc hết 30 ngày → Yêu cầu OTP lại
   */
  const verifyOTP = async (
    phone: string,
    otp: string,
    sessionId?: string,
  ): Promise<VerifyOTPResult> => {
    try {
      console.log("[AuthContext] Verifying OTP for:", phone);
      const { apiFetch, setToken, setRefreshToken } =
        await import("../services/api");
      const { trustedDeviceService } =
        await import("../services/trustedDeviceService");

      // Format phone
      let formattedPhone = phone.replace(/[\s\-\(\)\.]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "84" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("84")) {
        formattedPhone = "84" + formattedPhone;
      }

      const response = await apiFetch<any>("/zalo/verify-otp", {
        method: "POST",
        data: {
          phone: formattedPhone,
          otp,
          sessionId,
        },
      });

      console.log("[AuthContext] OTP verify response:", response);

      if (response.success && response.accessToken) {
        // Save tokens to local storage
        const expiresAt = calculateExpiryTimestamp("7d");

        // 🔐 Trust device for 30 days (no OTP needed on this device)
        try {
          await trustedDeviceService.trustDevice(
            formattedPhone,
            response.user?.id?.toString(),
            {
              accessToken: response.accessToken,
              refreshToken: response.refreshToken,
            },
          );
          console.log("[AuthContext] Device trusted for 30 days");
        } catch (trustError) {
          console.warn("[AuthContext] Could not trust device:", trustError);
        }
        await saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt,
        });

        // Set tokens in api.ts for automatic refresh
        setToken(response.accessToken);
        setRefreshToken(response.refreshToken);

        // Update auth state
        if (response.user) {
          const user: User = {
            id: response.user.id?.toString() || formattedPhone,
            email:
              response.user.email || `phone_${formattedPhone}@baotienweb.cloud`,
            name: response.user.name,
            phone: response.user.phone || formattedPhone,
            role: response.user.role || "CLIENT",
            avatar: response.user.avatar,
          };

          setState({
            user,
            loading: false,
            isAuthenticated: true,
          });

          // Persist user data
          await setItem("userData", JSON.stringify(user));

          return {
            success: true,
            message: response.message || "Đăng nhập thành công",
            isNewUser: response.isNewUser,
            user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          };
        }
      }

      return {
        success: response.success,
        message: response.message,
        isNewUser: response.isNewUser,
      };
    } catch (error: any) {
      console.error("[AuthContext] Verify OTP error:", error);
      return {
        success: false,
        message: error.message || "Mã OTP không đúng. Vui lòng thử lại.",
      };
    }
  };

  /**
   * Sign in with phone after OTP verification
   */
  const signInWithPhone = async (
    phone: string,
    name?: string,
    email?: string,
  ): Promise<void> => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const result = await verifyOTP(phone, "", "");

      if (!result.success) {
        throw new Error(result.message);
      }

      console.log("[AuthContext] Sign in with phone successful");
    } catch (error) {
      console.error("[AuthContext] Sign in with phone failed:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  // ============================================
  // 2FA (Two-Factor Authentication via Email)
  // ============================================

  /**
   * 2FA Registration - Step 1: Send OTP to email
   */
  const twoFARegisterSendOtp = async (
    email: string,
  ): Promise<TwoFASendOtpResult> => {
    try {
      console.log("[AuthContext] 2FA Register - Sending OTP to:", email);
      const response = await authApi.twoFARegisterSendOtp({ email });
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      console.error("[AuthContext] 2FA Register Send OTP error:", error);
      return {
        success: false,
        message: error.message || "Không thể gửi OTP. Vui lòng thử lại.",
      };
    }
  };

  /**
   * 2FA Registration - Step 2: Verify OTP and create account
   */
  const twoFARegisterVerify = async (
    email: string,
    otp: string,
    password: string,
    name: string,
    phone?: string,
  ): Promise<TwoFAVerifyResult> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] 2FA Register - Verifying OTP for:", email);

      const response = await authApi.twoFARegisterVerify({
        email,
        otp,
        password,
        name,
        phone,
      });

      // Store tokens
      const expiresAt = calculateExpiryTimestamp("7d");
      await saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt,
      });

      // Set tokens in api.ts
      const { setToken, setRefreshToken } = await import("../services/api");
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      const user = mapUser(response.user);

      console.log("[AuthContext] 2FA Register successful");
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      return {
        success: true,
        message: "Đăng ký thành công",
        user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
    } catch (error: any) {
      console.error("[AuthContext] 2FA Register Verify error:", error);
      setState((prev) => ({ ...prev, loading: false }));
      return {
        success: false,
        message: error.message || "Mã OTP không đúng. Vui lòng thử lại.",
      };
    }
  };

  /**
   * 2FA Registration - Resend OTP
   */
  const twoFARegisterResendOtp = async (
    email: string,
  ): Promise<TwoFASendOtpResult> => {
    try {
      console.log("[AuthContext] 2FA Register - Resending OTP to:", email);
      const response = await authApi.twoFARegisterResendOtp({ email });
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      console.error("[AuthContext] 2FA Register Resend OTP error:", error);
      return {
        success: false,
        message: error.message || "Không thể gửi lại OTP. Vui lòng thử lại.",
      };
    }
  };

  /**
   * 2FA Login - Step 1: Verify password and request OTP
   */
  const twoFALoginRequestOtp = async (
    email: string,
    password: string,
  ): Promise<TwoFALoginRequestResult> => {
    try {
      console.log("[AuthContext] 2FA Login - Requesting OTP for:", email);
      const response = await authApi.twoFALoginRequestOtp({ email, password });
      return {
        success: response.success,
        message: response.message,
        tempToken: response.tempToken,
      };
    } catch (error: any) {
      console.error("[AuthContext] 2FA Login Request OTP error:", error);
      return {
        success: false,
        message: error.message || "Email hoặc mật khẩu không chính xác.",
      };
    }
  };

  /**
   * 2FA Login - Step 2: Verify OTP and get tokens
   */
  const twoFALoginVerify = async (
    email: string,
    tempToken: string,
    otp: string,
  ): Promise<TwoFAVerifyResult> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] 2FA Login - Verifying OTP for:", email);

      const response = await authApi.twoFALoginVerify({
        email,
        tempToken,
        otp,
      });

      // Store tokens
      const expiresAt = calculateExpiryTimestamp("7d");
      await saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt,
      });

      // Set tokens in api.ts
      const { setToken, setRefreshToken } = await import("../services/api");
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);

      const user = mapUser(response.user);

      console.log("[AuthContext] 2FA Login successful");
      setState({
        user,
        loading: false,
        isAuthenticated: true,
      });

      return {
        success: true,
        message: "Đăng nhập thành công",
        user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
    } catch (error: any) {
      console.error("[AuthContext] 2FA Login Verify error:", error);
      setState((prev) => ({ ...prev, loading: false }));
      return {
        success: false,
        message: error.message || "Mã OTP không đúng. Vui lòng thử lại.",
      };
    }
  };

  /**
   * 2FA Login - Resend OTP
   */
  const twoFALoginResendOtp = async (
    email: string,
  ): Promise<TwoFASendOtpResult> => {
    try {
      console.log("[AuthContext] 2FA Login - Resending OTP to:", email);
      const response = await authApi.twoFALoginResendOtp({ email });
      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      console.error("[AuthContext] 2FA Login Resend OTP error:", error);
      return {
        success: false,
        message: error.message || "Không thể gửi lại OTP. Vui lòng thử lại.",
      };
    }
  };

  /**
   * Register new user with phone after OTP verification
   * Uses backend API: POST /zalo/register-phone
   */
  const registerWithPhone = async (
    phone: string,
    name: string,
    email?: string,
    password?: string,
  ): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      console.log("[AuthContext] Registering with phone:", phone);

      const { apiFetch, setToken, setRefreshToken } =
        await import("../services/api");

      // Format phone
      let formattedPhone = phone.replace(/[\s\-\(\)\.]/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "84" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("84")) {
        formattedPhone = "84" + formattedPhone;
      }

      const response = await apiFetch<any>("/zalo/register-phone", {
        method: "POST",
        data: {
          phone: formattedPhone,
          name,
          email,
          password,
        },
      });

      if (response.accessToken) {
        // Save tokens
        const expiresAt = calculateExpiryTimestamp("7d");
        await saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt,
        });

        setToken(response.accessToken);
        setRefreshToken(response.refreshToken);

        // Update auth state
        const user: User = {
          id: response.user?.id?.toString() || formattedPhone,
          email:
            response.user?.email ||
            email ||
            `phone_${formattedPhone}@baotienweb.cloud`,
          name: response.user?.name || name,
          phone: formattedPhone,
          role: response.user?.role || "CLIENT",
        };

        setState({
          user,
          loading: false,
          isAuthenticated: true,
        });

        await setItem("userData", JSON.stringify(user));

        console.log("[AuthContext] Register with phone successful");
      } else {
        throw new Error(response.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("[AuthContext] Register with phone failed:", error);
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        restoreSessionFromBiometric,
        signUp,
        // 2FA Authentication
        twoFARegisterSendOtp,
        twoFARegisterVerify,
        twoFARegisterResendOtp,
        twoFALoginRequestOtp,
        twoFALoginVerify,
        twoFALoginResendOtp,
        // OTP via Phone
        sendOTP,
        verifyOTP,
        checkTrustedDevice,
        autoLoginWithTrustedDevice,
        signInWithPhone,
        registerWithPhone,
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
        // Aliases for backward compatibility
        login: signIn,
        sessionId: undefined, // TODO: Add session management
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
