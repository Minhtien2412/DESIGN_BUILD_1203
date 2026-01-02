import { useCallback, useState } from 'react';

export interface UseApiCallOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

export interface UseApiCallResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for handling API calls with loading, error, and data states
 * 
 * Usage:
 * ```tsx
 * const { data, loading, error, execute } = useApiCall(
 *   productService.getProducts,
 *   {
 *     onSuccess: (products) => console.log('Loaded', products.length, 'products'),
 *     onError: (err) => showToast('Failed to load products'),
 *   }
 * );
 * 
 * // In useEffect or button press
 * useEffect(() => {
 *   execute({ category: 'materials' });
 * }, []);
 * ```
 */
export function useApiCall<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiCallOptions<T> = {}
): UseApiCallResult<T> {
  const { onSuccess, onError, initialData } = options;

  const [data, setData] = useState<T | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const result = await apiFunction(...args);
        
        setData(result);
        onSuccess?.(result);
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        setError(error);
        onError?.(error);
        
        console.error('[useApiCall] Error:', {
          function: apiFunction.name,
          error: error.message,
          args,
        });
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(initialData ?? null);
    setLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

/**
 * Hook for handling mutation API calls (POST, PATCH, DELETE)
 * Similar to useApiCall but optimized for mutations
 * 
 * Usage:
 * ```tsx
 * const { mutate, loading, error } = useMutation(
 *   productService.createProduct,
 *   {
 *     onSuccess: (product) => {
 *       showToast('Product created!');
 *       navigate('/admin/products');
 *     },
 *   }
 * );
 * 
 * // In form submit
 * const handleSubmit = async () => {
 *   await mutate({ name: 'New Product', price: 100000 });
 * };
 * ```
 */
export function useMutation<TData, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiCallOptions<TData> = {}
) {
  const { execute, loading, error, reset } = useApiCall(mutationFn, options);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData | null> => {
      return execute(variables);
    },
    [execute]
  );

  return {
    mutate,
    loading,
    error,
    reset,
  };
}

/**
 * Hook for feature availability detection
 * Tests if a backend endpoint is available (not 404)
 * 
 * Usage:
 * ```tsx
 * const { available, loading, check } = useFeatureAvailability('/products');
 * 
 * if (loading) return <Loader />;
 * if (!available) return <FeatureComingSoon feature="Products" />;
 * 
 * return <ProductsList />;
 * ```
 */
export function useFeatureAvailability(endpoint: string) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const check = useCallback(async () => {
    try {
      setLoading(true);
      
      // Simple HEAD request to check if endpoint exists
      const response = await fetch(
        `https://baotienweb.cloud/api/v1${endpoint}`,
        {
          method: 'HEAD',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      // 404 = not available, anything else = available (even 401, 500)
      const isAvailable = response.status !== 404;
      
      setAvailable(isAvailable);
      setLastChecked(new Date());
      
      console.log('[useFeatureAvailability]', {
        endpoint,
        status: response.status,
        available: isAvailable,
      });
      
      return isAvailable;
    } catch (err) {
      // Network error = assume available (fail open)
      console.warn('[useFeatureAvailability] Network error, assuming available:', err);
      setAvailable(true);
      return true;
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  // Auto-check on mount
  useState(() => {
    check();
  });

  return {
    available,
    loading,
    check,
    lastChecked,
  };
}
