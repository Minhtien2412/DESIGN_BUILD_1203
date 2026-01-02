/**
 * Authentication API Client
 * Backend: https://baotienweb.cloud/api/v1/auth
 * Enhanced with OTP and Social Login support
 */

import ENV from '../../config/env';
import { apiFetch } from '../api';

const BASE_URL = `${ENV.API_BASE_URL}/auth`;

// Debug log
console.log('[authApi] BASE_URL:', BASE_URL);
console.log('[authApi] ENV.API_BASE_URL:', ENV.API_BASE_URL);

// ==================== TYPES ====================

// Backend Role enum
export type UserRole = 'CLIENT' | 'ENGINEER' | 'CONTRACTOR' | 'ARCHITECT' | 'DESIGNER' | 'SUPPLIER' | 'STAFF' | 'ADMIN';

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

/**
 * Login with email and password
 * Endpoint: POST /auth/login
 * Returns JWT tokens and user info
 */
export async function login(dto: LoginDto): Promise<AuthResponse> {
  try {
    console.log('[authApi] Attempting login with:', { email: dto.email });
    return await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      data: dto,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[authApi] login error:', error);
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
    console.log('[authApi] Attempting registration with:', { email: dto.email, role: dto.role });
    return await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      data: dto,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[authApi] register error:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 * Endpoint: POST /auth/refresh
 * Returns new access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  try {
    console.log('[authApi] Attempting token refresh');
    return await apiFetch<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      data: { refreshToken },
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[authApi] refreshAccessToken error:', error);
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
    return await apiFetch<User>('/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  } catch (error) {
    console.error('[authApi] getProfile error:', error);
    throw error;
  }
}

/**
 * Get current user profile without passing token (uses stored token)
 * Endpoint: GET /auth/me
 */
export async function getCurrentUser(): Promise<User> {
  try {
    return await apiFetch<User>('/auth/me', {
      method: 'GET',
    });
  } catch (error) {
    console.error('[authApi] getCurrentUser error:', error);
    throw error;
  }
}

// ==================== OTP TYPES ====================

export interface SendOtpDto {
  type: 'phone' | 'email';
  value: string;
  purpose: 'register' | 'reset-password' | 'verify-phone' | 'verify-email';
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  retryAfter?: number;
}

export interface VerifyOtpDto {
  type: 'phone' | 'email';
  value: string;
  code: string;
  purpose: 'register' | 'reset-password' | 'verify-phone' | 'verify-email';
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string;
}

// ==================== OTP API METHODS ====================

/**
 * Send OTP to phone number or email
 * Endpoint: POST /auth/send-otp
 */
export async function sendOtp(dto: SendOtpDto): Promise<SendOtpResponse> {
  try {
    console.log('[authApi] Sending OTP to:', dto.value);
    return await apiFetch<SendOtpResponse>('/auth/send-otp', {
      method: 'POST',
      data: dto,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[authApi] sendOtp error:', error);
    throw error;
  }
}

/**
 * Verify OTP code
 * Endpoint: POST /auth/verify-otp
 */
export async function verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
  try {
    console.log('[authApi] Verifying OTP for:', dto.value);
    return await apiFetch<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      data: dto,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[authApi] verifyOtp error:', error);
    throw error;
  }
}

// ==================== SOCIAL LOGIN TYPES ====================

export interface SocialLoginDto {
  provider: 'google' | 'facebook' | 'apple';
  token: string; // OAuth token from provider
  userData?: {
    email?: string;
    name?: string;
    avatar?: string;
  };
}

/**
 * Social login (Google, Facebook, Apple)
 * Endpoint: POST /auth/social-login
 */
export async function socialLogin(dto: SocialLoginDto): Promise<AuthResponse> {
  try {
    console.log('[authApi] Social login via:', dto.provider);
    return await apiFetch<AuthResponse>('/auth/social-login', {
      method: 'POST',
      data: dto,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[authApi] socialLogin error:', error);
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
export async function forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[authApi] Requesting password reset for:', dto.email);
    return await apiFetch('/auth/forgot-password', {
      method: 'POST',
      data: dto,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[authApi] forgotPassword error:', error);
    throw error;
  }
}

/**
 * Reset password with token
 * Endpoint: POST /auth/reset-password
 */
export async function resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[authApi] Resetting password with token');
    return await apiFetch('/auth/reset-password', {
      method: 'POST',
      data: dto,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[authApi] resetPassword error:', error);
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
};

export default authApi;
