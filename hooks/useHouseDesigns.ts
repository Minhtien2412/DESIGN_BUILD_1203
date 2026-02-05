/**
 * Hook for House Design API integration
 * Connects FE screens with house-design.api.ts service
 */

import {
    CreateHouseDesignDto,
    DesignStyle,
    DesignType,
    getDesignStyles,
    getDesignTypes,
    getFeaturedDesigns,
    getHouseDesignById,
    getHouseDesigns,
    HouseDesign,
    HouseDesignQueryParams,
} from "@/services/house-design.api";
import { useCallback, useEffect, useState } from "react";

// Review types (may not be in API yet)
export interface DesignReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

export interface CreateDesignReviewDto {
  rating: number;
  comment?: string;
  images?: string[];
}

interface UseHouseDesignsOptions {
  autoLoad?: boolean;
  initialParams?: HouseDesignQueryParams;
}

interface UseHouseDesignsResult {
  // Data
  designs: HouseDesign[];
  featuredDesigns: HouseDesign[];
  designTypes: { id: string; value: string; label: string; count?: number }[];
  designStyles: { id: string; value: string; label: string }[];

  // Pagination
  totalDesigns: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;

  // Loading states
  loading: boolean;
  loadingMore: boolean;
  loadingTypes: boolean;
  loadingStyles: boolean;
  error: string | null;

  // Actions
  loadDesigns: (params?: HouseDesignQueryParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshDesigns: () => Promise<void>;
  loadFeatured: (limit?: number) => Promise<void>;
  loadDesignTypes: () => Promise<void>;
  loadDesignStyles: () => Promise<void>;
  searchDesigns: (query: string) => Promise<void>;
  setFilters: (params: HouseDesignQueryParams) => void;
  clearFilters: () => void;
}

export function useHouseDesigns(
  options: UseHouseDesignsOptions = {},
): UseHouseDesignsResult {
  const { autoLoad = true, initialParams = {} } = options;

  // State
  const [designs, setDesigns] = useState<HouseDesign[]>([]);
  const [featuredDesigns, setFeaturedDesigns] = useState<HouseDesign[]>([]);
  const [designTypes, setDesignTypes] = useState<
    { id: string; value: string; label: string; count?: number }[]
  >([]);
  const [designStyles, setDesignStyles] = useState<
    { id: string; value: string; label: string }[]
  >([]);

  // Pagination
  const [totalDesigns, setTotalDesigns] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingStyles, setLoadingStyles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [currentParams, setCurrentParams] =
    useState<HouseDesignQueryParams>(initialParams);

  // Load designs
  const loadDesigns = useCallback(
    async (params?: HouseDesignQueryParams) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = { ...currentParams, ...params, page: 1 };
        const response = await getHouseDesigns(queryParams);

        if (response.data) {
          setDesigns(response.data);
          setTotalDesigns(response.meta?.total || 0);
          setCurrentPage(response.meta?.page || 1);
          setTotalPages(response.meta?.totalPages || 1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load designs");
        console.error("Error loading designs:", err);
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
      const response = await getHouseDesigns({
        ...currentParams,
        page: nextPage,
      });

      if (response.data) {
        setDesigns((prev) => [...prev, ...response.data]);
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.error("Error loading more designs:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, totalPages, loadingMore, currentParams]);

  // Refresh
  const refreshDesigns = useCallback(async () => {
    await loadDesigns({ page: 1 });
  }, [loadDesigns]);

  // Load featured
  const loadFeatured = useCallback(async (limit = 10) => {
    try {
      const response = await getFeaturedDesigns();
      if (response.data) {
        setFeaturedDesigns(response.data.slice(0, limit));
      }
    } catch (err) {
      console.error("Error loading featured designs:", err);
    }
  }, []);

  // Load design types
  const loadDesignTypes = useCallback(async () => {
    try {
      setLoadingTypes(true);
      const response = await getDesignTypes();
      if (response) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDesignTypes(response as any);
      }
    } catch (err) {
      console.error("Error loading design types:", err);
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  // Load design styles
  const loadDesignStyles = useCallback(async () => {
    try {
      setLoadingStyles(true);
      const response = await getDesignStyles();
      if (response) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setDesignStyles(response as any);
      }
    } catch (err) {
      console.error("Error loading design styles:", err);
    } finally {
      setLoadingStyles(false);
    }
  }, []);

  // Search
  const searchDesigns = useCallback(
    async (query: string) => {
      await loadDesigns({ search: query, page: 1 });
    },
    [loadDesigns],
  );

  // Set filters
  const setFilters = useCallback((params: HouseDesignQueryParams) => {
    setCurrentParams((prev) => ({ ...prev, ...params }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setCurrentParams({});
  }, []);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad) {
      loadDesigns();
      loadDesignTypes();
      loadDesignStyles();
    }
  }, [autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when params change
  useEffect(() => {
    if (Object.keys(currentParams).length > 0) {
      loadDesigns();
    }
  }, [currentParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Data
    designs,
    featuredDesigns,
    designTypes,
    designStyles,

    // Pagination
    totalDesigns,
    currentPage,
    totalPages,
    hasMore: currentPage < totalPages,

    // Loading
    loading,
    loadingMore,
    loadingTypes,
    loadingStyles,
    error,

    // Actions
    loadDesigns,
    loadMore,
    refreshDesigns,
    loadFeatured,
    loadDesignTypes,
    loadDesignStyles,
    searchDesigns,
    setFilters,
    clearFilters,
  };
}

// Single design hook
interface UseHouseDesignResult {
  design: HouseDesign | null;
  reviews: DesignReview[];
  similarDesigns: HouseDesign[];
  loading: boolean;
  error: string | null;
  loadDesign: (id: string) => Promise<void>;
  loadReviews: () => Promise<void>;
  loadSimilar: () => Promise<void>;
  addReview: (review: CreateDesignReviewDto) => Promise<boolean>;
  incrementView: () => Promise<void>;
}

export function useHouseDesign(designId?: string): UseHouseDesignResult {
  const [design, setDesign] = useState<HouseDesign | null>(null);
  const [reviews, setReviews] = useState<DesignReview[]>([]);
  const [similarDesigns, setSimilarDesigns] = useState<HouseDesign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDesign = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getHouseDesignById(id);
      if (response) {
        setDesign(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load design");
      console.error("Error loading design:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    if (!designId && !design?.id) return;
    // TODO: Implement when API is ready
  }, [designId, design]);

  const loadSimilar = useCallback(async () => {
    if (!designId && !design?.id) return;
    // TODO: Implement when API is ready
  }, [designId, design]);

  const addReview = useCallback(
    async (_review: CreateDesignReviewDto): Promise<boolean> => {
      if (!designId && !design?.id) return false;
      // TODO: Implement when API is ready
      return true;
    },
    [designId, design],
  );

  const incrementView = useCallback(async () => {
    if (!designId && !design?.id) return;
    // TODO: Implement when API is ready
  }, [designId, design]);

  // Auto load on mount if designId provided
  useEffect(() => {
    if (designId) {
      loadDesign(designId);
    }
  }, [designId, loadDesign]);

  return {
    design,
    reviews,
    similarDesigns,
    loading,
    error,
    loadDesign,
    loadReviews,
    loadSimilar,
    addReview,
    incrementView,
  };
}

export { DesignStyle, DesignType };
export type { CreateHouseDesignDto, HouseDesign, HouseDesignQueryParams };

