/**
 * Hook for Products/Shop API integration
 * Connects FE screens with products.api.ts service
 */

import {
    createProduct,
    CreateProductDto,
    getBestSellers,
    getCategories,
    getFeaturedProducts,
    getNewArrivals,
    getProductById,
    getProducts,
    Product,
    ProductCategory,
    ProductCondition,
    ProductQueryParams,
    ProductStatus,
    searchProducts,
} from "@/services/products.api";
import { useCallback, useEffect, useState } from "react";

interface UseShopAPIOptions {
  autoLoad?: boolean;
  initialParams?: ProductQueryParams;
}

interface UseShopAPIResult {
  // Data
  products: Product[];
  featuredProducts: Product[];
  bestSellers: Product[];
  newArrivals: Product[];
  categories: { id: string; name: string; icon?: string; count?: number }[];

  // Pagination
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Loading states
  loading: boolean;
  loadingMore: boolean;
  loadingCategories: boolean;
  error: string | null;

  // Actions
  loadProducts: (params?: ProductQueryParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  loadFeatured: () => Promise<void>;
  loadBestSellers: () => Promise<void>;
  loadNewArrivals: () => Promise<void>;
  loadCategories: () => Promise<void>;
  search: (query: string) => Promise<void>;
  setFilters: (params: ProductQueryParams) => void;
  clearFilters: () => void;
}

export function useShopAPI(options: UseShopAPIOptions = {}): UseShopAPIResult {
  const { autoLoad = true, initialParams = {} } = options;

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    { id: string; name: string; icon?: string; count?: number }[]
  >([]);

  // Pagination
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [currentParams, setCurrentParams] =
    useState<ProductQueryParams>(initialParams);

  // Load products
  const loadProducts = useCallback(
    async (params?: ProductQueryParams) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = { ...currentParams, ...params, page: 1 };
        const response = await getProducts(queryParams);

        if (response.data) {
          setProducts(response.data);
          setTotalProducts(response.meta?.total || 0);
          setCurrentPage(response.meta?.page || 1);
          setTotalPages(response.meta?.totalPages || 1);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products",
        );
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentParams],
  );

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (loadingMore || currentPage >= totalPages) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await getProducts({
        ...currentParams,
        page: nextPage,
      });

      if (response.data) {
        setProducts((prev) => [...prev, ...response.data]);
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.error("Error loading more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, totalPages, loadingMore, currentParams]);

  // Refresh
  const refreshProducts = useCallback(async () => {
    await loadProducts({ page: 1 });
  }, [loadProducts]);

  // Load featured
  const loadFeatured = useCallback(async () => {
    try {
      const response = await getFeaturedProducts();
      if (response.data) {
        setFeaturedProducts(response.data);
      }
    } catch (err) {
      console.error("Error loading featured products:", err);
    }
  }, []);

  // Load best sellers
  const loadBestSellers = useCallback(async () => {
    try {
      const response = await getBestSellers();
      if (response.data) {
        setBestSellers(response.data);
      }
    } catch (err) {
      console.error("Error loading best sellers:", err);
    }
  }, []);

  // Load new arrivals
  const loadNewArrivals = useCallback(async () => {
    try {
      const response = await getNewArrivals();
      if (response.data) {
        setNewArrivals(response.data);
      }
    } catch (err) {
      console.error("Error loading new arrivals:", err);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await getCategories();
      if (response) {
         
        setCategories(response as any);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Search
  const search = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const response = await searchProducts(query);
      if (response.data) {
        setProducts(response.data);
        setTotalProducts(response.meta?.total || 0);
      }
    } catch (err) {
      console.error("Error searching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Set filters
  const setFilters = useCallback((params: ProductQueryParams) => {
    setCurrentParams((prev) => ({ ...prev, ...params }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setCurrentParams({});
  }, []);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad) {
      loadProducts();
      loadCategories();
    }
  }, [autoLoad]);  

  // Reload when params change
  useEffect(() => {
    if (Object.keys(currentParams).length > 0) {
      loadProducts();
    }
  }, [currentParams]);  

  return {
    // Data
    products,
    featuredProducts,
    bestSellers,
    newArrivals,
    categories,

    // Pagination
    totalProducts,
    currentPage,
    totalPages,
    hasMore: currentPage < totalPages,

    // Loading
    loading,
    loadingMore,
    loadingCategories,
    error,

    // Actions
    loadProducts,
    loadMore,
    refreshProducts,
    loadFeatured,
    loadBestSellers,
    loadNewArrivals,
    loadCategories,
    search,
    setFilters,
    clearFilters,
  };
}

// Single product hook
interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
  loadProduct: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProduct(productId?: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProductById(Number(id));
      if (response) {
        setProduct(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
      console.error("Error loading product:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (productId) {
      await loadProduct(productId);
    }
  }, [productId, loadProduct]);

  // Auto load on mount if productId provided
  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId, loadProduct]);

  return {
    product,
    loading,
    error,
    loadProduct,
    refresh,
  };
}

// Product creation hook
export function useProductCreation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const create = useCallback(async (data: CreateProductDto) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await createProduct(data);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo sản phẩm thất bại");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    create,
    reset,
  };
}

export { ProductCategory, ProductCondition, ProductStatus };
export type { CreateProductDto, Product, ProductQueryParams };

