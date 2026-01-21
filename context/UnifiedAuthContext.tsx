/**
 * Unified Authentication Context
 * ==============================
 * 
 * Context tích hợp authentication với:
 * - Login/Register/Logout
 * - OTP Verification
 * - Social Login (Google, Facebook)
 * - Biometric Authentication
 * - Session Management
 * 
 * @author ThietKeResort Team
 * @created 2026-01-12
 */

import UnifiedAuthService, {
    AuthError,
    AuthProvider,
    AuthResponse,
    AuthState,
    LoginCredentials,
    OTPChannel,
    OTPPurpose,
    OTPRequest,
    OTPResponse,
    OTPVerifyRequest,
    RegisterData,
    UnifiedUser,
} from '@/services/unifiedAuth';
import { router } from 'expo-router';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// ==================== CONTEXT TYPE ====================

interface UnifiedAuthContextType extends AuthState {
  // Auth Actions
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  
  // OTP Actions
  sendOTP: (request: OTPRequest) => Promise<OTPResponse>;
  verifyOTP: (request: OTPVerifyRequest) => Promise<OTPResponse>;
  resendOTP: (request: OTPRequest) => Promise<OTPResponse>;
  
  // Password Reset
  forgotPassword: (emailOrPhone: string) => Promise<OTPResponse>;
  resetPassword: (emailOrPhone: string, otpCode: string, newPassword: string) => Promise<AuthResponse>;
  
  // Social Login
  loginWithGoogle: (idToken: string, userData?: any) => Promise<AuthResponse>;
  loginWithFacebook: (accessToken: string, userData?: any) => Promise<AuthResponse>;
  
  // Biometric
  isBiometricAvailable: () => Promise<boolean>;
  loginWithBiometric: () => Promise<AuthResponse>;
  enableBiometric: (email: string, password: string) => Promise<void>;
  disableBiometric: () => Promise<void>;
  
  // Session
  refreshSession: () => Promise<void>;
  
  // State
  error: string | null;
  clearError: () => void;
  otpSent: boolean;
  otpTimer: number;
  setOtpTimer: (seconds: number) => void;
}

// ==================== CONTEXT ====================

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    provider: null,
    accessToken: null,
    refreshToken: null,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // ==================== INITIALIZATION ====================
  
  useEffect(() => {
    loadSession();
  }, []);
  
  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setOtpSent(false);
    }
  }, [otpTimer]);

  const loadSession = async () => {
    try {
      console.log('[UnifiedAuthContext] Loading session...');
      const session = await UnifiedAuthService.getSession();
      
      setState({
        ...session,
        isLoading: false,
      });
      
      if (session.user) {
        console.log('[UnifiedAuthContext] Session loaded:', session.user.email);
      } else {
        console.log('[UnifiedAuthContext] No session found');
      }
    } catch (err) {
      console.error('[UnifiedAuthContext] Load session error:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // ==================== AUTH ACTIONS ====================

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      console.log('[UnifiedAuthContext] Logging in...');
      const response = await UnifiedAuthService.login(credentials);
      
      if (response.success && response.user) {
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          provider: response.user.provider,
          accessToken: response.accessToken || null,
          refreshToken: response.refreshToken || null,
        });
        
        console.log('[UnifiedAuthContext] Login successful:', response.user.email);
      }
      
      return response;
    } catch (err: any) {
      console.error('[UnifiedAuthContext] Login error:', err);
      setState(prev => ({ ...prev, isLoading: false }));
      
      const message = err instanceof AuthError ? err.message : 'Đăng nhập thất bại';
      setError(message);
      throw err;
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      console.log('[UnifiedAuthContext] Registering...');
      const response = await UnifiedAuthService.register(data);
      
      if (response.success && response.user) {
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          provider: response.user.provider,
          accessToken: response.accessToken || null,
          refreshToken: response.refreshToken || null,
        });
        
        console.log('[UnifiedAuthContext] Register successful:', response.user.email);
      }
      
      return response;
    } catch (err: any) {
      console.error('[UnifiedAuthContext] Register error:', err);
      setState(prev => ({ ...prev, isLoading: false }));
      
      const message = err instanceof AuthError ? err.message : 'Đăng ký thất bại';
      setError(message);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('[UnifiedAuthContext] Logging out...');
      await UnifiedAuthService.logout();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        provider: null,
        accessToken: null,
        refreshToken: null,
      });
      
      console.log('[UnifiedAuthContext] Logout successful');
      
      // Navigate to login
      try {
        router.replace('/(auth)/login' as any);
      } catch (navError) {
        console.warn('[UnifiedAuthContext] Navigation error:', navError);
      }
    } catch (err) {
      console.error('[UnifiedAuthContext] Logout error:', err);
      // Still clear state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        provider: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  };

  // ==================== OTP ACTIONS ====================

  const sendOTP = async (request: OTPRequest): Promise<OTPResponse> => {
    try {
      setError(null);
      console.log('[UnifiedAuthContext] Sending OTP...');
      
      const response = await UnifiedAuthService.sendOTP(request);
      
      if (response.success) {
        setOtpSent(true);
        setOtpTimer(response.expiresIn || 60);
      }
      
      return response;
    } catch (err: any) {
      const message = err instanceof AuthError ? err.message : 'Không thể gửi mã OTP';
      setError(message);
      throw err;
    }
  };

  const verifyOTP = async (request: OTPVerifyRequest): Promise<OTPResponse> => {
    try {
      setError(null);
      console.log('[UnifiedAuthContext] Verifying OTP...');
      
      const response = await UnifiedAuthService.verifyOTP(request);
      
      if (response.success) {
        setOtpSent(false);
        setOtpTimer(0);
      }
      
      return response;
    } catch (err: any) {
      const message = err instanceof AuthError ? err.message : 'Mã OTP không đúng';
      setError(message);
      throw err;
    }
  };

  const resendOTP = async (request: OTPRequest): Promise<OTPResponse> => {
    return sendOTP(request);
  };

  // ==================== PASSWORD RESET ====================

  const forgotPassword = async (emailOrPhone: string): Promise<OTPResponse> => {
    try {
      setError(null);
      console.log('[UnifiedAuthContext] Forgot password...');
      
      const response = await UnifiedAuthService.forgotPassword(emailOrPhone);
      
      if (response.success) {
        setOtpSent(true);
        setOtpTimer(response.expiresIn || 60);
      }
      
      return response;
    } catch (err: any) {
      const message = err instanceof AuthError ? err.message : 'Không thể gửi mã xác nhận';
      setError(message);
      throw err;
    }
  };

  const resetPassword = async (
    emailOrPhone: string,
    otpCode: string,
    newPassword: string
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      console.log('[UnifiedAuthContext] Resetting password...');
      
      const response = await UnifiedAuthService.resetPassword(emailOrPhone, otpCode, newPassword);
      
      if (response.success) {
        setOtpSent(false);
        setOtpTimer(0);
      }
      
      return response;
    } catch (err: any) {
      const message = err instanceof AuthError ? err.message : 'Không thể đặt lại mật khẩu';
      setError(message);
      throw err;
    }
  };

  // ==================== SOCIAL LOGIN ====================

  const loginWithGoogle = async (idToken: string, userData?: any): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      console.log('[UnifiedAuthContext] Google login...');
      const response = await UnifiedAuthService.loginWithGoogle(idToken, userData);
      
      if (response.success && response.user) {
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          provider: 'google',
          accessToken: response.accessToken || null,
          refreshToken: response.refreshToken || null,
        });
      }
      
      return response;
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      const message = err instanceof AuthError ? err.message : 'Đăng nhập Google thất bại';
      setError(message);
      throw err;
    }
  };

  const loginWithFacebook = async (accessToken: string, userData?: any): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      console.log('[UnifiedAuthContext] Facebook login...');
      const response = await UnifiedAuthService.loginWithFacebook(accessToken, userData);
      
      if (response.success && response.user) {
        setState({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          provider: 'facebook',
          accessToken: response.accessToken || null,
          refreshToken: response.refreshToken || null,
        });
      }
      
      return response;
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      const message = err instanceof AuthError ? err.message : 'Đăng nhập Facebook thất bại';
      setError(message);
      throw err;
    }
  };

  // ==================== BIOMETRIC ====================

  const isBiometricAvailable = async (): Promise<boolean> => {
    return UnifiedAuthService.isBiometricAvailable();
  };

  const loginWithBiometric = async (): Promise<AuthResponse> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      const credentials = await UnifiedAuthService.getBiometricCredentials();
      
      if (!credentials) {
        throw new AuthError('Không tìm thấy thông tin đăng nhập đã lưu', 'NO_CREDENTIALS', 400);
      }
      
      return login({
        emailOrPhone: credentials.email,
        password: credentials.password,
        rememberMe: true,
      });
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      const message = err instanceof AuthError ? err.message : 'Đăng nhập sinh trắc học thất bại';
      setError(message);
      throw err;
    }
  };

  const enableBiometric = async (email: string, password: string): Promise<void> => {
    await UnifiedAuthService.enableBiometric(email, password);
  };

  const disableBiometric = async (): Promise<void> => {
    await UnifiedAuthService.disableBiometric();
  };

  // ==================== SESSION ====================

  const refreshSession = async (): Promise<void> => {
    await loadSession();
  };

  const clearError = () => {
    setError(null);
  };

  // ==================== CONTEXT VALUE ====================

  const contextValue: UnifiedAuthContextType = {
    // State
    ...state,
    error,
    otpSent,
    otpTimer,
    
    // Auth Actions
    login,
    register,
    logout,
    
    // OTP Actions
    sendOTP,
    verifyOTP,
    resendOTP,
    
    // Password Reset
    forgotPassword,
    resetPassword,
    
    // Social Login
    loginWithGoogle,
    loginWithFacebook,
    
    // Biometric
    isBiometricAvailable,
    loginWithBiometric,
    enableBiometric,
    disableBiometric,
    
    // Session
    refreshSession,
    
    // Helpers
    clearError,
    setOtpTimer,
  };

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  );
}

// ==================== HOOK ====================

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext);
  if (context === undefined) {
    throw new Error('useUnifiedAuth must be used within a UnifiedAuthProvider');
  }
  return context;
}

// Re-export types
export type {
    AuthProvider,
    AuthResponse,
    AuthState,
    LoginCredentials,
    OTPChannel,
    OTPPurpose,
    OTPRequest,
    OTPResponse,
    OTPVerifyRequest,
    RegisterData,
    UnifiedUser
};
