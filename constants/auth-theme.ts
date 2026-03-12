/**
 * Auth Design Tokens
 * Shared constants for all auth screens - consistent dark premium theme
 */

export const AUTH_THEME = {
  // Primary palette
  primary: "#8B5CF6",
  primaryLight: "#A78BFA",
  primaryDark: "#7C3AED",
  primaryGlow: "rgba(139, 92, 246, 0.25)",

  // Accent
  accent: "#06B6D4",
  accentGlow: "rgba(6, 182, 212, 0.15)",

  // Background
  bg: "#0B0B1A",
  bgCard: "rgba(30, 30, 60, 0.65)",
  bgCardBorder: "rgba(139, 92, 246, 0.12)",
  bgInput: "rgba(20, 20, 45, 0.8)",
  bgInputBorder: "rgba(100, 100, 160, 0.2)",

  // Text
  white: "#FFFFFF",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  textDim: "#475569",

  // Semantic
  error: "#F43F5E",
  errorBg: "rgba(244, 63, 94, 0.1)",
  success: "#10B981",
  warning: "#FBBF24",

  // Sizes
  inputH: 54,
  btnH: 54,
  radius: { sm: 10, md: 14, lg: 20, xl: 28, pill: 9999 },
  gap: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
} as const;

export type AuthTheme = typeof AUTH_THEME;
