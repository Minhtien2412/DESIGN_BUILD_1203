/**
 * Multi-Role Design System Tokens
 *
 * Lime green (#90B44C) accent, bright modern feel.
 * Each role has a distinct accent color + label + icon.
 *
 * @created 2026-03-21
 */

import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

// ────────────────── Role Types ──────────────────
export type AppRole = "worker" | "engineer" | "contractor" | "customer";

export interface RoleMeta {
  key: AppRole;
  label: string;
  shortLabel: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  accent: string;
  accentLight: string;
  gradient: [string, string];
}

export const ROLES: Record<AppRole, RoleMeta> = {
  worker: {
    key: "worker",
    label: "Thợ thi công",
    shortLabel: "Thợ",
    description: "Nhận việc, chấm công, quản lý nghề nghiệp",
    icon: "hammer-outline",
    accent: "#F59E0B",
    accentLight: "#FEF3C7",
    gradient: ["#F59E0B", "#D97706"],
  },
  engineer: {
    key: "engineer",
    label: "Kỹ sư / Kiến trúc sư",
    shortLabel: "KS/KTS",
    description: "Hồ sơ, giám sát, thiết kế chuyên nghiệp",
    icon: "bulb-outline",
    accent: "#6366F1",
    accentLight: "#EEF2FF",
    gradient: ["#6366F1", "#4F46E5"],
  },
  contractor: {
    key: "contractor",
    label: "Nhà thầu / Công ty",
    shortLabel: "Nhà thầu",
    description: "Dashboard quản trị, điều phối doanh nghiệp",
    icon: "business-outline",
    accent: "#0D9488",
    accentLight: "#F0FDFA",
    gradient: ["#0D9488", "#0F766E"],
  },
  customer: {
    key: "customer",
    label: "Khách hàng",
    shortLabel: "Khách",
    description: "Tìm dịch vụ, theo dõi dự án, cảm hứng",
    icon: "person-outline",
    accent: "#90B44C",
    accentLight: "#F4F9EC",
    gradient: ["#90B44C", "#7A9B3E"],
  },
};

export const ROLE_LIST: RoleMeta[] = [
  ROLES.worker,
  ROLES.engineer,
  ROLES.contractor,
  ROLES.customer,
];

// ────────────────── Global Palette ──────────────────
export const ROLE_THEME = {
  // Primary accent (lime green)
  primary: "#90B44C",
  primaryLight: "#F4F9EC",
  primaryDark: "#6B8A35",

  // Backgrounds
  bg: "#FFFFFF",
  bgSoft: "#F8F9FA",
  bgMuted: "#F1F3F5",
  card: "#FFFFFF",

  // Text
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Borders
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Shadows
  shadow: "rgba(0,0,0,0.06)",
  shadowStrong: "rgba(0,0,0,0.12)",

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  // Radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    title: 20,
    heading: 26,
    hero: 30,
  },
} as const;
