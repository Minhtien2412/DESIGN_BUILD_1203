/**
 * ApiClient — Unified HTTP client for Clean Architecture
 * ======================================================
 * Wraps the existing services/api.ts (apiFetch, get, post, etc.)
 * so the data layer has a single, typed entry point.
 *
 * This is a thin adapter — NOT a rewrite. All retry, refresh-token,
 * timeout, and API-key logic stays in services/api.ts.
 */

import type { ApiFetchOptions } from "@/services/api";
import { ApiError, apiFetch, del, get, patch, post, put } from "@/services/api";

// Re-export ApiError for consumers
export { ApiError };

/**
 * Typed wrapper around the existing apiFetch.
 * Usage:
 *   const data = await apiClient.get<Product[]>('/products');
 *   const created = await apiClient.post<Product>('/products', dto);
 */
export const apiClient = {
  /**
   * GET request with optional query params merged into URL.
   */
  get<T = any>(path: string, params?: Record<string, any>): Promise<T> {
    if (params) {
      const filtered = Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      );
      if (filtered.length > 0) {
        const qs = new URLSearchParams(
          filtered.map(([k, v]) => [k, String(v)]),
        ).toString();
        return apiFetch<T>(`${path}?${qs}`, { method: "GET" });
      }
    }
    return get<T>(path);
  },

  /** POST request with JSON body. */
  post<T = any>(path: string, data?: any): Promise<T> {
    return post<T>(path, data);
  },

  /** PUT request with JSON body. */
  put<T = any>(path: string, data?: any): Promise<T> {
    return put<T>(path, data);
  },

  /** PATCH request with JSON body. */
  patch<T = any>(path: string, data?: any): Promise<T> {
    return patch<T>(path, data);
  },

  /** DELETE request. */
  delete<T = any>(path: string, data?: any): Promise<T> {
    return del<T>(path, data);
  },

  /** Raw apiFetch for special cases (form upload, custom headers, etc.) */
  request<T = any>(path: string, options?: ApiFetchOptions): Promise<T> {
    return apiFetch<T>(path, options);
  },
} as const;

export type ApiClient = typeof apiClient;
