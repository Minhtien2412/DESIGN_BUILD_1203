/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BaoTien Design System (DS) — Single Source of Truth
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Palette: Teal + Black + White (Professional Minimalist)
 * Grid: 4px base unit
 * Typography: System font with consistent scale
 * Shadows: Progressive elevation system
 *
 * Usage:
 *   import { DS } from '@/constants/ds';
 *   backgroundColor: DS.colors.bg
 *   padding: DS.spacing.md
 *   fontSize: DS.font.size.md
 *
 * @created 2026-02-24
 */

import { Dimensions, Platform, TextStyle, ViewStyle } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ═══════════════════════════════════════════════════════════════════════
// COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════

const palette = {
  // Primary — Professional Teal
  teal50: "#F0FDFA",
  teal100: "#CCFBF1",
  teal200: "#99F6E4",
  teal300: "#5EEAD4",
  teal400: "#2DD4BF",
  teal500: "#14B8A6",
  teal600: "#0D9488",
  teal700: "#0F766E",
  teal800: "#115E59",
  teal900: "#134E4A",

  // Neutral — Clean gray scale
  white: "#FFFFFF",
  gray50: "#FAFAFA",
  gray100: "#F5F5F5",
  gray200: "#E5E5E5",
  gray300: "#D4D4D4",
  gray400: "#A3A3A3",
  gray500: "#737373",
  gray600: "#525252",
  gray700: "#404040",
  gray800: "#262626",
  gray900: "#171717",
  black: "#000000",

  // Accent — Red/Pink for FAB/CTA
  rose500: "#F43F5E",
  rose600: "#E11D48",

  // Semantic
  green500: "#22C55E",
  green600: "#16A34A",
  amber500: "#F59E0B",
  amber600: "#D97706",
  red500: "#EF4444",
  red600: "#DC2626",
  blue500: "#3B82F6",
  blue600: "#2563EB",

  // Special
  overlayDark: "rgba(0,0,0,0.6)",
  overlayLight: "rgba(0,0,0,0.3)",
  shimmer: "rgba(255,255,255,0.08)",
} as const;

// Light theme colors
const lightColors = {
  // Primary
  primary: palette.teal600,
  primaryLight: palette.teal500,
  primaryDark: palette.teal700,
  primaryBg: palette.teal50,
  primaryBorder: palette.teal200,

  // Accent (for FAB, hot items, flash sales)
  accent: palette.rose500,
  accentDark: palette.rose600,

  // Text
  text: palette.gray900,
  textSecondary: palette.gray600,
  textTertiary: palette.gray400,
  textInverse: palette.white,
  textLink: palette.teal600,

  // Background
  bg: palette.gray50,
  bgSurface: palette.white,
  bgMuted: palette.gray100,
  bgHover: palette.gray200,
  bgInput: palette.gray100,

  // Cards & Surfaces
  card: palette.white,
  cardBorder: palette.gray200,
  cardHover: palette.gray50,

  // Borders
  border: palette.gray200,
  borderStrong: palette.gray400,
  borderLight: palette.gray100,
  divider: palette.gray200,

  // Semantic
  success: palette.green500,
  successBg: "#F0FDF4",
  warning: palette.amber500,
  warningBg: "#FFFBEB",
  error: palette.red500,
  errorBg: "#FEF2F2",
  info: palette.blue500,
  infoBg: "#EFF6FF",

  // Chips/Tags
  chipBg: palette.teal50,
  chipText: palette.teal700,
  chipBorder: palette.teal200,

  // Tab Bar — Dark gradient base
  tabBar: palette.gray900,
  tabBarGradient: ["#1A1A2E", "#16213E", "#0F3460"] as readonly string[],
  tabActive: "#00D4FF",
  tabInactive: "rgba(255,255,255,0.5)",
  tabActiveBg: "rgba(0,212,255,0.15)",
  fabGradient: [palette.rose500, "#7B2CBF"] as readonly string[],

  // Badge
  badge: palette.rose500,
  badgeText: palette.white,

  // Shadows
  shadow: "rgba(0,0,0,0.08)",
  shadowStrong: "rgba(0,0,0,0.16)",

  // Overlay
  overlay: palette.overlayDark,
  overlayLight: palette.overlayLight,

  // Status bar
  statusBar: "dark-content" as const,

  // Gold/Premium
  gold: palette.amber500,
  goldBg: "#FFFBEB",

  // Legacy compat
  tint: palette.teal600,
  icon: palette.gray900,
  danger: palette.red500,
  white: palette.white,
  black: palette.black,
} as const;

// Dark theme colors
const darkColors: DSColors = {
  primary: palette.teal500,
  primaryLight: palette.teal400,
  primaryDark: palette.teal600,
  primaryBg: "#0D1F1D",
  primaryBorder: "#1A3A36",

  accent: palette.rose500,
  accentDark: palette.rose600,

  text: palette.gray100,
  textSecondary: palette.gray400,
  textTertiary: palette.gray500,
  textInverse: palette.gray900,
  textLink: palette.teal400,

  bg: palette.black,
  bgSurface: palette.gray900,
  bgMuted: palette.gray800,
  bgHover: palette.gray700,
  bgInput: palette.gray800,

  card: palette.gray900,
  cardBorder: palette.gray800,
  cardHover: palette.gray800,

  border: palette.gray800,
  borderStrong: palette.gray600,
  borderLight: palette.gray800,
  divider: palette.gray800,

  success: palette.green500,
  successBg: "#052E16",
  warning: palette.amber500,
  warningBg: "#451A03",
  error: palette.red500,
  errorBg: "#450A0A",
  info: palette.blue500,
  infoBg: "#1E3A5F",

  chipBg: "#0D2924",
  chipText: palette.teal400,
  chipBorder: "#1A3A36",

  tabBar: palette.black,
  tabBarGradient: ["#0A0A14", "#0D1020", "#091830"] as readonly string[],
  tabActive: "#00D4FF",
  tabInactive: "rgba(255,255,255,0.4)",
  tabActiveBg: "rgba(0,212,255,0.12)",
  fabGradient: [palette.rose500, "#7B2CBF"] as readonly string[],

  badge: palette.rose500,
  badgeText: palette.white,

  shadow: "rgba(0,0,0,0.3)",
  shadowStrong: "rgba(0,0,0,0.5)",

  overlay: "rgba(0,0,0,0.85)",
  overlayLight: "rgba(0,0,0,0.5)",

  statusBar: "light-content" as const,

  gold: palette.amber500,
  goldBg: "#1A1506",

  tint: palette.teal500,
  icon: palette.gray100,
  danger: palette.red500,
  white: palette.white,
  black: palette.black,
} as const;

/** Color token interface — allows different literal values per theme */
export interface DSColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBg: string;
  primaryBorder: string;
  accent: string;
  accentDark: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textLink: string;
  bg: string;
  bgSurface: string;
  bgMuted: string;
  bgHover: string;
  bgInput: string;
  card: string;
  cardBorder: string;
  cardHover: string;
  border: string;
  borderStrong: string;
  borderLight: string;
  divider: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  tabBar: string;
  tabBarGradient: readonly string[];
  tabActive: string;
  tabInactive: string;
  tabActiveBg: string;
  fabGradient: readonly string[];
  badge: string;
  badgeText: string;
  shadow: string;
  shadowStrong: string;
  overlay: string;
  overlayLight: string;
  statusBar: "dark-content" | "light-content";
  gold: string;
  goldBg: string;
  tint: string;
  icon: string;
  danger: string;
  white: string;
  black: string;
}

// ═══════════════════════════════════════════════════════════════════════
// SPACING (4px grid)
// ═══════════════════════════════════════════════════════════════════════

const spacing = {
  /** 2px */ xxs: 2,
  /** 4px */ xs: 4,
  /** 6px */ sm: 6,
  /** 8px */ md: 8,
  /** 12px */ lg: 12,
  /** 16px */ xl: 16,
  /** 20px */ xxl: 20,
  /** 24px */ xxxl: 24,
  /** 32px */ huge: 32,
  /** 48px */ giant: 48,
} as const;

// ═══════════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════════════════

const radius = {
  /** 4px */ xs: 4,
  /** 8px */ sm: 8,
  /** 12px */ md: 12,
  /** 16px */ lg: 16,
  /** 20px */ xl: 20,
  /** 24px */ xxl: 24,
  /** 9999px */ full: 9999,
} as const;

// ═══════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════

const fontFamily = Platform.select({
  ios: "System",
  android: "Roboto",
  default: "System",
});

const font = {
  family: fontFamily,
  size: {
    /** 10px — caption/badge */ xxs: 10,
    /** 11px — tiny labels */ xs: 11,
    /** 12px — small text */ sm: 12,
    /** 13px — minor labels */ caption: 13,
    /** 14px — body text */ md: 14,
    /** 15px — sub-heading */ body: 15,
    /** 16px — standard */ lg: 16,
    /** 18px — section title */ xl: 18,
    /** 20px — page title */ xxl: 20,
    /** 24px — heading */ heading: 24,
    /** 28px — large heading */ display: 28,
    /** 32px — hero */ hero: 32,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "800" as const,
  },
  lineHeight: {
    /** compact */ tight: 1.2,
    /** normal reading */ normal: 1.4,
    /** spacious */ relaxed: 1.6,
  },
} as const;

// Pre-built text styles
const textStyles = {
  // Display/Hero
  hero: {
    fontSize: font.size.hero,
    fontWeight: font.weight.bold,
    lineHeight: font.size.hero * font.lineHeight.tight,
  } as TextStyle,
  display: {
    fontSize: font.size.display,
    fontWeight: font.weight.bold,
    lineHeight: font.size.display * font.lineHeight.tight,
  } as TextStyle,

  // Headings
  h1: {
    fontSize: font.size.heading,
    fontWeight: font.weight.bold,
    lineHeight: font.size.heading * font.lineHeight.tight,
  } as TextStyle,
  h2: {
    fontSize: font.size.xxl,
    fontWeight: font.weight.bold,
    lineHeight: font.size.xxl * font.lineHeight.tight,
  } as TextStyle,
  h3: {
    fontSize: font.size.xl,
    fontWeight: font.weight.semibold,
    lineHeight: font.size.xl * font.lineHeight.tight,
  } as TextStyle,
  h4: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    lineHeight: font.size.lg * font.lineHeight.normal,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontSize: font.size.body,
    fontWeight: font.weight.regular,
    lineHeight: font.size.body * font.lineHeight.normal,
  } as TextStyle,
  body: {
    fontSize: font.size.md,
    fontWeight: font.weight.regular,
    lineHeight: font.size.md * font.lineHeight.normal,
  } as TextStyle,
  bodyMedium: {
    fontSize: font.size.md,
    fontWeight: font.weight.medium,
    lineHeight: font.size.md * font.lineHeight.normal,
  } as TextStyle,
  bodySemibold: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    lineHeight: font.size.md * font.lineHeight.normal,
  } as TextStyle,

  // Small
  small: {
    fontSize: font.size.sm,
    fontWeight: font.weight.regular,
    lineHeight: font.size.sm * font.lineHeight.normal,
  } as TextStyle,
  smallMedium: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    lineHeight: font.size.sm * font.lineHeight.normal,
  } as TextStyle,
  smallBold: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    lineHeight: font.size.sm * font.lineHeight.normal,
  } as TextStyle,

  // Tiny
  caption: {
    fontSize: font.size.caption,
    fontWeight: font.weight.regular,
    lineHeight: font.size.caption * font.lineHeight.normal,
  } as TextStyle,
  captionMedium: {
    fontSize: font.size.caption,
    fontWeight: font.weight.medium,
    lineHeight: font.size.caption * font.lineHeight.normal,
  } as TextStyle,
  label: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    lineHeight: font.size.xs * font.lineHeight.normal,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  } as TextStyle,

  // Badge/Chip
  badge: {
    fontSize: font.size.xxs,
    fontWeight: font.weight.bold,
    lineHeight: font.size.xxs * font.lineHeight.tight,
  } as TextStyle,

  // Button
  button: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    lineHeight: font.size.md * font.lineHeight.normal,
  } as TextStyle,
  buttonSmall: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    lineHeight: font.size.sm * font.lineHeight.normal,
  } as TextStyle,
  buttonLarge: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    lineHeight: font.size.lg * font.lineHeight.normal,
  } as TextStyle,

  // Section title
  sectionTitle: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    lineHeight: font.size.md * font.lineHeight.tight,
    letterSpacing: 0.3,
  } as TextStyle,
} as const;

// ═══════════════════════════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════════════════════════

const shadow = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,
  xs: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  } as ViewStyle,
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  } as ViewStyle,
} as const;

// ═══════════════════════════════════════════════════════════════════════
// DIMENSIONS & LAYOUT
// ═══════════════════════════════════════════════════════════════════════

const screen = {
  width: SCREEN_W,
  height: SCREEN_H,
} as const;

const layout = {
  // Grid
  gridGutter: spacing.md, // 8px between grid items
  screenPadding: spacing.xl, // 16px horizontal screen padding

  // Component heights
  headerHeight: 56,
  tabBarHeight: 70,
  searchHeight: 44,
  buttonHeight: 48,
  buttonSmallHeight: 36,
  inputHeight: 48,
  bannerHeight: 160,
  avatarSmall: 32,
  avatarMedium: 44,
  avatarLarge: 64,

  // Cards
  productCardWidth: (SCREEN_W - spacing.xl * 2 - spacing.md) / 2,
  serviceIconSize: 56,
  serviceGridColumns: 4,

  // FAB
  fabSize: 56,

  // Content widths
  maxContentWidth: 600,
} as const;

// ═══════════════════════════════════════════════════════════════════════
// ANIMATION PRESETS
// ═══════════════════════════════════════════════════════════════════════

const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    tension: 50,
    friction: 7,
  },
  bounce: {
    speed: 40,
    bounciness: 6,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════
// ICON SIZES
// ═══════════════════════════════════════════════════════════════════════

const icon = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 26,
  xl: 32,
  xxl: 40,
} as const;

// ═══════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════

export const DS = {
  palette,
  colors: lightColors,
  dark: darkColors,
  spacing,
  radius,
  font,
  text: textStyles,
  shadow,
  screen,
  layout,
  animation,
  icon,
} as const;

export type DSType = typeof DS;
export default DS;
