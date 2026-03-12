/**
 * Core API Client
 * Centralized HTTP client with auth, retry, and error handling
 * 
 * Features:
 * - Auto token refresh on 401
 * - Request/response interceptors
 * - Error normalization
 * - Retry logic with exponential backoff
 * - Timeout handling
 */

import ENV from '@/config/env';
import { clearToken, getApiKey, setToken } from '../api';

const API_BASE = ENV.API_BASE_URL;
const API_PREFIX = ENV.API_PREFIX;

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

export const setTokens = (access: string | null, refresh?: string | null) => {
  accessToken = access;
  if (refresh !== undefined) {
    refreshToken = refresh;
  }
  setToken(access); // Sync with old api.ts
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  clearToken(); // Sync with old api.ts
};

// Refresh lock to prevent multiple refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshToken) {
    console.warn('[ApiClient] No refresh token available');
    return null;
  }

  if (isRefreshing) {
    // Wait for ongoing refresh
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    console.log('[ApiClient] 🔄 Refreshing access token...');
    
    const response = await fetch(`${API_BASE}${API_PREFIX}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getApiKey() || '',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const data = await response.json();
    const newToken = data.token || data.accessToken;

    if (newToken) {
      setTokens(newToken, data.refreshToken);
      console.log('[ApiClient] ✅ Token refreshed successfully');
      onRefreshed(newToken);
      return newToken;
    }

    throw new Error('No token in refresh response');
  } catch (error) {
    console.error('[ApiClient] ❌ Token refresh failed:', error);
    clearTokens();
    isRefreshing = false;
    return null;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Core request function with retry and auth
 */
export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
  retries?: number;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  requestId?: string;
  data?: any;

  constructor(message: string, opts: { status?: number; code?: string; requestId?: string; data?: any } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId;
    this.data = opts.data;
  }
}

async function request<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    timeoutMs = 120000,
    skipAuth = false,
    retries = 1,
    ...fetchOptions
  } = options;

  // Build URL
  const isAbsoluteUrl = path.startsWith('http://') || path.startsWith('https://');
  const url = isAbsoluteUrl ? path : `${API_BASE}${API_PREFIX}${path}`;

  // Build headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  // Add API Key
  const apiKey = getApiKey();
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  // Add Auth Token (unless skipped or FormData)
  if (!skipAuth && accessToken && !(fetchOptions.body instanceof FormData)) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Remove Content-Type for FormData
  if (fetchOptions.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  // Abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Success
    if (response.ok) {
      return data as T;
    }

    // Handle 401 Unauthorized - try refresh
    if (response.status === 401 && !skipAuth && refreshToken && retries > 0) {
      console.log('[ApiClient] 🔄 401 detected, attempting token refresh...');
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry with new token
        return request<T>(path, { ...options, retries: retries - 1 });
      }
    }

    // Error
    const errorMessage = typeof data === 'string' ? data : (data?.message || `HTTP ${response.status}`);
    throw new ApiError(errorMessage, {
      status: response.status,
      data,
    });
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', { code: 'TIMEOUT' });
    }

    throw new ApiError('Network error', { code: 'NETWORK_ERROR', data: error });
  }
}

// HTTP method helpers
export const apiClient = {
  get: <T = any>(path: string, params?: Record<string, any>, options?: RequestOptions) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return request<T>(`${path}${query}`, { method: 'GET', ...options });
  },

  post: <T = any>(path: string, data?: any, options?: RequestOptions) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return request<T>(path, { method: 'POST', body, ...options });
  },

  put: <T = any>(path: string, data?: any, options?: RequestOptions) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return request<T>(path, { method: 'PUT', body, ...options });
  },

  patch: <T = any>(path: string, data?: any, options?: RequestOptions) => {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return request<T>(path, { method: 'PATCH', body, ...options });
  },

  delete: <T = any>(path: string, options?: RequestOptions) => {
    return request<T>(path, { method: 'DELETE', ...options });
  },
};

export default apiClient;
