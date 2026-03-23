/**
 * useRealProducts Hook
 * Created: 03/02/2026
 *
 * Hook kết nối trực tiếp với Backend API để lấy sản phẩm thật
 * Thay thế dần mock data bằng data từ database
 *
 * Features:
 * - Direct API connection (no mock fallback by default)
 * - React Query-like caching với useRef
 * - Infinite scroll pagination
 * - Pull-to-refresh
 * - Filter & Search
 * - Optimistic updates
 * - Retry logic
 * - Offline detection
 */

import type { Product } from "@/data/products";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { apiFetch } from "@/services/api";
import { useCallback, useEffect, useRef, useState } from "react";

// ==================== TYPES ====================

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sellerId?: string;
  verified?: boolean;
  freeShipping?: boolean;
  flashSale?: boolean;
  rating?: number;
  sortBy?: "price" | "rating" | "newest" | "popular" | "sold";
  sortOrder?: "asc" | "desc";
}

export interface ProductsApiResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UseRealProductsOptions {
  filters?: ProductFilters;
  pageSize?: number;
  autoFetch?: boolean;
  enableCache?: boolean;
  cacheTTL?: number; // milliseconds
  useMockFallback?: boolean; // Cho phép fallback về mock data không (default: false)
}

export interface UseRealProductsReturn {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;
  totalProducts: number;
  currentPage: number;
  isOffline: boolean;
  // Actions
  fetchProducts: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  clearError: () => void;
}

// ==================== CACHE IMPLEMENTATION ====================

interface CacheEntry {
  data: Product[];
  timestamp: number;
  filters: ProductFilters;
}

const productCache = new Map<string, CacheEntry>();

function getCacheKey(filters: ProductFilters, page: number): string {
  return JSON.stringify({ ...filters, page });
}

function isCacheValid(entry: CacheEntry, ttl: number): boolean {
  return Date.now() - entry.timestamp < ttl;
}

// ==================== HOOK ====================

export function useRealProducts(
  options: UseRealProductsOptions = {},
): UseRealProductsReturn {
  const {
    filters: initialFilters = {},
    pageSize = 20,
    autoFetch = true,
    enableCache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    useMockFallback = false,
  } = options;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters);

  // Network status
  const { isConnected } = useNetworkStatus();
  const isOffline = !isConnected;

  // Refs for preventing duplicate calls
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Retry config
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  /**
   * Build query string from filters
   */
  const buildQueryString = useCallback(
    (page: number): string => {
      const params = new URLSearchParams();

      params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      if (filters.category) params.append("category", filters.category);
      if (filters.minPrice !== undefined)
        params.append("minPrice", filters.minPrice.toString());
      if (filters.maxPrice !== undefined)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.sellerId) params.append("sellerId", filters.sellerId);
      if (filters.verified !== undefined)
        params.append("verified", filters.verified.toString());
      if (filters.freeShipping !== undefined)
        params.append("freeShipping", filters.freeShipping.toString());
      if (filters.flashSale !== undefined)
        params.append("flashSale", filters.flashSale.toString());
      if (filters.rating !== undefined)
        params.append("rating", filters.rating.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      return params.toString();
    },
    [filters, pageSize],
  );

  /**
   * Fetch with retry logic
   */
  const fetchWithRetry = useCallback(
    async <T>(url: string, retries: number = maxRetries): Promise<T | null> => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await apiFetch<T>(url, { method: "GET" });
          return response;
        } catch (err) {
          console.warn(
            `[useRealProducts] Attempt ${attempt}/${retries} failed:`,
            err,
          );

          if (attempt < retries) {
            await new Promise((resolve) =>
              setTimeout(resolve, retryDelay * attempt),
            );
          }
        }
      }
      return null;
    },
    [],
  );

  /**
   * Fetch products from API
   */
  const fetchProducts = useCallback(
    async (page: number = 1, append: boolean = false): Promise<void> => {
      if (fetchingRef.current) {
        console.log("[useRealProducts] Already fetching, skipping...");
        return;
      }

      if (isOffline && !enableCache) {
        setError("Không có kết nối mạng");
        return;
      }

      // Check cache first
      const cacheKey = getCacheKey(filters, page);
      if (enableCache && !append) {
        const cached = productCache.get(cacheKey);
        if (cached && isCacheValid(cached, cacheTTL)) {
          console.log("[useRealProducts] ✅ Using cached data");
          setProducts(cached.data);
          setError(null);
          return;
        }
      }

      fetchingRef.current = true;

      // Set loading state
      if (append) {
        setLoadingMore(true);
      } else if (page === 1) {
        setLoading(true);
      }

      try {
        const queryString = buildQueryString(page);
        const url = `/products?${queryString}`;

        console.log("[useRealProducts] Fetching:", url);

        const response = await fetchWithRetry<ProductsApiResponse | Product[]>(
          url,
        );

        if (!mountedRef.current) return;

        if (!response) {
          throw new Error("API không phản hồi sau nhiều lần thử");
        }

        // Handle response format
        let productsData: Product[];
        let meta: ProductsApiResponse["meta"] | null = null;

        if (Array.isArray(response)) {
          // Direct array response
          productsData = response;
        } else if (response.data) {
          // { data: [], meta: {} } format
          productsData = response.data;
          meta = response.meta;
        } else {
          productsData = [];
        }

        // Update state
        if (append) {
          setProducts((prev) => [...prev, ...productsData]);
        } else {
          setProducts(productsData);
        }

        // Update pagination
        if (meta) {
          setTotalProducts(meta.total);
          setCurrentPage(meta.page);
          setHasMore(meta.hasMore);
        } else {
          setCurrentPage(page);
          setHasMore(productsData.length >= pageSize);
          if (!append) setTotalProducts(productsData.length);
        }

        // Cache the response
        if (enableCache && !append) {
          productCache.set(cacheKey, {
            data: productsData,
            timestamp: Date.now(),
            filters,
          });
        }

        setError(null);
        console.log(
          `[useRealProducts] ✅ Loaded ${productsData.length} products from API`,
        );
      } catch (err: any) {
        if (!mountedRef.current) return;

        const errorMessage =
          err.message || "Không thể tải sản phẩm. Vui lòng thử lại.";
        setError(errorMessage);
        console.error("[useRealProducts] ❌ Error:", err);

        // Only fallback to mock if explicitly enabled
        if (useMockFallback && !append) {
          console.log("[useRealProducts] Using mock data fallback...");
          // Import mock data only when needed
          import("@/data/products").then(({ PRODUCTS }) => {
            if (mountedRef.current) {
              setProducts(PRODUCTS.slice(0, pageSize));
              setHasMore(PRODUCTS.length > pageSize);
              setTotalProducts(PRODUCTS.length);
            }
          });
        }
      } finally {
        fetchingRef.current = false;
        if (mountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [
      filters,
      pageSize,
      buildQueryString,
      fetchWithRetry,
      enableCache,
      cacheTTL,
      isOffline,
      useMockFallback,
    ],
  );

  /**
   * Load more products (pagination)
   */
  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || loadingMore || loading) return;
    await fetchProducts(currentPage + 1, true);
  }, [hasMore, loadingMore, loading, currentPage, fetchProducts]);

  /**
   * Pull to refresh
   */
  const refresh = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    // Clear cache for current filters
    const cacheKey = getCacheKey(filters, 1);
    productCache.delete(cacheKey);
    await fetchProducts(1, false);
  }, [filters, fetchProducts]);

  /**
   * Update filters
   */
  const setFilters = useCallback((newFilters: ProductFilters): void => {
    setFiltersState(newFilters);
    setCurrentPage(1);
    setProducts([]);
    setHasMore(true);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Auto-fetch on mount or when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(1, false);
    }
  }, [autoFetch]); // Only on mount, not on filter change

  // Fetch when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(1, false);
    }
     
  }, [filters]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    products,
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,
    totalProducts,
    currentPage,
    isOffline,
    fetchProducts: () => fetchProducts(1, false),
    loadMore,
    refresh,
    setFilters,
    clearError,
  };
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook cho Flash Sale products
 */
export function useFlashSaleProducts(pageSize: number = 10) {
  return useRealProducts({
    filters: { flashSale: true, sortBy: "sold", sortOrder: "desc" },
    pageSize,
    autoFetch: true,
  });
}

/**
 * Hook cho Featured/Popular products
 */
export function useFeaturedProducts(pageSize: number = 10) {
  return useRealProducts({
    filters: { sortBy: "popular", sortOrder: "desc" },
    pageSize,
    autoFetch: true,
  });
}

/**
 * Hook cho products theo category
 */
export function useProductsByCategory(category: string, pageSize: number = 20) {
  return useRealProducts({
    filters: { category },
    pageSize,
    autoFetch: true,
  });
}

/**
 * Hook cho seller's products
 */
export function useSellerProducts(sellerId: string, pageSize: number = 20) {
  return useRealProducts({
    filters: { sellerId },
    pageSize,
    autoFetch: true,
  });
}

/**
 * Hook cho search
 */
export function useProductSearch(searchQuery: string, pageSize: number = 20) {
  return useRealProducts({
    filters: { search: searchQuery },
    pageSize,
    autoFetch: !!searchQuery,
  });
}

export default useRealProducts;
