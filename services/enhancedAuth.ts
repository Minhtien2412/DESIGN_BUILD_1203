/**
 * Enhanced Authentication Service
 * Tích hợp với unified API service
 */

import { storage } from '@/services/storage';
import { AuthUser, Role } from '../types/auth';
import { apiFetch } from './api';

// API_BASE may not be exported from the canonical api module in all variants.
// Use a fallback to process.env when available.
const API_BASE = ((): string => {
  try {
    // attempt to read export dynamically if present at runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('./api');
    return mod.API_BASE || process.env.EXPO_PUBLIC_API_BASE || 'https://api.thietkeresort.com.vn';
  } catch {
    return process.env.EXPO_PUBLIC_API_BASE || 'https://api.thietkeresort.com.vn';
  }
})();

// API Response Types theo API docs
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

interface LoginRequest {
  email?: string;
  username?: string;
  phone?: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MeResponse {
  sub: string;
  email: string;
  fullName: string;
  roles: string[];
  iat: number;
  exp: number;
}

interface RegisterRequest {
  name?: string;
  email?: string;
  phone?: string;
  username?: string;
  password: string;
  role?: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email?: string;
    username?: string;
    phone?: string;
    name?: string;
    role?: string;
  };
  message?: string;
}

class EnhancedAuthService {
  private baseUrl = API_BASE;

  /**
   * Đăng nhập với API backend
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      // Check if response is HTML (indicates wrong endpoint or server issue)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.warn('[EnhancedAuth] Received HTML response instead of JSON');
        return {
          success: false,
          error: {
            code: 'INVALID_ENDPOINT',
            message: 'API endpoint không hỗ trợ đăng nhập, sử dụng mock data'
          }
        };
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn('[EnhancedAuth] Failed to parse JSON response');
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'Server trả về dữ liệu không hợp lệ'
          }
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: data.message || 'Đăng nhập thất bại'
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('[EnhancedAuth] Login error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Lỗi kết nối mạng'
        }
      };
    }
  }

  /**
   * Đăng ký tài khoản mới
   */
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: data.message || 'Đăng ký thất bại'
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('[EnhancedAuth] Register error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Lỗi kết nối mạng'
        }
      };
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(token?: string): Promise<ApiResponse<MeResponse>> {
    try {
  const authToken = token || await storage.get('accessToken');
      
      if (!authToken) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Chưa đăng nhập'
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      // Check if response is HTML (indicates wrong endpoint or server issue)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.warn('[EnhancedAuth] Received HTML response instead of JSON for /auth/me');
        return {
          success: false,
          error: {
            code: 'INVALID_ENDPOINT',
            message: 'API endpoint không hỗ trợ thông tin user'
          }
        };
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn('[EnhancedAuth] Failed to parse JSON response for /auth/me');
        return {
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'Server trả về dữ liệu không hợp lệ'
          }
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'UNKNOWN_ERROR',
            message: data.message || 'Không thể lấy thông tin người dùng'
          }
        };
      }

      return {
        success: true,
        data: data.user || data
      };
    } catch (error) {
      console.error('[EnhancedAuth] Get current user error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Lỗi kết nối mạng'
        }
      };
    }
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<ApiResponse> {
    try {
  const token = await storage.get('accessToken');
      
      if (token) {
        // Call logout endpoint if available
        try {
          await fetch(`${this.baseUrl}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
          });
        } catch (error) {
          // Ignore logout endpoint errors
          console.warn('[EnhancedAuth] Logout endpoint error:', error);
        }
      }

      // Clear local storage
            await storage.remove('accessToken');
            await storage.remove('refreshToken');
            await storage.remove('auth:currentUserId');
            await storage.remove('auth:currentUser');

      return { success: true };
    } catch (error) {
      console.error('[EnhancedAuth] Logout error:', error);
      return {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Lỗi khi đăng xuất'
        }
      };
    }
  }

  /**
   * Refresh token (if supported)
   */
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
  const currentToken = await storage.get('accessToken');
      
      if (!currentToken) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Chưa đăng nhập'
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'REFRESH_FAILED',
            message: 'Không thể làm mới token'
          }
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('[EnhancedAuth] Refresh token error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Lỗi kết nối mạng'
        }
      };
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
  const token = await storage.get('accessToken');
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Chưa đăng nhập'
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'CHANGE_PASSWORD_FAILED',
            message: 'Không thể đổi mật khẩu'
          }
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EnhancedAuth] Change password error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Lỗi kết nối mạng'
        }
      };
    }
  }

  /**
   * Quên mật khẩu
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'FORGOT_PASSWORD_FAILED',
            message: 'Không thể gửi email khôi phục mật khẩu'
          }
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EnhancedAuth] Forgot password error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Lỗi kết nối mạng'
        }
      };
    }
  }

  /**
   * Reset mật khẩu
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'RESET_PASSWORD_FAILED',
            message: 'Không thể đặt lại mật khẩu'
          }
        };
      }

      return { success: true, data };
    } catch (error) {
      console.error('[EnhancedAuth] Reset password error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Lỗi kết nối mạng'
        }
      };
    }
  }

  /**
   * Cập nhật profile
   */
  async updateProfile(updates: Partial<MeResponse>): Promise<ApiResponse<MeResponse>> {
    try {
  const token = await storage.get('accessToken');
      
      if (!token) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Chưa đăng nhập'
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: 'UPDATE_PROFILE_FAILED',
            message: 'Không thể cập nhật thông tin'
          }
        };
      }

      return {
        success: true,
        data: data.data || data.user || data
      };
    } catch (error) {
      console.error('[EnhancedAuth] Update profile error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Lỗi kết nối mạng'
        }
      };
    }
  }

  /**
   * Kiểm tra health của API
   */
  async checkHealth(): Promise<ApiResponse> {
    try {
      // Use centralized apiFetch to leverage origin routing and health fallback
      const data = await apiFetch<any>('/health', { method: 'GET', timeoutMs: 8000 });
      return { success: true, data };
    } catch (error) {
      console.error('[EnhancedAuth] Health check error:', error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'API không khả dụng'
        }
      };
    }
  }

  /**
   * Convert API user to AuthUser format
   */
  convertToAuthUser(apiUser: MeResponse): AuthUser {
    return {
      id: apiUser.sub,
      phone: '', // Not provided by this API
      name: apiUser.fullName,
      email: apiUser.email || '',
      avatar: '', // Not provided by this API
      role: (apiUser.roles?.[0] as Role) || 'khach-hang',
      is_active: true, // Assume active if user can authenticate
      created_at: new Date(apiUser.iat * 1000).toISOString(), // Convert from timestamp
      updated_at: new Date().toISOString(),
      companies: [], // Will be populated separately if needed
      current_company_id: 'default-company',
      is_admin: apiUser.roles?.includes('admin') || false,
      scopes: [],
      global_roles: (apiUser.roles as Role[]) || ['khach-hang'],
      reward_points: 100, // Default reward points
    };
  }
}

// Export singleton instance
export const enhancedAuthService = new EnhancedAuthService();

// Export types
export type {
    ApiResponse,
    LoginRequest,
    LoginResponse,
    MeResponse,
    RegisterRequest,
    RegisterResponse
};

