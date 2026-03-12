/**
 * useNearbyWorkers Hook
 * Finds and manages nearby workers based on user location
 * Powers the Grab-style worker map view
 */

import {
    getNearbyWorkers,
    type NearbyWorkerQuery,
    type WorkerWithLocation,
} from "@/services/worker-location.service";
import type { LatLng } from "@/utils/geo";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseNearbyWorkersOptions {
  /** Search radius in km (default 10) */
  radiusKm?: number;
  /** Worker type filter */
  workerType?: string;
  /** Service category filter */
  category?: string;
  /** Minimum rating filter */
  minRating?: number;
  /** Max results */
  limit?: number;
  /** Auto-search when location changes? Default true */
  autoSearch?: boolean;
  /** Refresh interval in ms (0 = off). Default 30000 (30s) */
  refreshInterval?: number;
}

interface UseNearbyWorkersResult {
  workers: WorkerWithLocation[];
  loading: boolean;
  error: string | null;
  selectedWorker: WorkerWithLocation | null;
  totalFound: number;
  searchRadius: number;
  search: (location?: LatLng) => Promise<void>;
  selectWorker: (worker: WorkerWithLocation | null) => void;
  setRadius: (km: number) => void;
  setCategory: (cat: string | undefined) => void;
  refresh: () => Promise<void>;
}

export function useNearbyWorkers(
  userLocation: LatLng | null,
  options: UseNearbyWorkersOptions = {},
): UseNearbyWorkersResult {
  const {
    radiusKm: initialRadius = 10,
    workerType,
    category: initialCategory,
    minRating,
    limit = 20,
    autoSearch = true,
    refreshInterval = 30000,
  } = options;

  const [workers, setWorkers] = useState<WorkerWithLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] =
    useState<WorkerWithLocation | null>(null);
  const [searchRadius, setSearchRadius] = useState(initialRadius);
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastLocationRef = useRef<LatLng | null>(null);

  const search = useCallback(
    async (location?: LatLng) => {
      const loc = location || userLocation;
      if (!loc) {
        setError("Cần vị trí để tìm thợ gần bạn");
        return;
      }

      setLoading(true);
      setError(null);
      lastLocationRef.current = loc;

      try {
        const query: NearbyWorkerQuery = {
          latitude: loc.latitude,
          longitude: loc.longitude,
          radiusKm: searchRadius,
          workerType,
          category,
          limit,
          minRating,
          available: true,
        };

        const result = await getNearbyWorkers(query);
        setWorkers(result);
      } catch (err) {
        setError("Không thể tìm thợ. Thử lại sau.");
        console.warn("[useNearbyWorkers] Search failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [userLocation, searchRadius, workerType, category, limit, minRating],
  );

  const selectWorker = useCallback((worker: WorkerWithLocation | null) => {
    setSelectedWorker(worker);
  }, []);

  const setRadius = useCallback((km: number) => {
    setSearchRadius(km);
  }, []);

  const setCategoryFilter = useCallback((cat: string | undefined) => {
    setCategory(cat);
  }, []);

  const refresh = useCallback(async () => {
    if (lastLocationRef.current) {
      await search(lastLocationRef.current);
    } else if (userLocation) {
      await search(userLocation);
    }
  }, [search, userLocation]);

  // Auto-search when user location is available
  useEffect(() => {
    if (autoSearch && userLocation) {
      search(userLocation);
    }
  }, [autoSearch, userLocation, searchRadius, category]); // eslint-disable-line react-hooks/exhaustive-deps

  // Periodic refresh
  useEffect(() => {
    if (refreshInterval > 0 && userLocation) {
      intervalRef.current = setInterval(() => {
        search(userLocation);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    return undefined;
  }, [refreshInterval, userLocation, search]);

  return {
    workers,
    loading,
    error,
    selectedWorker,
    totalFound: workers.length,
    searchRadius,
    search,
    selectWorker,
    setRadius,
    setCategory: setCategoryFilter,
    refresh,
  };
}
