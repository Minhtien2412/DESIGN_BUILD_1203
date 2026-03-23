/**
 * Role-Based Profile Feature Types
 * Central type definitions for the redesigned profile system.
 *
 * Uses existing types from:
 *  - types/profile.ts (UserProfileFull, UserRole, PointsBalance, etc.)
 *  - context/AuthContext.tsx (User)
 *  - context/RoleContext.tsx (AppRole)
 *  - services/workers.api.ts (Worker, WorkerType)
 */

import type { Ionicons } from "@expo/vector-icons";

// ═══════════════════════════════════════════════════════════════
// EFFECTIVE ROLE — unified from multiple role sources
// ═══════════════════════════════════════════════════════════════

/**
 * Effective roles the profile system actually renders.
 * Mapped from existing UserRole + AppRole + Worker data.
 */
export type EffectiveRole =
  | "customer"
  | "worker"
  | "architect"
  | "engineer"
  | "supervisor"
  | "admin";

// ═══════════════════════════════════════════════════════════════
// GREETING
// ═══════════════════════════════════════════════════════════════

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface GreetingData {
  timeGreeting: string; // "Chào buổi sáng"
  userName: string;
  roleSubtitle: string; // Role-specific subtitle CTA
  roleBadge: string; // "Khách hàng", "Thợ xây", etc.
  roleBadgeColor: string;
  roleBadgeIcon: string;
}

// ═══════════════════════════════════════════════════════════════
// STAT CARDS
// ═══════════════════════════════════════════════════════════════

export interface StatCardItem {
  id: string;
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  suffix?: string; // "%", "đ", "⭐"
  onPress?: () => void;
}

// ═══════════════════════════════════════════════════════════════
// PROFILE COMPLETION (workers + professionals)
// ═══════════════════════════════════════════════════════════════

export interface CompletionItem {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  completed: boolean;
  required: boolean;
  route?: string; // Navigation route to fix this
}

export interface CompletionState {
  percentage: number;
  total: number;
  completed: number;
  requiredRemaining: number;
  items: CompletionItem[];
  isBlocked: boolean; // True if required items are missing
  blockedMessage?: string;
}

// ═══════════════════════════════════════════════════════════════
// QUICK ACTIONS (role-based shortcuts)
// ═══════════════════════════════════════════════════════════════

export interface QuickAction {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  badge?: string | number;
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS SECTION (role-aware)
// ═══════════════════════════════════════════════════════════════

export interface SettingsItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  route?: string;
  action?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
  /** Roles that can see this setting. undefined = all roles */
  visibleRoles?: EffectiveRole[];
}

export interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

// ═══════════════════════════════════════════════════════════════
// VERIFICATION STATE
// ═══════════════════════════════════════════════════════════════

export type VerificationLevel = "none" | "pending" | "basic" | "full";

export interface VerificationState {
  level: VerificationLevel;
  phoneVerified: boolean;
  emailVerified: boolean;
  idVerified: boolean; // CCCD
  certificatesVerified: boolean;
  badgeText: string;
  badgeColor: string;
}

// ═══════════════════════════════════════════════════════════════
// ROLE CONFIG — rendering configuration per role
// ═══════════════════════════════════════════════════════════════

export interface RoleProfileConfig {
  role: EffectiveRole;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string, string];
  accentColor: string;
  badgeColor: string;
  badgeBgColor: string;
  /** Whether this role requires completion checklist */
  requiresCompletion: boolean;
  /** Minimum completion % to be "active" */
  minCompletionPercent: number;
}
