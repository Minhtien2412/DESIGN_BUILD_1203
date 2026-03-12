/**
 * Perfex CRM Authentication Service
 * Sử dụng Mobile API Module chính thức cho authentication
 * 
 * API Endpoints (Module: mobile_api):
 * - POST /api/v1/auth/login - Đăng nhập
 * - POST /api/v1/auth/register - Đăng ký
 * - GET  /api/v1/auth/me - Lấy thông tin user (cần X-User-Type, X-User-Id)
 * - POST /api/v1/auth/change-password - Đổi mật khẩu
 * - GET  /api/v1/dashboard - Dashboard stats
 * - GET  /api/v1/projects - Danh sách dự án
 * - GET  /api/v1/invoices - Danh sách hóa đơn
 * - GET  /api/v1/estimates - Danh sách báo giá
 * - GET  /api/v1/tickets - Danh sách tickets
 * 
 * @author ThietKeResort Team
 * @created 2025-12-30
 * @updated 2025-12-30 - Chuyển sang Mobile API Module
 */

import ENV from '@/config/env';
import { deleteItem, getItem, setItem } from '@/utils/storage';

// ==================== CONFIG ====================

const PERFEX_CONFIG = {
  baseUrl: ENV.PERFEX_CRM_URL || 'https://thietkeresort.com.vn/perfex_crm',
  // API Key from Mobile API Module (header: X-API-Key)
  apiKey: ENV.PERFEX_API_KEY || '',
  // API Version prefix
  apiVersion: '/api/v1',
  timeout: 30000,
};

// Storage keys
const STORAGE_KEYS = {
  PERFEX_USER: 'perfex_user',
  PERFEX_USER_TYPE: 'perfex_user_type', // 'contact' or 'staff'
  PERFEX_USER_ID: 'perfex_user_id',
  PERFEX_SESSION: 'perfex_session',
};

// ==================== TYPES ====================

export interface PerfexAuthUser {
  id: string;
  contactId: string | null;
  customerId: string | null;
  staffId: string | null;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  phone?: string;
  company?: string;
  profileImage?: string;
  active: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  role: 'admin' | 'staff' | 'customer';
}

export interface LoginResponse {
  success: boolean;
  user: PerfexAuthUser;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: PerfexAuthUser;
  customerId: string;
  contactId: string;
  message?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstname: string;
  lastname?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

// ==================== ERROR CLASS ====================

export class PerfexAuthError extends Error {
  code: string;
  status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = 'PerfexAuthError';
    this.code = code;
    this.status = status;
  }
}

// ==================== API HELPER ====================

/**
 * Gọi Mobile API Module endpoint
 * URL: /api/v1/{endpoint}
 * Auth: X-API-Key header
 * User Auth: X-User-Type + X-User-Id headers (optional)
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  userAuth?: { userType: string; userId: string }
): Promise<T> {
  // API URL: /api/v1/...
  const url = `${PERFEX_CONFIG.baseUrl}${PERFEX_CONFIG.apiVersion}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': PERFEX_CONFIG.apiKey,
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Add user authentication headers if provided
  if (userAuth) {
    headers['X-User-Type'] = userAuth.userType;
    headers['X-User-Id'] = userAuth.userId;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PERFEX_CONFIG.timeout);

  try {
    console.log(`[PerfexAuth] ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new PerfexAuthError(
          `Invalid response: ${text.substring(0, 200)}`,
          'INVALID_RESPONSE',
          response.status
        );
      }
    }

    // Check for API errors
    if (data.status === false || data.error) {
      throw new PerfexAuthError(
        data.error || data.message || 'API Error',
        data.code || 'API_ERROR',
        response.status
      );
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new PerfexAuthError('Request timeout', 'TIMEOUT', 408);
    }
    
    if (error instanceof PerfexAuthError) {
      throw error;
    }
    
    throw new PerfexAuthError(
      error.message || 'Network error',
      'NETWORK_ERROR',
      0
    );
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert API response to PerfexAuthUser
 */
function apiUserToAuthUser(apiUser: any): PerfexAuthUser {
  return {
    id: String(apiUser.id),
    contactId: apiUser.contact_id ? String(apiUser.contact_id) : null,
    customerId: apiUser.customer_id ? String(apiUser.customer_id) : null,
    staffId: apiUser.staff_id ? String(apiUser.staff_id) : null,
    email: apiUser.email,
    firstname: apiUser.firstname,
    lastname: apiUser.lastname || '',
    fullName: `${apiUser.firstname} ${apiUser.lastname || ''}`.trim(),
    phone: apiUser.phone || apiUser.phonenumber,
    company: apiUser.company,
    profileImage: apiUser.profile_image,
    active: true,
    isStaff: apiUser.is_staff === true,
    isAdmin: apiUser.is_admin === true,
    role: apiUser.role || 'customer',
  };
}

// ==================== AUTHENTICATION SERVICE ====================

export const PerfexAuthService = {
  /**
   * Đăng nhập (hỗ trợ cả Staff và Customer)
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.status || !response.user) {
        throw new PerfexAuthError(
          response.error || 'Đăng nhập thất bại',
          'LOGIN_FAILED',
          401
        );
      }

      const user = apiUserToAuthUser(response.user);
      const userType = user.isStaff ? 'staff' : 'contact';

      // Save to storage
      await setItem(STORAGE_KEYS.PERFEX_USER, JSON.stringify(user));
      await setItem(STORAGE_KEYS.PERFEX_USER_TYPE, userType);
      await setItem(STORAGE_KEYS.PERFEX_USER_ID, user.id);
      await setItem(STORAGE_KEYS.PERFEX_SESSION, Date.now().toString());

      console.log('[PerfexAuth] Login successful:', user.email);

      return {
        success: true,
        user,
        message: response.message,
      };
    } catch (error: any) {
      console.error('[PerfexAuth] Login error:', error);
      throw error;
    }
  },

  /**
   * Đăng ký tài khoản khách hàng mới
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await apiFetch<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstname: data.firstname,
          lastname: data.lastname || '',
          phone: data.phone || '',
          company: data.company || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
        }),
      });

      if (!response.status || !response.user) {
        throw new PerfexAuthError(
          response.error || 'Đăng ký thất bại',
          'REGISTER_FAILED',
          400
        );
      }

      const user = apiUserToAuthUser(response.user);

      // Save to storage
      await setItem(STORAGE_KEYS.PERFEX_USER, JSON.stringify(user));
      await setItem(STORAGE_KEYS.PERFEX_USER_TYPE, 'contact');
      await setItem(STORAGE_KEYS.PERFEX_USER_ID, user.id);
      await setItem(STORAGE_KEYS.PERFEX_SESSION, Date.now().toString());

      console.log('[PerfexAuth] Register successful:', user.email);

      return {
        success: true,
        user,
        customerId: user.customerId || '',
        contactId: user.contactId || user.id,
        message: response.message,
      };
    } catch (error: any) {
      console.error('[PerfexAuth] Register error:', error);
      throw error;
    }
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    try {
      await deleteItem(STORAGE_KEYS.PERFEX_USER);
      await deleteItem(STORAGE_KEYS.PERFEX_USER_TYPE);
      await deleteItem(STORAGE_KEYS.PERFEX_USER_ID);
      await deleteItem(STORAGE_KEYS.PERFEX_SESSION);
      console.log('[PerfexAuth] Logout successful');
    } catch (error) {
      console.error('[PerfexAuth] Logout error:', error);
    }
  },

  /**
   * Lấy user hiện tại từ storage
   */
  getCurrentUser: async (): Promise<PerfexAuthUser | null> => {
    try {
      const userJson = await getItem(STORAGE_KEYS.PERFEX_USER);
      if (!userJson) return null;

      const user = JSON.parse(userJson) as PerfexAuthUser;
      return user;
    } catch (error) {
      console.error('[PerfexAuth] Get current user error:', error);
      return null;
    }
  },

  /**
   * Refresh user data từ server
   */
  refreshUser: async (): Promise<PerfexAuthUser | null> => {
    try {
      const userType = await getItem(STORAGE_KEYS.PERFEX_USER_TYPE);
      const userId = await getItem(STORAGE_KEYS.PERFEX_USER_ID);

      if (!userType || !userId) return null;

      const response = await apiFetch<any>(
        '/auth/me',
        { method: 'GET' },
        { userType, userId }
      );

      if (!response.status || !response.user) {
        // Session invalid, logout
        await PerfexAuthService.logout();
        return null;
      }

      const user = apiUserToAuthUser(response.user);
      await setItem(STORAGE_KEYS.PERFEX_USER, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('[PerfexAuth] Refresh user error:', error);
      return null;
    }
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isLoggedIn: async (): Promise<boolean> => {
    const user = await PerfexAuthService.getCurrentUser();
    return user !== null;
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    const userType = await getItem(STORAGE_KEYS.PERFEX_USER_TYPE);
    const userId = await getItem(STORAGE_KEYS.PERFEX_USER_ID);

    if (!userType || !userId) {
      throw new PerfexAuthError('Chưa đăng nhập', 'NOT_AUTHENTICATED', 401);
    }

    const response = await apiFetch<any>(
      '/auth/change_password',
      {
        method: 'POST',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      },
      { userType, userId }
    );

    if (!response.status) {
      throw new PerfexAuthError(
        response.error || 'Đổi mật khẩu thất bại',
        'CHANGE_PASSWORD_FAILED',
        400
      );
    }

    console.log('[PerfexAuth] Password changed successfully');
  },

  /**
   * Cập nhật profile
   */
  updateProfile: async (data: {
    firstname?: string;
    lastname?: string;
    phone?: string;
  }): Promise<PerfexAuthUser> => {
    const userType = await getItem(STORAGE_KEYS.PERFEX_USER_TYPE);
    const userId = await getItem(STORAGE_KEYS.PERFEX_USER_ID);

    if (!userType || !userId) {
      throw new PerfexAuthError('Chưa đăng nhập', 'NOT_AUTHENTICATED', 401);
    }

    const response = await apiFetch<any>(
      '/auth/update_profile',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      { userType, userId }
    );

    if (!response.status) {
      throw new PerfexAuthError(
        response.error || 'Cập nhật thất bại',
        'UPDATE_FAILED',
        400
      );
    }

    // Refresh user data
    const updatedUser = await PerfexAuthService.refreshUser();
    if (!updatedUser) {
      throw new PerfexAuthError('Không thể lấy thông tin mới', 'REFRESH_FAILED', 500);
    }

    return updatedUser;
  },

  /**
   * Kiểm tra email đã tồn tại chưa
   */
  checkEmailExists: async (email: string): Promise<boolean> => {
    try {
      // Try to get customers with this email
      const response = await apiFetch<any>(`/customers?search=${encodeURIComponent(email)}`);
      
      if (response.data && response.data.length > 0) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};

export default PerfexAuthService;
