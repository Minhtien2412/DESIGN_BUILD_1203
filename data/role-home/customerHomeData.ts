/**
 * Customer Home Screen — Full data matching reference design
 * Dữ liệu cho trang chủ role Khách hàng — bám sát ảnh mẫu
 */
import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

// ────── Shared Types ──────
export interface GridItem {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  bgColor: string;
}

export interface LiveStreamItem {
  id: string;
  title: string;
  viewers?: string;
  isLive?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  views: string;
}

export interface UtilitySectionData {
  id: string;
  title: string;
  searchPlaceholder: string;
  items: GridItem[];
  promo: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    bgColor: string;
  };
}

export interface MarketplaceProduct {
  id: string;
  label: string;
}

export interface FurnitureProduct {
  id: string;
  name: string;
  price: string;
  sold: string;
}

// ────────────────────────────────────────────────
// 1. DỊCH VỤ — 12-icon grid (3×4)
// ────────────────────────────────────────────────
export const customerServiceGrid: GridItem[] = [
  {
    id: "sv1",
    label: "Thiết kế nhà",
    icon: "home-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv2",
    label: "Thiết kế nội thất",
    icon: "bed-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv3",
    label: "Tra cứu xây dựng",
    icon: "search-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv4",
    label: "Xin phép",
    icon: "document-text-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv5",
    label: "Hồ sơ mẫu",
    icon: "folder-open-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv6",
    label: "Sửa nhà",
    icon: "hammer-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv7",
    label: "Mẫu nhà",
    icon: "business-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv8",
    label: "Tư vấn chất lượng",
    icon: "shield-checkmark-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv9",
    label: "Công ty xây dựng",
    icon: "storefront-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv10",
    label: "Công ty nội thất",
    icon: "cube-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv11",
    label: "Giám sát thi công",
    icon: "eye-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
  {
    id: "sv12",
    label: "Xem thêm",
    icon: "grid-outline",
    color: "#90B44C",
    bgColor: "#F4F9EC",
  },
];

// ────────────────────────────────────────────────
// 2. LIVE & VIDEO data
// ────────────────────────────────────────────────
export const liveStreams: LiveStreamItem[] = [
  { id: "l1", title: "SIÊU SALE...", isLive: true },
  { id: "l2", title: "Live stream", isLive: true },
];

export const videoItems: VideoItem[] = [
  { id: "v1", title: "Video 1", views: "29.0k" },
  { id: "v2", title: "Video 2", views: "21.6k" },
];

// ────────────────────────────────────────────────
// 3. TIỆN ÍCH THIẾT KẾ
// ────────────────────────────────────────────────
export const designUtilitySection: UtilitySectionData = {
  id: "design",
  title: "TIỆN ÍCH THIẾT KẾ",
  searchPlaceholder: "Tìm giải pháp, PCCC...",
  items: [
    {
      id: "d1",
      label: "Kiến trúc sư",
      icon: "person-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "d2",
      label: "Kỹ sư",
      icon: "construct-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "d3",
      label: "Kết cấu",
      icon: "layers-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "d4",
      label: "Điện",
      icon: "flash-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "d5",
      label: "Nước",
      icon: "water-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "d6",
      label: "Dự toán",
      icon: "calculator-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "d7",
      label: "Nội thất",
      icon: "bed-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "d8",
      label: "Công Cụ AI",
      icon: "sparkles-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
  ],
  promo: {
    title: "TIỆN ÍCH\nTHIẾT KẾ",
    subtitle:
      "Lấy ý tưởng nhanh — có sẵ không gian\nvà kỹ thuật thi chuyên nghiệp\n\nTích hợp tiện ích cho kiến trúc sư\nvà thiết kế nội thất",
    ctaLabel: "KHÁM PHÁ NGAY",
    bgColor: "#90B44C",
  },
};

// ────────────────────────────────────────────────
// 4. TIỆN ÍCH XÂY DỰNG
// ────────────────────────────────────────────────
export const constructionUtilitySection: UtilitySectionData = {
  id: "construction",
  title: "TIỆN ÍCH XÂY DỰNG",
  searchPlaceholder: "Tìm cọ vật liệu, thợ, nhân công xây dựng...",
  items: [
    {
      id: "c1",
      label: "Ép cọc",
      icon: "arrow-down-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "c2",
      label: "Đào đất",
      icon: "trending-down-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "c3",
      label: "Vật liệu",
      icon: "cube-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "c4",
      label: "Nhân công xây dựng",
      icon: "people-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "c5",
      label: "Thợ xây",
      icon: "hammer-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "c6",
      label: "Thợ cốt pha",
      icon: "construct-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "c7",
      label: "Thợ cơ khí",
      icon: "settings-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "c8",
      label: "Xem thêm",
      icon: "grid-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
  ],
  promo: {
    title: "TÌM THỢ\nNHANH",
    subtitle: "Tìm thợ nhanh nhất trên app",
    ctaLabel: "ĐẶT THỢ NGAY",
    bgColor: "#F59E0B",
  },
};

// ────────────────────────────────────────────────
// 5. TIỆN ÍCH HOÀN THIỆN
// ────────────────────────────────────────────────
export const finishingUtilitySection: UtilitySectionData = {
  id: "finishing",
  title: "TIỆN ÍCH HOÀN THIỆN",
  searchPlaceholder: "Tìm thợ hoàn thiện, thợ sơn, thợ gạch...",
  items: [
    {
      id: "f1",
      label: "Thợ lát gạch",
      icon: "grid-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "f2",
      label: "Thợ thạch cao",
      icon: "layers-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "f3",
      label: "Thợ sơn",
      icon: "color-palette-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "f4",
      label: "Thợ đá",
      icon: "diamond-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "f5",
      label: "Thợ trần cáo",
      icon: "resize-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "f6",
      label: "Thợ lan can",
      icon: "remove-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "f7",
      label: "Thợ cổng",
      icon: "log-in-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "f8",
      label: "Thợ camera",
      icon: "videocam-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
  ],
  promo: {
    title: "TÌM THỢ\nGẦN BẠN",
    subtitle: "Cung cấp nhanh — giá tốt —\nchọn đúng tay nghề",
    ctaLabel: "TÌM NGAY",
    bgColor: "#6366F1",
  },
};

// ────────────────────────────────────────────────
// 6. TIỆN ÍCH BẢO TRÌ - SỬA CHỮA
// ────────────────────────────────────────────────
export const maintenanceUtilitySection: UtilitySectionData = {
  id: "maintenance",
  title: "TIỆN ÍCH BẢO TRÌ - SỬA CHỮA",
  searchPlaceholder: "Tìm thợ sửa điện, thợ sửa nước, thợ máy lạnh...",
  items: [
    {
      id: "m1",
      label: "Thợ sửa máy giặt",
      icon: "water-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "m2",
      label: "Thợ sửa tủ lạnh",
      icon: "snow-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "m3",
      label: "Thợ thống tắc cống",
      icon: "funnel-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "m4",
      label: "Thợ điện",
      icon: "flash-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "m5",
      label: "Thợ cấp nước",
      icon: "water-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "m6",
      label: "Thợ mạng - wifi",
      icon: "wifi-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "m7",
      label: "Thợ sửa máy lạnh",
      icon: "thermometer-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
    {
      id: "m8",
      label: "Xem thêm",
      icon: "grid-outline",
      color: "#90B44C",
      bgColor: "#F4F9EC",
    },
  ],
  promo: {
    title: "TIỆN ÍCH\nBẢO TRÌ",
    subtitle: "Cần thợ sửa nhà?\nCó ngay trong vài phút",
    ctaLabel: "ĐẶT LỊCH NGAY",
    bgColor: "#0D9488",
  },
};

// ────────────────────────────────────────────────
// 7. TIỆN ÍCH MARKET PLACE
// ────────────────────────────────────────────────
export const marketplaceProducts: MarketplaceProduct[] = [
  { id: "mp1", label: "Thiết bị bếp" },
  { id: "mp2", label: "Thiết bị vệ sinh" },
  { id: "mp3", label: "Điện" },
  { id: "mp4", label: "PCCC" },
  { id: "mp5", label: "Giường" },
  { id: "mp6", label: "Bàn làm việc" },
  { id: "mp7", label: "Sofa" },
  { id: "mp8", label: "Xem thêm" },
];

export const marketplaceSearchPlaceholder =
  "Tìm nội thất, ghế, đèn, kệ trưng bày...";

// ────────────────────────────────────────────────
// 8. SẢN PHẨM NỘI THẤT — horizontal product cards
// ────────────────────────────────────────────────
export const furnitureProducts: FurnitureProduct[] = [
  {
    id: "fp1",
    name: "Sofa hiện đại phong cách Bắc Âu cao cấp",
    price: "1.200.000đ",
    sold: "Đã bán 1.2k+",
  },
  {
    id: "fp2",
    name: "Bàn ăn gỗ sồi tự nhiên chân sắt sơn tĩnh điện",
    price: "2.450.000đ",
    sold: "Đã bán 856",
  },
  {
    id: "fp3",
    name: "Đèn học để tối giản thô...",
    price: "350.000đ",
    sold: "Đã bán 2.1k+",
  },
];

// ────────────────────────────────────────────────
// 9. Deal HOT banner bottom
// ────────────────────────────────────────────────
export const dealHotBadges = [
  { id: "dh1", label: "Giảm đến\n30%", icon: "pricetag-outline" as IconName },
  { id: "dh2", label: "Tặng\nVOUCHER", icon: "gift-outline" as IconName },
  {
    id: "dh3",
    label: "BẢO HÀNH\nDÀI HẠN",
    icon: "shield-checkmark-outline" as IconName,
  },
  { id: "dh4", label: "LẮP ĐẶT\nTẠI NHÀ", icon: "home-outline" as IconName },
];

// ────────────────────────────────────────────────
// All 4 utility sections in order
// ────────────────────────────────────────────────
export const utilitySections: UtilitySectionData[] = [
  designUtilitySection,
  constructionUtilitySection,
  finishingUtilitySection,
  maintenanceUtilitySection,
];
