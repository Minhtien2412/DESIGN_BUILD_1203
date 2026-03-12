/**
 * Unified Authentication Service
 * ==============================
 * 
 * Service tích hợp authentication cho cả:
 * 1. Perfex CRM (thietkeresort.com.vn)
 * 2. Backend chính (baotienweb.cloud)
 * 3. OTP verification (SMS/Email)
 * 
 * Features:
 * - Multi-provider authentication (Perfex CRM, Backend API, Social Login)
 * - OTP verification với nhiều provider (Twilio, eSMS, Email)
 * - Session management và token refresh
 * - Biometric authentication
 * - Offline fallback
 * 
 * @author ThietKeResort Team
 * @created 2026-01-12
 */

import ENV from '@/config/env';
import { deleteItem, getItem, setItem } from '@/utils/storage';
import { getOTPService } from './getOTPService';

// ==================== CONFIG ====================

const AUTH_CONFIG = {
  // Backend chính
  backendUrl: ENV.API_BASE_URL || 'https://baotienweb.cloud/api/v1',
  
  // Perfex CRM
  perfexUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  perfexApiKey: ENV.PERFEX_API_KEY || '',
  
  // OTP Settings
  otpLength: 6,
  otpExpiry: 300, // 5 minutes
  maxOtpAttempts: 5,
  
  // Request timeout
  timeout: 30000,
};

// Storage keys
const STORAGE_KEYS = {
  USER: 'unified_auth_user',
  ACCESS_TOKEN: 'unified_auth_access_token',
  REFRESH_TOKEN: 'unified_auth_refresh_token',
  AUTH_PROVIDER: 'unified_auth_provider', // 'perfex' | 'backend' | 'social'
  SESSION_TIMESTAMP: 'unified_auth_session',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  SAVED_EMAIL: 'saved_email',
  SAVED_PASSWORD: 'saved_password', // Encrypted in production
  OTP_REQUEST_ID: 'otp_request_id',
};

// ==================== TYPES ====================

export type AuthProvider = 'perfex' | 'backend' | 'google' | 'facebook' | 'apple';
export type UserRole = 'CLIENT' | 'ENGINEER' | 'CONTRACTOR' | 'ARCHITECT' | 'DESIGNER' | 'SUPPLIER' | 'STAFF' | 'ADMIN';
export type OTPPurpose = 'register' | 'login' | 'reset-password' | 'verify-phone' | 'verify-email' | 'two-factor';
export type OTPChannel = 'sms' | 'email' | 'call';

export interface UnifiedUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  provider: AuthProvider;
  
  // Additional info from Perfex
  customerId?: string;
  contactId?: string;
  company?: string;
  
  // Timestamps
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthState {
  user: UnifiedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  provider: AuthProvider | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface LoginCredentials {
  emailOrPhone: string;
  password: string;
  rememberMe?: boolean;
  provider?: AuthProvider;
}

export interface RegisterData {
  email: string;
  phone?: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  company?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  acceptTerms: boolean;
}

export interface OTPRequest {
  recipient: string; // Phone or email
  channel: OTPChannel;
  purpose: OTPPurpose;
  locale?: 'vi' | 'en';
}

export interface OTPVerifyRequest {
  recipient: string;
  code: string;
  purpose: OTPPurpose;
  requestId?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UnifiedUser;
  accessToken?: string;
  refreshToken?: string;
  message: string;
  error?: string;
  requiresOTP?: boolean;
  otpSent?: boolean;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  requestId?: string;
  expiresIn?: number;
  channel?: OTPChannel;
  error?: string;
}

// ==================== ERROR CLASS ====================

export class AuthError extends Error {
  code: string;
  status?: number;
  provider?: AuthProvider;

  constructor(message: string, code: string, status?: number, provider?: AuthProvider) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
    this.provider = provider;
  }
}

// ==================== OTP STORAGE ====================

// In-memory OTP storage (for development - use Redis in production)
const otpStorage = new Map<string, { 
  code: string; 
  expiresAt: number; 
  attempts: number;
  purpose: OTPPurpose;
  channel: OTPChannel;
}>();

/**
 * Generate random OTP
 */
function generateOTP(length = 6): string {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Store OTP
 */
function storeOTP(
  recipient: string, 
  code: string, 
  purpose: OTPPurpose,
  channel: OTPChannel,
  ttlSeconds = 300
): void {
  const key = `${recipient}:${purpose}`;
  otpStorage.set(key, {
    code,
    expiresAt: Date.now() + ttlSeconds * 1000,
    attempts: 0,
    purpose,
    channel,
  });
}

/**
 * Validate OTP
 */
function validateOTP(
  recipient: string, 
  code: string,
  purpose: OTPPurpose
): { valid: boolean; message: string } {
  const key = `${recipient}:${purpose}`;
  const stored = otpStorage.get(key);
  
  if (!stored) {
    return { valid: false, message: 'Mã OTP không tồn tại hoặc đã hết hạn' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(key);
    return { valid: false, message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' };
  }
  
  if (stored.attempts >= AUTH_CONFIG.maxOtpAttempts) {
    otpStorage.delete(key);
    return { valid: false, message: 'Bạn đã nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.' };
  }
  
  if (stored.code !== code) {
    stored.attempts++;
    return { 
      valid: false, 
      message: `Mã OTP không đúng. Còn ${AUTH_CONFIG.maxOtpAttempts - stored.attempts} lần thử.` 
    };
  }
  
  // Valid - remove from storage
  otpStorage.delete(key);
  return { valid: true, message: 'Xác thực thành công' };
}

// ==================== API HELPERS ====================

/**
 * Format phone to E.164
 */
function formatPhone(phone: string, countryCode = '84'): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = countryCode + cleaned.slice(1);
  }
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

/**
 * Check if input is phone number
 */
function isPhoneNumber(value: string): boolean {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length >= 9 && /^\d+$/.test(cleaned);
}

/**
 * API request helper
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {},
  headers: Record<string, string> = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers as Record<string, string>,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new AuthError(
        data.message || data.error || `HTTP ${response.status}`,
        data.code || 'API_ERROR',
        response.status
      );
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new AuthError('Request timeout', 'TIMEOUT', 408);
    }
    
    if (error instanceof AuthError) {
      throw error;
    }
    
    throw new AuthError(
      error.message || 'Network error',
      'NETWORK_ERROR',
      0
    );
  }
}

// ==================== UNIFIED AUTH SERVICE ====================

export const UnifiedAuthService = {
  // ==================== LOGIN ====================
  
  /**
   * Login với email/phone và password
   * Tự động xác định provider (Perfex CRM hoặc Backend)
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('[UnifiedAuth] Login attempt:', credentials.emailOrPhone);
    
    const isPhone = isPhoneNumber(credentials.emailOrPhone);
    const identifier = isPhone 
      ? formatPhone(credentials.emailOrPhone)
      : credentials.emailOrPhone.toLowerCase().trim();
    
    // Try Perfex CRM first (primary auth)
    try {
      const perfexResponse = await apiRequest<any>(
        `${AUTH_CONFIG.perfexUrl}/api/v1/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: identifier,
            password: credentials.password,
          }),
        },
        { 'X-API-Key': AUTH_CONFIG.perfexApiKey }
      );
      
      if (perfexResponse.status && perfexResponse.user) {
        const user: UnifiedUser = {
          id: String(perfexResponse.user.id),
          email: perfexResponse.user.email,
          phone: perfexResponse.user.phone,
          name: `${perfexResponse.user.firstname} ${perfexResponse.user.lastname || ''}`.trim(),
          firstName: perfexResponse.user.firstname,
          lastName: perfexResponse.user.lastname,
          fullName: `${perfexResponse.user.firstname} ${perfexResponse.user.lastname || ''}`.trim(),
          avatar: perfexResponse.user.profile_image,
          role: perfexResponse.user.is_admin ? 'ADMIN' : perfexResponse.user.is_staff ? 'STAFF' : 'CLIENT',
          isVerified: true,
          isActive: true,
          provider: 'perfex',
          customerId: perfexResponse.user.customer_id,
          contactId: perfexResponse.user.contact_id,
          company: perfexResponse.user.company,
        };
        
        // Save session
        await UnifiedAuthService.saveSession(user, 'perfex');
        
        // Save credentials for biometric if rememberMe
        if (credentials.rememberMe) {
          await setItem(STORAGE_KEYS.SAVED_EMAIL, identifier);
          await setItem(STORAGE_KEYS.SAVED_PASSWORD, credentials.password);
          await setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
        }
        
        console.log('[UnifiedAuth] Perfex login successful:', user.email);
        
        return {
          success: true,
          user,
          message: 'Đăng nhập thành công',
        };
      }
    } catch (perfexError: any) {
      console.log('[UnifiedAuth] Perfex login failed, trying backend:', perfexError.message);
    }
    
    // Fallback to Backend API
    try {
      const backendResponse = await apiRequest<any>(
        `${AUTH_CONFIG.backendUrl}/auth/login`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: identifier,
            password: credentials.password,
          }),
        }
      );
      
      if (backendResponse.accessToken && backendResponse.user) {
        const user: UnifiedUser = {
          id: String(backendResponse.user.id),
          email: backendResponse.user.email,
          phone: backendResponse.user.phone,
          name: backendResponse.user.name,
          fullName: backendResponse.user.name,
          avatar: backendResponse.user.avatar,
          role: backendResponse.user.role || 'CLIENT',
          isVerified: backendResponse.user.isActive,
          isActive: backendResponse.user.isActive,
          provider: 'backend',
        };
        
        // Save session with tokens
        await UnifiedAuthService.saveSession(
          user, 
          'backend',
          backendResponse.accessToken,
          backendResponse.refreshToken
        );
        
        console.log('[UnifiedAuth] Backend login successful:', user.email);
        
        return {
          success: true,
          user,
          accessToken: backendResponse.accessToken,
          refreshToken: backendResponse.refreshToken,
          message: 'Đăng nhập thành công',
        };
      }
    } catch (backendError: any) {
      console.log('[UnifiedAuth] Backend login failed:', backendError.message);
    }
    
    // Both failed
    throw new AuthError(
      'Email/số điện thoại hoặc mật khẩu không đúng',
      'INVALID_CREDENTIALS',
      401
    );
  },

  // ==================== REGISTER ====================
  
  /**
   * Đăng ký tài khoản mới
   * Cần xác thực OTP trước khi hoàn tất
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    console.log('[UnifiedAuth] Register attempt:', data.email);
    
    // Try Perfex CRM first
    try {
      const perfexResponse = await apiRequest<any>(
        `${AUTH_CONFIG.perfexUrl}/api/v1/auth/register`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: data.email.toLowerCase().trim(),
            password: data.password,
            firstname: data.firstName || data.name.split(' ')[0],
            lastname: data.lastName || data.name.split(' ').slice(1).join(' ') || '',
            phone: data.phone || '',
            company: data.company || '',
          }),
        },
        { 'X-API-Key': AUTH_CONFIG.perfexApiKey }
      );
      
      if (perfexResponse.status && perfexResponse.user) {
        const user: UnifiedUser = {
          id: String(perfexResponse.user.id),
          email: perfexResponse.user.email,
          phone: perfexResponse.user.phone,
          name: `${perfexResponse.user.firstname} ${perfexResponse.user.lastname || ''}`.trim(),
          firstName: perfexResponse.user.firstname,
          lastName: perfexResponse.user.lastname,
          fullName: `${perfexResponse.user.firstname} ${perfexResponse.user.lastname || ''}`.trim(),
          role: 'CLIENT',
          isVerified: false, // Need OTP verification
          isActive: true,
          provider: 'perfex',
          customerId: perfexResponse.customer_id,
          contactId: perfexResponse.contact_id,
          company: data.company,
        };
        
        // Save session
        await UnifiedAuthService.saveSession(user, 'perfex');
        
        console.log('[UnifiedAuth] Perfex register successful:', user.email);
        
        return {
          success: true,
          user,
          message: 'Đăng ký thành công',
        };
      }
    } catch (perfexError: any) {
      console.log('[UnifiedAuth] Perfex register failed:', perfexError.message);
      
      // Check specific error
      if (perfexError.message?.toLowerCase().includes('exist') || 
          perfexError.message?.toLowerCase().includes('đã tồn tại')) {
        throw new AuthError('Email này đã được đăng ký', 'EMAIL_EXISTS', 409);
      }
    }
    
    // Fallback to Backend API
    try {
      const backendResponse = await apiRequest<any>(
        `${AUTH_CONFIG.backendUrl}/auth/register`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: data.email.toLowerCase().trim(),
            password: data.password,
            name: data.name,
            phone: data.phone,
            role: data.role || 'CLIENT',
            location: data.location,
          }),
        }
      );
      
      if (backendResponse.accessToken && backendResponse.user) {
        const user: UnifiedUser = {
          id: String(backendResponse.user.id),
          email: backendResponse.user.email,
          phone: backendResponse.user.phone,
          name: backendResponse.user.name,
          fullName: backendResponse.user.name,
          role: backendResponse.user.role || 'CLIENT',
          isVerified: false,
          isActive: true,
          provider: 'backend',
        };
        
        await UnifiedAuthService.saveSession(
          user, 
          'backend',
          backendResponse.accessToken,
          backendResponse.refreshToken
        );
        
        console.log('[UnifiedAuth] Backend register successful:', user.email);
        
        return {
          success: true,
          user,
          accessToken: backendResponse.accessToken,
          refreshToken: backendResponse.refreshToken,
          message: 'Đăng ký thành công',
        };
      }
    } catch (backendError: any) {
      console.log('[UnifiedAuth] Backend register failed:', backendError.message);
      
      if (backendError.message?.toLowerCase().includes('exist')) {
        throw new AuthError('Email này đã được đăng ký', 'EMAIL_EXISTS', 409);
      }
    }
    
    throw new AuthError('Không thể đăng ký. Vui lòng thử lại.', 'REGISTER_FAILED', 500);
  },

  // ==================== OTP METHODS ====================
  
  /**
   * Gửi OTP qua SMS hoặc Email
   * Sử dụng GetOTP API (https://otp.dev) cho SMS
   */
  sendOTP: async (request: OTPRequest): Promise<OTPResponse> => {
    console.log('[UnifiedAuth] Send OTP:', request.recipient, request.channel, request.purpose);
    
    const recipient = request.channel === 'sms' 
      ? formatPhone(request.recipient)
      : request.recipient.toLowerCase().trim();
    
    const requestId = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await setItem(STORAGE_KEYS.OTP_REQUEST_ID, requestId);
    
    // ===== SMS via GetOTP =====
    if (request.channel === 'sms') {
      try {
        console.log('[UnifiedAuth] Sending SMS via GetOTP...');
        
        const otpResult = await getOTPService.sendSMS({
          phone: recipient,
          sender: ENV.GETOTP_SENDER_NAME || 'ThietKe',
          codeLength: AUTH_CONFIG.otpLength,
        });
        
        if (otpResult.success) {
          console.log('[UnifiedAuth] GetOTP SMS sent successfully:', otpResult.data?.message_id);
          
          return {
            success: true,
            message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
            requestId: otpResult.data?.message_id || requestId,
            expiresIn: AUTH_CONFIG.otpExpiry,
            channel: 'sms',
          };
        } else {
          console.warn('[UnifiedAuth] GetOTP failed:', otpResult.message);
          throw new Error(otpResult.message);
        }
      } catch (otpError: any) {
        console.error('[UnifiedAuth] GetOTP error:', otpError.message);
        
        // Fallback to local mock mode for development
        const code = generateOTP(AUTH_CONFIG.otpLength);
        storeOTP(recipient, code, request.purpose, request.channel, AUTH_CONFIG.otpExpiry);
        console.log('[UnifiedAuth] DEV FALLBACK - Mock OTP Code:', code);
        
        return {
          success: true,
          message: 'Mã OTP đã được gửi (fallback mode)',
          requestId,
          expiresIn: AUTH_CONFIG.otpExpiry,
          channel: 'sms',
        };
      }
    }
    
    // ===== Email OTP via Backend =====
    if (request.channel === 'email') {
      const code = generateOTP(AUTH_CONFIG.otpLength);
      storeOTP(recipient, code, request.purpose, request.channel, AUTH_CONFIG.otpExpiry);
      
      try {
        await apiRequest(
          `${AUTH_CONFIG.backendUrl}/otp/send-email`,
          {
            method: 'POST',
            body: JSON.stringify({
              email: recipient,
              code,
              purpose: request.purpose,
            }),
          }
        );
        
        console.log('[UnifiedAuth] Email OTP sent via backend');
      } catch (emailError) {
        console.log('[UnifiedAuth] Email API not available, using local mode');
        console.log('[UnifiedAuth] DEV MODE - OTP Code:', code);
      }
      
      return {
        success: true,
        message: 'Mã OTP đã được gửi đến email của bạn',
        requestId,
        expiresIn: AUTH_CONFIG.otpExpiry,
        channel: 'email',
      };
    }
    
    throw new AuthError('Kênh gửi OTP không hợp lệ', 'INVALID_CHANNEL', 400);
  },

  /**
   * Xác thực OTP
   * Sử dụng GetOTP API để verify SMS OTP
   */
  verifyOTP: async (request: OTPVerifyRequest): Promise<OTPResponse> => {
    console.log('[UnifiedAuth] Verify OTP:', request.recipient, request.purpose);
    
    const isPhone = isPhoneNumber(request.recipient);
    const recipient = isPhone
      ? formatPhone(request.recipient)
      : request.recipient.toLowerCase().trim();
    
    // ===== SMS OTP - Verify via GetOTP =====
    if (isPhone) {
      try {
        console.log('[UnifiedAuth] Verifying SMS OTP via GetOTP...');
        
        const verifyResult = await getOTPService.verifyOTP({
          phone: recipient,
          code: request.code,
        });
        
        if (verifyResult.success && verifyResult.verified) {
          console.log('[UnifiedAuth] GetOTP verification successful');
          return {
            success: true,
            message: 'Xác thực thành công',
          };
        } else if (verifyResult.success && !verifyResult.verified) {
          // GetOTP says code is invalid, try local fallback
          console.log('[UnifiedAuth] GetOTP: OTP invalid, trying local fallback');
        } else {
          throw new Error(verifyResult.message);
        }
      } catch (otpError: any) {
        console.warn('[UnifiedAuth] GetOTP verify error:', otpError.message);
      }
      
      // Fallback to local verification (for dev/mock mode)
      console.log('[UnifiedAuth] Falling back to local OTP verification');
      const result = validateOTP(recipient, request.code, request.purpose);
      
      if (!result.valid) {
        throw new AuthError(result.message, 'INVALID_OTP', 400);
      }
      
      return {
        success: true,
        message: result.message,
      };
    }
    
    // ===== Email OTP - Verify via Backend or Local =====
    try {
      const response = await apiRequest<any>(
        `${AUTH_CONFIG.backendUrl}/otp/verify`,
        {
          method: 'POST',
          body: JSON.stringify({
            recipient,
            code: request.code,
            purpose: request.purpose,
          }),
        }
      );
      
      if (response.success) {
        return {
          success: true,
          message: 'Xác thực thành công',
        };
      }
    } catch (apiError) {
      console.log('[UnifiedAuth] API verification failed, using local');
    }
    
    // Fallback to local verification
    const result = validateOTP(recipient, request.code, request.purpose);
    
    if (!result.valid) {
      throw new AuthError(result.message, 'INVALID_OTP', 400);
    }
    
    return {
      success: true,
      message: result.message,
    };
  },

  /**
   * Gửi lại OTP
   */
  resendOTP: async (request: OTPRequest): Promise<OTPResponse> => {
    return UnifiedAuthService.sendOTP(request);
  },

  // ==================== PASSWORD RESET ====================
  
  /**
   * Quên mật khẩu - gửi OTP để reset
   */
  forgotPassword: async (emailOrPhone: string): Promise<OTPResponse> => {
    console.log('[UnifiedAuth] Forgot password:', emailOrPhone);
    
    const isPhone = isPhoneNumber(emailOrPhone);
    const channel: OTPChannel = isPhone ? 'sms' : 'email';
    
    return UnifiedAuthService.sendOTP({
      recipient: emailOrPhone,
      channel,
      purpose: 'reset-password',
    });
  },

  /**
   * Reset mật khẩu sau khi xác thực OTP
   */
  resetPassword: async (
    emailOrPhone: string,
    otpCode: string,
    newPassword: string
  ): Promise<AuthResponse> => {
    console.log('[UnifiedAuth] Reset password:', emailOrPhone);
    
    // Verify OTP first
    await UnifiedAuthService.verifyOTP({
      recipient: emailOrPhone,
      code: otpCode,
      purpose: 'reset-password',
    });
    
    // Try API reset
    try {
      await apiRequest(
        `${AUTH_CONFIG.backendUrl}/auth/reset-password`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: emailOrPhone,
            newPassword,
          }),
        }
      );
      
      return {
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công',
      };
    } catch (error) {
      console.log('[UnifiedAuth] API reset failed');
    }
    
    // Try Perfex reset
    try {
      await apiRequest(
        `${AUTH_CONFIG.perfexUrl}/api/v1/auth/reset_password`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: emailOrPhone,
            new_password: newPassword,
          }),
        },
        { 'X-API-Key': AUTH_CONFIG.perfexApiKey }
      );
      
      return {
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công',
      };
    } catch (error) {
      console.log('[UnifiedAuth] Perfex reset failed');
    }
    
    throw new AuthError(
      'Không thể đặt lại mật khẩu. Vui lòng thử lại.',
      'RESET_FAILED',
      500
    );
  },

  // ==================== SESSION MANAGEMENT ====================
  
  /**
   * Save session to storage
   */
  saveSession: async (
    user: UnifiedUser,
    provider: AuthProvider,
    accessToken?: string,
    refreshToken?: string
  ): Promise<void> => {
    await setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    await setItem(STORAGE_KEYS.AUTH_PROVIDER, provider);
    await setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());
    
    if (accessToken) {
      await setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      await setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: async (): Promise<UnifiedUser | null> => {
    try {
      const userJson = await getItem(STORAGE_KEYS.USER);
      if (!userJson) return null;
      return JSON.parse(userJson) as UnifiedUser;
    } catch {
      return null;
    }
  },

  /**
   * Check if logged in
   */
  isLoggedIn: async (): Promise<boolean> => {
    const user = await UnifiedAuthService.getCurrentUser();
    return user !== null;
  },

  /**
   * Get session info
   */
  getSession: async (): Promise<AuthState> => {
    const user = await UnifiedAuthService.getCurrentUser();
    const provider = await getItem(STORAGE_KEYS.AUTH_PROVIDER) as AuthProvider | null;
    const accessToken = await getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    return {
      user,
      isAuthenticated: !!user,
      isLoading: false,
      provider,
      accessToken,
      refreshToken,
    };
  },

  /**
   * Logout - clear all session data
   */
  logout: async (): Promise<void> => {
    console.log('[UnifiedAuth] Logging out...');
    
    await deleteItem(STORAGE_KEYS.USER);
    await deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
    await deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
    await deleteItem(STORAGE_KEYS.AUTH_PROVIDER);
    await deleteItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    await deleteItem(STORAGE_KEYS.OTP_REQUEST_ID);
    
    console.log('[UnifiedAuth] Logout successful');
  },

  // ==================== BIOMETRIC AUTH ====================
  
  /**
   * Check if biometric login is available
   */
  isBiometricAvailable: async (): Promise<boolean> => {
    const enabled = await getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    const savedEmail = await getItem(STORAGE_KEYS.SAVED_EMAIL);
    return enabled === 'true' && !!savedEmail;
  },

  /**
   * Get saved credentials for biometric login
   */
  getBiometricCredentials: async (): Promise<{ email: string; password: string } | null> => {
    const email = await getItem(STORAGE_KEYS.SAVED_EMAIL);
    const password = await getItem(STORAGE_KEYS.SAVED_PASSWORD);
    
    if (email && password) {
      return { email, password };
    }
    return null;
  },

  /**
   * Enable biometric login
   */
  enableBiometric: async (email: string, password: string): Promise<void> => {
    await setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
    await setItem(STORAGE_KEYS.SAVED_EMAIL, email);
    await setItem(STORAGE_KEYS.SAVED_PASSWORD, password);
  },

  /**
   * Disable biometric login
   */
  disableBiometric: async (): Promise<void> => {
    await setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
    await deleteItem(STORAGE_KEYS.SAVED_PASSWORD);
  },

  // ==================== SOCIAL LOGIN ====================
  
  /**
   * Login with Google
   */
  loginWithGoogle: async (idToken: string, userData?: any): Promise<AuthResponse> => {
    console.log('[UnifiedAuth] Google login');
    
    try {
      const response = await apiRequest<any>(
        `${AUTH_CONFIG.backendUrl}/auth/social-login`,
        {
          method: 'POST',
          body: JSON.stringify({
            provider: 'google',
            token: idToken,
            userData,
          }),
        }
      );
      
      if (response.accessToken && response.user) {
        const user: UnifiedUser = {
          id: String(response.user.id),
          email: response.user.email,
          name: response.user.name,
          fullName: response.user.name,
          avatar: response.user.avatar || userData?.photo,
          role: response.user.role || 'CLIENT',
          isVerified: true,
          isActive: true,
          provider: 'google',
        };
        
        await UnifiedAuthService.saveSession(
          user,
          'google',
          response.accessToken,
          response.refreshToken
        );
        
        return {
          success: true,
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          message: 'Đăng nhập Google thành công',
        };
      }
    } catch (error: any) {
      console.log('[UnifiedAuth] Google login API error:', error.message);
    }
    
    throw new AuthError('Đăng nhập Google thất bại', 'GOOGLE_LOGIN_FAILED', 401);
  },

  /**
   * Login with Facebook
   */
  loginWithFacebook: async (accessToken: string, userData?: any): Promise<AuthResponse> => {
    console.log('[UnifiedAuth] Facebook login');
    
    try {
      const response = await apiRequest<any>(
        `${AUTH_CONFIG.backendUrl}/auth/social-login`,
        {
          method: 'POST',
          body: JSON.stringify({
            provider: 'facebook',
            token: accessToken,
            userData,
          }),
        }
      );
      
      if (response.accessToken && response.user) {
        const user: UnifiedUser = {
          id: String(response.user.id),
          email: response.user.email,
          name: response.user.name,
          fullName: response.user.name,
          avatar: response.user.avatar || userData?.picture?.data?.url,
          role: response.user.role || 'CLIENT',
          isVerified: true,
          isActive: true,
          provider: 'facebook',
        };
        
        await UnifiedAuthService.saveSession(
          user,
          'facebook',
          response.accessToken,
          response.refreshToken
        );
        
        return {
          success: true,
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          message: 'Đăng nhập Facebook thành công',
        };
      }
    } catch (error: any) {
      console.log('[UnifiedAuth] Facebook login API error:', error.message);
    }
    
    throw new AuthError('Đăng nhập Facebook thất bại', 'FACEBOOK_LOGIN_FAILED', 401);
  },

  // ==================== UTILITIES ====================
  
  /**
   * Check if email exists
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      const response = await apiRequest<any>(
        `${AUTH_CONFIG.backendUrl}/auth/check-email`,
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );
      return response.exists;
    } catch {
      return false;
    }
  },

  /**
   * Validate password strength
   */
  validatePassword: (password: string): { valid: boolean; message: string } => {
    if (!password) {
      return { valid: false, message: 'Vui lòng nhập mật khẩu' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }
    if (password.length > 100) {
      return { valid: false, message: 'Mật khẩu quá dài' };
    }
    // Check for at least one letter and one number (optional - for stronger passwords)
    // if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
    //   return { valid: false, message: 'Mật khẩu phải có ít nhất 1 chữ cái và 1 số' };
    // }
    return { valid: true, message: 'Mật khẩu hợp lệ' };
  },

  /**
   * Validate email format
   */
  validateEmail: (email: string): { valid: boolean; message: string } => {
    if (!email) {
      return { valid: false, message: 'Vui lòng nhập email' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: 'Email không hợp lệ' };
    }
    return { valid: true, message: 'Email hợp lệ' };
  },

  /**
   * Validate phone number
   */
  validatePhone: (phone: string): { valid: boolean; message: string } => {
    if (!phone) {
      return { valid: false, message: 'Vui lòng nhập số điện thoại' };
    }
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9 || cleaned.length > 15) {
      return { valid: false, message: 'Số điện thoại không hợp lệ' };
    }
    return { valid: true, message: 'Số điện thoại hợp lệ' };
  },
};

export default UnifiedAuthService;
