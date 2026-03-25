import { Platform, TextStyle, ViewStyle } from "react-native";

type ShadowToken = ViewStyle;

const shadowBaseColor = "#131A10";

export const uiCloneShadows: Record<
  "none" | "xs" | "sm" | "md" | "lg" | "xl",
  ShadowToken
> = {
  none: {},
  xs: Platform.select({
    ios: {
      shadowColor: shadowBaseColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 3,
    },
    android: { elevation: 1 },
    default: {},
  }) as ShadowToken,
  sm: Platform.select({
    ios: {
      shadowColor: shadowBaseColor,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    },
    android: { elevation: 2 },
    default: {},
  }) as ShadowToken,
  md: Platform.select({
    ios: {
      shadowColor: shadowBaseColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
    android: { elevation: 4 },
    default: {},
  }) as ShadowToken,
  lg: Platform.select({
    ios: {
      shadowColor: shadowBaseColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.11,
      shadowRadius: 18,
    },
    android: { elevation: 7 },
    default: {},
  }) as ShadowToken,
  xl: Platform.select({
    ios: {
      shadowColor: shadowBaseColor,
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.16,
      shadowRadius: 26,
    },
    android: { elevation: 10 },
    default: {},
  }) as ShadowToken,
};

export const uiCloneTheme = {
  colors: {
    brand: "#86C91D",
    brandStrong: "#75B90D",
    brandDark: "#60980B",
    brandSoft: "#F1F9E1",
    brandTint: "#E8F4CB",
    accentBlue: "#2A87E9",
    accentBlueSoft: "#EAF4FF",
    accentGold: "#D7B56A",

    textPrimary: "#1D2430",
    textSecondary: "#636E7E",
    textTertiary: "#98A1AF",
    textOnBrand: "#FAFFF3",
    textOnDark: "#F5F8FF",

    bgCanvas: "#F3F4F6",
    bgSurface: "#FFFFFF",
    bgSurfaceSoft: "#F8FAFC",
    bgSurfaceTint: "#F4F9EA",
    bgHeader: "#FFFFFF",
    bgMap: "#DDE9F5",
    bgDarkCard: "#0F1A34",

    borderSoft: "#E7EBF1",
    borderMuted: "#DCE3EB",
    borderBrand: "#CFE4A9",
    borderDark: "#2A385A",

    success: "#2E9B3C",
    successSoft: "#E9F8E8",
    warning: "#D79A1A",
    warningSoft: "#FFF6E3",
    danger: "#DA4757",
    dangerSoft: "#FCECEF",
    neutral: "#7D8795",
    neutralSoft: "#EEF1F5",

    overlay: "rgba(16, 24, 40, 0.45)",
    white: "#FFFFFF",
    black: "#000000",
  },

  spacing: {
    s0: 0,
    s1: 2,
    s2: 4,
    s3: 6,
    s4: 8,
    s5: 10,
    s6: 12,
    s7: 14,
    s8: 16,
    s9: 18,
    s10: 20,
    s11: 24,
    s12: 28,
    s13: 32,
    s14: 36,
    s15: 40,
  },

  radius: {
    r0: 0,
    r1: 4,
    r2: 6,
    r3: 8,
    r4: 10,
    r5: 12,
    r6: 14,
    r7: 16,
    r8: 20,
    r9: 24,
    rPill: 999,
  },

  iconSize: {
    xxs: 12,
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 34,
  },

  dimensions: {
    headerHeight: 56,
    buttonHeightSm: 38,
    buttonHeightMd: 44,
    buttonHeightLg: 52,
    sectionBadgeSize: 22,
    bottomNavHeight: 64,
    stickyActionHeight: 86,
    cardMinHeight: 60,
  },

  typography: {
    h1: {
      fontSize: 33,
      lineHeight: 40,
      fontWeight: "800",
      letterSpacing: 0.2,
    } as TextStyle,
    h2: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "800",
      letterSpacing: 0.2,
    } as TextStyle,
    h3: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "800",
    } as TextStyle,
    titleLg: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "800",
    } as TextStyle,
    titleMd: {
      fontSize: 20,
      lineHeight: 25,
      fontWeight: "800",
    } as TextStyle,
    titleSm: {
      fontSize: 18,
      lineHeight: 23,
      fontWeight: "700",
    } as TextStyle,
    section: {
      fontSize: 31,
      lineHeight: 38,
      fontWeight: "700",
    } as TextStyle,
    bodyLg: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "500",
    } as TextStyle,
    bodyMd: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    } as TextStyle,
    bodySm: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "500",
    } as TextStyle,
    caption: {
      fontSize: 11,
      lineHeight: 15,
      fontWeight: "500",
    } as TextStyle,
    label: {
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "700",
      letterSpacing: 0.2,
    } as TextStyle,
    price: {
      fontSize: 30,
      lineHeight: 35,
      fontWeight: "800",
      letterSpacing: 0.2,
    } as TextStyle,
  },

  shadows: uiCloneShadows,
};

export const uiCloneFonts = {
  regular: Platform.select({
    ios: "System",
    android: "Roboto",
    default: "System",
  }),
  medium: Platform.select({
    ios: "System",
    android: "Roboto-Medium",
    default: "System",
  }),
  semibold: Platform.select({
    ios: "System",
    android: "Roboto-Medium",
    default: "System",
  }),
  bold: Platform.select({
    ios: "System",
    android: "Roboto-Bold",
    default: "System",
  }),
};

export const uiCloneLayout = {
  screenHorizontalPadding: uiCloneTheme.spacing.s8,
  sectionGap: uiCloneTheme.spacing.s8,
  cardPadding: uiCloneTheme.spacing.s8,
};
