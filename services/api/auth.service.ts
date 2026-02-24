/**
 * @deprecated Use `services/api/authApi.ts` instead — this file is superseded.
 *
 * Authentication Service
 * Handles user authentication endpoints
 *
 * Endpoints:
 * - POST /auth/register
 * - POST /auth/login
 * - POST /auth/refresh
 * - POST /auth/logout
 * - GET /auth/me
 */

import { apiClient, clearTokens, setTokens } from "./client";
import type {
    AuthResponse,
    LoginCredentials,
    RefreshTokenRequest,
    RegisterData,
    User,
} from "./types";

export const authService = {
  /**
   * Register new user
   * POST /auth/register
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    console.log("[AuthService] 📝 Registering user:", data.email);

    const response = await apiClient.post<AuthResponse>(
      "/auth/register",
      data,
      {
        skipAuth: true, // Public endpoint
      },
    );

    // Save tokens (backend returns accessToken)
    if (response.accessToken) {
      setTokens(response.accessToken, response.refreshToken);
    }

    console.log("[AuthService] ✅ Registration successful");
    return response;
  },

  /**
   * Login user
   * POST /auth/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log("[AuthService] 🔐 Logging in:", credentials.email);

    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials,
      {
        skipAuth: true, // Public endpoint
      },
    );

    // Save tokens (backend returns accessToken)
    if (response.accessToken) {
      setTokens(response.accessToken, response.refreshToken);
    }

    console.log("[AuthService] ✅ Login successful");
    return response;
  },

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  refresh: async (request: RefreshTokenRequest): Promise<AuthResponse> => {
    console.log("[AuthService] 🔄 Refreshing token");

    const response = await apiClient.post<AuthResponse>(
      "/auth/refresh",
      request,
      {
        skipAuth: true,
      },
    );

    // Update tokens (backend returns accessToken)
    if (response.accessToken) {
      setTokens(response.accessToken, response.refreshToken);
    }

    console.log("[AuthService] ✅ Token refreshed");
    return response;
  },

  /**
   * Logout user
   * POST /auth/logout
   */
  logout: async (): Promise<void> => {
    console.log("[AuthService] 👋 Logging out");

    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.warn("[AuthService] Logout request failed (continuing):", error);
    } finally {
      // Clear local tokens regardless of API response
      clearTokens();
      console.log("[AuthService] ✅ Logged out locally");
    }
  },

  /**
   * Get current user
   * GET /auth/me
   */
  me: async (): Promise<User> => {
    console.log("[AuthService] 👤 Fetching current user");

    const response = await apiClient.get<User>("/auth/me");

    console.log("[AuthService] ✅ User fetched:", response.email);
    return response;
  },
};

export default authService;
