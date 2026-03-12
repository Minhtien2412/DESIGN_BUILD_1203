/**
 * useApiQuery - React hook for efficient API requests
 * Features:
 * - Auto-caching & deduplication
 * - Loading/error states
 * - Auto-refetch on focus
 * - Manual refresh
 * - Stale-while-revalidate pattern
 */

import { clearCache, get, RequestOptions } from "@/services/apiClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export interface UseApiQueryOptions<T> extends Omit<
  RequestOptions,
  "useCache" | "dedupe"
> {
  /** Enable the query (default: true) */
  enabled?: boolean;
  /** Cache TTL in milliseconds (default: 30000) */
  cacheTtl?: number;
  /** Refetch on app focus (default: false) */
  refetchOnFocus?: boolean;
  /** Refetch interval in milliseconds (default: 0 = disabled) */
  refetchInterval?: number;
  /** Initial data before fetch */
  initialData?: T;
  /** Transform response data */
  select?: (data: any) => T;
  /** Callback on success */
  onSuccess?: (data: T) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseApiQueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

export function useApiQuery<T = any>(
  url: string | null,
  options: UseApiQueryOptions<T> = {},
): UseApiQueryResult<T> {
  const {
    enabled = true,
    cacheTtl = 30000,
    refetchOnFocus = false,
    refetchInterval = 0,
    initialData,
    select,
    onSuccess,
    onError,
    ...requestOptions
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData && enabled && !!url);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);
  const fetchIdRef = useRef(0);

  const fetchData = useCallback(
    async (showLoading = false) => {
      if (!url || !enabled) return;

      const fetchId = ++fetchIdRef.current;

      if (showLoading && !data) {
        setIsLoading(true);
      }
      setIsFetching(true);
      setError(null);

      try {
        const response = await get<any>(url, {
          ...requestOptions,
          useCache: true,
          cacheTtl,
          dedupe: true,
        });

        // Only update if this is the latest fetch and component is mounted
        if (fetchId === fetchIdRef.current && mountedRef.current) {
          const transformedData = select ? select(response) : response;
          setData(transformedData);
          onSuccess?.(transformedData);
        }
      } catch (err) {
        if (fetchId === fetchIdRef.current && mountedRef.current) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          onError?.(error);
        }
      } finally {
        if (fetchId === fetchIdRef.current && mountedRef.current) {
          setIsLoading(false);
          setIsFetching(false);
        }
      }
    },
    [url, enabled, cacheTtl, requestOptions, select, onSuccess, onError, data],
  );

  // Initial fetch
  useEffect(() => {
    fetchData(true);
  }, [url, enabled]);

  // Refetch on app focus
  useEffect(() => {
    if (!refetchOnFocus) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        fetchData(false);
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, [refetchOnFocus, fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0) return;

    const interval = setInterval(() => {
      fetchData(false);
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, fetchData]);

  // Cleanup
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    // Clear cache before refetching
    if (url) {
      clearCache(`GET:${url}:`);
    }
    await fetchData(false);
  }, [url, fetchData]);

  const invalidate = useCallback(() => {
    if (url) {
      clearCache(`GET:${url}:`);
    }
  }, [url]);

  return {
    data,
    isLoading,
    isFetching,
    isError: !!error,
    error,
    refetch,
    invalidate,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE, PATCH)
 */
export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables,
  ) => void;
  /** Invalidate cache patterns after mutation */
  invalidatePatterns?: (string | RegExp)[];
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {},
): UseMutationResult<TData, TVariables> {
  const { onSuccess, onError, onSettled, invalidatePatterns } = options;

  const [data, setData] = useState<TData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await mutationFn(variables);
        setData(result);

        // Invalidate related caches
        if (invalidatePatterns) {
          invalidatePatterns.forEach((pattern) => {
            clearCache(typeof pattern === "string" ? pattern : undefined);
          });
        }

        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error, variables);
        onSettled?.(undefined, error, variables);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutationFn, onSuccess, onError, onSettled, invalidatePatterns],
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      mutateAsync(variables).catch(() => {}); // Catch to prevent unhandled rejection
    },
    [mutateAsync],
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync,
    data,
    isLoading,
    isError: !!error,
    error,
    reset,
  };
}

export default useApiQuery;
