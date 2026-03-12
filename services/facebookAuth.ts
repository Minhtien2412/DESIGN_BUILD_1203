/**
 * Facebook Authentication Service
 * Tích hợp Facebook Login với expo-auth-session
 */

import { AuthUser, Role } from '@/types/auth';
import { getItem, setItem } from '@/utils/storage';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { post } from './api';

// Complete the auth session setup for web
WebBrowser.maybeCompleteAuthSession();

// Facebook App Configuration
const FACEBOOK_APP_CONFIG = {
  appId: '1394279839037220', // TODO: Replace with your Facebook App ID -> joined
  appSecret: '557a04217d0aa4ff76d232eda3695e6a', // TODO: Replace with your Facebook App Secret -> joined
};

// Facebook Auth Endpoints
const FACEBOOK_AUTH_ENDPOINTS = {
  authorization: 'https://www.facebook.com/v18.0/dialog/oauth',
  token: 'https://graph.facebook.com/v18.0/oauth/access_token',
  userInfo: 'https://graph.facebook.com/me',
};

// Interfaces
export interface FacebookAuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
  isNewUser?: boolean;
}

/**
 * Facebook Authentication Service Class
 */
class FacebookAuthService {
  /**
   * Initialize Facebook Sign-In with expo-auth-session
   */
  async signInWithFacebook(): Promise<FacebookAuthResponse> {
    try {
      const redirectUri = makeRedirectUri({
        scheme: 'appdesignbuild', // Must match app.config.js scheme
        path: 'auth',
      });

      const authUrl = `${FACEBOOK_AUTH_ENDPOINTS.authorization}?` +
        `client_id=${FACEBOOK_APP_CONFIG.appId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=email,public_profile`;

      console.log('[FacebookAuth] Opening Facebook login...');

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      if (result.type === 'success') {
        const url = result.url;
        const accessToken = this.extractAccessToken(url);

        if (accessToken) {
          return await this.processFacebookLogin(accessToken);
        } else {
          return {
            success: false,
            message: 'Không thể lấy access token từ Facebook',
          };
        }
      } else {
        return {
          success: false,
          message: 'Đăng nhập Facebook bị hủy',
        };
      }
    } catch (error) {
      console.error('[FacebookAuth] Error:', error);
      return {
        success: false,
        message: 'Lỗi khi đăng nhập Facebook',
      };
    }
  }

  /**
   * Extract access token from redirect URL
   */
  private extractAccessToken(url: string): string | null {
    try {
      const match = url.match(/access_token=([^&]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Process Facebook login with access token (Mock Mode)
   */
  private async processFacebookLogin(accessToken: string): Promise<FacebookAuthResponse> {
    try {
      // Call mock API for Facebook auth using apiFetch (auto-handles Android localhost)
      const apiResult = await post('/auth/facebook', {
        access_token: accessToken
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
          message: apiResult.error || 'Đăng nhập Facebook thất bại'
        };
      }
    } catch (error) {
      console.error('[FacebookAuth] processFacebookLogin error:', error);
      return {
        success: false,
        message: 'Lỗi kết nối. Vui lòng thử lại.'
      };
    }
  }

  /**
   * Fetch user info from Facebook Graph API
   */
  private async fetchFacebookUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(
        `${FACEBOOK_AUTH_ENDPOINTS.userInfo}?fields=id,name,email,picture&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Facebook user info');
      }

      return await response.json();
    } catch (error) {
      console.error('[FacebookAuth] ❌ Failed to fetch user info:', error);
      return null;
    }
  }

  /**
   * Convert local user to AuthUser format
   */
  private convertToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      avatar: user.metadata?.avatar,
      phone: user.phone,
      is_admin: user.role === 'admin',
      is_active: true,
      created_at: user.createdAt || new Date().toISOString(),
      updated_at: user.updatedAt || new Date().toISOString(),
      reward_points: user.metadata?.rewardPoints || 0,
      companies: [],
      current_company_id: null,
      scopes: [],
      global_roles: [user.role || 'customer'],
    };
  }

  /**
   * Generate auth token
   */
  private generateToken(userId: string, provider: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${provider}_${userId}_${timestamp}_${random}`;
  }

  /**
   * Generate username from email or Facebook ID
   */
  private generateUsername(emailOrId: string): string {
    const base = emailOrId.includes('@')
      ? emailOrId.split('@')[0]
      : `fb_${emailOrId}`;
    return base.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Generate random password
   */
  private generateRandomPassword(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Save Facebook session
   */
  private async saveFacebookSession(
    user: AuthUser,
    token: string,
    facebookToken: string
  ): Promise<void> {
    await setItem('auth_token', token);
    await setItem('auth_user', JSON.stringify(user));
    await setItem('facebook_token', facebookToken);
    await setItem('auth_provider', 'facebook');
  }

  /**
   * Get stored Facebook token
   */
  async getFacebookToken(): Promise<string | null> {
    return await getItem('facebook_token');
  }

  /**
   * Clear Facebook session
   */
  async clearFacebookSession(): Promise<void> {
    await setItem('facebook_token', '');
  }
}

// Export singleton instance
export const facebookAuthService = new FacebookAuthService();

// Export main function
export const signInWithFacebook = () => facebookAuthService.signInWithFacebook();
