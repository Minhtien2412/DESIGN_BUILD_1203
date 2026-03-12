/**
 * useProducts Hook
 * Quản lý products với pagination, filter, search
 */

import {
    createProduct,
    deleteProduct,
    getMyProducts,
    getProductById,
    moderateProduct,
    updateProduct,
} from '@/services/products';
import type {
    CreateProductDto,
    FilterProductsDto,
    ModerateProductDto,
    Product,
    ProductCategory,
    ProductStatus,
    UpdateProductDto
} from '@/types/products';
import { useCallback, useEffect, useState } from 'react';

interface UseProductsOptions {
  category?: ProductCategory;
  status?: ProductStatus;
  autoFetch?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { category, status, autoFetch = true } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [hasMore, setHasMore] = useState(true);

  /**
   * Fetch products
   */
  const fetchProducts = useCallback(
    async (filters?: FilterProductsDto) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getMyProducts({
          page: pagination.page,
          limit: pagination.limit,
          category,
          status,
          ...filters,
        });

        setProducts(response.products);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
        setHasMore(response.page < response.totalPages);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
        console.error('[useProducts] Fetch error:', err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, category, status]
  );

  /**
   * Load more products (pagination)
   */
  const fetchMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const nextPage = pagination.page + 1;

      const response = await getMyProducts({
        page: nextPage,
        limit: pagination.limit,
        category,
        status,
      });

      setProducts((prev) => [...prev, ...response.products]);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
      setHasMore(response.page < response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to load more products');
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, pagination, category, status]);

  /**
   * Refresh products (reset to page 1)
   */
  const refresh = useCallback(async () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    await fetchProducts();
  }, [fetchProducts]);

  /**
   * Search products
   */
  const search = useCallback(
    async (query: string) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      await fetchProducts({ search: query });
    },
    [fetchProducts]
  );

  /**
   * Filter products
   */
  const filter = useCallback(
    async (filters: FilterProductsDto) => {
      setPagination((prev) => ({ ...prev, page: 1 }));
      await fetchProducts(filters);
    },
    [fetchProducts]
  );

  /**
   * Create product
   */
  const create = useCallback(
    async (data: CreateProductDto): Promise<Product> => {
      const product = await createProduct(data);
      await refresh(); // Refresh list after create
      return product;
    },
    [refresh]
  );

  /**
   * Update product
   */
  const update = useCallback(
    async (id: number, data: UpdateProductDto): Promise<Product> => {
      const product = await updateProduct(id, data);
      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? product : p))
      );
      return product;
    },
    []
  );

  /**
   * Delete product
   */
  const remove = useCallback(
    async (id: number): Promise<void> => {
      await deleteProduct(id);
      // Remove from local state
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    []
  );

  /**
   * Get product by ID
   */
  const getById = useCallback(async (id: number): Promise<Product> => {
    return getProductById(id);
  }, []);

  /**
   * Moderate product (Admin only)
   */
  const moderate = useCallback(
    async (id: number, data: ModerateProductDto): Promise<Product> => {
      const status = data.action === 'approve' ? 'APPROVED' : 'REJECTED';
      const product = await moderateProduct(id, status);
      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? product : p))
      );
      return product;
    },
    []
  );

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch]); // Only run once on mount

  return {
    products,
    loading,
    error,
    pagination,
    hasMore,
    
    // Actions
    fetchProducts,
    fetchMore,
    refresh,
    search,
    filter,
    create,
    update,
    remove,
    getById,
    moderate,
  };
}

/**
 * Hook to get single product
 */
export function useProduct(id: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
}
