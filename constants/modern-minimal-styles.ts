/**
 * Modern Minimal UI Styles
 * Thiết kế hiện đại tối giản cho các màn hình con
 * Focus: Clean, spacious, elegant with subtle shadows and gradients
 */

import { Dimensions, Platform, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Design tokens
export const MODERN_COLORS = {
  // Primary
  primary: "#0D9488",
  primaryLight: "#E8F4FF",
  primaryDark: "#004C99",

  // Secondary
  secondary: "#6366F1",
  secondaryLight: "#EEF2FF",

  // Accent
  accent: "#10B981",
  accentLight: "#D1FAE5",

  // Warning
  warning: "#F59E0B",
  warningLight: "#FEF3C7",

  // Error
  error: "#EF4444",
  errorLight: "#FEE2E2",

  // Neutral
  background: "#FAFBFC",
  surface: "#FFFFFF",
  surfaceHover: "#F8FAFC",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Text
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  textInverse: "#FFFFFF",
  textDisabled: "#D1D5DB",

  // Text Aliases (for convenience)
  text: "#1F2937",
  textLight: "#9CA3AF",

  // Divider
  divider: "#E5E7EB",

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ["#0D9488", "#004C99"],
  gradientAccent: ["#10B981", "#059669"],
  gradientWarm: ["#F59E0B", "#D97706"],
  gradientCool: ["#6366F1", "#4F46E5"],
};

export const MODERN_SHADOWS = {
  none: {},
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const MODERN_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const MODERN_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
};

export const MODERN_FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

// Main Styles
export const MODERN_STYLES = StyleSheet.create({
  // ============ CONTAINERS ============
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  safeArea: {
    flex: 1,
    backgroundColor: MODERN_COLORS.surface,
  },

  scrollContent: {
    paddingBottom: 100,
  },

  // ============ HEADER ============
  header: {
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.borderLight,
  },

  headerTitle: {
    fontSize: MODERN_FONT_SIZE.xl,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  // ============ SEARCH BAR ============
  searchContainer: {
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical:
      Platform.OS === "ios" ? MODERN_SPACING.md : MODERN_SPACING.sm,
    borderWidth: 1,
    borderColor: MODERN_COLORS.borderLight,
  },

  searchBarFocused: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.surface,
  },

  searchIcon: {
    marginRight: MODERN_SPACING.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: MODERN_FONT_SIZE.md,
    color: MODERN_COLORS.textPrimary,
    padding: 0,
  },

  searchClear: {
    padding: MODERN_SPACING.xs,
  },

  // ============ FILTER BAR ============
  filterBar: {
    backgroundColor: MODERN_COLORS.surface,
    paddingVertical: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.borderLight,
  },

  filterScrollContent: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },

  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    gap: MODERN_SPACING.xs,
  },

  filterChipActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },

  filterChipText: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },

  filterChipTextActive: {
    color: MODERN_COLORS.textInverse,
  },

  filterClearBtn: {
    padding: MODERN_SPACING.xs,
    marginLeft: MODERN_SPACING.xs,
  },

  // ============ RESULTS INFO ============
  resultsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.background,
  },

  resultsText: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
  },

  resultsCount: {
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },

  // ============ CARDS ============
  card: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    marginHorizontal: MODERN_SPACING.lg,
    marginVertical: MODERN_SPACING.sm,
    padding: MODERN_SPACING.lg,
    ...MODERN_SHADOWS.md,
  },

  cardCompact: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    marginHorizontal: MODERN_SPACING.md,
    marginVertical: MODERN_SPACING.xs,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },

  cardHeader: {
    flexDirection: "row",
    marginBottom: MODERN_SPACING.md,
  },

  cardAvatar: {
    width: 56,
    height: 56,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },

  cardAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.sm,
  },

  cardInfo: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
    justifyContent: "center",
  },

  cardTitle: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.xs,
    letterSpacing: -0.2,
  },

  cardTitleSmall: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: 2,
  },

  cardSubtitle: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
  },

  // ============ RATING ============
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.xs,
  },

  ratingStar: {
    color: "#FCD34D",
  },

  ratingValue: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },

  ratingCount: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
  },

  // ============ LOCATION & META ============
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.xs,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.xs,
  },

  metaText: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
  },

  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: MODERN_COLORS.textTertiary,
  },

  // ============ TAGS ============
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.md,
  },

  tag: {
    backgroundColor: MODERN_COLORS.primaryLight,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.sm,
  },

  tagText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "500",
    color: MODERN_COLORS.primary,
  },

  tagOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  tagOutlineText: {
    color: MODERN_COLORS.textSecondary,
  },

  // ============ STATS GRID ============
  statsGrid: {
    flexDirection: "row",
    marginTop: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.borderLight,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },

  statLabel: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    backgroundColor: MODERN_COLORS.borderLight,
    marginVertical: MODERN_SPACING.xs,
  },

  // ============ PRICE ============
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: MODERN_SPACING.xs,
  },

  priceValue: {
    fontSize: MODERN_FONT_SIZE.xl,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },

  priceUnit: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textTertiary,
  },

  // ============ BADGES ============
  badge: {
    position: "absolute",
    top: MODERN_SPACING.sm,
    right: MODERN_SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.sm,
    gap: MODERN_SPACING.xs,
  },

  badgeText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "600",
    color: MODERN_COLORS.textInverse,
  },

  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },

  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  availableBackground: {
    backgroundColor: MODERN_COLORS.accentLight,
  },

  availableDot: {
    backgroundColor: MODERN_COLORS.accent,
  },

  availableText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "600",
    color: MODERN_COLORS.accent,
  },

  busyBackground: {
    backgroundColor: MODERN_COLORS.warningLight,
  },

  busyDot: {
    backgroundColor: MODERN_COLORS.warning,
  },

  busyText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "600",
    color: MODERN_COLORS.warning,
  },

  // ============ BUTTONS ============
  buttonRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
    marginTop: MODERN_SPACING.md,
  },

  buttonPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.sm,
  },

  buttonPrimaryText: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.textInverse,
  },

  buttonSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MODERN_COLORS.background,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    gap: MODERN_SPACING.sm,
  },

  buttonSecondaryText: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },

  buttonIcon: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  buttonIconSmall: {
    width: 32,
    height: 32,
    borderRadius: MODERN_RADIUS.sm,
  },

  // ============ SECTIONS ============
  section: {
    marginTop: MODERN_SPACING.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.md,
  },

  sectionTitle: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  sectionAction: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },

  // ============ LIST ITEMS ============
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.borderLight,
  },

  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.md,
  },

  listItemContent: {
    flex: 1,
  },

  listItemTitle: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "500",
    color: MODERN_COLORS.textPrimary,
  },

  listItemSubtitle: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },

  listItemValue: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },

  // ============ MODALS ============
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    maxHeight: "90%",
    ...MODERN_SHADOWS.xl,
  },

  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: MODERN_COLORS.border,
    alignSelf: "center",
    marginTop: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.lg,
    paddingBottom: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.borderLight,
  },

  modalTitle: {
    fontSize: MODERN_FONT_SIZE.xl,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },

  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  modalBody: {
    padding: MODERN_SPACING.lg,
  },

  modalFooter: {
    flexDirection: "row",
    padding: MODERN_SPACING.lg,
    gap: MODERN_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.borderLight,
  },

  // ============ FORMS ============
  formGroup: {
    marginBottom: MODERN_SPACING.lg,
  },

  formLabel: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
  },

  formInput: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    fontSize: MODERN_FONT_SIZE.md,
    color: MODERN_COLORS.textPrimary,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  formInputFocused: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: MODERN_COLORS.surface,
  },

  formTextArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },

  formHint: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
    marginTop: MODERN_SPACING.xs,
  },

  formError: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.error,
    marginTop: MODERN_SPACING.xs,
  },

  // ============ EMPTY STATE ============
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.xxxl * 2,
    paddingHorizontal: MODERN_SPACING.xxl,
  },

  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.lg,
  },

  emptyStateTitle: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
    textAlign: "center",
  },

  emptyStateText: {
    fontSize: MODERN_FONT_SIZE.md,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  emptyStateButton: {
    marginTop: MODERN_SPACING.lg,
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.xl,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
  },

  emptyStateButtonText: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.textInverse,
  },

  // ============ LOADING STATE ============
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: MODERN_FONT_SIZE.md,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.md,
  },

  // ============ DIVIDERS ============
  divider: {
    height: 1,
    backgroundColor: MODERN_COLORS.borderLight,
    marginVertical: MODERN_SPACING.md,
  },

  dividerWithText: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: MODERN_SPACING.lg,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: MODERN_COLORS.borderLight,
  },

  dividerText: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textTertiary,
    marginHorizontal: MODERN_SPACING.md,
  },

  // ============ INFO BANNER ============
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primaryLight,
    marginHorizontal: MODERN_SPACING.lg,
    marginVertical: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.sm,
  },

  infoBannerText: {
    flex: 1,
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.primary,
    lineHeight: 18,
  },

  // ============ FLOATING ACTION ============
  fab: {
    position: "absolute",
    bottom: MODERN_SPACING.xl,
    right: MODERN_SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...MODERN_SHADOWS.lg,
  },

  fabExtended: {
    flexDirection: "row",
    paddingHorizontal: MODERN_SPACING.lg,
    width: "auto",
    gap: MODERN_SPACING.sm,
  },

  fabText: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.textInverse,
  },
});

// Component-specific modern styles
export const WORKER_CARD_STYLES = StyleSheet.create({
  container: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    marginHorizontal: MODERN_SPACING.lg,
    marginVertical: MODERN_SPACING.sm,
    overflow: "hidden",
    ...MODERN_SHADOWS.md,
  },

  header: {
    flexDirection: "row",
    padding: MODERN_SPACING.lg,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },

  info: {
    flex: 1,
    marginLeft: MODERN_SPACING.md,
  },

  name: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.xs,
    letterSpacing: -0.3,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.xs,
  },

  rating: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },

  reviews: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: MODERN_SPACING.xs,
    gap: MODERN_SPACING.xs,
  },

  locationText: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
  },

  body: {
    paddingHorizontal: MODERN_SPACING.lg,
    paddingBottom: MODERN_SPACING.md,
  },

  tagsLabel: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
  },

  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.xs,
  },

  tag: {
    backgroundColor: MODERN_COLORS.primaryLight,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
  },

  tagText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "500",
    color: MODERN_COLORS.primary,
  },

  statsRow: {
    flexDirection: "row",
    paddingVertical: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.borderLight,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statValue: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },

  statLabel: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
    marginTop: 2,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: MODERN_SPACING.lg,
    paddingTop: 0,
    gap: MODERN_SPACING.sm,
  },

  priceContainer: {
    flex: 1,
  },

  priceLabel: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textTertiary,
    marginBottom: 2,
  },

  price: {
    fontSize: MODERN_FONT_SIZE.xl,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },

  priceUnit: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "400",
    color: MODERN_COLORS.textTertiary,
  },

  actions: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },

  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm + 2,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.xs,
  },

  bookBtnText: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.textInverse,
  },

  featuredBadge: {
    position: "absolute",
    top: MODERN_SPACING.md,
    right: MODERN_SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.warning,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.sm,
    gap: 4,
  },

  featuredText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "600",
    color: MODERN_COLORS.textInverse,
  },

  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 4,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
});

export default MODERN_STYLES;
