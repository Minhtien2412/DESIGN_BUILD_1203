/**
 * useServices Hook
 * React hook for managing services marketplace with caching and offline support
 */

import { useCallback, useEffect, useState } from "react";
import servicesApi, { Service, ServiceCategory } from "../services/servicesApi";
import { cache, CacheTTL } from "../utils/cache";
import { getOfflineData, saveOfflineData } from "../utils/offlineStorage";
import { useNetworkStatus } from "./useNetworkStatus";

// ==================== TYPES ====================

interface UseServicesResult {
  services: Service[];
  categories: ServiceCategory[];
  loading: boolean;
  error: Error | null;
  selectedCategory: string | null;
  searchQuery: string;
  setSelectedCategory: (category: string | null) => void;
  setSearchQuery: (query: string) => void;
  refreshServices: () => Promise<void>;
  retrying: boolean;
}

// ==================== HOOK ====================

export function useServices(): UseServicesResult {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOffline } = useNetworkStatus();

  const fetchCategories = useCallback(async () => {
    try {
      const data = await servicesApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("[useServices] Error fetching categories:", err);
      // Don't set error for categories, just log it
    }
  }, []);

  const fetchServices = useCallback(
    async (isRetry = false) => {
      const CACHE_KEY = "services:all";
      const OFFLINE_KEY = "services_offline";

      try {
        // If offline, try offline storage first
        if (isOffline) {
          console.log("[useServices] Device offline, using offline storage");
          const offlineData = await getOfflineData<Service[]>(OFFLINE_KEY);
          if (offlineData) {
            setServices(offlineData);
            setLoading(false);
            setError(null);
            return;
          }
          // No offline data available
          throw new Error(
            "No offline data available. Please connect to the internet.",
          );
        }

        // Try cache first (unless retrying)
        if (!isRetry) {
          const cachedData = cache.get<Service[]>(CACHE_KEY);
          if (cachedData) {
            console.log("[useServices] Using cached data");
            setServices(cachedData);
            setLoading(false);
            setError(null);

            // Background refresh after returning cached data
            servicesApi
              .getServices(selectedCategory || undefined)
              .then((response) => {
                cache.set(CACHE_KEY, response.data, CacheTTL.MEDIUM);
                saveOfflineData(OFFLINE_KEY, response.data); // Persist for offline
                setServices(response.data);
              })
              .catch((err) => {
                console.error("[useServices] Background refresh failed:", err);
              });

            return;
          }
        }

        if (isRetry) {
          setRetrying(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await servicesApi.getServices(
          selectedCategory || undefined,
        );

        // Cache the response
        cache.set(CACHE_KEY, response.data, CacheTTL.MEDIUM);

        // Save to offline storage for offline access
        await saveOfflineData(OFFLINE_KEY, response.data);

        // Filter by search query client-side (backend doesn't support search yet)
        let filteredServices = response.data;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredServices = response.data.filter(
            (service) =>
              service.name.toLowerCase().includes(query) ||
              (service.description ?? "").toLowerCase().includes(query) ||
              service.category.toLowerCase().includes(query),
          );
        }

        setServices(filteredServices);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load services");
        setError(error);
        console.error("[useServices] Error fetching services:", err);
        setServices([]); // Clear stale data on error
      } finally {
        setLoading(false);
        setRetrying(false);
      }
    },
    [selectedCategory, searchQuery],
  );

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch services when category or search changes
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleRetry = useCallback(async () => {
    await fetchServices(true);
  }, [fetchServices]);

  return {
    services,
    categories,
    loading,
    error,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    refreshServices: handleRetry,
    retrying,
  };
}

// ==================== SERVICE DETAIL HOOK ====================

interface UseServiceDetailResult {
  service: Service | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useServiceDetail(serviceId: number): UseServiceDetailResult {
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await servicesApi.getService(serviceId);
      setService(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service");
      console.error("[useServiceDetail] Error:", err);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  return {
    service,
    loading,
    error,
    refresh: fetchService,
  };
}

// ==================== EXPORTS ====================

export default useServices;
