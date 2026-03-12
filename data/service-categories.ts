/**
 * Shared Service Categories
 * Single source of truth for all worker booking screens.
 * Replaces duplicate definitions in:
 *   - app/find-workers.tsx
 *   - app/service-booking/booking-steps.tsx
 *   - app/service-booking/index.tsx
 *   - app/service-booking/worker-map.tsx
 *   - app/service-booking/confirm-booking.tsx
 */

import type { WorkerType } from "@/services/workers.api";

// ============================================================================
// Types
// ============================================================================

export interface ServiceCategory {
  /** Unique slug, e.g. "electrical" */
  id: string;
  /** Vietnamese label shown in UI */
  label: string;
  /** Short description */
  desc: string;
  /** Ionicons icon name */
  icon: string;
  /** Brand color hex */
  color: string;
  /** Backend WorkerType enum value */
  workerType: WorkerType;
  /** Price range string (VND) – displayed on market‑place home */
  priceRange?: string;
}

// ============================================================================
// Master list — ordered by popularity
// ============================================================================

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "electrical",
    label: "Thợ điện",
    desc: "Sửa điện, lắp đèn",
    icon: "flash",
    color: "#FFC107",
    workerType: "THO_DIEN" as WorkerType,
    priceRange: "100,000 - 300,000đ",
  },
  {
    id: "plumbing",
    label: "Thợ nước",
    desc: "Sửa ống, chống thấm",
    icon: "water",
    color: "#03A9F4",
    workerType: "THO_NUOC" as WorkerType,
    priceRange: "150,000 - 400,000đ",
  },
  {
    id: "ac-cleaning",
    label: "Máy lạnh",
    desc: "Vệ sinh, sửa chữa",
    icon: "snow-outline",
    color: "#2196F3",
    workerType: "THO_DIEN" as WorkerType,
    priceRange: "120,000 - 200,000đ",
  },
  {
    id: "painting",
    label: "Thợ sơn",
    desc: "Sơn nhà, trang trí",
    icon: "color-palette",
    color: "#E91E63",
    workerType: "THO_SON" as WorkerType,
    priceRange: "200,000 - 600,000đ",
  },
  {
    id: "carpentry",
    label: "Thợ mộc",
    desc: "Đồ gỗ, nội thất",
    icon: "hammer",
    color: "#795548",
    workerType: "THO_MOC" as WorkerType,
    priceRange: "200,000 - 800,000đ",
  },
  {
    id: "welding",
    label: "Thợ hàn",
    desc: "Hàn sắt, inox",
    icon: "flame",
    color: "#FF5722",
    workerType: "THO_HAN" as WorkerType,
    priceRange: "200,000 - 600,000đ",
  },
  {
    id: "cleaning",
    label: "Vệ sinh",
    desc: "Dọn nhà, văn phòng",
    icon: "sparkles",
    color: "#4CAF50",
    workerType: "NHAN_CONG" as WorkerType,
    priceRange: "200,000 - 500,000đ",
  },
  {
    id: "locksmith",
    label: "Thợ khoá",
    desc: "Mở khoá, thay ổ",
    icon: "key",
    color: "#607D8B",
    workerType: "THO_SAT" as WorkerType,
    priceRange: "100,000 - 300,000đ",
  },
  {
    id: "camera",
    label: "Camera",
    desc: "Lắp, sửa camera",
    icon: "videocam",
    color: "#9C27B0",
    workerType: "THO_CAMERA" as WorkerType,
    priceRange: "300,000 - 1,000,000đ",
  },
  {
    id: "construction",
    label: "Thợ xây",
    desc: "Xây, sửa nhà",
    icon: "construct",
    color: "#78350F",
    workerType: "THO_XAY" as WorkerType,
    priceRange: "300,000 - 800,000đ",
  },
  {
    id: "iron",
    label: "Thợ sắt",
    desc: "Cửa sắt, khung",
    icon: "link",
    color: "#374151",
    workerType: "THO_SAT" as WorkerType,
    priceRange: "200,000 - 600,000đ",
  },
  {
    id: "aluminum",
    label: "Nhôm kính",
    desc: "Cửa nhôm, kính",
    icon: "albums",
    color: "#6366F1",
    workerType: "THO_NHOM_KINH" as WorkerType,
    priceRange: "300,000 - 1,000,000đ",
  },
];

// ============================================================================
// Derived helpers
// ============================================================================

/** Map category id → category object */
export const CATEGORY_MAP: Record<string, ServiceCategory> = Object.fromEntries(
  SERVICE_CATEGORIES.map((c) => [c.id, c]),
);

/** Map category id → Vietnamese label (includes "all" fallback) */
export const CATEGORY_LABELS: Record<string, string> = {
  ...Object.fromEntries(SERVICE_CATEGORIES.map((c) => [c.id, c.label])),
  all: "Dịch vụ",
};

/** Map category id → backend WorkerType string for API filtering */
export const CATEGORY_TO_WORKER_TYPE: Record<string, string> =
  Object.fromEntries(
    SERVICE_CATEGORIES.map((c) => [c.id, c.workerType as string]),
  );

/** Quick-filter chip list (prepended with "all") for maps */
export const QUICK_FILTER_CATEGORIES = [
  { id: "all", label: "Tất cả", icon: "apps" as const },
  ...SERVICE_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon as any,
  })),
];

/** Radius options (km) used across map screens */
export const RADIUS_OPTIONS = [3, 5, 10, 20, 50];

/** Payment method options */
export const PAYMENT_METHODS = [
  { id: "cash", label: "Tiền mặt", icon: "cash-outline" as const },
  { id: "transfer", label: "Chuyển khoản", icon: "card-outline" as const },
  { id: "momo", label: "MoMo", icon: "wallet-outline" as const },
];

/** Get label for a category id (safe fallback) */
export function getCategoryLabel(categoryId: string): string {
  return CATEGORY_LABELS[categoryId] || "Dịch vụ";
}

/** Get category by id */
export function getCategoryById(
  categoryId: string,
): ServiceCategory | undefined {
  return CATEGORY_MAP[categoryId];
}
