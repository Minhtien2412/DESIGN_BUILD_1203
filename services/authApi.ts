/**
 * Authentication API Services
 * Handles user registration, login, and authentication
 */

import { ApiError, apiFetch } from './api';

// Types
export type RegisterPayload = {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    role?: string;
    created_at?: string;
  };
};

export type User = {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  role?: string;
  created_at?: string;
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(payload: RegisterPayload): Promise<User> {
  try {
    const response = await apiFetch<{ id: string; email: string; full_name?: string }>('/api/auth/register', {
      method: 'POST',
      data: payload,
    });
    
    return {
      id: response.id,
      email: response.email,
      name: response.full_name,
      full_name: response.full_name,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.data?.error || 'Đăng ký thất bại');
    }
    throw new Error('Đăng ký thất bại');
  }
}

/**
 * Login user and get JWT token
 * POST /api/auth/login
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      data: { email, password },
    });
    
    if (!response.token) {
      throw new Error('Không nhận được token từ server');
    }
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.data?.error || error.data?.message || 'Đăng nhập thất bại';
      throw new Error(message);
    }
    throw new Error('Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng.');
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const response = await apiFetch<User>('/api/auth/me', {
      method: 'GET',
    });
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.data?.error || 'Không thể lấy thông tin người dùng');
    }
    throw new Error('Không thể lấy thông tin người dùng');
  }
}

/**
 * Logout user (optional server-side logout endpoint)
 * POST /api/auth/logout
 */
export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    // Ignore errors on logout - we'll clear local token anyway
    console.warn('Logout API call failed:', error);
  }
}
