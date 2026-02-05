// API base default (production). Can be overridden by EXPO_PUBLIC_API_BASE_URL for local/dev runs.
// Backend: Fastify on 127.0.0.1:4000, public via Nginx at https://api.thietkeresort.com.vn
import ENV from "@/config/env";
import { Platform } from "react-native";

function normalizeBaseUrl(base: string) {
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

const API = normalizeBaseUrl(ENV.API_BASE_URL);
const API_PREFIX = ENV.API_PREFIX.replace(/\/$/, "");
export const API_BASE = API;

// API Key management - Initialize from ENV immediately
let apiKey: string | null = ENV.API_KEY;

if (apiKey) {
  console.log("[API] ? API key initialized:", apiKey.substring(0, 15) + "...");
} else {
  console.error("[API] ? CRITICAL: No API key! Requests will fail!");
}

export const setApiKey = (key: string | null) => {
  apiKey = key;
  if (key) {
    console.log("[API] ? API key updated:", key.substring(0, 15) + "...");
  }
};
export const getApiKey = () => apiKey;

// Refresh Token management - For token refresh flow
let refreshToken: string | null = null;

export const setRefreshToken = (token: string | null) => {
  refreshToken = token;
  if (token) {
    console.log("[API] ?? Refresh token updated");
  }
};
export const getRefreshToken = () => refreshToken;

// Small exported options type used across the codebase. Keep lightweight.
export type ApiFetchOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  token?: string;
  data?: any;
  responseType?: "json" | "blob" | "text" | "arraybuffer"; // For file downloads
};

export class ApiError {
  name: string = "ApiError";
  message: string;
  status?: number;
  code?: string;
  requestId?: string;
  data?: any;
  stack?: string;

  constructor(message: string, opts: any = {}) {
    this.message = message;
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId;
    this.data = opts.data ?? opts.body ?? null;

    // Capture stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    } else {
      this.stack = new Error().stack;
    }
  }
}

let authToken: string | null = null;
export const setToken = (t: string | null) => {
  authToken = t;
  console.log("[API] Token set:", t ? `${t.substring(0, 20)}...` : "null");
};
export const clearToken = () => {
  authToken = null;
  console.log("[API] Token cleared");
};
export const getAuthToken = () => authToken;
// Friendly alias for clarity at callsites
export const setAuthToken = setToken;

// --- Token refresh machinery (no circular deps) ---
let isRefreshing = false;
let refreshWaiters: ((token: string | null) => void)[] = [];

// Optional persistence hook set by other modules (e.g., secure storage)
let persistTokenCallback:
  | ((token: string | null) => void | Promise<void>)
  | null = null;
export function setTokenPersistor(
  fn: ((token: string | null) => void | Promise<void>) | null,
) {
  persistTokenCallback = fn;
}

// Logout callback - Called when token refresh fails completely
let logoutCallback: (() => void | Promise<void>) | null = null;
export function setLogoutCallback(fn: (() => void | Promise<void>) | null) {
  logoutCallback = fn;
}

async function refreshTokenDirect(): Promise<string | null> {
  // Must have refreshToken to proceed
  if (!refreshToken) {
    console.warn("[API] ?? No refresh token available");
    return null;
  }

  // Use configured refresh path (default: /auth/refresh)
  const path = ENV.AUTH_REFRESH_PATH || "/auth/refresh";

  try {
    const isAbsolute = /^https?:/i.test(path);
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const prefixedPath =
      !API_PREFIX || normalizedPath.startsWith(API_PREFIX + "/")
        ? normalizedPath
        : `${API_PREFIX}${normalizedPath}`;
    const url = isAbsolute ? path : `${API}${prefixedPath}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      // Backend expects refreshToken in Authorization header (JwtRefreshAuthGuard)
      Authorization: `Bearer ${refreshToken}`,
    };
    if (apiKey) headers["X-API-Key"] = apiKey as string;

    console.log("[API] ?? Trying token refresh via", url);
    const r = await fetch(url, { method: "POST", headers });
    if (!r.ok) {
      console.warn(`[API] ?? Refresh failed with status ${r.status}`);
      return null;
    }
    const data = await r.json().catch(() => ({}));
    // Backend returns { accessToken: "...", refreshToken: "..." }
    const newAccessToken = data?.accessToken || data?.token;
    const newRefreshToken = data?.refreshToken;

    if (typeof newAccessToken === "string" && newAccessToken.length > 0) {
      setToken(newAccessToken); // in-memory
      if (typeof newRefreshToken === "string" && newRefreshToken.length > 0) {
        setRefreshToken(newRefreshToken); // update refresh token too
      }
      try {
        await persistTokenCallback?.(newAccessToken);
      } catch {}
      console.log("[API] ? Token refresh succeeded");
      return newAccessToken;
    }
  } catch (e) {
    console.warn("[API] ?? Refresh attempt failed:", e);
  }
  return null;
}

async function getRefreshedToken(): Promise<string | null> {
  if (isRefreshing) {
    return new Promise<string | null>((resolve) =>
      refreshWaiters.push(resolve),
    );
  }
  isRefreshing = true;
  try {
    const token = await refreshTokenDirect();
    refreshWaiters.forEach((fn) => fn(token));
    refreshWaiters = [];
    return token;
  } finally {
    isRefreshing = false;
  }
}

async function _parseResponse(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const isAbsolute = /^https?:/i.test(path);
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Auto-strip duplicate version prefixes from path if API_BASE_URL already contains them
  // This prevents double prefixing like /api/v1/api/v1/... or /api/v1/v1/...
  if (API.includes("/api/v1")) {
    // Remove /api/v1/ prefix
    if (normalizedPath.startsWith("/api/v1/")) {
      normalizedPath = normalizedPath.slice(7); // Remove '/api/v1'
    }
    // Remove /api/ prefix
    else if (normalizedPath.startsWith("/api/")) {
      normalizedPath = normalizedPath.slice(4); // Remove '/api'
    }
    // Remove /v1/ prefix (when caller uses /v1/path instead of /path)
    else if (normalizedPath.startsWith("/v1/")) {
      normalizedPath = normalizedPath.slice(3); // Remove '/v1'
    }
  } else if (API.includes("/api")) {
    if (normalizedPath.startsWith("/api/")) {
      normalizedPath = normalizedPath.slice(4); // Remove '/api'
    }
  }

  // Avoid double prefix if caller already included API_PREFIX
  const prefixedPath =
    !API_PREFIX || normalizedPath.startsWith(API_PREFIX + "/")
      ? normalizedPath
      : `${API_PREFIX}${normalizedPath}`;
  const url = isAbsolute ? path : `${API}${prefixedPath}`;
  const isForm =
    (options as any).data instanceof FormData ||
    (options as any).body instanceof FormData;
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  // Set JSON content type by default unless we're sending FormData
  if (!isForm && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Add JWT token if available
  const token = (options as any).token || authToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Add API key if available
  // Backend requires API key for ALL endpoints including auth
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  // Single consolidated log (only in dev mode)
  if (__DEV__) {
    const logPath = isAbsolute ? path : prefixedPath;
    const authInfo = token ? "token" : apiKey ? "API key" : "no auth";
    console.log(`[API] ${options.method || "GET"} ${logPath} (${authInfo})`);
  }

  const controller = new AbortController();
  const timeout = options.timeoutMs ?? 20000; // Increased from 10s to 20s for slow networks
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const doRequest = async (): Promise<{ res: Response; data: any }> => {
    const body =
      options.data && !(options.data instanceof FormData)
        ? JSON.stringify(options.data)
        : (options.body ?? options.data);

    const res = await fetch(url, {
      ...options,
      body,
      headers,
      signal: controller.signal,
    } as RequestInit);

    const data = await _parseResponse(res);
    return { res, data };
  };

  try {
    let { res, data } = await doRequest();
    clearTimeout(timeoutId);
    if (!res.ok) {
      // On 401, attempt a single refresh-and-retry if not already retried
      if (res.status === 401 && !(options as any)._retry) {
        const newToken = await getRefreshedToken();
        if (newToken) {
          // update Authorization header for retry
          headers.Authorization = `Bearer ${newToken}`;
          (options as any)._retry = true;
          // restart timeout
          const timeout2 = options.timeoutMs ?? 20000; // Increased to match main timeout
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), timeout2);
          try {
            const body2 =
              options.data && !(options.data instanceof FormData)
                ? JSON.stringify(options.data)
                : (options.body ?? options.data);
            res = await fetch(url, {
              ...options,
              body: body2,
              headers,
              signal: controller2.signal,
            } as RequestInit);
            clearTimeout(timeoutId2);
            data = await _parseResponse(res);
          } catch (e) {
            clearTimeout(timeoutId2);
            throw e;
          }
          if (res.ok) return data as T;
        } else {
          // Token refresh failed or no refresh token available
          // Only trigger logout if we actually have a refresh token (user is logged in)
          if (refreshToken) {
            console.error("[API] ? Token refresh failed, signing out...");
            try {
              await logoutCallback?.();
            } catch (err) {
              console.error("[API] Logout callback error:", err);
            }
          } else {
            console.warn("[API] ?? No refresh token available");
            // Don't logout - user may not be logged in yet
          }
        }
      }
      // On 429/503/504, attempt one backoff retry if not already retried
      if (
        (res.status === 429 || res.status === 503 || res.status === 504) &&
        !(options as any)._retryBackoff
      ) {
        (options as any)._retryBackoff = true;
        const retryAfter = Number(res.headers.get("Retry-After"));

        // Configurable backoff params via ENV (defaults: base=500ms, jitter=500ms)
        const backoffBaseMs = ENV.BACKOFF_BASE_MS ?? 500;
        const backoffJitterMs = ENV.BACKOFF_JITTER_MS ?? 500;

        const delayMs =
          Number.isFinite(retryAfter) && retryAfter! > 0
            ? retryAfter! * 1000
            : backoffBaseMs + Math.floor(Math.random() * backoffJitterMs);

        await new Promise((r) => setTimeout(r, delayMs));
        // restart timeout
        const timeout2 = options.timeoutMs ?? 20000; // Increased to match main timeout
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), timeout2);
        try {
          const body2 =
            options.data && !(options.data instanceof FormData)
              ? JSON.stringify(options.data)
              : (options.body ?? options.data);
          const res2 = await fetch(url, {
            ...options,
            body: body2,
            headers,
            signal: controller2.signal,
          } as RequestInit);
          clearTimeout(timeoutId2);
          const data2 = await _parseResponse(res2);
          if (res2.ok) return data2 as T;
        } catch (e) {
          clearTimeout(timeoutId2);
          // fallthrough to throw below
        }
      }
      throw new ApiError(
        typeof data === "string" ? data : data?.message || `HTTP ${res.status}`,
        { status: res.status, data },
      );
    }
    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) throw err;
    if (err && err.name === "AbortError")
      throw new ApiError("K?t n?i qu� ch?m", { code: "TIMEOUT" });
    throw new ApiError("L?i k?t n?i", { code: "NETWORK_ERROR" });
  }
}

export const get = <T = any>(path: string, params?: Record<string, any>) => {
  const url = params ? `${path}?${new URLSearchParams(params)}` : path;
  return apiFetch<T>(url, { method: "GET" });
};

export const post = <T = any>(path: string, data?: any) =>
  apiFetch<T>(path, { method: "POST", data });
export const put = <T = any>(path: string, data?: any) =>
  apiFetch<T>(path, { method: "PUT", data });
export const patch = <T = any>(path: string, data?: any) =>
  apiFetch<T>(path, { method: "PATCH", data });
export const del = <T = any>(path: string, data?: any) =>
  apiFetch<T>(path, { method: "DELETE", data });

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return res;
      if (res.status >= 400 && res.status < 500)
        throw new Error(`Client error: ${res.status}`);
      if (attempt === retries)
        throw new Error(`HTTP Error: ${res.status} after ${retries} attempts`);
    } catch (e) {
      if (attempt === retries) throw e;
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Max retries exceeded");
}

export const healthCheck = () => get("/health");

export const api = {
  get,
  post,
  put,
  patch,
  del,
  request: apiFetch,
  fetchWithRetry,
  healthCheck,
};

export interface ImageLabel {
  description?: string;
  score?: number;
}

export interface ImageAnalysisResponse {
  success: boolean;
  labels?: ImageLabel[];
  error?: string;
}

export async function analyzeImageLabels(
  imageData: string,
): Promise<ImageAnalysisResponse> {
  return post("/v1/images/analyze", { image: imageData });
}

// Keep the minimal functions the user requested as convenience wrappers
export async function getConfig() {
  const r = await fetch(`${API}/config`, { cache: "no-store" });
  if (!r.ok) throw new Error("config failed");
  return r.json();
}

export async function getHealth() {
  const r = await fetch(`${API}/health`);
  return r.json();
}

export async function getVideos(limit = 100) {
  const r = await fetch(`${API}/videos?limit=${limit}`);
  if (!r.ok) throw new Error("videos failed");
  return r.json();
}

export async function createRoomToken(name: string) {
  const r = await fetch(`${API}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!r.ok) throw new Error("token failed");
  return r.json();
}

// Convenience helpers per user's request
export async function login(username: string, password: string) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { token, user }
}

export async function listCustomers(
  token: string,
  search = "",
  page = 1,
  pageSize = 20,
) {
  const qs = new URLSearchParams({
    search,
    page: String(page),
    pageSize: String(pageSize),
  });
  const r = await fetch(`${API}/customers?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // { page, pageSize, total, items }
}

// =============================================================================
// PRODUCTS API
// =============================================================================

export interface ProductFilter {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number; // Minimum rating (e.g., 4 for 4+ stars)
  isNew?: boolean;
  inStock?: boolean;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "rating" | "sold" | "newest";
}

export interface ProductPagination {
  page?: number;
  limit?: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string; // URL or URI
  images?: string[]; // Multiple images for gallery
  categoryId?: string;
  categoryName?: string;
  rating?: number;
  reviewCount?: number;
  sold?: number;
  stock?: number;
  isNew?: boolean;
  isFavorite?: boolean;
  variants?: ProductVariant[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g., "Color", "Size"
  options: string[]; // e.g., ["Red", "Blue"], ["S", "M", "L"]
  price?: number; // Additional price for this variant
}

export interface ProductsResponse {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get products list with filters and pagination
 * @param filters - Filter criteria
 * @param pagination - Pagination options
 * @returns Products list with pagination info
 */
export async function getProducts(
  filters: ProductFilter = {},
  pagination: ProductPagination = { page: 1, limit: 20 },
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  // Pagination
  if (pagination.page) params.append("page", String(pagination.page));
  if (pagination.limit) params.append("limit", String(pagination.limit));

  // Filters
  if (filters.categoryId) params.append("categoryId", filters.categoryId);
  if (filters.minPrice !== undefined)
    params.append("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.append("maxPrice", String(filters.maxPrice));
  if (filters.rating !== undefined)
    params.append("rating", String(filters.rating));
  if (filters.isNew !== undefined)
    params.append("isNew", String(filters.isNew));
  if (filters.inStock !== undefined)
    params.append("inStock", String(filters.inStock));
  if (filters.search) params.append("search", filters.search);
  if (filters.sortBy) params.append("sortBy", filters.sortBy);

  try {
    const response = await apiFetch(`/products?${params.toString()}`, {
      method: "GET",
    });

    return response as ProductsResponse;
  } catch (error) {
    console.error("[API] Error fetching products:", error);
    throw error;
  }
}

/**
 * Get single product by ID
 * @param id - Product ID
 * @returns Product details
 */
export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await apiFetch(`/products/${id}`, {
      method: "GET",
    });

    return response as Product;
  } catch (error) {
    console.error(`[API] Error fetching product ${id}:`, error);
    throw error;
  }
}

/**
 * Search products by keyword
 * @param query - Search keyword
 * @param pagination - Pagination options
 * @returns Products matching search query
 */
export async function searchProducts(
  query: string,
  pagination: ProductPagination = { page: 1, limit: 20 },
): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  params.append("search", query);
  if (pagination.page) params.append("page", String(pagination.page));
  if (pagination.limit) params.append("limit", String(pagination.limit));

  try {
    const response = await apiFetch(`/products/search?${params.toString()}`, {
      method: "GET",
    });

    return response as ProductsResponse;
  } catch (error) {
    console.error("[API] Error searching products:", error);
    throw error;
  }
}

/**
 * Get product categories
 * @returns List of categories
 */
export async function getCategories(): Promise<
  { id: string; name: string; icon?: string; color?: string }[]
> {
  try {
    const response = await apiFetch("/products/categories", {
      method: "GET",
    });

    return response as {
      id: string;
      name: string;
      icon?: string;
      color?: string;
    }[];
  } catch (error) {
    console.error("[API] Error fetching categories:", error);
    throw error;
  }
}

/**
 * Toggle product favorite status
 * @param productId - Product ID
 * @param isFavorite - New favorite status
 * @returns Updated favorite status
 */
export async function toggleFavorite(
  productId: string,
  isFavorite: boolean,
): Promise<{ success: boolean; isFavorite: boolean }> {
  try {
    const response = await apiFetch(`/products/${productId}/favorite`, {
      method: "POST",
      data: { isFavorite },
    });

    return response as { success: boolean; isFavorite: boolean };
  } catch (error) {
    console.error(
      `[API] Error toggling favorite for product ${productId}:`,
      error,
    );
    throw error;
  }
}
