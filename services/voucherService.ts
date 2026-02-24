/**
 * Voucher Service - Complete Discount System
 * Shopee-style voucher management with API + mock fallback
 * Updated: 09/02/2026
 */

import { BackendResult, getJson, postJson } from "./backendClient";

// ==================== TYPES ====================

export type VoucherType = "percent" | "fixed" | "freeship";
export type VoucherCategory =
  | "shop"
  | "platform"
  | "freeship"
  | "new_user"
  | "flash_sale";
export type VoucherStatus = "available" | "used" | "expired" | "claimed";

export interface Voucher {
  id: string;
  code: string;
  title: string;
  description?: string;
  discount: number; // percent value or fixed amount
  type: VoucherType;
  category: VoucherCategory;
  minOrder: number; // minimum order for voucher to apply
  maxDiscount?: number; // cap for percent-based vouchers
  expiresAt: string;
  startAt?: string;
  isUsed: boolean;
  isExpired: boolean;
  isClaimed: boolean;
  usedAt?: string;
  createdAt?: string;
  usageLimit?: number; // total uses allowed
  usageCount?: number; // current usage count
  perUserLimit?: number; // max uses per user
  applicableProducts?: string[]; // specific product IDs, empty = all
  applicableCategories?: string[]; // specific category slugs
  stackable: boolean; // can combine with other vouchers
  imageUrl?: string;
}

export interface VoucherListResponse {
  vouchers: Voucher[];
  total: number;
}

export interface VoucherValidateResponse {
  valid: boolean;
  voucher?: Voucher;
  discountAmount: number;
  message?: string;
}

export interface ApplyVoucherResult {
  success: boolean;
  voucher: Voucher;
  discountAmount: number;
  message: string;
}

// ==================== DISCOUNT CALCULATION ====================

/**
 * Calculate the actual discount amount for a voucher
 */
export function calculateDiscount(
  voucher: Voucher,
  orderAmount: number,
): number {
  if (orderAmount < voucher.minOrder) return 0;

  switch (voucher.type) {
    case "percent": {
      const raw = (orderAmount * voucher.discount) / 100;
      return voucher.maxDiscount ? Math.min(raw, voucher.maxDiscount) : raw;
    }
    case "fixed":
      return Math.min(voucher.discount, orderAmount);
    case "freeship":
      return voucher.discount; // shipping fee amount
    default:
      return 0;
  }
}

/**
 * Format discount display text
 */
export function formatVoucherDiscount(voucher: Voucher): string {
  switch (voucher.type) {
    case "percent":
      return `Giảm ${voucher.discount}%`;
    case "fixed":
      return `Giảm ${formatCurrencyShort(voucher.discount)}`;
    case "freeship":
      return "Miễn phí vận chuyển";
    default:
      return "";
  }
}

/**
 * Format discount badge (short form)
 */
export function formatDiscountBadge(voucher: Voucher): string {
  switch (voucher.type) {
    case "percent":
      return `-${voucher.discount}%`;
    case "fixed":
      return `-${formatCurrencyShort(voucher.discount)}`;
    case "freeship":
      return "Free ship";
    default:
      return "";
  }
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1000000)
    return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}tr`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
  return `${amount}đ`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

/**
 * Check if voucher is still valid (not expired, not over limit, etc.)
 */
export function isVoucherValid(voucher: Voucher): boolean {
  if (voucher.isUsed || voucher.isExpired) return false;
  const now = new Date();
  if (new Date(voucher.expiresAt) < now) return false;
  if (voucher.startAt && new Date(voucher.startAt) > now) return false;
  if (
    voucher.usageLimit &&
    voucher.usageCount &&
    voucher.usageCount >= voucher.usageLimit
  )
    return false;
  return true;
}

/**
 * Check if a voucher can be applied to a specific order amount
 */
export function canApplyVoucher(
  voucher: Voucher,
  orderAmount: number,
): { canApply: boolean; reason?: string } {
  if (!isVoucherValid(voucher)) {
    return {
      canApply: false,
      reason: "Voucher đã hết hạn hoặc không khả dụng",
    };
  }
  if (orderAmount < voucher.minOrder) {
    return {
      canApply: false,
      reason: `Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)}. Cần thêm ${formatCurrency(voucher.minOrder - orderAmount)}`,
    };
  }
  return { canApply: true };
}

/**
 * Get time remaining before voucher expires
 */
export function getTimeRemaining(voucher: Voucher): {
  days: number;
  hours: number;
  minutes: number;
  isUrgent: boolean;
} {
  const now = new Date();
  const expiry = new Date(voucher.expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, isUrgent: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isUrgent: days < 2 };
}

/**
 * Sort vouchers by best discount for a given order amount
 */
export function sortByBestDiscount(
  vouchers: Voucher[],
  orderAmount: number,
): Voucher[] {
  return [...vouchers].sort((a, b) => {
    const discountA = calculateDiscount(a, orderAmount);
    const discountB = calculateDiscount(b, orderAmount);
    return discountB - discountA;
  });
}

// ==================== CATEGORY CONFIG ====================

export const VOUCHER_CATEGORY_CONFIG: Record<
  VoucherCategory,
  {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
  }
> = {
  shop: {
    label: "Voucher Shop",
    icon: "storefront",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  platform: {
    label: "Voucher Sàn",
    icon: "globe",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
  },
  freeship: {
    label: "Miễn Phí Ship",
    icon: "car",
    color: "#3B82F6",
    bgColor: "#EFF6FF",
  },
  new_user: {
    label: "Người Mới",
    icon: "gift",
    color: "#EF4444",
    bgColor: "#FEF2F2",
  },
  flash_sale: {
    label: "Flash Sale",
    icon: "flash",
    color: "#EC4899",
    bgColor: "#FDF2F8",
  },
};

// ==================== API ENDPOINTS ====================

const ENDPOINTS = {
  list: "/api/vouchers",
  myVouchers: "/api/vouchers/my",
  validate: "/api/vouchers/validate",
  claim: (code: string) => `/api/vouchers/${code}/claim`,
  redeem: (code: string) => `/api/vouchers/${code}/redeem`,
};

/**
 * Get user's collected vouchers
 */
export async function getMyVouchers(): Promise<
  BackendResult<VoucherListResponse>
> {
  return getJson<VoucherListResponse>(ENDPOINTS.myVouchers, { retry: 2 });
}

/**
 * Get all public vouchers (claimable)
 */
export async function getPublicVouchers(): Promise<
  BackendResult<VoucherListResponse>
> {
  return getJson<VoucherListResponse>(ENDPOINTS.list, { retry: 2 });
}

/**
 * Validate a voucher code for a given order amount
 */
export async function validateVoucher(
  code: string,
  orderAmount?: number,
): Promise<BackendResult<VoucherValidateResponse>> {
  return postJson<VoucherValidateResponse>(ENDPOINTS.validate, {
    code,
    orderAmount,
  });
}

/**
 * Claim/collect a voucher (add to user's voucher wallet)
 */
export async function claimVoucher(
  code: string,
): Promise<BackendResult<{ success: boolean; voucher?: Voucher }>> {
  return postJson(ENDPOINTS.claim(code), {});
}

/**
 * Redeem/apply a voucher to an order
 */
export async function redeemVoucher(
  code: string,
  orderId?: string,
): Promise<BackendResult<{ success: boolean; voucher?: Voucher }>> {
  return postJson(ENDPOINTS.redeem(code), { orderId });
}

// ==================== MOCK DATA ====================

const now = new Date();
const futureDate = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};
const pastDate = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: "v1",
    code: "CHAO2026",
    title: "Giảm 15% cho đơn đầu tiên",
    description:
      "Áp dụng cho khách hàng mới, đơn hàng từ 300.000đ. Giảm tối đa 200.000đ.",
    discount: 15,
    type: "percent",
    category: "new_user",
    minOrder: 300000,
    maxDiscount: 200000,
    expiresAt: futureDate(30),
    isUsed: false,
    isExpired: false,
    isClaimed: true,
    stackable: false,
    usageLimit: 1000,
    usageCount: 342,
  },
  {
    id: "v2",
    code: "FREESHIP50",
    title: "Miễn phí ship đến 50k",
    description: "Áp dụng cho tất cả đơn hàng từ 100.000đ",
    discount: 50000,
    type: "freeship",
    category: "freeship",
    minOrder: 100000,
    expiresAt: futureDate(14),
    isUsed: false,
    isExpired: false,
    isClaimed: true,
    stackable: true,
  },
  {
    id: "v3",
    code: "FLASH30",
    title: "Flash Sale - Giảm 30%",
    description: "Áp dụng cho vật liệu xây dựng. Giảm tối đa 500.000đ. Có hạn!",
    discount: 30,
    type: "percent",
    category: "flash_sale",
    minOrder: 500000,
    maxDiscount: 500000,
    expiresAt: futureDate(1),
    startAt: pastDate(0),
    isUsed: false,
    isExpired: false,
    isClaimed: true,
    stackable: false,
    usageLimit: 100,
    usageCount: 87,
  },
  {
    id: "v4",
    code: "SHOP100K",
    title: "Giảm 100.000đ",
    description: "Voucher Shop - Áp dụng cho đơn hàng từ 800.000đ",
    discount: 100000,
    type: "fixed",
    category: "shop",
    minOrder: 800000,
    expiresAt: futureDate(60),
    isUsed: false,
    isExpired: false,
    isClaimed: true,
    stackable: false,
  },
  {
    id: "v5",
    code: "SAN200K",
    title: "Giảm 200.000đ đơn hàng sàn",
    description: "Voucher từ Sàn BaoTien. Đơn tối thiểu 1.500.000đ",
    discount: 200000,
    type: "fixed",
    category: "platform",
    minOrder: 1500000,
    expiresAt: futureDate(7),
    isUsed: false,
    isExpired: false,
    isClaimed: false,
    stackable: false,
    usageLimit: 500,
    usageCount: 201,
  },
  {
    id: "v6",
    code: "TET50",
    title: "Giảm 50% mừng xuân",
    description: "Áp dụng cho toàn bộ sản phẩm. Giảm tối đa 1.000.000đ",
    discount: 50,
    type: "percent",
    category: "platform",
    minOrder: 1000000,
    maxDiscount: 1000000,
    expiresAt: futureDate(20),
    isUsed: false,
    isExpired: false,
    isClaimed: false,
    stackable: false,
    usageLimit: 200,
    usageCount: 156,
  },
  {
    id: "v7",
    code: "FREESHIP100",
    title: "Miễn phí ship đến 100k",
    description: "Áp dụng cho đơn hàng từ 500.000đ",
    discount: 100000,
    type: "freeship",
    category: "freeship",
    minOrder: 500000,
    expiresAt: futureDate(45),
    isUsed: false,
    isExpired: false,
    isClaimed: false,
    stackable: true,
  },
  {
    id: "v8",
    code: "USED01",
    title: "Giảm 10% - ĐÃ DÙNG",
    discount: 10,
    type: "percent",
    category: "shop",
    minOrder: 200000,
    maxDiscount: 100000,
    expiresAt: futureDate(30),
    isUsed: true,
    isExpired: false,
    isClaimed: true,
    stackable: false,
    usedAt: pastDate(5),
  },
  {
    id: "v9",
    code: "EXPIRED01",
    title: "Voucher hết hạn",
    discount: 20,
    type: "percent",
    category: "platform",
    minOrder: 500000,
    maxDiscount: 300000,
    expiresAt: pastDate(10),
    isUsed: false,
    isExpired: true,
    isClaimed: true,
    stackable: false,
  },
  {
    id: "v10",
    code: "GIAM200K",
    title: "Giảm 200.000đ",
    description: "Áp dụng cho mọi đơn hàng từ 1.000.000đ",
    discount: 200000,
    type: "fixed",
    category: "shop",
    minOrder: 1000000,
    expiresAt: futureDate(90),
    isUsed: false,
    isExpired: false,
    isClaimed: true,
    stackable: false,
  },
];

// ==================== DEFAULT EXPORT ====================

const VoucherService = {
  getMyVouchers,
  getPublicVouchers,
  validateVoucher,
  claimVoucher,
  redeemVoucher,
  calculateDiscount,
  formatVoucherDiscount,
  formatDiscountBadge,
  isVoucherValid,
  canApplyVoucher,
  getTimeRemaining,
  sortByBestDiscount,
  formatCurrency,
  MOCK_VOUCHERS,
  VOUCHER_CATEGORY_CONFIG,
};

export default VoucherService;
