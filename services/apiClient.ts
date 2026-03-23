/**
 * API Client with Axios - Integrated with ThietKeResort Backend API v2.0
 * Based on: FRONTEND-INTEGRATION-GUIDE.md
 *
 * Features:
 * - Auto-refresh token mechanism
 * - Request/Response interceptors
 * - Error handling with ApiError class
 * - Retry logic for rate limiting
 * - Type-safe endpoints
 */

import ENV from "@/config/env";
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import { Platform } from "react-native";

// ============================================================================
// Constants
// ============================================================================

const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const CACHE_TTL = 30000; // 30 seconds cache
const DEBOUNCE_MS = 300; // 300ms debounce

// ============================================================================
// Request Cache & Deduplication
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

// Cache for GET requests
const requestCache = new Map<string, CacheEntry<any>>();
// Pending requests for deduplication
const pendingRequests = new Map<string, PendingRequest<any>>();
// Debounce timers
const debounceTimers = new Map<string, NodeJS.Timeout>();
// AbortControllers for cancellation
const abortControllers = new Map<string, AbortController>();

/**
 * Generate cache key from request config
 */
function getCacheKey(method: string, url: string, params?: any): string {
  const paramsStr = params ? JSON.stringify(params) : "";
  return `${method}:${url}:${paramsStr}`;
}

/**
 * Get cached response if valid
 */
function getCached<T>(key: string): T | null {
  const entry = requestCache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    console.log(`[ApiClient] 📦 Cache hit: ${key.substring(0, 50)}...`);
    return entry.data;
  }
  if (entry) {
    requestCache.delete(key); // Clean expired
  }
  return null;
}

/**
 * Set cache entry
 */
function setCache<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
  requestCache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl,
  });
}

/**
 * Clear cache (specific key or all)
 */
export function clearCache(key?: string): void {
  if (key) {
    requestCache.delete(key);
  } else {
    requestCache.clear();
  }
  console.log(`[ApiClient] 🗑️ Cache cleared${key ? `: ${key}` : " (all)"}`);
}

/**
 * Clear cache by URL pattern
 */
export function clearCacheByPattern(pattern: string | RegExp): void {
  const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
  let count = 0;
  for (const key of requestCache.keys()) {
    if (regex.test(key)) {
      requestCache.delete(key);
      count++;
    }
  }
  console.log(`[ApiClient] 🗑️ Cleared ${count} cache entries matching pattern`);
}

// ============================================================================
// Error Class
// ============================================================================

export class ApiError extends Error {
  status?: number;
  statusText?: string;
  code?: string;
  requestId?: string;
  data?: any;
  url?: string;

  constructor(
    message: string,
    options: {
      status?: number;
      statusText?: string;
      code?: string;
      requestId?: string;
      data?: any;
      url?: string;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.code = options.code;
    this.requestId = options.requestId;
    this.data = options.data;
    this.url = options.url;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// ============================================================================
// Token Management
// ============================================================================

let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

export const setAuthTokens = async (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  // Store tokens using token.service for consistency (SecureStore)
  const { saveTokens, calculateExpiryTimestamp } =
    await import("./token.service");
  await saveTokens({
    accessToken: access,
    refreshToken: refresh,
    expiresAt: calculateExpiryTimestamp("1h"), // 1 hour default
  });
  console.log("[ApiClient] ✅ Tokens set successfully");
};

export const clearAuthTokens = async () => {
  accessToken = null;
  refreshToken = null;
  // Clear tokens using token.service for consistency
  const { clearTokens } = await import("./token.service");
  await clearTokens();
  console.log("[ApiClient] 🗑️ Tokens cleared");
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!accessToken) {
    const { getAccessToken: getStoredAccessToken } =
      await import("./token.service");
    accessToken = await getStoredAccessToken();
  }
  return accessToken;
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (!refreshToken) {
    // Import from token.service to use SecureStore with correct key
    const { getRefreshToken: getStoredRefreshToken } =
      await import("./token.service");
    refreshToken = await getStoredRefreshToken();
  }
  return refreshToken;
};

/**
 * Manually trigger token refresh
 * Used by WebSocket manager when JWT expires
 */
export const doRefreshToken = async (): Promise<string | null> => {
  try {
    const refresh = await getRefreshToken();
    if (!refresh) {
      console.log("[ApiClient] No refresh token available");
      return null;
    }

    console.log("[ApiClient] 🔄 Manual token refresh...");

    const response = await axios.post(
      `${normalizeBaseUrl(ENV.API_BASE_URL)}/auth/refresh`,
      { refreshToken: refresh },
      { timeout: API_TIMEOUT },
    );

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      response.data;

    await setAuthTokens(newAccessToken, newRefreshToken);
    console.log("[ApiClient] ✅ Token refreshed successfully");

    return newAccessToken;
  } catch (error) {
    console.error("[ApiClient] ❌ Token refresh failed:", error);
    return null;
  }
};

// Notify all waiting requests when token is refreshed
const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Add request to waiting queue
const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

export function normalizeBaseUrl(base: string): string {
  try {
    const url = new URL(base);
    // Android emulator cannot reach localhost on host machine
    if (
      Platform.OS === "android" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1")
    ) {
      url.hostname = "10.0.2.2";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    // Fallback for non-URL strings
    if (
      Platform.OS === "android" &&
      (base.includes("localhost") || base.includes("127.0.0.1"))
    ) {
      return base
        .replace("localhost", "10.0.2.2")
        .replace("127.0.0.1", "10.0.2.2")
        .replace(/\/$/, "");
    }
    return base.replace(/\/$/, "");
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: normalizeBaseUrl(ENV.API_BASE_URL),
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================================
// Base URL Management
// ============================================================================

/**
 * Get current API base URL
 */
export function getApiBaseUrl(): string {
  return apiClient.defaults.baseURL || normalizeBaseUrl(ENV.API_BASE_URL);
}

/**
 * Set API base URL dynamically (for fallback servers)
 */
export function setApiBaseUrl(url: string): void {
  apiClient.defaults.baseURL = normalizeBaseUrl(url);
  console.log("[ApiClient] Base URL changed to:", apiClient.defaults.baseURL);
}

// ============================================================================
// Request Interceptor - Add Token
// ============================================================================

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(`[ApiClient] → ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => {
    console.error("[ApiClient] Request error:", error);
    return Promise.reject(error);
  },
);

// ============================================================================
// Response Interceptor - Auto Refresh Token
// ============================================================================

apiClient.interceptors.response.use(
  (response) => {
    // Success - return data directly
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for token refresh to complete
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string | null) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = await getRefreshToken();

        if (!refresh) {
          // No refresh token - user not logged in, silently reject
          console.log(
            "[ApiClient] ℹ️ No refresh token - user not authenticated",
          );
          isRefreshing = false;
          return Promise.reject(
            new ApiError("Not authenticated", {
              status: 401,
              code: "NO_TOKEN",
            }),
          );
        }

        console.log("[ApiClient] 🔄 Refreshing token...");

        // Call refresh token endpoint
        const response = await axios.post(
          `${normalizeBaseUrl(ENV.API_BASE_URL)}/auth/refresh`,
          { refreshToken: refresh },
          { timeout: API_TIMEOUT },
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;

        // Update tokens
        await setAuthTokens(newAccessToken, newRefreshToken);

        // Update request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Notify all waiting requests
        onRefreshed(newAccessToken);

        console.log("[ApiClient] ✅ Token refreshed successfully");

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("[ApiClient] ❌ Token refresh failed:", refreshError);

        // Clear tokens and redirect to login
        await clearAuthTokens();
        onRefreshed(null);

        // You can emit an event here to trigger login screen
        // EventEmitter.emit('AUTH_TOKEN_EXPIRED');

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 429 Rate Limit
    if (error.response?.status === 429) {
      const responseData = error.response.data as any;
      const retryAfter = responseData?.retryAfter || 60;
      console.warn(`[ApiClient] ⏱️ Rate limited. Retry after ${retryAfter}s`);

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          apiClient(originalRequest).then(resolve).catch(reject);
        }, retryAfter * 1000);
      });
    }

    // Transform error to ApiError
    const responseData = error.response?.data as any;
    const apiError = new ApiError(
      responseData?.message || error.message || "Unknown error occurred",
      {
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: responseData?.code || error.code,
        data: error.response?.data,
        url: error.config?.url,
      },
    );

    console.error("[ApiClient] ❌ Response error:", {
      url: apiError.url,
      status: apiError.status,
      message: apiError.message,
      code: apiError.code,
    });

    return Promise.reject(apiError);
  },
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Retry API call with exponential backoff
 */
export async function apiCallWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = MAX_RETRIES,
  baseDelay = RETRY_DELAY,
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 429 &&
        i < maxRetries - 1
      ) {
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff
        console.log(
          `[ApiClient] Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// Request options with caching/deduplication control
export interface RequestOptions extends AxiosRequestConfig {
  /** Use cached response if available (default: true for GET) */
  useCache?: boolean;
  /** Cache TTL in milliseconds (default: 30000) */
  cacheTtl?: number;
  /** Deduplicate concurrent requests (default: true) */
  dedupe?: boolean;
  /** Cancel previous request to same endpoint (default: false) */
  cancelPrevious?: boolean;
  /** Debounce request by milliseconds (default: 0 = no debounce) */
  debounceMs?: number;
}

/**
 * Make a GET request with caching & deduplication
 */
export async function get<T = any>(
  url: string,
  config?: RequestOptions,
): Promise<T> {
  const {
    useCache = true,
    cacheTtl = CACHE_TTL,
    dedupe = true,
    cancelPrevious = false,
    debounceMs = 0,
    ...axiosConfig
  } = config || {};

  const cacheKey = getCacheKey("GET", url, axiosConfig.params);

  // Check cache first
  if (useCache) {
    const cached = getCached<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  // Cancel previous request if needed
  if (cancelPrevious) {
    const existingController = abortControllers.get(cacheKey);
    if (existingController) {
      existingController.abort();
      console.log(`[ApiClient] ⏹️ Cancelled previous request: ${url}`);
    }
    const controller = new AbortController();
    abortControllers.set(cacheKey, controller);
    axiosConfig.signal = controller.signal;
  }

  // Deduplicate: return existing promise if same request is pending
  if (dedupe) {
    const pending = pendingRequests.get(cacheKey);
    if (pending && Date.now() - pending.timestamp < 5000) {
      console.log(`[ApiClient] 🔄 Deduped: ${url}`);
      return pending.promise;
    }
  }

  // Debounce if needed
  if (debounceMs > 0) {
    return new Promise((resolve, reject) => {
      const existingTimer = debounceTimers.get(cacheKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(async () => {
        debounceTimers.delete(cacheKey);
        try {
          const result = await executeGet<T>(
            url,
            cacheKey,
            axiosConfig,
            useCache,
            cacheTtl,
            dedupe,
          );
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, debounceMs);

      debounceTimers.set(cacheKey, timer as unknown as NodeJS.Timeout);
    });
  }

  return executeGet<T>(url, cacheKey, axiosConfig, useCache, cacheTtl, dedupe);
}

async function executeGet<T>(
  url: string,
  cacheKey: string,
  axiosConfig: AxiosRequestConfig,
  useCache: boolean,
  cacheTtl: number,
  dedupe: boolean,
): Promise<T> {
  const promise = apiClient.get<any, T>(url, axiosConfig);

  if (dedupe) {
    pendingRequests.set(cacheKey, { promise, timestamp: Date.now() });
  }

  try {
    const result = await promise;

    // Cache successful response
    if (useCache) {
      setCache(cacheKey, result, cacheTtl);
    }

    return result;
  } finally {
    pendingRequests.delete(cacheKey);
    abortControllers.delete(cacheKey);
  }
}

/**
 * Make a POST request (invalidates related cache)
 */
export async function post<T = any>(
  url: string,
  data?: any,
  config?: RequestOptions,
): Promise<T> {
  const { cancelPrevious = false, ...axiosConfig } = config || {};

  // Cancel previous if needed
  if (cancelPrevious) {
    const cacheKey = getCacheKey("POST", url, data);
    const existingController = abortControllers.get(cacheKey);
    if (existingController) {
      existingController.abort();
    }
    const controller = new AbortController();
    abortControllers.set(cacheKey, controller);
    axiosConfig.signal = controller.signal;
  }

  const result = await apiClient.post<any, T>(url, data, axiosConfig);

  // Invalidate related GET caches
  clearCacheByPattern(new RegExp(url.split("/").slice(0, -1).join("/") || url));

  return result;
}

/**
 * Make a PUT request (invalidates related cache)
 */
export async function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  const result = await apiClient.put<any, T>(url, data, config);
  clearCacheByPattern(new RegExp(url.split("/").slice(0, -1).join("/") || url));
  return result;
}

/**
 * Make a DELETE request (invalidates related cache)
 */
export async function del<T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const result = await apiClient.delete<any, T>(url, config);
  clearCacheByPattern(new RegExp(url.split("/").slice(0, -1).join("/") || url));
  return result;
}

/**
 * Make a PATCH request (invalidates related cache)
 */
export async function patch<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  const result = await apiClient.patch<any, T>(url, data, config);
  clearCacheByPattern(new RegExp(url.split("/").slice(0, -1).join("/") || url));
  return result;
}

/**
 * Cancel all pending requests (useful when navigating away)
 */
export function cancelAllRequests(): void {
  for (const [key, controller] of abortControllers.entries()) {
    controller.abort();
  }
  abortControllers.clear();
  pendingRequests.clear();
  for (const timer of debounceTimers.values()) {
    clearTimeout(timer);
  }
  debounceTimers.clear();
  console.log("[ApiClient] ⏹️ All pending requests cancelled");
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: requestCache.size,
    keys: Array.from(requestCache.keys()),
  };
}

// ============================================================================
// Export
// ============================================================================

export default apiClient;
export { apiClient };
