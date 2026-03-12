/**
 * Token Management Service
 * Centralized token handling for Frontend apps
 *
 * PERSISTENT LOGIN: Uses localStorage on web for permanent sessions
 * Mobile uses SecureStore (iOS Keychain / Android Keystore)
 */

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER_ID: "auth_user_id",
  TOKEN_EXPIRY: "auth_token_expiry",
  REMEMBER_ME: "auth_remember_me", // For persistent login
} as const;

/**
 * Token Interface
 */
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

/**
 * Web Storage helper - uses localStorage for persistent login
 */
const webStorage = {
  getItem: (key: string): string | null => {
    try {
      // Try localStorage first (persistent), then sessionStorage (fallback)
      return localStorage.getItem(key) ?? sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      // Always use localStorage for persistent login
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(
        "[TokenService] localStorage failed, using sessionStorage",
        e,
      );
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key); // Clear both
    } catch {
      // Ignore
    }
  },
};

/**
 * Store tokens securely
 */
export const saveTokens = async (tokens: TokenData): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      // Web: use localStorage for persistent login
      webStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      webStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
      webStorage.setItem(
        STORAGE_KEYS.TOKEN_EXPIRY,
        tokens.expiresAt.toString(),
      );
      webStorage.setItem(STORAGE_KEYS.REMEMBER_ME, "true");
    } else {
      // Mobile: use SecureStore (iOS Keychain / Android Keystore)
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        SecureStore.setItemAsync(
          STORAGE_KEYS.REFRESH_TOKEN,
          tokens.refreshToken,
        ),
        SecureStore.setItemAsync(
          STORAGE_KEYS.TOKEN_EXPIRY,
          tokens.expiresAt.toString(),
        ),
        SecureStore.setItemAsync(STORAGE_KEYS.REMEMBER_ME, "true"),
      ]);
    }
    console.log("[TokenService] ✅ Tokens saved (persistent login enabled)");
  } catch (error) {
    console.error("[TokenService] ❌ Failed to save tokens:", error);
    throw error;
  }
};

/**
 * Retrieve access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return webStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } else {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    }
  } catch (error) {
    console.error("[TokenService] ❌ Failed to get access token:", error);
    return null;
  }
};

/**
 * Retrieve refresh token
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return webStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } else {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    }
  } catch (error) {
    console.error("[TokenService] ❌ Failed to get refresh token:", error);
    return null;
  }
};

/**
 * Check if access token is expired
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    let expiryStr: string | null;
    if (Platform.OS === "web") {
      expiryStr = webStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
    } else {
      expiryStr = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY);
    }

    if (!expiryStr) {
      return true; // No expiry = expired
    }

    const expiresAt = parseInt(expiryStr, 10);
    const now = Date.now();

    // Add 60s buffer to refresh before actual expiry
    const isExpired = now >= expiresAt - 60000;

    if (isExpired) {
      console.log("[TokenService] ⚠️ Token expired or expiring soon");
    }

    return isExpired;
  } catch (error) {
    console.error("[TokenService] ❌ Failed to check token expiry:", error);
    return true; // Treat as expired on error
  }
};

/**
 * Clear all tokens (logout)
 */
export const clearTokens = async (): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      webStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      webStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      webStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
      webStorage.removeItem(STORAGE_KEYS.USER_ID);
      webStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    } else {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REMEMBER_ME),
      ]);
    }
    console.log("[TokenService] 🗑️ Tokens cleared");
  } catch (error) {
    console.error("[TokenService] ❌ Failed to clear tokens:", error);
  }
};

/**
 * Check if persistent login is enabled
 */
export const isPersistentLoginEnabled = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "web") {
      return webStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true";
    } else {
      const value = await SecureStore.getItemAsync(STORAGE_KEYS.REMEMBER_ME);
      return value === "true";
    }
  } catch {
    return false;
  }
};

/**
 * Calculate token expiry timestamp
 * @param expiresIn - Token lifetime (e.g., "7d", "1h", "30m")
 */
export const calculateExpiryTimestamp = (expiresIn: string): number => {
  const now = Date.now();
  const match = expiresIn.match(/^(\d+)([dhms])$/);

  if (!match) {
    // Default to 7 days if format invalid
    return now + 7 * 24 * 60 * 60 * 1000;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    d: 24 * 60 * 60 * 1000, // days
    h: 60 * 60 * 1000, // hours
    m: 60 * 1000, // minutes
    s: 1000, // seconds
  };

  return now + value * multipliers[unit as keyof typeof multipliers];
};

/**
 * Parse JWT token to get expiry (without verification)
 * @param token - JWT token string
 */
export const parseJwtExpiry = (token: string): number | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64 payload
    const payload = JSON.parse(atob(parts[1]));

    // JWT exp is in seconds, convert to milliseconds
    return payload.exp ? payload.exp * 1000 : null;
  } catch (error) {
    console.error("[TokenService] ❌ Failed to parse JWT:", error);
    return null;
  }
};

/**
 * Save user ID (optional, for analytics/tracking)
 */
export const saveUserId = async (userId: string): Promise<void> => {
  try {
    if (Platform.OS === "web") {
      webStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
    }
  } catch (error) {
    console.error("[TokenService] ❌ Failed to save user ID:", error);
  }
};

/**
 * Get stored user ID
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    if (Platform.OS === "web") {
      return webStorage.getItem(STORAGE_KEYS.USER_ID);
    } else {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
    }
  } catch (error) {
    console.error("[TokenService] ❌ Failed to get user ID:", error);
    return null;
  }
};

/**
 * Get all tokens (for debugging)
 */
export const getAllTokens = async (): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}> => {
  const [accessToken, refreshToken, expiryStr] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
    Platform.OS === "web"
      ? webStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
      : SecureStore.getItemAsync(STORAGE_KEYS.TOKEN_EXPIRY),
  ]);

  return {
    accessToken,
    refreshToken,
    expiresAt: expiryStr ? parseInt(expiryStr, 10) : null,
  };
};

/**
 * Get tokens for biometric authentication
 * Returns both access and refresh tokens if available
 */
export const getTokens = async (): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> => {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      getAccessToken(),
      getRefreshToken(),
    ]);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("[TokenService] ❌ Failed to get tokens:", error);
    return null;
  }
};
