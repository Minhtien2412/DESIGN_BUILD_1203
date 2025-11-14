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

import ENV from '@/config/env';
import { clearToken as clearStorageToken, getToken, setToken as setStorageToken } from '@/utils/storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';

// ============================================================================
// Constants
// ============================================================================

const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

  constructor(message: string, options: {
    status?: number;
    statusText?: string;
    code?: string;
    requestId?: string;
    data?: any;
    url?: string;
  } = {}) {
    super(message);
    this.name = 'ApiError';
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
let refreshSubscribers: Array<(token: string | null) => void> = [];

export const setAuthTokens = async (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  // Store both tokens - using different keys
  await setStorageToken(access); // Main token key
  await (async () => {
    const { setItem } = await import('@/utils/storage');
    await setItem('refresh_token', refresh);
  })();
  console.log('[ApiClient] ✅ Tokens set successfully');
};

export const clearAuthTokens = async () => {
  accessToken = null;
  refreshToken = null;
  await clearStorageToken();
  const { deleteItem } = await import('@/utils/storage');
  await deleteItem('refresh_token');
  console.log('[ApiClient] 🗑️ Tokens cleared');
};

export const getAccessToken = async (): Promise<string | null> => {
  if (!accessToken) {
    accessToken = await getToken();
  }
  return accessToken;
};

export const getRefreshToken = async (): Promise<string | null> => {
  if (!refreshToken) {
    const { getItem } = await import('@/utils/storage');
    refreshToken = await getItem('refresh_token');
  }
  return refreshToken;
};

// Notify all waiting requests when token is refreshed
const onRefreshed = (token: string | null) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Add request to waiting queue
const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

// ============================================================================
// Axios Instance Configuration
// ============================================================================

function normalizeBaseUrl(base: string): string {
  try {
    const url = new URL(base);
    // Android emulator cannot reach localhost on host machine
    if (
      Platform.OS === 'android' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    ) {
      url.hostname = '10.0.2.2';
    }
    return url.toString().replace(/\/$/, '');
  } catch {
    // Fallback for non-URL strings
    if (
      Platform.OS === 'android' &&
      (base.includes('localhost') || base.includes('127.0.0.1'))
    ) {
      return base
        .replace('localhost', '10.0.2.2')
        .replace('127.0.0.1', '10.0.2.2')
        .replace(/\/$/, '');
    }
    return base.replace(/\/$/, '');
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: normalizeBaseUrl(ENV.API_BASE_URL),
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    console.error('[ApiClient] Request error:', error);
    return Promise.reject(error);
  }
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
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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
          throw new Error('No refresh token available');
        }

        console.log('[ApiClient] 🔄 Refreshing token...');

        // Call refresh token endpoint
        const response = await axios.post(
          `${normalizeBaseUrl(ENV.API_BASE_URL)}/auth/refresh`,
          { refreshToken: refresh },
          { timeout: API_TIMEOUT }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens
        await setAuthTokens(newAccessToken, newRefreshToken);

        // Update request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Notify all waiting requests
        onRefreshed(newAccessToken);

        console.log('[ApiClient] ✅ Token refreshed successfully');

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[ApiClient] ❌ Token refresh failed:', refreshError);
        
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
          apiClient(originalRequest)
            .then(resolve)
            .catch(reject);
        }, retryAfter * 1000);
      });
    }

    // Transform error to ApiError
    const responseData = error.response?.data as any;
    const apiError = new ApiError(
      responseData?.message || error.message || 'Unknown error occurred',
      {
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: responseData?.code || error.code,
        data: error.response?.data,
        url: error.config?.url,
      }
    );

    console.error('[ApiClient] ❌ Response error:', {
      url: apiError.url,
      status: apiError.status,
      message: apiError.message,
      code: apiError.code,
    });

    return Promise.reject(apiError);
  }
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
  baseDelay = RETRY_DELAY
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error instanceof ApiError && error.status === 429 && i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff
        console.log(`[ApiClient] Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Make a GET request
 */
export async function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.get(url, config);
}

/**
 * Make a POST request
 */
export async function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.post(url, data, config);
}

/**
 * Make a PUT request
 */
export async function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.put(url, data, config);
}

/**
 * Make a DELETE request
 */
export async function del<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.delete(url, config);
}

/**
 * Make a PATCH request
 */
export async function patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return apiClient.patch(url, data, config);
}

// ============================================================================
// Export
// ============================================================================

export default apiClient;
export { apiClient };
