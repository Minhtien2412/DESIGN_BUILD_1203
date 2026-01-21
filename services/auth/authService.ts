/**
 * Unified Authentication Service
 *
 * Hợp nhất tất cả auth logic với endpoints nhất quán
 * Backend: https://baotienweb.cloud/api/v1
 * VPS: root@103.200.20.100 (baotienweb-api)
 *
 * Supported Auth Methods:
 * 1. Email/Password (JWT)
 * 2. Phone/OTP (Zalo Integration)
 * 3. Zalo Mini App SDK
 * 4. Google OAuth (future)
 */

import { apiFetch, clearToken, setRefreshToken, setToken } from "../api";
import {
    calculateExpiryTimestamp,
    clearTokens,
    getRefreshToken,
    saveTokens,
} from "../token.service";
import { trustedDeviceService } from "../trustedDeviceService";

// ==================== TYPES ====================

export type UserRole =
  | "CLIENT"
  | "ENGINEER"
  | "CONTRACTOR"
  | "ARCHITECT"
  | "DESIGNER"
  | "SUPPLIER"
  | "STAFF"
  | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: AuthUser;
  tokens?: AuthTokens;
  isNewUser?: boolean;
}

// Login DTOs
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PhoneLoginRequest {
  phone: string;
  otp: string;
  sessionId?: string;
}

// Register DTOs
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface PhoneRegisterData {
  phone: string;
  name: string;
  email?: string;
  password?: string;
}

// OTP DTOs
export interface SendOTPRequest {
  phone: string;
  channel?: "sms" | "voice" | "viber" | "zalo";
}

export interface SendOTPResult {
  success: boolean;
  message: string;
  sessionId?: string;
  expiresIn?: number;
  cooldownRemaining?: number;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
  sessionId?: string;
}

export interface VerifyOTPResult extends AuthResult {
  sessionId?: string;
}

// Zalo Mini App
export interface ZaloUserInfo {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
}

export interface ZaloLoginRequest {
  zaloUserId: string;
  accessToken: string;
  userInfo: ZaloUserInfo;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format phone number to 84xxxxxxxxx (Vietnam format)
 */
export const formatPhoneNumber = (phone: string): string => {
  let formatted = phone.replace(/[\s\-\(\)\.]/g, "");

  if (formatted.startsWith("+84")) {
    formatted = formatted.substring(1);
  } else if (formatted.startsWith("0")) {
    formatted = "84" + formatted.substring(1);
  } else if (!formatted.startsWith("84")) {
    formatted = "84" + formatted;
  }

  return formatted;
};

/**
 * Map backend response to AuthUser
 */
const mapToAuthUser = (apiUser: any): AuthUser => ({
  id: apiUser.id?.toString() || "",
  email: apiUser.email || "",
  name: apiUser.name,
  phone: apiUser.phone || undefined,
  avatar: apiUser.avatar || undefined,
  role: apiUser.role || "CLIENT",
  isActive: apiUser.isActive !== false,
  createdAt: apiUser.createdAt,
  updatedAt: apiUser.updatedAt,
  location: apiUser.location,
});

/**
 * Save tokens and set in API client
 */
const persistTokens = async (tokens: AuthTokens): Promise<void> => {
  const expiresIn =
    typeof tokens.expiresIn === "number"
      ? `${tokens.expiresIn}s`
      : tokens.expiresIn || "7d";
  const expiresAt = calculateExpiryTimestamp(expiresIn);

  await saveTokens({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt,
  });

  setToken(tokens.accessToken);
  setRefreshToken(tokens.refreshToken);
};

// ==================== AUTH SERVICE ====================

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ============ EMAIL/PASSWORD AUTH ============

  /**
   * Login with email and password
   * Endpoint: POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      console.log("[AuthService] Login with email:", credentials.email);

      const response = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>("/auth/login", {
        method: "POST",
        data: {
          email: credentials.email,
          password: credentials.password,
        },
      });

      const user = mapToAuthUser(response.user);
      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      await persistTokens(tokens);

      console.log("[AuthService] Login successful for:", user.email);

      return {
        success: true,
        message: "Đăng nhập thành công",
        user,
        tokens,
      };
    } catch (error: any) {
      console.error("[AuthService] Login failed:", error);
      return {
        success: false,
        message:
          error.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.",
      };
    }
  }

  /**
   * Register new user with email/password
   * Endpoint: POST /auth/register
   */
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      console.log("[AuthService] Register with email:", data.email);

      const response = await apiFetch<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>("/auth/register", {
        method: "POST",
        data: {
          email: data.email,
          password: data.password,
          name: data.name || data.email.split("@")[0],
          phone: data.phone,
          role: data.role || "CLIENT",
          location: data.location,
        },
      });

      const user = mapToAuthUser(response.user);
      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      await persistTokens(tokens);

      console.log("[AuthService] Register successful for:", user.email);

      return {
        success: true,
        message: "Đăng ký thành công",
        user,
        tokens,
        isNewUser: true,
      };
    } catch (error: any) {
      console.error("[AuthService] Register failed:", error);
      return {
        success: false,
        message: error.message || "Đăng ký thất bại. Vui lòng thử lại.",
      };
    }
  }

  // ============ PHONE/OTP AUTH ============

  /**
   * Send OTP to phone number
   * Endpoint: POST /auth/otp/send
   *
   * NOTE: Backend cần có endpoint này, nếu chưa có sẽ sử dụng /zalo/send-otp
   */
  async sendOTP(request: SendOTPRequest): Promise<SendOTPResult> {
    try {
      const phone = formatPhoneNumber(request.phone);
      console.log("[AuthService] Sending OTP to:", phone);

      // Try new unified endpoint first, fallback to /zalo/send-otp
      try {
        const response = await apiFetch<SendOTPResult>("/auth/otp/send", {
          method: "POST",
          data: {
            phone,
            channel: request.channel || "sms",
          },
        });

        console.log("[AuthService] OTP sent via /auth/otp/send");
        return {
          success: true,
          message: response.message || "Đã gửi mã OTP",
          sessionId: response.sessionId,
          expiresIn: response.expiresIn || 300, // 5 minutes
          cooldownRemaining: response.cooldownRemaining,
        };
      } catch (primaryError: any) {
        // If endpoint not found (404), fallback to /zalo/send-otp
        if (primaryError.status === 404) {
          console.log("[AuthService] Fallback to /zalo/send-otp");

          const response = await apiFetch<SendOTPResult>("/zalo/send-otp", {
            method: "POST",
            data: {
              phone,
              channel: request.channel || "sms",
            },
          });

          return {
            success: true,
            message: response.message || "Đã gửi mã OTP",
            sessionId: response.sessionId,
            expiresIn: response.expiresIn || 300,
            cooldownRemaining: response.cooldownRemaining,
          };
        }
        throw primaryError;
      }
    } catch (error: any) {
      console.error("[AuthService] Send OTP failed:", error);
      return {
        success: false,
        message: error.message || "Không thể gửi OTP. Vui lòng thử lại.",
      };
    }
  }

  /**
   * Verify OTP and login/register
   * Endpoint: POST /auth/otp/verify
   *
   * NOTE: Backend cần có endpoint này, nếu chưa có sẽ sử dụng /zalo/verify-otp
   */
  async verifyOTP(request: VerifyOTPRequest): Promise<VerifyOTPResult> {
    try {
      const phone = formatPhoneNumber(request.phone);
      console.log("[AuthService] Verifying OTP for:", phone);

      let response: any;

      // Try new unified endpoint first
      try {
        response = await apiFetch<any>("/auth/otp/verify", {
          method: "POST",
          data: {
            phone,
            otp: request.otp,
            sessionId: request.sessionId,
          },
        });
      } catch (primaryError: any) {
        // Fallback to /zalo/verify-otp
        if (primaryError.status === 404) {
          console.log("[AuthService] Fallback to /zalo/verify-otp");

          response = await apiFetch<any>("/zalo/verify-otp", {
            method: "POST",
            data: {
              phone,
              otp: request.otp,
              sessionId: request.sessionId,
            },
          });
        } else {
          throw primaryError;
        }
      }

      if (!response.success && !response.accessToken) {
        return {
          success: false,
          message: response.message || "Mã OTP không đúng",
        };
      }

      // Success - extract tokens and user
      const user = response.user
        ? mapToAuthUser(response.user)
        : {
            id: phone,
            email: `phone_${phone}@baotienweb.cloud`,
            phone,
            role: "CLIENT" as UserRole,
            isActive: true,
          };

      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      await persistTokens(tokens);

      // Trust device for 30 days (no OTP needed)
      try {
        await trustedDeviceService.trustDevice(phone, user.id, tokens);
        console.log("[AuthService] Device trusted for 30 days");
      } catch (trustError) {
        console.warn("[AuthService] Could not trust device:", trustError);
      }

      console.log("[AuthService] OTP verification successful");

      return {
        success: true,
        message: response.message || "Xác thực OTP thành công",
        user,
        tokens,
        isNewUser: response.isNewUser,
      };
    } catch (error: any) {
      console.error("[AuthService] Verify OTP failed:", error);
      return {
        success: false,
        message: error.message || "Mã OTP không đúng. Vui lòng thử lại.",
      };
    }
  }

  /**
   * Register with phone after OTP verification
   * Endpoint: POST /auth/register-phone
   */
  async registerWithPhone(data: PhoneRegisterData): Promise<AuthResult> {
    try {
      const phone = formatPhoneNumber(data.phone);
      console.log("[AuthService] Register with phone:", phone);

      // Try unified endpoint first
      let response: any;

      try {
        response = await apiFetch<any>("/auth/register-phone", {
          method: "POST",
          data: {
            phone,
            name: data.name,
            email: data.email,
            password: data.password,
          },
        });
      } catch (primaryError: any) {
        // Fallback to /zalo/register-phone
        if (primaryError.status === 404) {
          response = await apiFetch<any>("/zalo/register-phone", {
            method: "POST",
            data: {
              phone,
              name: data.name,
              email: data.email,
              password: data.password,
            },
          });
        } else {
          throw primaryError;
        }
      }

      if (!response.accessToken) {
        return {
          success: false,
          message: response.message || "Đăng ký thất bại",
        };
      }

      const user = response.user
        ? mapToAuthUser(response.user)
        : {
            id: phone,
            email: data.email || `phone_${phone}@baotienweb.cloud`,
            name: data.name,
            phone,
            role: "CLIENT" as UserRole,
            isActive: true,
          };

      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      await persistTokens(tokens);

      console.log("[AuthService] Phone registration successful");

      return {
        success: true,
        message: "Đăng ký thành công",
        user,
        tokens,
        isNewUser: true,
      };
    } catch (error: any) {
      console.error("[AuthService] Register with phone failed:", error);
      return {
        success: false,
        message: error.message || "Đăng ký thất bại. Vui lòng thử lại.",
      };
    }
  }

  // ============ ZALO MINI APP AUTH ============

  /**
   * Login with Zalo Mini App
   * Endpoint: POST /auth/zalo-miniapp
   */
  async loginWithZalo(request: ZaloLoginRequest): Promise<AuthResult> {
    try {
      console.log("[AuthService] Login with Zalo:", request.zaloUserId);

      const response = await apiFetch<any>("/auth/zalo-miniapp", {
        method: "POST",
        data: {
          zaloUserId: request.zaloUserId,
          zaloAccessToken: request.accessToken,
          name: request.userInfo.name,
          avatar: request.userInfo.avatar,
          phone: request.userInfo.phone,
        },
      });

      if (!response.accessToken) {
        return {
          success: false,
          message: response.message || "Đăng nhập Zalo thất bại",
        };
      }

      const user = response.user
        ? mapToAuthUser(response.user)
        : {
            id: request.zaloUserId,
            email: `zalo_${request.zaloUserId}@baotienweb.cloud`,
            name: request.userInfo.name,
            phone: request.userInfo.phone,
            avatar: request.userInfo.avatar,
            role: "CLIENT" as UserRole,
            isActive: true,
          };

      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      await persistTokens(tokens);

      console.log("[AuthService] Zalo login successful");

      return {
        success: true,
        message: "Đăng nhập Zalo thành công",
        user,
        tokens,
        isNewUser: response.isNewUser,
      };
    } catch (error: any) {
      console.error("[AuthService] Zalo login failed:", error);
      return {
        success: false,
        message: error.message || "Đăng nhập Zalo thất bại. Vui lòng thử lại.",
      };
    }
  }

  // ============ TRUSTED DEVICE ============

  /**
   * Check if device is trusted (no OTP required)
   */
  async checkTrustedDevice(phone: string): Promise<{
    trusted: boolean;
    daysRemaining?: number;
    deviceName?: string;
  }> {
    try {
      const formattedPhone = formatPhoneNumber(phone);
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
      console.error("[AuthService] Check trusted device error:", error);
      return { trusted: false };
    }
  }

  /**
   * Auto-login with trusted device (no OTP required)
   */
  async autoLoginWithTrustedDevice(phone: string): Promise<AuthResult> {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      console.log("[AuthService] Auto-login attempt for:", formattedPhone);

      const tokens = await trustedDeviceService.autoLogin(formattedPhone);

      if (!tokens) {
        return {
          success: false,
          message: "Thiết bị không được tin tưởng. Vui lòng xác thực OTP.",
        };
      }

      await persistTokens(tokens);

      // Get current user info
      try {
        const userInfo = await this.getCurrentUser();
        if (userInfo) {
          console.log("[AuthService] Auto-login successful");
          return {
            success: true,
            message: "Đăng nhập tự động thành công",
            user: userInfo,
            tokens,
          };
        }
      } catch (userError) {
        console.warn("[AuthService] Could not get user info:", userError);
      }

      return {
        success: true,
        message: "Đăng nhập tự động thành công",
        tokens,
      };
    } catch (error: any) {
      console.error("[AuthService] Auto-login failed:", error);
      return {
        success: false,
        message: error.message || "Không thể đăng nhập tự động.",
      };
    }
  }

  // ============ SESSION MANAGEMENT ============

  /**
   * Get current user profile
   * Endpoint: GET /auth/me
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiFetch<any>("/auth/me", {
        method: "GET",
      });

      return mapToAuthUser(response);
    } catch (error) {
      console.error("[AuthService] Get current user failed:", error);
      return null;
    }
  }

  /**
   * Refresh access token
   * Endpoint: POST /auth/refresh
   */
  async refreshToken(): Promise<AuthTokens | null> {
    try {
      const currentRefreshToken = await getRefreshToken();

      if (!currentRefreshToken) {
        console.warn("[AuthService] No refresh token available");
        return null;
      }

      const response = await apiFetch<{
        accessToken: string;
        refreshToken?: string;
      }>("/auth/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentRefreshToken}`,
        },
      });

      const tokens: AuthTokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken || currentRefreshToken,
      };

      await persistTokens(tokens);

      console.log("[AuthService] Token refreshed successfully");
      return tokens;
    } catch (error) {
      console.error("[AuthService] Token refresh failed:", error);
      return null;
    }
  }

  /**
   * Logout - clear all tokens and session
   */
  async logout(): Promise<void> {
    try {
      console.log("[AuthService] Logging out...");

      // Clear stored tokens
      await clearTokens();

      // Clear API client tokens
      clearToken();
      setRefreshToken(null);

      console.log("[AuthService] Logout successful");
    } catch (error) {
      console.error("[AuthService] Logout error:", error);
    }
  }

  /**
   * Clear trusted device for a phone number
   */
  async clearTrustedDevice(phone: string): Promise<void> {
    try {
      const formattedPhone = formatPhoneNumber(phone);
      await trustedDeviceService.removeTrustedDevice(formattedPhone);
      console.log("[AuthService] Trusted device cleared for:", formattedPhone);
    } catch (error) {
      console.warn("[AuthService] Could not clear trusted device:", error);
    }
  }

  // ============ PASSWORD RESET ============

  /**
   * Request password reset
   * Endpoint: POST /auth/forgot-password
   */
  async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("[AuthService] Request password reset for:", email);

      const response = await apiFetch<{ success: boolean; message: string }>(
        "/auth/forgot-password",
        {
          method: "POST",
          data: { email },
        }
      );

      return {
        success: true,
        message:
          response.message || "Đã gửi link reset mật khẩu đến email của bạn",
      };
    } catch (error: any) {
      console.error("[AuthService] Forgot password failed:", error);
      return {
        success: false,
        message: error.message || "Không thể gửi email reset mật khẩu.",
      };
    }
  }

  /**
   * Reset password with token
   * Endpoint: POST /auth/reset-password
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("[AuthService] Reset password with token");

      const response = await apiFetch<{ success: boolean; message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          data: { token, newPassword },
        }
      );

      return {
        success: true,
        message: response.message || "Mật khẩu đã được đặt lại thành công",
      };
    } catch (error: any) {
      console.error("[AuthService] Reset password failed:", error);
      return {
        success: false,
        message: error.message || "Không thể đặt lại mật khẩu.",
      };
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export types
export default authService;
