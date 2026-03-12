/**
 * ThietKe Resort API Authentication Client
 * Base URL: Configured via ENV.API_BASE_URL
 * Auth: Bearer Token (JWT) on Authorization header
 */

import ENV from "@/config/env";
import { apiFetch } from "./api";

// Types matching the API specification
export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
  };
  access_token: string;
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
}

export interface UserProfile {
  sub: string;
  email: string;
  role: string;
  full_name?: string;
  phone?: string;
}

export interface ApiErrorResponse {
  error:
    | "NO_TOKEN"
    | "INVALID_TOKEN"
    | "INVALID_INPUT"
    | "EMAIL_PASSWORD_REQUIRED"
    | "NO_FIELDS"
    | "NOT_FOUND"
    | "EMAIL_EXISTS"
    | string;
}

/**
 * Authentication API Client for ThietKe Resort
 */
export class ThietKeAuthClient {
  private baseUrl: string;

  constructor(baseUrl = ENV.API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user
   * POST /auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Login with email and password
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get new access token using refresh token
   * POST /auth/refresh
   */
  async refresh(refreshToken: string): Promise<RefreshResponse> {
    try {
      const response = await apiFetch<RefreshResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      return response;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user profile
   * GET /me + Header Authorization: Bearer <access_token>
   */
  async getProfile(accessToken: string): Promise<{ user: UserProfile }> {
    try {
      const response = await apiFetch<{ user: UserProfile }>("/me", {
        method: "GET",
        token: accessToken,
      });
      return response;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle authentication errors according to API specification
   */
  private handleAuthError(error: any): Error {
    if (error?.status === 401) {
      if (error?.body?.error === "NO_TOKEN") {
        return new Error("Token bị thiếu. Vui lòng đăng nhập lại.");
      }
      if (error?.body?.error === "INVALID_TOKEN") {
        return new Error("Token không hợp lệ. Vui lòng đăng nhập lại.");
      }
      return new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    if (error?.status === 400) {
      if (error?.body?.error === "INVALID_INPUT") {
        return new Error("Dữ liệu đầu vào không hợp lệ.");
      }
      if (error?.body?.error === "EMAIL_PASSWORD_REQUIRED") {
        return new Error("Email và mật khẩu là bắt buộc.");
      }
      if (error?.body?.error === "NO_FIELDS") {
        return new Error("Thiếu thông tin bắt buộc.");
      }
      return new Error("Dữ liệu không hợp lệ.");
    }

    if (error?.status === 404) {
      return new Error("Không tìm thấy tài khoản.");
    }

    if (error?.status === 409) {
      if (error?.body?.error === "EMAIL_EXISTS") {
        return new Error("Email đã được sử dụng. Vui lòng chọn email khác.");
      }
      return new Error("Dữ liệu đã tồn tại.");
    }

    if (error?.status >= 500) {
      return new Error("Lỗi máy chủ. Vui lòng thử lại sau.");
    }

    return new Error(error?.message || "Đã xảy ra lỗi không xác định.");
  }
}

// Singleton instance
export const thietKeAuth = new ThietKeAuthClient();

// Convenience functions matching the pseudo-code in documentation
export const register = (data: RegisterRequest) => thietKeAuth.register(data);
export const login = (data: LoginRequest) => thietKeAuth.login(data);
export const refreshToken = (token: string) => thietKeAuth.refresh(token);
export const getMe = (accessToken: string) =>
  thietKeAuth.getProfile(accessToken);
