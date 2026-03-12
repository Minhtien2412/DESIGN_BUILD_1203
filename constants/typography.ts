/**
 * Typography System
 * Centralized font definitions for consistent text styling
 */

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
} as const;

export const LineHeight = {
  xs: 14,
  sm: 16,
  base: 20,
  md: 22,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 44,
} as const;

export const FontWeight = {
  normal: '500',      // Tăng từ 400
  medium: '600',      // Tăng từ 500
  semibold: '700',    // Tăng từ 600
  bold: '800',        // Tăng từ 700
  extrabold: '900',   // Tăng từ 800
} as const;

export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

// Text Variants
export const TextVariants = {
  // Display
  display: {
    fontSize: FontSize['5xl'],
    lineHeight: LineHeight['5xl'],
    fontWeight: FontWeight.extrabold,  // Tăng từ bold
    letterSpacing: LetterSpacing.tight,
  },
  
  // Headings
  h1: {
    fontSize: FontSize['4xl'],
    lineHeight: LineHeight['4xl'],
    fontWeight: FontWeight.extrabold,  // Tăng từ bold
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontSize: FontSize['3xl'],
    lineHeight: LineHeight['3xl'],
    fontWeight: FontWeight.bold,       // Giữ bold
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontSize: FontSize['2xl'],
    lineHeight: LineHeight['2xl'],
    fontWeight: FontWeight.bold,       // Tăng từ semibold
    letterSpacing: LetterSpacing.normal,
  },
  h4: {
    fontSize: FontSize.xl,
    lineHeight: LineHeight.xl,
    fontWeight: FontWeight.bold,       // Tăng từ semibold
    letterSpacing: LetterSpacing.normal,
  },
  h5: {
    fontSize: FontSize.lg,
    lineHeight: LineHeight.lg,
    fontWeight: FontWeight.semibold,   // Giữ semibold
    letterSpacing: LetterSpacing.normal,
  },
  h6: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.semibold,   // Giữ semibold
    letterSpacing: LetterSpacing.normal,
  },
  
  // Body
  body1: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.medium,     // Tăng từ normal
    letterSpacing: LetterSpacing.normal,
  },
  body2: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.medium,     // Tăng từ normal
    letterSpacing: LetterSpacing.normal,
  },
  
  // Small
  caption: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.medium,     // Tăng từ normal
    letterSpacing: LetterSpacing.wide,
  },
  overline: {
    fontSize: FontSize.xs,
    lineHeight: LineHeight.xs,
    fontWeight: FontWeight.bold,       // Tăng từ semibold
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
  
  // Button
  button: {
    fontSize: FontSize.base,
    lineHeight: LineHeight.base,
    fontWeight: FontWeight.bold,       // Tăng từ semibold
    letterSpacing: LetterSpacing.wide,
  },
  buttonLarge: {
    fontSize: FontSize.md,
    lineHeight: LineHeight.md,
    fontWeight: FontWeight.bold,       // Tăng từ semibold
    letterSpacing: LetterSpacing.wide,
  },
  buttonSmall: {
    fontSize: FontSize.sm,
    lineHeight: LineHeight.sm,
    fontWeight: FontWeight.bold,       // Tăng từ semibold
    letterSpacing: LetterSpacing.wide,
  },
} as const;

export type TextVariant = keyof typeof TextVariants;
