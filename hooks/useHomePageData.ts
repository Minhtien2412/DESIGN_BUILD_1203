/**
 * useHomePageData - Comprehensive data hook for Home Screen
 * Fetches products, workers, categories, promotions from BE
 * Provides all data needed for modern home page sections
 * @created 2026-02-06
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

const VOUCHER_LABELS = ["2.2", "XTRA", "STYLE", "FREESHIP"];

// Stable random based on seed
const stableRandom = (seed: number, index: number) => {
  const x = Math.sin(seed * 9301 + index * 49297) * 49297;
  return x - Math.floor(x);
};

// ============================================================================
// Hook
// ============================================================================

export function useHomePageData() {
  const [products, setProducts] = useState<ServerProduct[]>([]);
  const [workers, setWorkers] = useState<ServerWorker[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, workersRes, categoriesRes] = await Promise.allSettled(
        [
          get<{ data: ServerProduct[] }>("/products?limit=50"),
          get<{ data: ServerWorker[] }>("/workers?limit=30"),
          get<CategoryItem[]>("/products/categories"),
        ],
      );

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

  // ======================== Flash Sale ========================
  const flashSaleProducts: FlashSaleItem[] = products
    .filter((p) => p.status === "APPROVED" && p.images.length > 0)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 10)
    .map((p) => {
      const price = Number(p.price);
      const r = stableRandom(p.id, 1);
      const discount = Math.floor(r * 20 + 15);
      const originalPrice = Math.round(price / (1 - discount / 100));
      return {
        id: p.id,
        name: p.name,
        image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || "",
        originalPrice,
        salePrice: price,
        sold: p.soldCount,
        total: Math.max(
          p.soldCount + 50 + Math.floor(stableRandom(p.id, 2) * 100),
          p.soldCount * 2,
        ),
        rating: Math.round((4.5 + stableRandom(p.id, 3) * 0.5) * 10) / 10,
        isLive: stableRandom(p.id, 4) > 0.7,
        hasVoucher: stableRandom(p.id, 5) > 0.5,
        voucherText: VOUCHER_LABELS[Math.floor(stableRandom(p.id, 6) * 4)],
        location: p.seller?.name || "TP. Hồ Chí Minh",
        deliveryDays: stableRandom(p.id, 7) > 0.3 ? "3-5 ngày" : "4 Giờ",
        route: `/product/${p.id}`,
      };
    });

  // ======================== Top Workers ========================
  const topRatedWorkers: TopWorkerItem[] = workers
    .filter((w) => w.status === "APPROVED" && w.rating >= 4.0)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 8)
    .map((w) => ({
      id: Number(w.id),
      name: w.name,
      avatar: w.avatar,
      specialty: WORKER_TYPE_DISPLAY[w.workerType] || w.workerType,
      rating: w.rating,
      reviews: w.reviewCount,
      location:
        w.location?.replace("Quan ", "Q.").replace(", TP.HCM", "") || "TP.HCM",
      verified: w.verified,
      completedJobs: w.completedJobs,
      experience: w.experience,
      dailyRate: w.dailyRate,
    }));

  // ======================== Trending Products ========================
  const trendingProducts: TrendingProductItem[] = products
    .filter((p) => p.status === "APPROVED" && p.images.length > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || "",
      price: Number(p.price),
      soldCount: p.soldCount,
      viewCount: p.viewCount,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      seller: p.seller?.name || "Bảo Tiên Web",
      sellerId: p.seller?.id ? String(p.seller.id) : undefined,
      route: `/product/${p.id}`,
    }));

  // ======================== Bestsellers ========================
  const bestsellers: BestsellerItem[] = products
    .filter(
      (p) => p.status === "APPROVED" && p.isBestseller && p.images.length > 0,
    )
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || "",
      price: Number(p.price),
      soldCount: p.soldCount,
      rating: Math.round((4.5 + stableRandom(p.id, 3) * 0.5) * 10) / 10,
      seller: p.seller?.name || "Bảo Tiên Web",
      sellerId: p.seller?.id ? String(p.seller.id) : undefined,
      route: `/product/${p.id}`,
    }));

  // ======================== New Arrivals ========================
  const newArrivals: NewArrivalItem[] = products
    .filter((p) => p.status === "APPROVED" && p.isNew && p.images.length > 0)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6)
    .map((p) => {
      const now = new Date();
      const created = new Date(p.createdAt);
      const daysNew = Math.max(
        1,
        Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)),
      );
      return {
        id: p.id,
        name: p.name,
        image: p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || "",
        price: Number(p.price),
        daysNew,
        seller: p.seller?.name || "Bảo Tiên Web",
        sellerId: p.seller?.id ? String(p.seller.id) : undefined,
        route: `/product/${p.id}`,
      };
    });

  // ======================== Workers by Type ========================
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

  // ======================== Stats ========================
  const stats: HomeStats = {
    totalProducts: products.length,
    totalWorkers: workers.length,
    totalSold: products.reduce((sum, p) => sum + p.soldCount, 0),
    avgRating:
      workers.length > 0
        ? +(
            workers.reduce((sum, w) => sum + w.rating, 0) / workers.length
          ).toFixed(1)
        : 4.7,
    activeDeals: flashSaleProducts.length,
    categoriesCount: categories.length,
  };

  return {
    // Raw
    rawProducts: products,
    rawWorkers: workers,
    categories,
    // Derived
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
