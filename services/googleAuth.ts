/**
 * Google Authentication Service
 * Tích hợp Google Sign-In và OTP để nhận điểm thưởng
 */

import { AuthUser, Role } from '@/types/auth';
import { getItem, setItem } from '@/utils/storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { post } from './api';
import { localUserDB } from './localAuth';

// Complete the auth session setup for web
WebBrowser.maybeCompleteAuthSession();

// Google Auth Configuration
const GOOGLE_CLIENT_CONFIG = {
  expoClientId: '242515746670-q3dp9t71p4fkvgcg2q0h5hkht4bm1b7j.apps.googleusercontent.com',
  iosClientId: '242515746670-jf25ukf8hf6klk4j2sqf25j3jnps0rf5.apps.googleusercontent.com',
  androidClientId: '242515746670-q3dp9t71p4fkvgcg2q0h5hkht4bm1b7j.apps.googleusercontent.com',
  webClientId: '242515746670-q3dp9t71p4fkvgcg2q0h5hkht4bm1b7j.apps.googleusercontent.com'
};

// OTP Configuration
const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
  rewardPoints: 50 // Điểm thưởng khi verify OTP thành công
};

// Interfaces
export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  isNewUser?: boolean;
  needsOTP?: boolean;
}

export interface OTPData {
  code: string;
  phone: string;
  email: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  userId?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  verified?: boolean;
  rewardPoints?: number;
}

/**
 * Google Authentication Service Class
 */
class GoogleAuthService {
  private otpStorage: Map<string, OTPData> = new Map();

  /**
   * Initialize Google Sign-In
   */
  useGoogleAuth() {
    // Use the app scheme defined in app.config (scheme: "appdesignbuild")
    const redirectUri = makeRedirectUri({
      scheme: 'appdesignbuild',
      path: 'redirect'
    });

    // Guard useAuthRequest: provide a fallback promptAsync when provider is unavailable
    const maybeUseAuthRequest: any = (Google && (Google as any).useAuthRequest)
      ? (Google as any).useAuthRequest
      : (options: any) => {
        const fallbackPrompt = async () => {
          const msg = 'Google Sign-in is not available in this environment. Create a development build (not Expo Go) to test native Google Sign-in, or ensure expo-auth-session is installed and configured.';
          try { (globalThis as any).alert?.(msg); } catch (e) { /* noop */ }
          // return an error-like object similar to the real prompt result
          return { type: 'error' };
        };
        return [null, null, fallbackPrompt];
      };

    const [request, response, promptAsync] = maybeUseAuthRequest({
      clientId: GOOGLE_CLIENT_CONFIG.expoClientId,
      iosClientId: GOOGLE_CLIENT_CONFIG.iosClientId,
      androidClientId: GOOGLE_CLIENT_CONFIG.androidClientId,
      webClientId: GOOGLE_CLIENT_CONFIG.webClientId,
      scopes: ['profile', 'email'],
      redirectUri,
    });

    return {
      request,
      response,
      promptAsync
    };
  }

  /**
   * Process Google Sign-In Response (Mock Mode)
   */
  async processGoogleSignIn(response: any): Promise<GoogleAuthResponse> {
    try {
      if (response?.type !== 'success') {
        return {
          success: false,
          message: 'Đăng nhập Google bị hủy hoặc thất bại'
        };
      }

      const { authentication } = response;
      if (!authentication?.accessToken) {
        return {
          success: false,
          message: 'Không nhận được access token từ Google'
        };
      }

      // Call mock API for Google auth using apiFetch (auto-handles Android localhost)
      const apiResult = await post('/auth/google', {
        access_token: authentication.accessToken,
        id_token: authentication.idToken
      });

      if (apiResult.success) {
        // Save user data locally for session
        const userData: AuthUser = {
          id: apiResult.data.user.id,
          email: apiResult.data.user.email,
          name: apiResult.data.user.full_name,
          phone: apiResult.data.user.phone || '',
          role: (apiResult.data.user.role as Role) || 'COMPANY_MEMBER',
          is_active: true,
          created_at: apiResult.data.user.created_at,
          updated_at: new Date().toISOString(),
          avatar: apiResult.data.user.avatar,
          companies: [],
          current_company_id: null,
          is_admin: false,
          scopes: [],
          global_roles: [(apiResult.data.user.role as Role) || 'COMPANY_MEMBER']
        };

        // Store token and user data
        await setItem('auth_token', apiResult.data.token);
        await setItem('auth_user', JSON.stringify(userData));

        return {
          success: true,
          message: apiResult.message,
          user: userData,
          token: apiResult.data.token,
          isNewUser: false
        };
      } else {
        return {
          success: false,
          message: apiResult.error || 'Đăng nhập Google thất bại'
        };
      }
    } catch (error) {
      console.error('[GoogleAuth] processGoogleSignIn error:', error);
      return {
        success: false,
        message: 'Lỗi kết nối. Vui lòng thử lại.'
      };
    }
  }

  /**
   * Fetch user info from Google API
   */
  private async fetchGoogleUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }

      return await response.json();
    } catch (error) {
      console.error('[GoogleAuth] ❌ Failed to fetch user info:', error);
      return null;
    }
  }

  /**
   * Generate OTP for phone verification
   */
  async generateOTP(phone: string, email: string, userId?: string): Promise<OTPResponse> {
    try {
      // Validate phone number
      if (!this.isValidPhone(phone)) {
        return {
          success: false,
          message: 'Số điện thoại không hợp lệ'
        };
      }

      // Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + (OTP_CONFIG.expiryMinutes * 60 * 1000);

      const otpData: OTPData = {
        code,
        phone,
        email,
        expiresAt,
        attempts: 0,
        verified: false,
        userId
      };

      // Store OTP
      this.otpStorage.set(phone, otpData);
      await this.persistOTPStorage();

      // In production, send SMS here
      console.log('[OTP] 📱 Generated OTP:', code, 'for phone:', phone);

      // For demo, we'll just log it
      if (__DEV__) {
        console.log('[OTP] 🧪 Demo OTP Code:', code);
      }

      return {
        success: true,
        message: `Mã OTP đã được gửi đến số ${this.maskPhone(phone)}`
      };

    } catch (error) {
      console.error('[OTP] ❌ Generate failed:', error);
      return {
        success: false,
        message: 'Không thể tạo mã OTP'
      };
    }
  }

  /**
   * Verify OTP and award points
   */
  async verifyOTP(phone: string, code: string): Promise<OTPResponse> {
    try {
      const otpData = this.otpStorage.get(phone);
      
      if (!otpData) {
        return {
          success: false,
          message: 'Không tìm thấy mã OTP cho số điện thoại này'
        };
      }

      // Check expiry
      if (Date.now() > otpData.expiresAt) {
        this.otpStorage.delete(phone);
        await this.persistOTPStorage();
        return {
          success: false,
          message: 'Mã OTP đã hết hạn'
        };
      }

      // Check attempts
      if (otpData.attempts >= OTP_CONFIG.maxAttempts) {
        this.otpStorage.delete(phone);
        await this.persistOTPStorage();
        return {
          success: false,
          message: 'Đã vượt quá số lần thử tối đa'
        };
      }

      // Verify code
      if (otpData.code !== code) {
        otpData.attempts++;
        this.otpStorage.set(phone, otpData);
        await this.persistOTPStorage();
        
        const remainingAttempts = OTP_CONFIG.maxAttempts - otpData.attempts;
        return {
          success: false,
          message: `Mã OTP không đúng. Còn lại ${remainingAttempts} lần thử`
        };
      }

      // OTP verified successfully
      otpData.verified = true;
      this.otpStorage.set(phone, otpData);

      // Award reward points
      let rewardPoints = 0;
      if (otpData.userId) {
        rewardPoints = await this.awardRewardPoints(otpData.userId, OTP_CONFIG.rewardPoints);
      }

      // Clean up
      setTimeout(() => {
        this.otpStorage.delete(phone);
        this.persistOTPStorage();
      }, 1000);

      console.log('[OTP] ✅ Verification successful for:', phone);

      return {
        success: true,
        message: 'Xác thực OTP thành công',
        verified: true,
        rewardPoints
      };

    } catch (error) {
      console.error('[OTP] ❌ Verify failed:', error);
      return {
        success: false,
        message: 'Lỗi khi xác thực OTP'
      };
    }
  }

  /**
   * Award reward points to user
   */
  private async awardRewardPoints(userId: string, points: number): Promise<number> {
    try {
      const user = await localUserDB.findByAccount(userId);
      if (!user) return 0;

      const currentPoints = user.metadata?.rewardPoints || 0;
      const newPoints = currentPoints + points;

      await localUserDB.updateUser(userId, {
        metadata: {
          ...user.metadata,
          rewardPoints: newPoints,
          lastRewardDate: new Date().toISOString(),
          rewardHistory: [
            ...(user.metadata?.rewardHistory || []),
            {
              points,
              reason: 'OTP verification',
              date: new Date().toISOString()
            }
          ]
        }
      });

      console.log('[Rewards] 🎁 Awarded', points, 'points to user:', userId);
      return points;

    } catch (error) {
      console.error('[Rewards] ❌ Award failed:', error);
      return 0;
    }
  }

  // Helper methods
  private generateUsername(email: string): string {
    const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    const suffix = Math.floor(Math.random() * 1000);
    return `${base}${suffix}`.toLowerCase();
  }

  private generateRandomPassword(): string {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  }

  private generateToken(userId: string, provider: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36);
    return `${provider}_token_${userId}_${timestamp}_${random}`;
  }

  private convertToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      phone: user.phone || '',
      name: user.fullName || user.username,
      email: user.email,
      avatar: user.metadata?.avatar,
      role: user.role,
      reward_points: user.metadata?.rewardPoints || 0,
      is_active: user.isActive,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      companies: [],
      current_company_id: 'default',
      is_admin: user.role === 'admin',
      scopes: [],
      global_roles: [user.role]
    };
  }

  private async saveGoogleSession(user: AuthUser, token: string, googleAuth: any): Promise<void> {
    try {
      await setItem('auth_user', JSON.stringify(user));
      await setItem('auth_token', token);
      await setItem('google_auth', JSON.stringify(googleAuth));
    } catch (error) {
      console.error('[GoogleAuth] ❌ Failed to save session:', error);
    }
  }

  private async persistOTPStorage(): Promise<void> {
    try {
      const otpData = Object.fromEntries(this.otpStorage.entries());
      await setItem('otp_storage', JSON.stringify(otpData));
    } catch (error) {
      console.error('[OTP] ❌ Failed to persist storage:', error);
    }
  }

  private async loadOTPStorage(): Promise<void> {
    try {
      const saved = await getItem('otp_storage');
      if (saved) {
        const otpData = JSON.parse(saved);
        Object.entries(otpData).forEach(([phone, data]) => {
          this.otpStorage.set(phone, data as OTPData);
        });
      }
    } catch (error) {
      console.error('[OTP] ❌ Failed to load storage:', error);
    }
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+84|84|0)[3-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private maskPhone(phone: string): string {
    if (phone.length < 4) return phone;
    return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();

// Export utility functions
export const useGoogleAuth = () => googleAuthService.useGoogleAuth();
export const processGoogleSignIn = (response: any) => googleAuthService.processGoogleSignIn(response);
export const generateOTP = (phone: string, email: string, userId?: string) => googleAuthService.generateOTP(phone, email, userId);
export const verifyOTP = (phone: string, code: string) => googleAuthService.verifyOTP(phone, code);