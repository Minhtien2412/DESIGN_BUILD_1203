/**
 * useProduct Hook
 * Created: 12/12/2025
 * 
 * React hook for fetching single product details
 * 
 * Features:
 * - Auto-fetch on mount
 * - Loading state
 * - Error handling
 * - Refresh capability
 * 
 * Usage:
 * const { product, loading, error, refresh } = useProduct('product-123');
 */

import { getProductById, Product } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';

interface UseProductOptions {
  autoFetch?: boolean;
}

interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export default function useProduct(
  productId: string,
  options: UseProductOptions = {}
): UseProductReturn {
  const { autoFetch = true } = options;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch product details
  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError(new Error('Product ID is required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getProductById(productId);
      setProduct(data);

    } catch (err) {
      console.error(`[useProduct] Error fetching product ${productId}:`, err);
      setError(err instanceof Error ? err : new Error('Failed to fetch product'));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Refresh product
  const refresh = useCallback(async () => {
    await fetchProduct();
  }, [fetchProduct]);

  // Auto-fetch on mount or when productId changes
  useEffect(() => {
    if (autoFetch && productId) {
      fetchProduct();
    }
  }, [productId, autoFetch, fetchProduct]);

  return {
    product,
    loading,
    error,
    refresh,
  };
}
