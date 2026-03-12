/**
 * useShoppingProducts Hook
 * Fetch products từ Main API và local data
 *
 * Features:
 * - Fetch all products với filters, pagination
 * - Search và category filtering
 * - Flash sale, verified seller filters
 * - Cart integration
 * - Support fallback to mock data
 *
 * @author Auto-generated
 * @updated 2026-01-03
 */

import { Product, PRODUCTS } from "@/data/products";
import {
    getFlashSaleProducts,
    getProducts,
    ProductQueryParams,
} from "@/services/api/products.service";
import { useCallback, useEffect, useMemo, useState } from "react";

// ==================== TYPES ====================

// Product categories for the app
const APP_CATEGORIES = [
  { id: "villa", name: "Biệt thự", icon: "🏠" },
  { id: "interior", name: "Nội thất", icon: "🛋️" },
  { id: "materials", name: "Vật liệu XD", icon: "🧱" },
  { id: "architecture", name: "Kiến trúc", icon: "📐" },
  { id: "construction", name: "Thi công", icon: "🏗️" },
  { id: "furniture", name: "Đồ nội thất", icon: "🪑" },
  { id: "lighting", name: "Chiếu sáng", icon: "💡" },
  { id: "sanitary", name: "Vệ sinh", icon: "🚿" },
];

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  verified?: boolean;
  freeShipping?: boolean;
  flashSale?: boolean;
  rating?: number;
}

export interface ProductsStats {
  total: number;
  categories: number;
  flashSale: number;
  verified: number;
  averagePrice: number;
}

export interface UseShoppingProductsReturn {
  products: Product[];
  filteredProducts: Product[];
  categories: typeof APP_CATEGORIES;
  stats: ProductsStats;
  loading: boolean;
  error: string | null;
  dataSource: "api" | "mock";
  page: number;
  hasMore: boolean;
  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  searchProducts: (query: string) => void;
  setFilters: (filters: ProductFilters) => void;
  resetFilters: () => void;
  getProductById: (id: string) => Product | undefined;
}

// ==================== HELPERS ====================

function calculateStats(products: Product[]): ProductsStats {
  const flashSale = products.filter(
    (p) => p.flashSale || (p.discountPercent && p.discountPercent > 0),
  ).length;
  const verified = products.filter((p) => p.seller?.verified).length;
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
  const uniqueCategories = new Set(products.map((p) => p.category)).size;

  return {
    total: products.length,
    categories: uniqueCategories,
    flashSale,
    verified,
    averagePrice:
      products.length > 0 ? Math.round(totalPrice / products.length) : 0,
  };
}

function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  let filtered = [...products];

  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.seller?.name?.toLowerCase().includes(query),
    );
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.verified) {
    filtered = filtered.filter((p) => p.seller?.verified);
  }

  if (filters.freeShipping) {
    filtered = filtered.filter((p) => p.freeShipping);
  }

  if (filters.flashSale) {
    filtered = filtered.filter(
      (p) => p.flashSale || (p.discountPercent && p.discountPercent > 0),
    );
  }

  if (filters.rating !== undefined) {
    filtered = filtered.filter((p) => (p.rating || 0) >= filters.rating!);
  }

  return filtered;
}

// ==================== HOOK ====================

export function useShoppingProducts(
  initialFilters?: ProductFilters,
): UseShoppingProductsReturn {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "mock">("api");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFiltersState] = useState<ProductFilters>(
    initialFilters || {},
  );

  // Filtered products based on current filters
  const filteredProducts = useMemo(() => {
    return applyFilters(allProducts, filters);
  }, [allProducts, filters]);

  const stats = useMemo(() => calculateStats(allProducts), [allProducts]);

  const fetchProducts = useCallback(
    async (resetPage = true) => {
      setLoading(true);
      setError(null);

      try {
        const params: ProductQueryParams = {
          page: resetPage ? 1 : page,
          limit: 20,
          ...filters,
        };

        const response = await getProducts(params);

        if (response.products.length > 0) {
          if (resetPage) {
            setAllProducts(response.products);
          } else {
            setAllProducts((prev) => [...prev, ...response.products]);
          }
          setPage(response.page);
          setHasMore(response.hasMore);
          setDataSource("api");
          console.log(
            "[useShoppingProducts] Loaded from API:",
            response.products.length,
          );
        } else {
          // Empty state - no data from API
          setAllProducts([]);
          setDataSource("api");
          setHasMore(false);
        }
      } catch (err) {
        console.error("[useShoppingProducts] Error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load products",
        );
        // Empty state on error - no fallback to mock data
        setAllProducts([]);
        setDataSource("api");
      } finally {
        setLoading(false);
      }
    },
    [page, filters],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    setPage((prev) => prev + 1);
    await fetchProducts(false);
  }, [hasMore, loading, fetchProducts]);

  const searchProductsHandler = useCallback((query: string) => {
    setFiltersState((prev) => ({ ...prev, search: query }));
  }, []);

  const setFilters = useCallback((newFilters: ProductFilters) => {
    setFiltersState(newFilters);
    setPage(1); // Reset page on filter change
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({});
    setPage(1);
  }, []);

  const getProductByIdHandler = useCallback(
    (id: string): Product | undefined => {
      return allProducts.find((p) => p.id === id);
    },
    [allProducts],
  );

  useEffect(() => {
    fetchProducts(true);
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      fetchProducts(true);
    }
  }, [filters]);

  return {
    products: allProducts,
    filteredProducts,
    categories: APP_CATEGORIES,
    stats,
    loading,
    error,
    dataSource,
    page,
    hasMore,
    refresh: () => fetchProducts(true),
    loadMore,
    searchProducts: searchProductsHandler,
    setFilters,
    resetFilters,
    getProductById: getProductByIdHandler,
  };
}

// ==================== FLASH SALE HOOK ====================

export function useFlashSaleProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "mock">("mock");
  const [endTime, _setEndTime] = useState<Date>(
    new Date(Date.now() + 4 * 60 * 60 * 1000),
  );

  const fetchFlashSale = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFlashSaleProducts();
      if (result.length > 0) {
        setProducts(result);
        setDataSource("api");
      } else {
        // Mock flash sale products
        const flashSale = PRODUCTS.filter(
          (p) => p.flashSale || (p.discountPercent && p.discountPercent > 0),
        ).slice(0, 6);
        setProducts(flashSale);
        setDataSource("mock");
      }
    } catch (err) {
      console.error("[useFlashSaleProducts] Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load flash sale",
      );
      const flashSale = PRODUCTS.filter(
        (p) => p.flashSale || (p.discountPercent && p.discountPercent > 0),
      ).slice(0, 6);
      setProducts(flashSale);
      setDataSource("mock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashSale();
  }, [fetchFlashSale]);

  return {
    products,
    loading,
    error,
    dataSource,
    endTime,
    refresh: fetchFlashSale,
  };
}

export default useShoppingProducts;
