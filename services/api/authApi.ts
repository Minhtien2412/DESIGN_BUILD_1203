/**
 * ⭐ CANONICAL Authentication API Client
 * Backend: https://baotienweb.cloud/api/v1/auth
 * Enhanced with OTP and Social Login support
 *
 * This is THE primary auth service for the app.
 * Used by AuthContext.tsx (core auth provider).
 * All other auth files (services/authApi.ts, services/auth.ts, etc.) are legacy/fallback.
 */

import ENV from "../../config/env";
import { apiFetch } from "../api";

const BASE_URL = `${ENV.API_BASE_URL}/auth`;

// Debug log
console.log("[authApi] BASE_URL:", BASE_URL);
console.log("[authApi] ENV.API_BASE_URL:", ENV.API_BASE_URL);

// ==================== TYPES ====================

// Backend Role enum
export type UserRole =
  | "CLIENT"
  | "ENGINEER"
  | "CONTRACTOR"
  | "ARCHITECT"
  | "DESIGNER"
  | "SUPPLIER"
  | "STAFF"
  | "ADMIN";

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
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
  faceEmbedding?: number[];
  faceImageUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// ==================== API METHODS ====================

export interface FaceVerificationRequired {
  requireFaceVerification: true;
  userId: number;
  reason: string;
}

/**
 * Login with email and password
 * Endpoint: POST /auth/login
 * Returns JWT tokens and user info, or face verification requirement
 */
export async function login(
  dto: LoginDto,
): Promise<AuthResponse | FaceVerificationRequired> {
  try {
    console.log("[authApi] Attempting login with:", { email: dto.email });
    return await apiFetch<AuthResponse | FaceVerificationRequired>(
      "/auth/login",
      {
        method: "POST",
        data: dto,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("[authApi] login error:", error);
    throw error;
  }
}

/**
 * Register a new user
 * Endpoint: POST /auth/register
 * Returns JWT tokens and user info
 */
export async function register(dto: RegisterDto): Promise<AuthResponse> {
  try {
    console.log("[authApi] Attempting registration with:", {
      email: dto.email,
      role: dto.role,
    });
    return await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      data: dto,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[authApi] register error:", error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 * Endpoint: POST /auth/refresh
 * NOTE: Backend uses JwtRefreshAuthGuard which expects refreshToken in Bearer header
 * Returns new access token and refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshTokenResponse> {
  try {
    console.log("[authApi] Attempting token refresh");
    return await apiFetch<RefreshTokenResponse>("/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  } catch (error) {
    console.error("[authApi] refreshAccessToken error:", error);
    throw error;
  }
}

/**
 * Get current user profile (requires authentication)
 * Endpoint: GET /auth/me
 * Returns user info
 */
export async function getProfile(accessToken: string): Promise<User> {
  try {
    return await apiFetch<User>("/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error) {
    console.error("[authApi] getProfile error:", error);
    throw error;
  }
}

/**
 * Get current user profile without passing token (uses stored token)
 * Endpoint: GET /auth/me
 */
export async function getCurrentUser(): Promise<User> {
  try {
    return await apiFetch<User>("/auth/me", {
      method: "GET",
    });
  } catch (error) {
    console.error("[authApi] getCurrentUser error:", error);
    throw error;
  }
}

/**
 * Logout — revoke server session and refresh token
 * Endpoint: POST /auth/logout
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (error) {
    // Best-effort: don't block client-side cleanup if server call fails
    console.warn("[authApi] logout error (non-blocking):", error);
  }
}

// ==================== OTP TYPES ====================

export interface SendOtpDto {
  type: "phone" | "email";
  value: string;
  purpose: "register" | "reset-password" | "verify-phone" | "verify-email";
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  retryAfter?: number;
}

export interface VerifyOtpDto {
  type: "phone" | "email";
  value: string;
  code: string;
  otp?: string;
  purpose: "register" | "reset-password" | "verify-phone" | "verify-email";
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string;
}

// ==================== OTP API METHODS ====================

/**
 * Send OTP to phone number or email
 * Endpoint: POST /auth/otp/send
 */
export async function sendOtp(dto: SendOtpDto): Promise<SendOtpResponse> {
  try {
    console.log("[authApi] Sending OTP to:", dto.value);
    return await apiFetch<SendOtpResponse>("/auth/otp/send", {
      method: "POST",
      data: {
        identifier: dto.value,
        channel: dto.type === "phone" ? "SMS" : "EMAIL",
        purpose: "LOGIN",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[authApi] sendOtp error:", error);
    throw error;
  }
}

/**
 * Verify OTP code
 * Endpoint: POST /auth/otp/verify
 */
export async function verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
  try {
    console.log("[authApi] Verifying OTP for:", dto.value);
    return await apiFetch<VerifyOtpResponse>("/auth/otp/verify", {
      method: "POST",
      data: {
        identifier: dto.value,
        otp: dto.otp,
        channel: dto.type === "phone" ? "SMS" : "EMAIL",
        purpose: "LOGIN",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[authApi] verifyOtp error:", error);
    throw error;
  }
}

// ==================== SOCIAL LOGIN TYPES ====================

export interface SocialLoginDto {
  provider: "GOOGLE" | "FACEBOOK" | "ZALO" | "APPLE";
  token: string; // OAuth id_token or access_token from provider
  userData?: {
    email?: string;
    name?: string;
    avatar?: string;
    picture?: string;
  };
}

/**
 * Social login (Google, Facebook, Apple, Zalo)
 * Endpoint: POST /auth/social
 */
export async function socialLogin(
  provider: string,
  data: { token: string; email?: string; name?: string; picture?: string },
): Promise<AuthResponse> {
  try {
    console.log("[authApi] Social login via:", provider);
    return await apiFetch<AuthResponse>("/auth/social", {
      method: "POST",
      data: {
        provider: provider.toUpperCase(),
        token: data.token,
        email: data.email || "",
        name: data.name || "",
        picture: data.picture || "",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[authApi] socialLogin error:", error);
    throw error;
  }
}

// ==================== PASSWORD RESET ====================

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

/**
 * Request password reset
 * Endpoint: POST /auth/forgot-password
 */
export async function forgotPassword(
  dto: ForgotPasswordDto,
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("[authApi] Requesting password reset for:", dto.email);
    return await apiFetch("/auth/forgot-password", {
      method: "POST",
      data: dto,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[authApi] forgotPassword error:", error);
    throw error;
  }
}

/**
 * Reset password with token
 * Endpoint: POST /auth/reset-password
 */
export async function resetPassword(
  dto: ResetPasswordDto,
): Promise<{ success: boolean; message: string }> {
  try {
    console.log("[authApi] Resetting password with token");
    return await apiFetch("/auth/reset-password", {
      method: "POST",
      data: dto,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[authApi] resetPassword error:", error);
    throw error;
  }
}

// ==================== 2FA (Two-Factor Authentication) ====================

// 2FA Registration Types
export interface TwoFARegisterSendOtpDto {
  email: string;
}

export interface TwoFARegisterSendOtpResponse {
  success: boolean;
  message: string;
}

export interface TwoFARegisterVerifyDto {
  email: string;
  otp: string;
  password: string;
  name: string;
  phone?: string;
}

export interface TwoFARegisterVerifyResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// 2FA Login Types
export interface TwoFALoginRequestOtpDto {
  email: string;
  password: string;
}

export interface TwoFALoginRequestOtpResponse {
  success: boolean;
  message: string;
  tempToken: string; // Temporary token for 2FA verification
}

export interface TwoFALoginVerifyDto {
  email: string;
  tempToken: string;
  otp: string;
}

export interface TwoFALoginVerifyResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface TwoFAResendOtpDto {
  email: string;
}

export interface TwoFAResendOtpResponse {
  success: boolean;
  message: string;
}

// ==================== 2FA API METHODS ====================

/**
 * 2FA Registration - Step 1: Send OTP to email
 * Endpoint: POST /auth/2fa/register/send-otp
 */
export async function twoFARegisterSendOtp(
  dto: TwoFARegisterSendOtpDto,
): Promise<TwoFARegisterSendOtpResponse> {
  try {
    console.log("[authApi] 2FA Register - Sending OTP to:", dto.email);
    return await apiFetch<TwoFARegisterSendOtpResponse>(
      "/auth/2fa/register/send-otp",
      {
        method: "POST",
        data: dto,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[authApi] twoFARegisterSendOtp error:", error);
    throw error;
  }
}

/**
 * 2FA Registration - Step 2: Verify OTP and create account
 * Endpoint: POST /auth/2fa/register/verify
 */
export async function twoFARegisterVerify(
  dto: TwoFARegisterVerifyDto,
): Promise<TwoFARegisterVerifyResponse> {
  try {
    console.log("[authApi] 2FA Register - Verifying OTP for:", dto.email);
    return await apiFetch<TwoFARegisterVerifyResponse>(
      "/auth/2fa/register/verify",
      {
        method: "POST",
        data: dto,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[authApi] twoFARegisterVerify error:", error);
    throw error;
  }
}

/**
 * 2FA Registration - Resend OTP
 * Endpoint: POST /auth/2fa/register/resend-otp
 */
export async function twoFARegisterResendOtp(
  dto: TwoFAResendOtpDto,
): Promise<TwoFAResendOtpResponse> {
  try {
    console.log("[authApi] 2FA Register - Resending OTP to:", dto.email);
    return await apiFetch<TwoFAResendOtpResponse>(
      "/auth/2fa/register/resend-otp",
      {
        method: "POST",
        data: dto,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[authApi] twoFARegisterResendOtp error:", error);
    throw error;
  }
}

/**
 * 2FA Login - Step 1: Verify password and request OTP
 * Endpoint: POST /auth/2fa/login/request-otp
 */
export async function twoFALoginRequestOtp(
  dto: TwoFALoginRequestOtpDto,
): Promise<TwoFALoginRequestOtpResponse> {
  try {
    console.log("[authApi] 2FA Login - Requesting OTP for:", dto.email);
    return await apiFetch<TwoFALoginRequestOtpResponse>(
      "/auth/2fa/login/request-otp",
      {
        method: "POST",
        data: dto,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[authApi] twoFALoginRequestOtp error:", error);
    throw error;
  }
}

/**
 * 2FA Login - Step 2: Verify OTP and get tokens
 * Endpoint: POST /auth/2fa/login/verify
 */
export async function twoFALoginVerify(
  dto: TwoFALoginVerifyDto,
): Promise<TwoFALoginVerifyResponse> {
  try {
    console.log("[authApi] 2FA Login - Verifying OTP for:", dto.email);
    return await apiFetch<TwoFALoginVerifyResponse>("/auth/2fa/login/verify", {
      method: "POST",
      data: dto,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[authApi] twoFALoginVerify error:", error);
    throw error;
  }
}

/**
 * 2FA Login - Resend OTP
 * Endpoint: POST /auth/2fa/login/resend-otp
 */
export async function twoFALoginResendOtp(
  dto: TwoFAResendOtpDto,
): Promise<TwoFAResendOtpResponse> {
  try {
    console.log("[authApi] 2FA Login - Resending OTP to:", dto.email);
    return await apiFetch<TwoFAResendOtpResponse>(
      "/auth/2fa/login/resend-otp",
      {
        method: "POST",
        data: dto,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("[authApi] twoFALoginResendOtp error:", error);
    throw error;
  }
}

// ==================== EXPORTS ====================

export const authApi = {
  login,
  register,
  refreshAccessToken,
  getProfile,
  getCurrentUser,
  // OTP
  sendOtp,
  verifyOtp,
  // Social Login
  socialLogin,
  // Password Reset
  forgotPassword,
  resetPassword,
  // 2FA (Two-Factor Authentication)
  twoFARegisterSendOtp,
  twoFARegisterVerify,
  twoFARegisterResendOtp,
  twoFALoginRequestOtp,
  twoFALoginVerify,
  twoFALoginResendOtp,
  // Generic POST helper for custom endpoints
  post: async (endpoint: string, data: any) => {
    return await apiFetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

export default authApi;
