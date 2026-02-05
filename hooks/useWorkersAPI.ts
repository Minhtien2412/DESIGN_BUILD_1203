/**
 * Hook for Workers API integration
 * Connects FE screens with workers.api.ts service
 */

import {
    addWorkerReview,
    contactWorker,
    CreateWorkerReviewDto,
    getFeaturedWorkers,
    getSpecialties,
    getWorkerById,
    getWorkerReviews,
    getWorkers,
    getWorkerStats,
    registerWorker,
    RegisterWorkerDto,
    Worker,
    WorkerQueryParams,
    WorkerReview,
    WorkerStatus,
    WorkerType,
} from "@/services/workers.api";
import { useCallback, useEffect, useState } from "react";

interface UseWorkersAPIOptions {
  autoLoad?: boolean;
  initialParams?: WorkerQueryParams;
}

interface UseWorkersAPIResult {
  // Data
  workers: Worker[];
  featuredWorkers: Worker[];
  specialties: {
    id: string;
    value: string;
    label: string;
    icon?: string;
    count?: number;
  }[];

  // Pagination
  totalWorkers: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Loading states
  loading: boolean;
  loadingMore: boolean;
  loadingSpecialties: boolean;
  error: string | null;

  // Actions
  loadWorkers: (params?: WorkerQueryParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshWorkers: () => Promise<void>;
  loadFeatured: () => Promise<void>;
  loadSpecialties: () => Promise<void>;
  loadStats: (params?: {
    workerType?: WorkerType;
    location?: string;
  }) => Promise<any>;
  searchWorkers: (query: string) => Promise<void>;
  setFilters: (params: WorkerQueryParams) => void;
  clearFilters: () => void;
}

export function useWorkersAPI(
  options: UseWorkersAPIOptions = {},
): UseWorkersAPIResult {
  const { autoLoad = true, initialParams = {} } = options;

  // State
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [featuredWorkers, setFeaturedWorkers] = useState<Worker[]>([]);
  const [specialties, setSpecialties] = useState<
    {
      id: string;
      value: string;
      label: string;
      icon?: string;
      count?: number;
    }[]
  >([]);

  // Pagination
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [currentParams, setCurrentParams] =
    useState<WorkerQueryParams>(initialParams);

  // Load workers
  const loadWorkers = useCallback(
    async (params?: WorkerQueryParams) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = { ...currentParams, ...params, page: 1 };
        const response = await getWorkers(queryParams);

        if (response.data) {
          setWorkers(response.data);
          setTotalWorkers(response.meta?.total || 0);
          setCurrentPage(response.meta?.page || 1);
          setTotalPages(response.meta?.totalPages || 1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load workers");
        console.error("Error loading workers:", err);
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
      const response = await getWorkers({
        ...currentParams,
        page: nextPage,
      });

      if (response.data) {
        setWorkers((prev) => [...prev, ...response.data]);
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.error("Error loading more workers:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, totalPages, loadingMore, currentParams]);

  // Refresh
  const refreshWorkers = useCallback(async () => {
    await loadWorkers({ page: 1 });
  }, [loadWorkers]);

  // Load featured
  const loadFeatured = useCallback(async () => {
    try {
      const response = await getFeaturedWorkers();
      if (response.data) {
        setFeaturedWorkers(response.data);
      }
    } catch (err) {
      console.error("Error loading featured workers:", err);
    }
  }, []);

  // Load specialties
  const loadSpecialties = useCallback(async () => {
    try {
      setLoadingSpecialties(true);
      const response = await getSpecialties();
      if (response) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSpecialties(response as any);
      }
    } catch (err) {
      console.error("Error loading specialties:", err);
    } finally {
      setLoadingSpecialties(false);
    }
  }, []);

  // Load stats
  const loadStats = useCallback(
    async (params?: { workerType?: WorkerType; location?: string }) => {
      try {
        return await getWorkerStats(params);
      } catch (err) {
        console.error("Error loading worker stats:", err);
        return null;
      }
    },
    [],
  );

  // Search
  const searchWorkers = useCallback(
    async (query: string) => {
      await loadWorkers({ search: query, page: 1 });
    },
    [loadWorkers],
  );

  // Set filters
  const setFilters = useCallback((params: WorkerQueryParams) => {
    setCurrentParams((prev) => ({ ...prev, ...params }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setCurrentParams({});
  }, []);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad) {
      loadWorkers();
      loadSpecialties();
    }
  }, [autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when params change
  useEffect(() => {
    if (Object.keys(currentParams).length > 0) {
      loadWorkers();
    }
  }, [currentParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Data
    workers,
    featuredWorkers,
    specialties,

    // Pagination
    totalWorkers,
    currentPage,
    totalPages,
    hasMore: currentPage < totalPages,

    // Loading
    loading,
    loadingMore,
    loadingSpecialties,
    error,

    // Actions
    loadWorkers,
    loadMore,
    refreshWorkers,
    loadFeatured,
    loadSpecialties,
    loadStats,
    searchWorkers,
    setFilters,
    clearFilters,
  };
}

// Single worker hook
interface UseWorkerResult {
  worker: Worker | null;
  reviews: WorkerReview[];
  loading: boolean;
  loadingReviews: boolean;
  error: string | null;
  loadWorker: (id: string) => Promise<void>;
  loadReviews: () => Promise<void>;
  addReview: (review: CreateWorkerReviewDto) => Promise<boolean>;
  contact: (message?: string) => Promise<boolean>;
}

export function useWorker(workerId?: string): UseWorkerResult {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [reviews, setReviews] = useState<WorkerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorker = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWorkerById(id);
      if (response) {
        setWorker(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load worker");
      console.error("Error loading worker:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    if (!workerId && !worker?.id) return;
    try {
      setLoadingReviews(true);
      const id = workerId || worker!.id;
      const response = await getWorkerReviews(id);
      if (response.data) {
        setReviews(response.data);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, [workerId, worker]);

  const addReview = useCallback(
    async (review: CreateWorkerReviewDto): Promise<boolean> => {
      if (!workerId && !worker?.id) return false;
      try {
        const id = workerId || worker!.id;
        await addWorkerReview(id, review);
        await loadReviews();
        return true;
      } catch (err) {
        console.error("Error adding review:", err);
        return false;
      }
    },
    [workerId, worker, loadReviews],
  );

  const contact = useCallback(
    async (message?: string): Promise<boolean> => {
      if (!workerId && !worker?.id) return false;
      try {
        const id = workerId || worker!.id;
        await contactWorker(id, message);
        return true;
      } catch (err) {
        console.error("Error contacting worker:", err);
        return false;
      }
    },
    [workerId, worker],
  );

  // Auto load on mount if workerId provided
  useEffect(() => {
    if (workerId) {
      loadWorker(workerId);
    }
  }, [workerId, loadWorker]);

  return {
    worker,
    reviews,
    loading,
    loadingReviews,
    error,
    loadWorker,
    loadReviews,
    addReview,
    contact,
  };
}

// Register worker hook
export function useWorkerRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const register = useCallback(async (data: RegisterWorkerDto) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await registerWorker(data);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
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
    register,
    reset,
  };
}

export { WorkerStatus, WorkerType };
export type {
    CreateWorkerReviewDto, RegisterWorkerDto, Worker,
    WorkerQueryParams,
    WorkerReview
};

