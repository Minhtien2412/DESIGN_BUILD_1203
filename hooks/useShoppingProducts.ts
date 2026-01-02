/**
 * useShoppingProducts Hook
 * Created: 12/12/2025
 * 
 * React hook for shopping/marketplace products (different from user-created products)
 * 
 * Features:
 * - Auto-fetch on mount
 * - Infinite scroll support
 * - Pull-to-refresh
 * - Filter and search
 * - Error handling
 * - Loading states
 * 
 * Usage:
 * const { products, loading, error, loadMore, refresh } = useShoppingProducts({ 
 *   filters: { categoryId: 'electronics' },
 *   autoFetch: true 
 * });
 */

import {
    getProducts,
    Product,
    ProductFilter,
    ProductPagination,
    ProductsResponse,
} from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface UseShoppingProductsOptions {
  filters?: ProductFilter;
  pagination?: ProductPagination;
  autoFetch?: boolean;
}

interface UseShoppingProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
  hasMore: boolean;
  totalPages: number;
  currentPage: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setFilters: (filters: ProductFilter) => void;
}

export default function useShoppingProducts(
  options: UseShoppingProductsOptions = {}
): UseShoppingProductsReturn {
  const { 
    filters: initialFilters = {}, 
    pagination: initialPagination = { page: 1, limit: 20 },
    autoFetch = true 
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPagination.page || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ProductFilter>(initialFilters);
  const [hasMore, setHasMore] = useState(true);

  // Fetch products
  const fetchProducts = useCallback(async (
    page: number = 1, 
    append: boolean = false
  ) => {
    try {
      if (append) {
        // Loading more items - don't show main loading state
        if (!hasMore) return;
      } else {
        // Initial load or refresh
        setLoading(true);
      }
      
      setError(null);

      const response: ProductsResponse = await getProducts(
        filters,
        { ...initialPagination, page }
      );

      if (append) {
        // Append to existing products (infinite scroll)
        setProducts(prev => [...prev, ...response.data]);
      } else {
        // Replace products (initial load or refresh)
        setProducts(response.data);
      }

      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setHasMore(response.pagination.page < response.pagination.totalPages);

    } catch (err) {
      console.error('[useShoppingProducts] Error fetching products:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, initialPagination, hasMore]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(async () => {
    if (loading || refreshing || !hasMore) return;
    
    const nextPage = currentPage + 1;
    await fetchProducts(nextPage, true);
  }, [currentPage, loading, refreshing, hasMore, fetchProducts]);

  // Refresh products (pull-to-refresh)
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setHasMore(true);
    await fetchProducts(1, false);
  }, [fetchProducts]);

  // Update filters
  const updateFilters = useCallback((newFilters: ProductFilter) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setHasMore(true);
  }, []);

  // Auto-fetch on mount or when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts(1, false);
    }
  }, [filters, autoFetch]); // Re-fetch when filters change

  return {
    products,
    loading,
    error,
    refreshing,
    hasMore,
    totalPages,
    currentPage,
    loadMore,
    refresh,
    setFilters: updateFilters,
  };
}
