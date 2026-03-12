/**
 * useHomePageData - Comprehensive data hook for Home Screen
 * Fetches pre-computed data from dedicated BE endpoints:
 *   /home/products/flash-sale, /home/products/trending,
 *   /home/products/bestsellers, /home/products/new-arrivals,
 *   /home/workers/top-rated, /home/stats
 * Also fetches raw products, workers, categories for other sections
 * @created 2026-02-06
 * @updated 2026-03-03 — Use server-side computed endpoints
 */

import { get } from "@/services/api";
import { useCallback, useEffect, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

export interface ServerProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  stock: number;
  status: string;
  viewCount: number;
  soldCount: number;
  isBestseller: boolean;
  isNew: boolean;
  images: ProductImage[];
  seller?: { id: number; name: string; email: string };
  createdAt: string;
}

export interface ServerWorker {
  id: string;
  name: string;
  phone: string;
  workerType: string;
  location: string;
  district: string;
  experience: number;
  skills: string[];
  dailyRate: number;
  hourlyRate: number;
  avatar: string;
  bio: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  status: string;
  verified: boolean;
  featured: boolean;
  availability: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  count?: number;
}

// ============================================================================
// Display types for UI
// ============================================================================

export interface FlashSaleItem {
  id: number;
  name: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  sold: number;
  total: number;
  rating: number;
  isLive: boolean;
  hasVoucher: boolean;
  voucherText: string;
  location: string;
  deliveryDays: string;
  route: string;
}

export interface TopWorkerItem {
  id: number;
  name: string;
  avatar: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  verified: boolean;
  completedJobs: number;
  experience: number;
  dailyRate: number;
}

export interface TrendingProductItem {
  id: number;
  name: string;
  image: string;
  price: number;
  soldCount: number;
  viewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  seller: string;
  sellerId?: string;
  route: string;
}

export interface BestsellerItem {
  id: number;
  name: string;
  image: string;
  price: number;
  soldCount: number;
  rating: number;
  seller: string;
  sellerId?: string;
  route: string;
}

export interface NewArrivalItem {
  id: number;
  name: string;
  image: string;
  price: number;
  daysNew: number;
  seller: string;
  sellerId?: string;
  route: string;
}

export interface WorkerByType {
  type: string;
  displayName: string;
  count: number;
  avgRating: number;
  topWorker?: TopWorkerItem;
}

export interface HomeStats {
  totalProducts: number;
  totalWorkers: number;
  totalSold: number;
  avgRating: number;
  activeDeals: number;
  categoriesCount: number;
}

// ============================================================================
// Constants
// ============================================================================

const WORKER_TYPE_DISPLAY: Record<string, string> = {
  THO_XAY: "Thợ xây",
  THO_DIEN: "Thợ điện",
  THO_SON: "Thợ sơn",
  THO_NUOC: "Thợ nước",
  THO_MOC: "Thợ mộc",
  THO_SAT: "Thợ sắt",
  THO_GACH: "Thợ gạch",
  THO_THACH_CAO: "Thợ thạch cao",
  THO_NHOM_KINH: "Thợ nhôm kính",
  GIAM_SAT: "Giám sát",
  KY_SU: "Kỹ sư",
  NHAN_CONG: "Nhân công",
  THO_COFFA: "Thợ coffa",
  THO_CO_KHI: "Thợ cơ khí",
  THO_CAMERA: "Thợ camera",
  THO_LAN_CAN: "Thợ lan can",
  THO_CUA: "Thợ cửa",
  THO_DA: "Thợ đá",
  THO_ONG_NUOC: "Thợ ống nước",
  THO_TO_TUONG: "Thợ tô tường",
  THO_OP_DA: "Thợ ốp đá",
};

// ============================================================================
// API Response wrapper
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ============================================================================
// Hook
// ============================================================================

export function useHomePageData() {
  // Raw data (for other sections that still need full lists)
  const [products, setProducts] = useState<ServerProduct[]>([]);
  const [workers, setWorkers] = useState<ServerWorker[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Pre-computed data from dedicated endpoints
  const [flashSaleProducts, setFlashSaleProducts] = useState<FlashSaleItem[]>(
    [],
  );
  const [topRatedWorkers, setTopRatedWorkers] = useState<TopWorkerItem[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<
    TrendingProductItem[]
  >([]);
  const [bestsellers, setBestsellers] = useState<BestsellerItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<NewArrivalItem[]>([]);
  const [stats, setStats] = useState<HomeStats>({
    totalProducts: 0,
    totalWorkers: 0,
    totalSold: 0,
    avgRating: 4.7,
    activeDeals: 0,
    categoriesCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel — dedicated endpoints + raw lists
      const [
        flashSaleRes,
        trendingRes,
        bestsellersRes,
        newArrivalsRes,
        topWorkersRes,
        statsRes,
        productsRes,
        workersRes,
        categoriesRes,
      ] = await Promise.allSettled([
        get<ApiResponse<FlashSaleItem[]>>("/home/products/flash-sale?limit=10"),
        get<ApiResponse<TrendingProductItem[]>>(
          "/home/products/trending?limit=10",
        ),
        get<ApiResponse<BestsellerItem[]>>(
          "/home/products/bestsellers?limit=6",
        ),
        get<ApiResponse<NewArrivalItem[]>>(
          "/home/products/new-arrivals?limit=6",
        ),
        get<ApiResponse<TopWorkerItem[]>>("/home/workers/top-rated?limit=8"),
        get<ApiResponse<HomeStats>>("/home/stats"),
        get<{ data: ServerProduct[] }>("/products?limit=50"),
        get<{ data: ServerWorker[] }>("/workers?limit=30"),
        get<CategoryItem[]>("/products/categories"),
      ]);

      // Dedicated endpoints (server-computed)
      if (flashSaleRes.status === "fulfilled") {
        const d = flashSaleRes.value?.data;
        setFlashSaleProducts(Array.isArray(d) ? d : []);
      }
      if (trendingRes.status === "fulfilled") {
        const d = trendingRes.value?.data;
        setTrendingProducts(Array.isArray(d) ? d : []);
      }
      if (bestsellersRes.status === "fulfilled") {
        const d = bestsellersRes.value?.data;
        setBestsellers(Array.isArray(d) ? d : []);
      }
      if (newArrivalsRes.status === "fulfilled") {
        const d = newArrivalsRes.value?.data;
        setNewArrivals(Array.isArray(d) ? d : []);
      }
      if (topWorkersRes.status === "fulfilled") {
        const d = topWorkersRes.value?.data;
        setTopRatedWorkers(Array.isArray(d) ? d : []);
      }
      if (statsRes.status === "fulfilled") {
        const d = statsRes.value?.data;
        if (d && typeof d === "object" && !Array.isArray(d)) {
          setStats(d);
        }
      }

      // Raw lists (for WorkerGrid, other sections)
      if (productsRes.status === "fulfilled" && productsRes.value?.data) {
        setProducts(
          Array.isArray(productsRes.value.data) ? productsRes.value.data : [],
        );
      }
      if (workersRes.status === "fulfilled" && workersRes.value?.data) {
        setWorkers(
          Array.isArray(workersRes.value.data) ? workersRes.value.data : [],
        );
      }
      if (categoriesRes.status === "fulfilled" && categoriesRes.value) {
        setCategories(
          Array.isArray(categoriesRes.value) ? categoriesRes.value : [],
        );
      }
    } catch (err: any) {
      setError(err?.message || "Không thể tải dữ liệu");
      console.warn("[useHomePageData] Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      const timer = setTimeout(fetchData, 200);
      return () => clearTimeout(timer);
    }
  }, [fetchData]);

  // ======================== Workers by Type ========================
  // Still derived client-side from raw workers list
  const workersByType: WorkerByType[] = Object.entries(
    workers
      .filter((w) => w.status === "APPROVED")
      .reduce(
        (acc, w) => {
          const type = w.workerType;
          if (!acc[type]) acc[type] = [];
          acc[type].push(w);
          return acc;
        },
        {} as Record<string, ServerWorker[]>,
      ),
  )
    .map(([type, list]) => ({
      type,
      displayName: WORKER_TYPE_DISPLAY[type] || type,
      count: list.length,
      avgRating: +(
        list.reduce((s, w) => s + w.rating, 0) / list.length
      ).toFixed(1),
      topWorker: list.sort((a, b) => b.rating - a.rating)[0]
        ? {
            id: Number(list[0].id),
            name: list[0].name,
            avatar: list[0].avatar,
            specialty: WORKER_TYPE_DISPLAY[type] || type,
            rating: list[0].rating,
            reviews: list[0].reviewCount,
            location: list[0].location || "TP.HCM",
            verified: list[0].verified,
            completedJobs: list[0].completedJobs,
            experience: list[0].experience,
            dailyRate: list[0].dailyRate,
          }
        : undefined,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    // Raw
    rawProducts: products,
    rawWorkers: workers,
    categories,
    // Server-computed sections
    flashSaleProducts,
    topRatedWorkers,
    trendingProducts,
    bestsellers,
    newArrivals,
    workersByType,
    stats,
    // State
    loading,
    error,
    refresh: fetchData,
  };
}
