/**
 * @deprecated Use `services/api/authApi.ts` instead — this file is the legacy root-level copy.
 *
 * Authentication API Service
 * Based on FRONTEND-INTEGRATION-GUIDE.md
 *
 * Endpoints:
 * - POST /auth/register - Register new user
 * - POST /auth/login - Login user
 * - POST /auth/logout - Logout user
 * - POST /auth/refresh - Refresh access token
 */

import { clearAuthTokens, post, setAuthTokens } from "./apiClient";

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  roleName: string;
  createdAt: string;
  isActive: boolean;
  phone?: string;
  avatar?: string;
}

export interface AuthResponse {
  message: string;
  success?: boolean; // Optional for compatibility with offline mock
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: "client" | "contractor" | "company" | "architect";
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// ============================================================================
// Auth API Functions
// ============================================================================

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  console.log("[AuthAPI] Registering user:", data.email);

  const response = await post<AuthResponse>("/auth/register", {
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    role: data.role || "client",
    phone: data.phone,
  });

  // Store tokens
  await setAuthTokens(response.accessToken, response.refreshToken);

  console.log(
    "[AuthAPI] ✅ User registered successfully:",
    response.user.email,
  );

  return response;
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  console.log("[AuthAPI] Logging in user:", data.email);

  const response = await post<AuthResponse>("/auth/login", {
    email: data.email,
    password: data.password,
  });

  // Store tokens
  await setAuthTokens(response.accessToken, response.refreshToken);

  console.log("[AuthAPI] ✅ User logged in successfully:", response.user.email);

  return response;
}

/**
 * Logout user
 */
export async function logout(refreshToken: string): Promise<void> {
  console.log("[AuthAPI] Logging out user");

  try {
    await post("/auth/logout", {
      refreshToken,
    });
  } catch (error) {
    console.warn("[AuthAPI] Logout request failed:", error);
    // Continue with local cleanup even if server request fails
  } finally {
    // Clear local tokens
    await clearAuthTokens();
    console.log("[AuthAPI] ✅ User logged out");
  }
}

/**
 * Refresh access token
 * Note: This is usually called automatically by apiClient interceptor
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
}> {
  console.log("[AuthAPI] Refreshing access token");

  const response = await post("/auth/refresh", {
    refreshToken,
  });

  // Store new tokens
  await setAuthTokens(response.accessToken, response.refreshToken);

  console.log("[AuthAPI] ✅ Token refreshed successfully");

  return response;
}

/**
 * Get current user profile
 * (If backend provides this endpoint)
 */
export async function getCurrentUser(): Promise<User> {
  console.log("[AuthAPI] Fetching current user profile");

  const response = await post<{ user: User }>("/auth/me");

  return response.user;
}

/**
 * Update user profile
 * (If backend provides this endpoint)
 */
export async function updateProfile(data: {
  fullName?: string;
  phone?: string;
  avatar?: string;
}): Promise<User> {
  console.log("[AuthAPI] Updating user profile");

  const response = await post<{ user: User }>("/me", data);

  return response.user;
}

/**
 * Change password
 * (If backend provides this endpoint)
 */
export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  console.log("[AuthAPI] Changing password");

  await post("/auth/change-password", data);

  console.log("[AuthAPI] ✅ Password changed successfully");
}

/**
 * Request password reset
 * (If backend provides this endpoint)
 */
export async function requestPasswordReset(email: string): Promise<void> {
  console.log("[AuthAPI] Requesting password reset for:", email);

  await post("/auth/forgot-password", { email });

  console.log("[AuthAPI] ✅ Password reset email sent");
}

/**
 * Reset password with token
 * (If backend provides this endpoint)
 */
export async function resetPassword(data: {
  token: string;
  newPassword: string;
}): Promise<void> {
  console.log("[AuthAPI] Resetting password");

  await post("/auth/reset-password", data);

  console.log("[AuthAPI] ✅ Password reset successfully");
}

// ============================================================================
// Export
// ============================================================================

export default {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
};
