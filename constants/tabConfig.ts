/**
 * Tab Configuration per Role
 *
 * Controls which tabs are visible and how they appear for each role.
 * The underlying route names stay the same — only labels and icons change.
 *
 * @created 2026-03-21
 */

import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import type { AppRole } from "./roleTheme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface TabItem {
  /** Route name in (tabs) — must match Tabs.Screen name */
  name: string;
  /** Display label */
  label: string;
  /** Inactive icon */
  icon: IconName;
  /** Active (filled) icon */
  activeIcon: IconName;
}

/**
 * 4 visible tabs per role.
 * Home + Communication + Profile are universal.
 * The "activity" tab adapts label/icon per role.
 */
export const TAB_CONFIG: Record<AppRole, TabItem[]> = {
  worker: [
    {
      name: "index",
      label: "Trang chủ",
      icon: "home-outline",
      activeIcon: "home",
    },
    {
      name: "activity",
      label: "Việc làm",
      icon: "briefcase-outline",
      activeIcon: "briefcase",
    },
    {
      name: "communication",
      label: "Liên lạc",
      icon: "chatbubbles-outline",
      activeIcon: "chatbubbles",
    },
    {
      name: "profile",
      label: "Tài khoản",
      icon: "person-outline",
      activeIcon: "person",
    },
  ],
  engineer: [
    {
      name: "index",
      label: "Trang chủ",
      icon: "home-outline",
      activeIcon: "home",
    },
    {
      name: "activity",
      label: "Dự án",
      icon: "layers-outline",
      activeIcon: "layers",
    },
    {
      name: "communication",
      label: "Liên lạc",
      icon: "chatbubbles-outline",
      activeIcon: "chatbubbles",
    },
    {
      name: "profile",
      label: "Tài khoản",
      icon: "person-outline",
      activeIcon: "person",
    },
  ],
  contractor: [
    {
      name: "index",
      label: "Trang chủ",
      icon: "home-outline",
      activeIcon: "home",
    },
    {
      name: "activity",
      label: "Quản lý",
      icon: "bar-chart-outline",
      activeIcon: "bar-chart",
    },
    {
      name: "communication",
      label: "Liên lạc",
      icon: "chatbubbles-outline",
      activeIcon: "chatbubbles",
    },
    {
      name: "profile",
      label: "Tài khoản",
      icon: "person-outline",
      activeIcon: "person",
    },
  ],
  customer: [
    {
      name: "index",
      label: "Trang chủ",
      icon: "home-outline",
      activeIcon: "home",
    },
    {
      name: "activity",
      label: "Hoạt động",
      icon: "list-outline",
      activeIcon: "list",
    },
    {
      name: "communication",
      label: "Liên lạc",
      icon: "chatbubbles-outline",
      activeIcon: "chatbubbles",
    },
    {
      name: "profile",
      label: "Tài khoản",
      icon: "person-outline",
      activeIcon: "person",
    },
  ],
};

/** Fallback when role is null (before selection) */
export const DEFAULT_TABS = TAB_CONFIG.customer;
