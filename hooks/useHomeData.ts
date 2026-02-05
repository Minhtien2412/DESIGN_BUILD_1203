/**
 * useHomeData Hook
 * Custom hook to fetch and manage home screen data
 * Combines API data with local fallback data
 * @updated 2026-01-29 - Fixed duplicate API calls on re-mount
 */

import {
    fetchBanners,
    fetchConstructionWorkers,
    fetchDesignServices,
    fetchEquipment,
    fetchFeaturedCategories,
    fetchFeaturedVideos,
    fetchFinishingWorkers,
    fetchHomeData,
    fetchLibraryCategories,
    fetchLiveStreams,
    fetchServices,
    HomeDataResponse,
    mergeWithFallback,
    type BannerItem,
    type CategoryItem,
    type LiveStreamItem,
    type ServiceItem,
    type VideoItem,
    type WorkerItem,
} from "@/services/homeDataService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ============================================================================
// Global state to prevent duplicate fetches across re-mounts
// ============================================================================
let globalFetchInProgress = false;
let globalLastFetchTime = 0;
const FETCH_DEBOUNCE_MS = 5000; // Minimum 5s between fetches

// ============================================================================
// Types
// ============================================================================

interface UseHomeDataOptions {
  enabled?: boolean;
  fetchAll?: boolean;
  sections?: (
    | "services"
    | "designServices"
    | "equipment"
    | "library"
    | "constructionWorkers"
    | "finishingWorkers"
    | "videos"
    | "liveStreams"
    | "categories"
    | "banners"
  )[];
}

interface UseHomeDataResult {
  // Data
  services: ServiceItem[];
  designServices: ServiceItem[];
  equipment: ServiceItem[];
  library: CategoryItem[];
  constructionWorkers: WorkerItem[];
  finishingWorkers: WorkerItem[];
  videos: VideoItem[];
  liveStreams: LiveStreamItem[];
  categories: CategoryItem[];
  banners: BannerItem[];

  // States
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;

  // Actions
  refresh: () => Promise<void>;
  setLocalData: (data: Partial<HomeDataResponse>) => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useHomeData(
  localFallbackData: Partial<HomeDataResponse> = {},
  options: UseHomeDataOptions = {},
): UseHomeDataResult {
  const { enabled = true, fetchAll = false, sections } = options;

  // Memoize fallback data to prevent infinite loops
  // (when caller passes inline object that changes every render)
  const fallbackDataRef = useRef(localFallbackData);
  const stableFallbackData = useMemo(() => {
    // Only update if values actually changed
    const hasChanged = Object.keys(localFallbackData).some(
      (key) =>
        localFallbackData[key as keyof HomeDataResponse] !==
        fallbackDataRef.current[key as keyof HomeDataResponse],
    );
    if (hasChanged) {
      fallbackDataRef.current = localFallbackData;
    }
    return fallbackDataRef.current;
  }, []); // Empty deps - only use initial value

  // Track if initial fetch has been done
  const hasFetchedRef = useRef(false);

  // State
  const [services, setServices] = useState<ServiceItem[]>(
    stableFallbackData.services || [],
  );
  const [designServices, setDesignServices] = useState<ServiceItem[]>(
    stableFallbackData.designServices || [],
  );
  const [equipment, setEquipment] = useState<ServiceItem[]>(
    stableFallbackData.equipmentItems || [],
  );
  const [library, setLibrary] = useState<CategoryItem[]>(
    stableFallbackData.libraryItems || [],
  );
  const [constructionWorkers, setConstructionWorkers] = useState<WorkerItem[]>(
    stableFallbackData.constructionWorkers || [],
  );
  const [finishingWorkers, setFinishingWorkers] = useState<WorkerItem[]>(
    stableFallbackData.finishingWorkers || [],
  );
  const [videos, setVideos] = useState<VideoItem[]>(
    stableFallbackData.videoItems || [],
  );
  const [liveStreams, setLiveStreams] = useState<LiveStreamItem[]>(
    stableFallbackData.liveStreams || [],
  );
  const [categories, setCategories] = useState<CategoryItem[]>(
    stableFallbackData.categories || [],
  );
  const [banners, setBanners] = useState<BannerItem[]>(
    stableFallbackData.banners || [],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if section should be fetched
  const shouldFetch = useCallback(
    (section: string) => {
      if (fetchAll) return true;
      if (!sections) return true;
      return sections.includes(section as any);
    },
    [fetchAll, sections],
  );

  // Fetch all data
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!enabled) return;

      // Prevent duplicate initial fetches using global state
      const now = Date.now();
      if (!isRefresh) {
        if (globalFetchInProgress) {
          console.log("[useHomeData] Fetch already in progress, skipping");
          return;
        }
        if (hasFetchedRef.current) {
          return;
        }
        // Check global debounce
        if (now - globalLastFetchTime < FETCH_DEBOUNCE_MS) {
          console.log("[useHomeData] Debouncing, skipping fetch");
          return;
        }
      }

      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
        hasFetchedRef.current = true;
        globalFetchInProgress = true;
        globalLastFetchTime = now;
      }
      setError(null);

      try {
        // Try to fetch all data in one request first
        if (fetchAll) {
          const homeData = await fetchHomeData();
          if (Object.keys(homeData).length > 0) {
            if (homeData.services)
              setServices(
                mergeWithFallback(
                  homeData.services,
                  stableFallbackData.services || [],
                ),
              );
            if (homeData.designServices)
              setDesignServices(
                mergeWithFallback(
                  homeData.designServices,
                  stableFallbackData.designServices || [],
                ),
              );
            if (homeData.equipmentItems)
              setEquipment(
                mergeWithFallback(
                  homeData.equipmentItems,
                  stableFallbackData.equipmentItems || [],
                ),
              );
            if (homeData.libraryItems)
              setLibrary(
                mergeWithFallback(
                  homeData.libraryItems,
                  stableFallbackData.libraryItems || [],
                ),
              );
            if (homeData.constructionWorkers)
              setConstructionWorkers(
                mergeWithFallback(
                  homeData.constructionWorkers,
                  stableFallbackData.constructionWorkers || [],
                ),
              );
            if (homeData.finishingWorkers)
              setFinishingWorkers(
                mergeWithFallback(
                  homeData.finishingWorkers,
                  stableFallbackData.finishingWorkers || [],
                ),
              );
            if (homeData.videoItems)
              setVideos(
                mergeWithFallback(
                  homeData.videoItems,
                  stableFallbackData.videoItems || [],
                ),
              );
            if (homeData.liveStreams)
              setLiveStreams(
                mergeWithFallback(
                  homeData.liveStreams,
                  stableFallbackData.liveStreams || [],
                ),
              );
            if (homeData.categories)
              setCategories(
                mergeWithFallback(
                  homeData.categories,
                  stableFallbackData.categories || [],
                ),
              );
            if (homeData.banners)
              setBanners(
                mergeWithFallback(
                  homeData.banners,
                  stableFallbackData.banners || [],
                ),
              );
            return;
          }
        }

        // Fetch individual sections in parallel
        const promises: Promise<void>[] = [];

        if (shouldFetch("services")) {
          promises.push(
            fetchServices().then((data) =>
              setServices(
                mergeWithFallback(data, stableFallbackData.services || []),
              ),
            ),
          );
        }

        if (shouldFetch("designServices")) {
          promises.push(
            fetchDesignServices().then((data) =>
              setDesignServices(
                mergeWithFallback(
                  data,
                  stableFallbackData.designServices || [],
                ),
              ),
            ),
          );
        }

        if (shouldFetch("equipment")) {
          promises.push(
            fetchEquipment().then((data) =>
              setEquipment(
                mergeWithFallback(
                  data,
                  stableFallbackData.equipmentItems || [],
                ),
              ),
            ),
          );
        }

        if (shouldFetch("library")) {
          promises.push(
            fetchLibraryCategories().then((data) =>
              setLibrary(
                mergeWithFallback(data, stableFallbackData.libraryItems || []),
              ),
            ),
          );
        }

        if (shouldFetch("constructionWorkers")) {
          promises.push(
            fetchConstructionWorkers().then((data) =>
              setConstructionWorkers(
                mergeWithFallback(
                  data,
                  stableFallbackData.constructionWorkers || [],
                ),
              ),
            ),
          );
        }

        if (shouldFetch("finishingWorkers")) {
          promises.push(
            fetchFinishingWorkers().then((data) =>
              setFinishingWorkers(
                mergeWithFallback(
                  data,
                  stableFallbackData.finishingWorkers || [],
                ),
              ),
            ),
          );
        }

        if (shouldFetch("videos")) {
          promises.push(
            fetchFeaturedVideos().then((data) =>
              setVideos(
                mergeWithFallback(data, stableFallbackData.videoItems || []),
              ),
            ),
          );
        }

        if (shouldFetch("liveStreams")) {
          promises.push(
            fetchLiveStreams().then((data) =>
              setLiveStreams(
                mergeWithFallback(data, stableFallbackData.liveStreams || []),
              ),
            ),
          );
        }

        if (shouldFetch("categories")) {
          promises.push(
            fetchFeaturedCategories().then((data) =>
              setCategories(
                mergeWithFallback(data, stableFallbackData.categories || []),
              ),
            ),
          );
        }

        if (shouldFetch("banners")) {
          promises.push(
            fetchBanners().then((data) =>
              setBanners(
                mergeWithFallback(data, stableFallbackData.banners || []),
              ),
            ),
          );
        }

        await Promise.allSettled(promises);
      } catch (err) {
        console.error("[useHomeData] Error fetching data:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch home data"),
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        globalFetchInProgress = false;
      }
    },
    [enabled, fetchAll, shouldFetch, stableFallbackData],
  );

  // Initial fetch - DEFERRED to not block UI
  useEffect(() => {
    // Delay initial fetch to let UI render first
    const timeoutId = setTimeout(() => {
      fetchData(false);
    }, 500); // Wait 500ms before fetching

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only depend on enabled, not fetchData to prevent loops

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Set local data manually (for testing or offline mode)
  const setLocalData = useCallback((data: Partial<HomeDataResponse>) => {
    if (data.services) setServices(data.services);
    if (data.designServices) setDesignServices(data.designServices);
    if (data.equipmentItems) setEquipment(data.equipmentItems);
    if (data.libraryItems) setLibrary(data.libraryItems);
    if (data.constructionWorkers)
      setConstructionWorkers(data.constructionWorkers);
    if (data.finishingWorkers) setFinishingWorkers(data.finishingWorkers);
    if (data.videoItems) setVideos(data.videoItems);
    if (data.liveStreams) setLiveStreams(data.liveStreams);
    if (data.categories) setCategories(data.categories);
    if (data.banners) setBanners(data.banners);
  }, []);

  return {
    services,
    designServices,
    equipment,
    library,
    constructionWorkers,
    finishingWorkers,
    videos,
    liveStreams,
    categories,
    banners,
    isLoading,
    isRefreshing,
    error,
    refresh,
    setLocalData,
  };
}

export default useHomeData;
