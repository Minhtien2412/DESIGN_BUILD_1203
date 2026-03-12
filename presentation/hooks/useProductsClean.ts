/**
 * useProductsClean — Clean Architecture hook for Products
 * =======================================================
 * Replaces direct API calls in screens with use-case-driven data flow.
 *
 * Flow: Screen → useProductsClean() → UseCase → Repository → API
 *
 * Usage in a screen:
 *   const { products, loading, error, loadMore, refresh } = useProductsClean({
 *     category: ProductCategory.HOME,
 *     limit: 20,
 *   });
 */

import { container } from "@/core/di/container";
import type {
    PaginatedResult,
    Product,
    ProductFilter,
} from "@/domain/entities/Product";
import type { IProductRepository } from "@/domain/repositories/IProductRepository";
import {
    GetBestSellers,
    GetFeaturedProducts,
    GetProductById,
    GetProducts,
    SearchProducts
} from "@/domain/usecases/products";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─────────────────────────────────────────────
// Hook: useProductsClean
// ─────────────────────────────────────────────

interface UseProductsOptions extends ProductFilter {
  /** Skip initial fetch (for lazy loading) */
  skip?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  meta: PaginatedResult<Product>["meta"] | null;
  /** Fetch next page (append) */
  loadMore: () => Promise<void>;
  /** Refresh from page 1 */
  refresh: () => Promise<void>;
  /** Whether more pages exist */
  hasMore: boolean;
}

export function useProductsClean(
  options: UseProductsOptions = {},
): UseProductsReturn {
  const { skip = false, ...filter } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginatedResult<Product>["meta"] | null>(
    null,
  );
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const currentPage = useRef(1);

  const getProducts = useMemo(() => {
    const repo = container.resolve<IProductRepository>("ProductRepository");
    return new GetProducts(repo);
  }, []);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      try {
        setLoading(true);
        setError(null);
        const result = await getProducts.execute({ ...filter, page });
        setProducts((prev) =>
          append ? [...prev, ...result.data] : result.data,
        );
        setMeta(result.meta);
        currentPage.current = page;
      } catch (err: any) {
        setError(err?.message ?? "Không thể tải sản phẩm");
      } finally {
        setLoading(false);
      }
    },
    // Stringify filter to avoid infinite re-renders from object reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getProducts, JSON.stringify(filter)],
  );

  // Initial fetch
  useEffect(() => {
    if (!skip) {
      fetchPage(1, false);
    }
  }, [fetchPage, skip]);

  const loadMore = useCallback(async () => {
    if (meta && currentPage.current < meta.totalPages && !loading) {
      await fetchPage(currentPage.current + 1, true);
    }
  }, [meta, loading, fetchPage]);

  const refresh = useCallback(async () => {
    currentPage.current = 1;
    await fetchPage(1, false);
  }, [fetchPage]);

  const hasMore = meta ? currentPage.current < meta.totalPages : false;

  return { products, loading, error, meta, loadMore, refresh, hasMore };
}

// ─────────────────────────────────────────────
// Hook: useProductDetail
// ─────────────────────────────────────────────

export function useProductDetail(id: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getProductById = useMemo(() => {
    const repo = container.resolve<IProductRepository>("ProductRepository");
    return new GetProductById(repo);
  }, []);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProductById.execute(id);
      setProduct(result);
    } catch (err: any) {
      setError(err?.message ?? "Không tìm thấy sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [getProductById, id]);

  useEffect(() => {
    if (id) fetch();
  }, [fetch, id]);

  return { product, loading, error, refresh: fetch };
}

// ─────────────────────────────────────────────
// Hook: useFeaturedProducts
// ─────────────────────────────────────────────

export function useFeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const getFeatured = useMemo(() => {
    const repo = container.resolve<IProductRepository>("ProductRepository");
    return new GetFeaturedProducts(repo);
  }, []);

  useEffect(() => {
    getFeatured
      .execute()
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getFeatured]);

  return { products, loading };
}

// ─────────────────────────────────────────────
// Hook: useBestSellers
// ─────────────────────────────────────────────

export function useBestSellers(limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const getBestSellers = useMemo(() => {
    const repo = container.resolve<IProductRepository>("ProductRepository");
    return new GetBestSellers(repo);
  }, []);

  useEffect(() => {
    getBestSellers
      .execute(limit)
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getBestSellers, limit]);

  return { products, loading };
}

// ─────────────────────────────────────────────
// Hook: useSearchProducts
// ─────────────────────────────────────────────

export function useSearchProducts(query: string, limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = useMemo(() => {
    const repo = container.resolve<IProductRepository>("ProductRepository");
    return new SearchProducts(repo);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }
    setLoading(true);
    searchProducts
      .execute(query, limit)
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchProducts, query, limit]);

  return { products, loading };
}
