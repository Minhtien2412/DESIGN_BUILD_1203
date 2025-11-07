/**
 * API Client Configuration
 * Centralized API configuration and interceptors
 */

import { router } from 'expo-router';

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Auth token storage key
const AUTH_TOKEN_KEY = 'auth_token';

/**
 * Get stored auth token
 */
export const getAuthToken = async (): Promise<string | null> => {
  // TODO: Implement with SecureStore
  // return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  return null;
};

/**
 * Set auth token
 */
export const setAuthToken = async (token: string): Promise<void> => {
  // TODO: Implement with SecureStore
  // await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
};

/**
 * Clear auth token
 */
export const clearAuthToken = async (): Promise<void> => {
  // TODO: Implement with SecureStore
  // await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
};

/**
 * Build request headers
 */
const buildHeaders = async (customHeaders?: Record<string, string>) => {
  const token = await getAuthToken();
  
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };
};

/**
 * Handle API errors
 */
const handleApiError = (error: any, url: string) => {
  console.error(`API Error [${url}]:`, error);

  // Handle 401 Unauthorized
  if (error.status === 401) {
    clearAuthToken();
    router.replace('/(auth)/sign-in');
    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
  }

  // Handle 403 Forbidden
  if (error.status === 403) {
    throw new Error('Bạn không có quyền truy cập tài nguyên này.');
  }

  // Handle 404 Not Found
  if (error.status === 404) {
    throw new Error('Không tìm thấy tài nguyên.');
  }

  // Handle 500 Server Error
  if (error.status >= 500) {
    throw new Error('Lỗi máy chủ. Vui lòng thử lại sau.');
  }

  // Handle network errors
  if (error.message === 'Network request failed') {
    throw new Error('Không có kết nối mạng. Vui lòng kiểm tra lại.');
  }

  // Generic error
  throw new Error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
};

/**
 * Make API request with retry logic
 */
const makeRequest = async (
  url: string,
  options: RequestInit,
  retryCount = 0
): Promise<Response> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response;
  } catch (error: any) {
    // Retry on network errors
    if (retryCount < API_CONFIG.RETRY_ATTEMPTS && error.name === 'AbortError') {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return makeRequest(url, options, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Main API client function
 */
export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const headers = await buildHeaders(options.headers as Record<string, string>);

  try {
    const response = await makeRequest(url, {
      ...options,
      headers,
    });

    // Parse response
    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    // Handle error responses
    if (!response.ok) {
      handleApiError({ status: response.status, message: data?.message }, url);
    }

    return data;
  } catch (error: any) {
    handleApiError(error, url);
    throw error; // Should never reach here due to handleApiError throwing
  }
};

/**
 * Convenience methods
 */
export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  upload: async <T = any>(endpoint: string, formData: FormData, options?: RequestInit) => {
    const token = await getAuthToken();
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      body: formData,
    });

    if (!response.ok) {
      handleApiError({ status: response.status }, url);
    }

    return response.json() as Promise<T>;
  },
};

export default api;
