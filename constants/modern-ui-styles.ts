/**
 * Modern UI Styles - Shared reusable modern design primitives
 * Gradient headers, glass cards, elevated surfaces, modern chips
 * @updated 2026-02-09
 */
import { Platform, StyleSheet } from "react-native";

// ============================================================================
// GRADIENT PRESETS  (use with expo-linear-gradient)
// ============================================================================
export const GRADIENTS = {
  /** Primary teal hero gradient */
  primary: ["#0D9488", "#0F766E"] as const,
  /** Bright teal accent */
  accent: ["#14B8A6", "#0D9488"] as const,
  /** Dark to deeper teal */
  deepTeal: ["#0F766E", "#064E3B"] as const,
  /** Warm sunset accent for promotions */
  warm: ["#F59E0B", "#D97706"] as const,
  /** Success green */
  success: ["#10B981", "#059669"] as const,
  /** Dark overlay */
  dark: ["rgba(0,0,0,0.7)", "rgba(0,0,0,0.95)"] as const,
  /** Light glass overlay */
  glass: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"] as const,
  /** Hero card */
  hero: ["#0D9488", "#0A7C72", "#064E3B"] as const,
  /** Subtle ambient */
  ambient: ["#F0FDFA", "#ECFDF5", "#FFFFFF"] as const,
} as const;

// ============================================================================
// MODERN PALETTE  (extended from theme.ts)
// ============================================================================
export const UI = {
  // Surfaces
  bg: "#F8FAFB",
  card: "#FFFFFF",
  cardHover: "#F0FDFA",
  overlay: "rgba(0,0,0,0.5)",
  glass: "rgba(255,255,255,0.85)",

  // Primary
  primary: "#0D9488",
  primaryLight: "#14B8A6",
  primaryDark: "#0F766E",
  primaryBg: "#F0FDFA",

  // Text
  text: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textOnDark: "#FFFFFF",
  textOnPrimary: "#FFFFFF",

  // Borders
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Semantic
  success: "#10B981",
  successBg: "#ECFDF5",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  error: "#EF4444",
  errorBg: "#FEF2F2",
  info: "#0D9488",
  infoBg: "#F0FDFA",
} as const;

// ============================================================================
// SHARED MODERN STYLES
// ============================================================================
export const modernStyles = StyleSheet.create({
  // ---- Screens ----
  screen: {
    flex: 1,
    backgroundColor: UI.bg,
  },

  // ---- Cards ----
  card: {
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
    }),
  },
  cardLg: {
    backgroundColor: UI.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    }),
  },
  cardInteractive: {
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: UI.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {
        shadowColor: "#0D9488",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
    }),
  },

  // ---- Hero gradient card (use as wrapper inside LinearGradient) ----
  heroGradient: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 24,
    overflow: "hidden" as const,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800" as const,
    letterSpacing: -1,
    marginTop: 8,
  },

  // ---- Glass effect row inside gradient ----
  glassRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    gap: 16,
  },
  glassChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  glassText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
  },

  // ---- Section headers ----
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: UI.text,
    letterSpacing: -0.3,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: UI.primary,
  },

  // ---- Filter chips / tabs (horizontal) ----
  chipRow: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: UI.card,
    borderWidth: 1,
    borderColor: UI.border,
  },
  chipActive: {
    backgroundColor: UI.primary,
    borderColor: UI.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: UI.textSecondary,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },

  // ---- Quick action grid ----
  actionGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  actionItem: {
    alignItems: "center" as const,
    width: "22%" as any,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: UI.textSecondary,
    textAlign: "center" as const,
  },

  // ---- List item row ----
  listItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: UI.card,
    borderBottomWidth: 1,
    borderBottomColor: UI.borderLight,
  },
  listItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 14,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: UI.text,
  },
  listItemSubtitle: {
    fontSize: 13,
    color: UI.textSecondary,
    marginTop: 2,
  },

  // ---- Modern button ----
  btnPrimary: {
    backgroundColor: UI.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: UI.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "transparent",
  },
  btnOutlineText: {
    color: UI.primary,
    fontSize: 15,
    fontWeight: "700" as const,
    letterSpacing: 0.3,
  },
  btnGhost: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: UI.primaryBg,
  },
  btnGhostText: {
    color: UI.primary,
    fontSize: 15,
    fontWeight: "700" as const,
  },

  // ---- Status badges ----
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },

  // ---- Empty state ----
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: UI.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: UI.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },

  // ---- Divider ----
  divider: {
    height: 1,
    backgroundColor: UI.borderLight,
    marginVertical: 12,
  },

  // ---- Avatar ----
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: UI.primaryBg,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    overflow: "hidden" as const,
  },
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  // ---- Image thumbnail ----
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: UI.borderLight,
    overflow: "hidden" as const,
  },

  // ---- Floating action btn ----
  fab: {
    position: "absolute" as const,
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: UI.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: UI.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      default: {
        shadowColor: UI.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
});

// ============================================================================
// STATUS COLOR PRESETS
// ============================================================================
export const STATUS_COLORS = {
  pending: { label: "Chờ xác nhận", color: "#F59E0B", bg: "#FFFBEB" },
  confirmed: { label: "Đã xác nhận", color: "#10B981", bg: "#ECFDF5" },
  completed: { label: "Hoàn thành", color: "#0D9488", bg: "#F0FDFA" },
  cancelled: { label: "Đã hủy", color: "#EF4444", bg: "#FEF2F2" },
  shipping: { label: "Đang giao", color: "#3B82F6", bg: "#EFF6FF" },
  processing: { label: "Đang xử lý", color: "#8B5CF6", bg: "#F5F3FF" },
} as const;
