# 🎨 Modern Minimalist Theme - Documentation

## Color Palette Overview

### Primary Colors
```
Deep Emerald Green:   #0A6847  ████ (Primary buttons, active states)
Bright Emerald:       #10B981  ████ (Accents, highlights, icons)
Forest Green:         #064E3B  ████ (Hover states, depth)
```

### Neutral Scale
```
Pure Black:           #0A0A0A  ████ (Darkest text, icons)
Soft Black:           #1A1A1A  ████ (Primary text)
Charcoal:             #2D2D2D  ████ (Borders in dark mode)
Dark Gray:            #4A4A4A  ████ (Secondary text)
Mid Gray:             #6B6B6B  ████ (Muted text)
Light Gray:           #9E9E9E  ████ (Disabled text)
Very Light Gray:      #E5E5E5  ████ (Borders)
Pure White:           #FFFFFF  ████ (Backgrounds, cards)
Off White:            #F8F8F8  ████ (Subtle surfaces)
```

### Accent Tints
```
Light Emerald Tint:   #E6F7F1  ████ (Success backgrounds, soft highlights)
```

---

## Usage Guidelines

### ✅ Do's
- Use **Deep Emerald (#0A6847)** for primary actions (buttons, CTAs)
- Use **Bright Emerald (#10B981)** for success states, highlights, active icons
- Use **Pure White (#FFFFFF)** for main backgrounds
- Use **Soft Black (#1A1A1A)** for primary text
- Keep 80% of UI in whites, grays, and blacks - use green sparingly
- Maintain high contrast for accessibility (WCAG AA minimum)

### ❌ Don'ts
- Don't use red/pink/orange (no #FF6B6B) - conflicts with minimalist aesthetic
- Don't overuse green - it loses impact
- Don't use more than 3 colors in a single component
- Avoid gradients unless absolutely necessary (prefer flat colors)
- Don't use bright colors for error states - use neutral blacks/grays

---

## Component Color Mapping

### Buttons
```typescript
Primary Button:
  - Background: #0A6847 (Deep Emerald)
  - Text: #FFFFFF (White)
  - Shadow: rgba(10,104,71,0.2)

Secondary/Outline Button:
  - Background: #FFFFFF (White)
  - Border: #E5E5E5 (Very Light Gray)
  - Text: #1A1A1A (Soft Black)

Ghost Button:
  - Background: transparent
  - Text: #0A6847 (Deep Emerald)
```

### Cards
```typescript
Product Card:
  - Background: #FFFFFF (White)
  - Border: #E5E5E5 (Very Light Gray)
  - Shadow: rgba(0,0,0,0.05)
  - Text: #1A1A1A (Soft Black)
  - Price: #0A6847 (Deep Emerald)
```

### Icons
```typescript
Active/Selected:  #0A6847 (Deep Emerald)
Default:          #6B6B6B (Mid Gray)
Disabled:         #9E9E9E (Light Gray)
On Dark BG:       #FFFFFF (White)
Success:          #10B981 (Bright Emerald)
```

### Badges/Tags
```typescript
Flash Sale Tag:
  - Background: #0A6847 (Deep Emerald)
  - Text: #FFFFFF (White)
  - Icon: #FFFFFF (White)

Discount Badge:
  - Background: #E6F7F1 (Light Emerald Tint)
  - Text: #064E3B (Forest Green)
```

### Navigation
```typescript
Tab Bar:
  - Active: #0A6847 (Deep Emerald)
  - Inactive: #6B6B6B (Mid Gray)
  - Background: #FFFFFF (White)
  - Border: #E5E5E5 (Very Light Gray)
```

---

## Typography Scale

```typescript
Heading XXL:  36px / 700 weight  // Hero titles
Heading XL:   28px / 700 weight  // Page titles
Heading LG:   21px / 600 weight  // Section headers
Body LG:      17px / 500 weight  // Large body text
Body MD:      15px / 400 weight  // Default body text
Body SM:      13px / 400 weight  // Small body text
Caption:      11px / 400 weight  // Captions, labels
```

**Color Usage:**
- Headings: #1A1A1A (Soft Black)
- Body: #1A1A1A (Soft Black)
- Muted: #6B6B6B (Mid Gray)
- Disabled: #9E9E9E (Light Gray)

---

## Spacing System (8pt Grid)

```
XXS:    4px   (Tight spacing, icon gaps)
XS:     8px   (Small padding, compact layouts)
SM:    12px   (Default padding)
MD:    16px   (Card padding, section spacing)
LG:    24px   (Large section gaps)
XL:    32px   (Major section breaks)
XXL:   48px   (Page-level spacing)
XXXL:  64px   (Hero sections)
```

---

## Shadow Levels

```typescript
SM Shadow:  // Subtle elevation
  shadowColor: #000
  shadowOffset: { width: 0, height: 1 }
  shadowOpacity: 0.05
  shadowRadius: 2
  elevation: 1

MD Shadow:  // Cards, buttons
  shadowColor: #000
  shadowOffset: { width: 0, height: 2 }
  shadowOpacity: 0.08
  shadowRadius: 4
  elevation: 2

LG Shadow:  // Modals, elevated cards
  shadowColor: #000
  shadowOffset: { width: 0, height: 4 }
  shadowOpacity: 0.12
  shadowRadius: 8
  elevation: 4

XL Shadow:  // Floating actions
  shadowColor: #000
  shadowOffset: { width: 0, height: 8 }
  shadowOpacity: 0.15
  shadowRadius: 16
  elevation: 8
```

---

## Border Radius

```
None:  0px    (Brutalist style)
SM:    4px    (Subtle rounding)
MD:    8px    (Default cards)
LG:   12px    (Buttons, inputs)
XL:   16px    (Large cards)
XXL:  24px    (Hero sections)
Full: 9999px  (Pills, circular)
```

---

## Before/After Comparison

### Old Theme
- Primary: #4AA14A (Lime green - too bright)
- Accent: #FF6B6B (Red - too playful)
- Shadows: 0.25 opacity (too heavy)
- Borders: #F0F0F0 (barely visible)

### New Theme ✅
- Primary: #0A6847 (Deep emerald - sophisticated)
- Accent: #10B981 (Bright emerald - energetic but refined)
- Shadows: 0.05-0.15 opacity (subtle elevation)
- Borders: #E5E5E5 (clearly defined but minimal)

---

## Accessibility Checklist

✅ Text contrast ratios:
- #1A1A1A on #FFFFFF: 15.8:1 (AAA)
- #4A4A4A on #FFFFFF: 8.6:1 (AAA)
- #FFFFFF on #0A6847: 6.2:1 (AA)

✅ Touch targets: Minimum 44x44px
✅ Color not sole indicator (use icons + text)
✅ Focus states visible (2px solid #0A6847 outline)

---

## Dark Mode Support

```typescript
Dark Mode Colors:
  Background: #0A0A0A (Pure Black)
  Surface: #1A1A1A (Soft Black)
  Primary: #10B981 (Bright Emerald)
  Text: #FAFAFA (Off White)
  Border: #2D2D2D (Dark Border)
```

**Note:** Current implementation focuses on light mode. Dark mode uses same green palette with inverted neutrals.

---

## Implementation Example

```typescript
import { ModernTheme } from '@/constants/ModernTheme';

// Usage in StyleSheet
const styles = StyleSheet.create({
  container: {
    backgroundColor: ModernTheme.colors.surface.primary,
    padding: ModernTheme.spacing.md,
    borderRadius: ModernTheme.borderRadius.lg,
    ...ModernTheme.shadows.md,
  },
  title: {
    fontSize: ModernTheme.typography.fontSize.xl,
    fontWeight: ModernTheme.typography.fontWeight.bold,
    color: ModernTheme.colors.text.primary,
  },
  button: {
    backgroundColor: ModernTheme.colors.primary.main,
    borderRadius: ModernTheme.borderRadius.lg,
    padding: ModernTheme.spacing.md,
  },
});
```

---

## Migration Notes

### Changed Components
- ✅ HeroBanner: #4AA14A → #0A6847
- ✅ FeaturedProducts: #FF6B6B → #10B981
- ✅ CategoryPills: #4AA14A → #0A6847
- ✅ ProductCard: #FF6B6B → #10B981, #4AA14A → #0A6847
- ✅ Theme constants: All colors updated

### Files Updated
1. `constants/ModernTheme.ts` (NEW)
2. `constants/theme.ts` (UPDATED)
3. `components/home/HeroBanner.tsx`
4. `components/home/FeaturedProducts.tsx`
5. `components/home/CategoryPills.tsx`
6. `components/ui/product-card.tsx`

---

## Design Philosophy

**"Timeless Sophistication Through Restraint"**

1. **Color Discipline:** 80% neutral, 20% green
2. **Generous White Space:** Let content breathe
3. **Subtle Shadows:** Elevation without heaviness
4. **Clear Hierarchy:** Size, weight, color for order
5. **Purposeful Motion:** Animations enhance, not distract

**Inspiration:** Apple Store, Shopify, Stripe, Linear

---

**Last Updated:** December 15, 2025  
**Version:** 2.0 - Modern Minimalist Green-Black-White Theme
