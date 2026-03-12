/**
 * Shop Tab - Static Data & Helpers
 * Construction Materials Store - Professional E-Commerce Data
 */

// ============================================================================
// MAIN CATEGORIES (Construction Materials Store)
// ============================================================================
export const SHOP_CATEGORIES = [
  { id: "all", label: "Tất cả", icon: "grid-outline" as const },
  { id: "materials", label: "Vật liệu XD", icon: "cube-outline" as const },
  { id: "steel", label: "Thép & Sắt", icon: "hardware-chip-outline" as const },
  { id: "cement", label: "Xi măng", icon: "layers-outline" as const },
  { id: "brick", label: "Gạch & Đá", icon: "apps-outline" as const },
  { id: "paint", label: "Sơn", icon: "color-fill-outline" as const },
  { id: "sanitary", label: "Thiết bị VS", icon: "water-outline" as const },
  { id: "electrical", label: "Thiết bị điện", icon: "flash-outline" as const },
  {
    id: "plumbing",
    label: "Ống & Phụ kiện",
    icon: "git-branch-outline" as const,
  },
  { id: "tools", label: "Dụng cụ", icon: "hammer-outline" as const },
  { id: "lighting", label: "Chiếu sáng", icon: "bulb-outline" as const },
  { id: "interior", label: "Nội thất", icon: "bed-outline" as const },
  { id: "furniture", label: "Đồ nội thất", icon: "home-outline" as const },
  { id: "roofing", label: "Mái & Tôn", icon: "triangle-outline" as const },
  { id: "sand", label: "Cát & Đá", icon: "ellipse-outline" as const },
  { id: "wood", label: "Gỗ", icon: "leaf-outline" as const },
  { id: "consultation", label: "Tư vấn", icon: "chatbubble-outline" as const },
  { id: "architecture", label: "Kiến trúc", icon: "business-outline" as const },
  { id: "villa", label: "Biệt thự", icon: "home-outline" as const },
  { id: "construction", label: "Thi công", icon: "construct-outline" as const },
] as const;

export type ShopCategoryId = (typeof SHOP_CATEGORIES)[number]["id"];

// ============================================================================
// FEATURED CATEGORY GRID (Top 8 for home display)
// ============================================================================
export const FEATURED_CATEGORIES = [
  {
    id: "cement",
    label: "Xi Măng",
    icon: "layers-outline" as const,
    color: "#6B7280",
    count: 342,
  },
  {
    id: "steel",
    label: "Thép & Sắt",
    icon: "hardware-chip-outline" as const,
    color: "#4B5563",
    count: 287,
  },
  {
    id: "brick",
    label: "Gạch Ốp Lát",
    icon: "apps-outline" as const,
    color: "#92400E",
    count: 521,
  },
  {
    id: "paint",
    label: "Sơn",
    icon: "color-fill-outline" as const,
    color: "#7C3AED",
    count: 198,
  },
  {
    id: "sanitary",
    label: "Thiết bị VS",
    icon: "water-outline" as const,
    color: "#0891B2",
    count: 432,
  },
  {
    id: "electrical",
    label: "Thiết bị điện",
    icon: "flash-outline" as const,
    color: "#D97706",
    count: 356,
  },
  {
    id: "plumbing",
    label: "Ống nước",
    icon: "git-branch-outline" as const,
    color: "#059669",
    count: 189,
  },
  {
    id: "tools",
    label: "Dụng cụ",
    icon: "hammer-outline" as const,
    color: "#DC2626",
    count: 276,
  },
] as const;

// ============================================================================
// SERVICES
// ============================================================================
export const SHOP_SERVICES = [
  {
    id: "delivery",
    label: "Giao hàng tận công trình",
    icon: "car-outline" as const,
    desc: "Giao nhanh 2h",
  },
  {
    id: "consulting",
    label: "Tư vấn vật liệu",
    icon: "chatbubbles-outline" as const,
    desc: "Miễn phí",
  },
  {
    id: "wholesale",
    label: "Giá sỉ công trình",
    icon: "pricetags-outline" as const,
    desc: "Giảm đến 30%",
  },
  {
    id: "warranty",
    label: "Bảo hành chính hãng",
    icon: "shield-checkmark-outline" as const,
    desc: "12-60 tháng",
  },
] as const;

// ============================================================================
// PROMO BANNERS
// ============================================================================
export const PROMO_BANNERS = [
  {
    id: "1",
    title: "Xi Măng Hà Tiên",
    subtitle: "Giảm 20% cho đơn > 100 bao",
    gradient: ["#0D9488", "#14B8A6"],
    icon: "layers" as const,
  },
  {
    id: "2",
    title: "Thép Hòa Phát",
    subtitle: "Free ship công trình nội thành",
    gradient: ["#4B5563", "#6B7280"],
    icon: "hardware-chip" as const,
  },
  {
    id: "3",
    title: "Sơn Dulux",
    subtitle: "Mua 5 thùng tặng 1 thùng",
    gradient: ["#7C3AED", "#8B5CF6"],
    icon: "color-fill" as const,
  },
  {
    id: "4",
    title: "Thiết bị TOTO",
    subtitle: "Flash Sale cuối tuần - Giảm 40%",
    gradient: ["#0891B2", "#06B6D4"],
    icon: "water" as const,
  },
] as const;

// ============================================================================
// FEATURED BRANDS
// ============================================================================
export const FEATURED_BRANDS = [
  { id: "hatien", name: "Hà Tiên", logo: "🏗️", category: "Xi Măng" },
  { id: "hoangphat", name: "Hòa Phát", logo: "⚙️", category: "Thép" },
  { id: "dulux", name: "Dulux", logo: "🎨", category: "Sơn" },
  { id: "viglacera", name: "Viglacera", logo: "🧱", category: "Gạch" },
  { id: "toto", name: "TOTO", logo: "🚿", category: "Thiết bị VS" },
  { id: "panasonic", name: "Panasonic", logo: "💡", category: "Điện" },
  { id: "binh_minh", name: "Bình Minh", logo: "🔧", category: "Ống nước" },
  { id: "schneider", name: "Schneider", logo: "⚡", category: "Thiết bị điện" },
] as const;

// ============================================================================
// PRICE FORMATTING
// ============================================================================
export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `${(price / 1_000_000_000).toFixed(price % 1_000_000_000 === 0 ? 0 : 1)} tỷ`;
  }
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}tr`;
  }
  if (price >= 1_000) {
    return price.toLocaleString("vi-VN") + "đ";
  }
  return price + "đ";
}

export function formatPriceFull(price: number): string {
  return price.toLocaleString("vi-VN") + "₫";
}

export function formatSold(sold?: number): string {
  if (!sold) return "";
  if (sold >= 1000) return `${(sold / 1000).toFixed(1)}k đã bán`;
  return `${sold} đã bán`;
}

export function formatDiscount(original: number, current: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - current) / original) * 100);
}
