/**
 * useHomeLiveData - Fetch real-time products & workers from API
 * For FlashSale, TopRatedWorkers, TrendingProducts sections
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

// Mapped types for UI consumption
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
  route: string;
}

// ============================================================================
// Worker Type Display Map
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

// Memoize random values based on product id so they stay stable
const stableRandom = (seed: number, index: number) => {
  const x = Math.sin(seed * 9301 + index * 49297) * 49297;
  return x - Math.floor(x);
};

// ============================================================================
// Hook
// ============================================================================
export function useHomeLiveData() {
  const [products, setProducts] = useState<ServerProduct[]>([]);
  const [workers, setWorkers] = useState<ServerWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsRes, workersRes] = await Promise.allSettled([
        get<{ data: ServerProduct[] }>("/products?limit=50"),
        get<{ data: ServerWorker[] }>("/workers?limit=20"),
      ]);

      if (productsRes.status === "fulfilled" && productsRes.value?.data) {
        setProducts(productsRes.value.data);
      }
      if (workersRes.status === "fulfilled" && workersRes.value?.data) {
        setWorkers(workersRes.value.data);
      }
    } catch (err: any) {
      setError(err?.message || "Không thể tải dữ liệu");
      console.warn("[useHomeLiveData] Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      // Delay slightly so UI renders first
      const timer = setTimeout(fetchData, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchData]);

  // ===================== Derived: Flash Sale Products =====================
  const flashSaleProducts: FlashSaleItem[] = products
    .filter((p) => p.status === "APPROVED" && p.images.length > 0)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 8)
    .map((p) => {
      const price = Number(p.price);
      const r = stableRandom(p.id, 1);
      const discount = Math.floor(r * 20 + 15); // 15-35%
      const originalPrice = Math.round(price / (1 - discount / 100));
      return {
        id: p.id,
        name: p.name,
        image:
          p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || "",
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

  // ===================== Derived: Top Rated Workers =====================
  const topRatedWorkers: TopWorkerItem[] = workers
    .filter((w) => w.status === "APPROVED" && w.rating >= 4.3)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 6)
    .map((w) => ({
      id: Number(w.id),
      name: w.name,
      avatar: w.avatar,
      specialty: WORKER_TYPE_DISPLAY[w.workerType] || w.workerType,
      rating: w.rating,
      reviews: w.reviewCount,
      location:
        w.location?.replace("Quan ", "Q.").replace(", TP.HCM", "") ||
        "TP.HCM",
      verified: w.verified,
      completedJobs: w.completedJobs,
      experience: w.experience,
      dailyRate: w.dailyRate,
    }));

  // ===================== Derived: Trending Products =====================
  const trendingProducts: TrendingProductItem[] = products
    .filter((p) => p.status === "APPROVED" && p.images.length > 0)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      image:
        p.images.find((i) => i.isPrimary)?.url || p.images[0]?.url || "",
      price: Number(p.price),
      soldCount: p.soldCount,
      viewCount: p.viewCount,
      isNew: p.isNew,
      isBestseller: p.isBestseller,
      seller: p.seller?.name || "Bảo Tiên Web",
      route: `/product/${p.id}`,
    }));

  // Stats
  const stats = {
    totalProducts: products.length,
    totalWorkers: workers.length,
    totalSold: products.reduce((sum, p) => sum + p.soldCount, 0),
    avgRating:
      workers.length > 0
        ? +(
            workers.reduce((sum, w) => sum + w.rating, 0) / workers.length
          ).toFixed(1)
        : 4.7,
  };

  return {
    flashSaleProducts,
    topRatedWorkers,
    trendingProducts,
    stats,
    loading,
    error,
    refresh: fetchData,
  };
}
