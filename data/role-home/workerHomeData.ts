/**
 * Worker Home Screen Mock Data
 * Dữ liệu cho trang chủ role Thợ
 */
import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface ShortcutItem {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  bgColor: string;
  route?: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  textColor: string;
  ctaLabel: string;
  image?: string;
}

export interface JobItem {
  id: string;
  title: string;
  location: string;
  salary: string;
  type: string;
  urgent: boolean;
  postedAt: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  icon: IconName;
  count: number;
}

// ────── Shortcuts Grid ──────
export const workerShortcuts: ShortcutItem[] = [
  {
    id: "w1",
    label: "Việc được giao",
    icon: "clipboard-outline",
    color: "#F59E0B",
    bgColor: "#FEF3C7",
  },
  {
    id: "w2",
    label: "Lịch sử việc",
    icon: "time-outline",
    color: "#EF4444",
    bgColor: "#FEE2E2",
  },
  {
    id: "w3",
    label: "Tổ đội",
    icon: "people-outline",
    color: "#6366F1",
    bgColor: "#EEF2FF",
  },
  {
    id: "w4",
    label: "Vật tư",
    icon: "cube-outline",
    color: "#0D9488",
    bgColor: "#F0FDFA",
  },
  {
    id: "w5",
    label: "Chấm công",
    icon: "time-outline",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
  {
    id: "w6",
    label: "Lịch hẹn",
    icon: "calendar-outline",
    color: "#EC4899",
    bgColor: "#FCE7F3",
  },
  {
    id: "w7",
    label: "Lương",
    icon: "wallet-outline",
    color: "#10B981",
    bgColor: "#D1FAE5",
  },
  {
    id: "w8",
    label: "Tiến độ",
    icon: "trending-up-outline",
    color: "#3B82F6",
    bgColor: "#DBEAFE",
  },
];

// ────── Banners ──────
export const workerBanners: BannerItem[] = [
  {
    id: "wb1",
    title: "Việc hot hôm nay",
    subtitle: "120+ công việc mới gần bạn, lương cao",
    bgColor: "#F59E0B",
    textColor: "#FFFFFF",
    ctaLabel: "Xem ngay",
  },
  {
    id: "wb2",
    title: "Tìm thợ gần bạn",
    subtitle: "Kết nối tổ đội, nhận việc nhóm",
    bgColor: "#6366F1",
    textColor: "#FFFFFF",
    ctaLabel: "Khám phá",
  },
  {
    id: "wb3",
    title: "Nâng cấp hồ sơ",
    subtitle: "Hoàn thiện hồ sơ để nhận việc nhanh hơn",
    bgColor: "#0D9488",
    textColor: "#FFFFFF",
    ctaLabel: "Cập nhật",
  },
];

// ────── Hot Jobs ──────
export const workerHotJobs: JobItem[] = [
  {
    id: "j1",
    title: "Thợ sơn nước - Quận 7",
    location: "TP.HCM",
    salary: "500K/ngày",
    type: "Toàn thời gian",
    urgent: true,
    postedAt: "2 giờ trước",
  },
  {
    id: "j2",
    title: "Thợ điện - Thủ Đức",
    location: "TP.HCM",
    salary: "600K/ngày",
    type: "Thời vụ",
    urgent: true,
    postedAt: "3 giờ trước",
  },
  {
    id: "j3",
    title: "Phụ hồ - Bình Tân",
    location: "TP.HCM",
    salary: "400K/ngày",
    type: "Toàn thời gian",
    urgent: false,
    postedAt: "5 giờ trước",
  },
  {
    id: "j4",
    title: "Thợ ốp lát - Quận 2",
    location: "TP.HCM",
    salary: "700K/ngày",
    type: "Theo dự án",
    urgent: false,
    postedAt: "1 ngày trước",
  },
];

// ────── Trade Categories ──────
export const workerCategories: CategoryItem[] = [
  { id: "wc1", label: "Thợ sơn", icon: "color-palette-outline", count: 45 },
  { id: "wc2", label: "Thợ điện", icon: "flash-outline", count: 32 },
  { id: "wc3", label: "Thợ nước", icon: "water-outline", count: 28 },
  { id: "wc4", label: "Thợ hồ", icon: "construct-outline", count: 56 },
  { id: "wc5", label: "Thợ mộc", icon: "hammer-outline", count: 23 },
  { id: "wc6", label: "Thợ hàn", icon: "flame-outline", count: 19 },
  { id: "wc7", label: "Thợ ốp lát", icon: "grid-outline", count: 31 },
  { id: "wc8", label: "Thợ nhôm kính", icon: "albums-outline", count: 15 },
];

// ────── Quick Stats ──────
export const workerStats = {
  jobsAvailable: 245,
  workersNearby: 89,
  completedToday: 12,
  averagePay: "520K",
};
