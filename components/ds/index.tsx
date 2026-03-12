/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BaoTien Core UI Kit — Unified components using DS design tokens
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Import: import { DSButton, DSCard, DSInput, ... } from '@/components/ds';
 *
 * Every component uses DS tokens and supports dark mode via useDS hook.
 * This replaces the fragmented button/card/input variants.
 *
 * Components:
 * - DSButton — Primary call-to-action button
 * - DSIconButton — Circular icon button
 * - DSCard — Flexible card container
 * - DSInput — Text input with label/error
 * - DSChip — Filter/tag chip
 * - DSBadge — Status badge with count
 * - DSSectionHeader — Section title + "See more"
 * - DSDivider — Horizontal line divider
 * - DSAvatar — Profile avatar with fallback
 * - DSEmptyState — Empty list placeholder
 * - DSServiceIcon — Grid service item with icon/image + label
 * - DSStatCard — Stat counter with icon
 * - DSBottomSheet — Bottom sheet action panel
 *
 * @created 2026-02-24
 */

import { DS } from "@/constants/ds";
import { useDS } from "@/hooks/useDS";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, router } from "expo-router";
import { memo, ReactNode } from "react";
import {
    ActivityIndicator,
    Image,
    ImageSourcePropType,
    ScrollView,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ═══════════════════════════════════════════════════════════════════════
// DSButton
// ═══════════════════════════════════════════════════════════════════════

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "accent";
type ButtonSize = "sm" | "md" | "lg";

interface DSButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const DSButton = memo<DSButtonProps>(
  ({
    title,
    onPress,
    variant = "primary",
    size = "md",
    icon,
    iconRight,
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
  }) => {
    const { colors, radius, spacing, text: textStyles } = useDS();

    const sizeMap = {
      sm: { height: 36, px: spacing.lg, text: textStyles.buttonSmall },
      md: { height: 44, px: spacing.xl, text: textStyles.button },
      lg: { height: 52, px: spacing.xxl, text: textStyles.buttonLarge },
    };

    const variantMap = {
      primary: {
        bg: colors.primary,
        textColor: colors.white,
        border: "transparent",
      },
      secondary: {
        bg: colors.bgMuted,
        textColor: colors.text,
        border: colors.border,
      },
      outline: {
        bg: "transparent",
        textColor: colors.primary,
        border: colors.primary,
      },
      ghost: {
        bg: "transparent",
        textColor: colors.primary,
        border: "transparent",
      },
      danger: {
        bg: colors.error,
        textColor: colors.white,
        border: "transparent",
      },
      accent: {
        bg: colors.accent,
        textColor: colors.white,
        border: "transparent",
      },
    };

    const s = sizeMap[size];
    const v = variantMap[variant];
    const iconSize = size === "sm" ? 16 : size === "lg" ? 22 : 18;

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          {
            height: s.height,
            paddingHorizontal: s.px,
            backgroundColor: v.bg,
            borderColor: v.border,
            borderWidth: v.border !== "transparent" ? 1.5 : 0,
            borderRadius: radius.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.md,
            opacity: disabled ? 0.5 : 1,
          },
          fullWidth && { width: "100%" },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={v.textColor} size="small" />
        ) : (
          <>
            {icon && (
              <Ionicons name={icon} size={iconSize} color={v.textColor} />
            )}
            <Text style={[s.text, { color: v.textColor }]}>{title}</Text>
            {iconRight && (
              <Ionicons name={iconRight} size={iconSize} color={v.textColor} />
            )}
          </>
        )}
      </TouchableOpacity>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSIconButton
// ═══════════════════════════════════════════════════════════════════════

interface DSIconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  bg?: string;
  style?: ViewStyle;
  badge?: number;
}

export const DSIconButton = memo<DSIconButtonProps>(
  ({ icon, onPress, size = 22, color, bg, style, badge }) => {
    const { colors, radius, spacing } = useDS();
    const btnSize = size + 20;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          {
            width: btnSize,
            height: btnSize,
            borderRadius: btnSize / 2,
            backgroundColor: bg || colors.bgMuted,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        <Ionicons name={icon} size={size} color={color || colors.text} />
        {badge !== undefined && badge > 0 && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: colors.badge,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: colors.white,
              }}
            >
              {badge > 99 ? "99+" : badge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSCard
// ═══════════════════════════════════════════════════════════════════════

interface DSCardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: "elevated" | "outlined" | "flat";
  padding?: number;
  style?: ViewStyle;
}

export const DSCard = memo<DSCardProps>(
  ({ children, onPress, variant = "elevated", padding, style }) => {
    const { colors, radius, spacing, shadow } = useDS();

    const variantStyles: ViewStyle =
      variant === "elevated"
        ? { backgroundColor: colors.card, ...shadow.sm }
        : variant === "outlined"
          ? {
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }
          : { backgroundColor: colors.card };

    const cardStyle: ViewStyle = {
      borderRadius: radius.lg,
      padding: padding ?? spacing.xl,
      ...variantStyles,
    };

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={[cardStyle, style]}
        >
          {children}
        </TouchableOpacity>
      );
    }

    return <View style={[cardStyle, style]}>{children}</View>;
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSInput
// ═══════════════════════════════════════════════════════════════════════

interface DSInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}

export const DSInput = memo<DSInputProps>(
  ({ label, error, icon, containerStyle, style, ...rest }) => {
    const { colors, radius, spacing, font, text: textStyles } = useDS();

    return (
      <View style={[{ marginBottom: spacing.xl }, containerStyle]}>
        {label && (
          <Text
            style={[
              textStyles.smallMedium,
              { color: colors.textSecondary, marginBottom: spacing.xs },
            ]}
          >
            {label}
          </Text>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgInput,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: error ? colors.error : colors.border,
            paddingHorizontal: spacing.xl,
            height: DS.layout.inputHeight,
          }}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={colors.textTertiary}
              style={{ marginRight: spacing.md }}
            />
          )}
          <TextInput
            placeholderTextColor={colors.textTertiary}
            style={[
              textStyles.body,
              { flex: 1, color: colors.text, height: "100%" },
              style,
            ]}
            {...rest}
          />
        </View>
        {error && (
          <Text
            style={[
              textStyles.small,
              { color: colors.error, marginTop: spacing.xs },
            ]}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSChip
// ═══════════════════════════════════════════════════════════════════════

interface DSChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: "sm" | "md";
}

export const DSChip = memo<DSChipProps>(
  ({ label, selected = false, onPress, icon, size = "md" }) => {
    const { colors, radius, spacing, text: textStyles } = useDS();
    const h = size === "sm" ? 28 : 34;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          height: h,
          paddingHorizontal: size === "sm" ? spacing.md : spacing.lg,
          borderRadius: h / 2,
          backgroundColor: selected ? colors.primary : colors.chipBg,
          borderWidth: selected ? 0 : 1,
          borderColor: colors.chipBorder,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.xs,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={size === "sm" ? 12 : 14}
            color={selected ? colors.white : colors.chipText}
          />
        )}
        <Text
          style={[
            size === "sm" ? textStyles.badge : textStyles.smallMedium,
            { color: selected ? colors.white : colors.chipText },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSBadge
// ═══════════════════════════════════════════════════════════════════════

interface DSBadgeProps {
  count?: number;
  label?: string;
  variant?: "error" | "success" | "warning" | "info" | "primary";
  dot?: boolean;
}

export const DSBadge = memo<DSBadgeProps>(
  ({ count, label, variant = "error", dot = false }) => {
    const { colors, text: textStyles, spacing } = useDS();

    const colorMap = {
      error: { bg: colors.error, text: colors.white },
      success: { bg: colors.success, text: colors.white },
      warning: { bg: colors.warning, text: colors.white },
      info: { bg: colors.info, text: colors.white },
      primary: { bg: colors.primary, text: colors.white },
    };

    const c = colorMap[variant];

    if (dot) {
      return (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: c.bg,
          }}
        />
      );
    }

    const displayText =
      label ||
      (count !== undefined ? (count > 99 ? "99+" : String(count)) : "");
    if (!displayText) return null;

    return (
      <View
        style={{
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: c.bg,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: spacing.xs,
        }}
      >
        <Text style={[textStyles.badge, { color: c.text }]}>{displayText}</Text>
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSSectionHeader
// ═══════════════════════════════════════════════════════════════════════

interface DSSectionHeaderProps {
  title: string;
  seeMoreRoute?: string;
  seeMoreLabel?: string;
  onSeeMore?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export const DSSectionHeader = memo<DSSectionHeaderProps>(
  ({
    title,
    seeMoreRoute,
    seeMoreLabel = "XEM THÊM",
    onSeeMore,
    icon,
    style,
  }) => {
    const { colors, spacing, text: textStyles } = useDS();

    const handleSeeMore = () => {
      if (onSeeMore) onSeeMore();
      else if (seeMoreRoute) router.push(seeMoreRoute as Href);
    };

    return (
      <View
        style={[
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: spacing.md,
            paddingHorizontal: spacing.xl,
          },
          style,
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            flex: 1,
          }}
        >
          {icon && <Ionicons name={icon} size={18} color={colors.primary} />}
          <Text
            style={[textStyles.sectionTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        {(seeMoreRoute || onSeeMore) && (
          <TouchableOpacity onPress={handleSeeMore} hitSlop={8}>
            <Text style={[textStyles.smallMedium, { color: colors.primary }]}>
              {seeMoreLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSDivider
// ═══════════════════════════════════════════════════════════════════════

interface DSDividerProps {
  margin?: number;
  color?: string;
}

export const DSDivider = memo<DSDividerProps>(({ margin, color }) => {
  const { colors, spacing } = useDS();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: color || colors.divider,
        marginVertical: margin ?? spacing.xl,
      }}
    />
  );
});

// ═══════════════════════════════════════════════════════════════════════
// DSAvatar
// ═══════════════════════════════════════════════════════════════════════

interface DSAvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
  onPress?: () => void;
}

export const DSAvatar = memo<DSAvatarProps>(
  ({ uri, name, size = 44, style, onPress }) => {
    const { colors, font } = useDS();
    const initials = name
      ? name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "?";

    const content = uri ? (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    ) : (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.primaryBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: size * 0.36,
            fontWeight: font.weight.semibold,
            color: colors.primary,
          }}
        >
          {initials}
        </Text>
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
          {content}
        </TouchableOpacity>
      );
    }

    return <View style={style}>{content}</View>;
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSEmptyState
// ═══════════════════════════════════════════════════════════════════════

interface DSEmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const DSEmptyState = memo<DSEmptyStateProps>(
  ({
    icon = "file-tray-outline",
    title,
    description,
    actionLabel,
    onAction,
  }) => {
    const { colors, spacing, text: textStyles } = useDS();

    return (
      <View
        style={{
          alignItems: "center",
          paddingVertical: spacing.giant,
          paddingHorizontal: spacing.xxxl,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.bgMuted,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xl,
          }}
        >
          <Ionicons name={icon} size={36} color={colors.textTertiary} />
        </View>
        <Text
          style={[
            textStyles.h4,
            {
              color: colors.text,
              marginBottom: spacing.md,
              textAlign: "center",
            },
          ]}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={[
              textStyles.body,
              {
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: spacing.xl,
              },
            ]}
          >
            {description}
          </Text>
        )}
        {actionLabel && onAction && (
          <DSButton title={actionLabel} onPress={onAction} size="sm" />
        )}
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSServiceIcon — Grid item with image/icon + label (for home sections)
// ═══════════════════════════════════════════════════════════════════════

interface DSServiceIconProps {
  label: string;
  image?: ImageSourcePropType;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  subtitle?: string;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export const DSServiceIcon = memo<DSServiceIconProps>(
  ({ label, image, icon, iconColor, subtitle, onPress, size = 56, style }) => {
    const { colors, radius, spacing, text: textStyles } = useDS();

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[{ alignItems: "center", width: size + 20 }, style]}
      >
        <View
          style={{
            width: size,
            height: size,
            borderRadius: radius.lg,
            backgroundColor: colors.bgSurface,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: spacing.xs,
            borderWidth: 1,
            borderColor: colors.borderLight,
            overflow: "hidden",
          }}
        >
          {image ? (
            <Image
              source={image}
              style={{
                width: size - 12,
                height: size - 12,
                borderRadius: radius.sm,
              }}
              resizeMode="cover"
            />
          ) : icon ? (
            <Ionicons
              name={icon}
              size={size * 0.45}
              color={iconColor || colors.primary}
            />
          ) : null}
        </View>
        <Text
          style={[
            textStyles.badge,
            { color: colors.text, textAlign: "center", marginTop: 2 },
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            style={[textStyles.badge, { color: colors.primary, marginTop: 1 }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </TouchableOpacity>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSStatCard — Compact stat counter
// ═══════════════════════════════════════════════════════════════════════

interface DSStatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
}

export const DSStatCard = memo<DSStatCardProps>(
  ({ label, value, icon, color, onPress }) => {
    const { colors, radius, spacing, shadow, text: textStyles } = useDS();

    const content = (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          padding: spacing.xl,
          alignItems: "center",
          ...shadow.xs,
          flex: 1,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={color || colors.primary}
            style={{ marginBottom: spacing.md }}
          />
        )}
        <Text style={[textStyles.h3, { color: color || colors.text }]}>
          {value}
        </Text>
        <Text
          style={[
            textStyles.caption,
            {
              color: colors.textSecondary,
              marginTop: spacing.xs,
              textAlign: "center",
            },
          ]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={{ flex: 1 }}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSGradientHeader — Gradient header for screens
// ═══════════════════════════════════════════════════════════════════════

interface DSGradientHeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightIcons?: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    badge?: number;
  }>;
  children?: ReactNode;
  colors?: string[];
}

export const DSGradientHeader = memo<DSGradientHeaderProps>(
  ({
    title,
    subtitle,
    leftIcon,
    onLeftPress,
    rightIcons,
    children,
    colors: gradientColors,
  }) => {
    const insets = useSafeAreaInsets();
    const { colors, spacing, text: textStyles } = useDS();

    return (
      <LinearGradient
        colors={
          (gradientColors || colors.tabBarGradient) as [
            string,
            string,
            ...string[],
          ]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + spacing.md,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.xl,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.lg,
              flex: 1,
            }}
          >
            {leftIcon && (
              <TouchableOpacity onPress={onLeftPress} hitSlop={8}>
                <Ionicons name={leftIcon} size={24} color={colors.white} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text
                style={[textStyles.h3, { color: colors.white }]}
                numberOfLines={1}
              >
                {title}
              </Text>
              {subtitle && (
                <Text
                  style={[
                    textStyles.small,
                    { color: "rgba(255,255,255,0.7)", marginTop: 2 },
                  ]}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightIcons && (
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              {rightIcons.map((item, index) => (
                <DSIconButton
                  key={index}
                  icon={item.icon}
                  onPress={item.onPress}
                  size={20}
                  color={colors.white}
                  bg="rgba(255,255,255,0.15)"
                  badge={item.badge}
                />
              ))}
            </View>
          )}
        </View>
        {children}
      </LinearGradient>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSListItem — Standard list row
// ═══════════════════════════════════════════════════════════════════════

interface DSListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  leftIconBg?: string;
  rightText?: string;
  showChevron?: boolean;
  onPress?: () => void;
  badge?: number;
  style?: ViewStyle;
}

export const DSListItem = memo<DSListItemProps>(
  ({
    title,
    subtitle,
    leftIcon,
    leftIconColor,
    leftIconBg,
    rightText,
    showChevron = true,
    onPress,
    badge,
    style,
  }) => {
    const { colors, spacing, text: textStyles, radius } = useDS();

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
            gap: spacing.lg,
          },
          style,
        ]}
      >
        {leftIcon && (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.md,
              backgroundColor: leftIconBg || colors.primaryBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name={leftIcon}
              size={20}
              color={leftIconColor || colors.primary}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={[textStyles.bodyMedium, { color: colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                textStyles.small,
                { color: colors.textSecondary, marginTop: 2 },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {rightText && (
          <Text style={[textStyles.small, { color: colors.textSecondary }]}>
            {rightText}
          </Text>
        )}
        {badge !== undefined && badge > 0 && <DSBadge count={badge} />}
        {showChevron && onPress && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textTertiary}
          />
        )}
      </TouchableOpacity>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSSearchBar
// ═══════════════════════════════════════════════════════════════════════

interface DSSearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  onSubmit?: () => void;
  editable?: boolean;
  style?: ViewStyle;
}

export const DSSearchBar = memo<DSSearchBarProps>(
  ({
    placeholder = "Tìm kiếm...",
    value,
    onChangeText,
    onPress,
    onSubmit,
    editable = true,
    style,
  }) => {
    const { colors, radius, spacing, text: textStyles } = useDS();

    const content = (
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.bgInput,
            borderRadius: radius.full,
            paddingHorizontal: spacing.xl,
            height: DS.layout.searchHeight,
            gap: spacing.md,
            borderWidth: 1,
            borderColor: colors.borderLight,
          },
          style,
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        {editable ? (
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmit}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            style={[textStyles.body, { flex: 1, color: colors.text }]}
            returnKeyType="search"
          />
        ) : (
          <Text
            style={[textStyles.body, { flex: 1, color: colors.textTertiary }]}
          >
            {placeholder}
          </Text>
        )}
      </View>
    );

    if (onPress && !editable) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSScreenLayout — Standard screen wrapper
// ═══════════════════════════════════════════════════════════════════════

interface DSScreenLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  headerRight?: ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  bg?: string;
  footer?: ReactNode;
  style?: ViewStyle;
}

export const DSScreenLayout = memo<DSScreenLayoutProps>(
  ({
    children,
    title,
    showBack = true,
    headerRight,
    scrollable = true,
    padding = true,
    refreshing,
    onRefresh,
    bg,
    footer,
    style,
  }) => {
    const insets = useSafeAreaInsets();
    const { colors, spacing, text: textStyles, radius } = useDS();

    return (
      <View style={[{ flex: 1, backgroundColor: bg || colors.bg }, style]}>
        {/* Header */}
        {title && (
          <View
            style={{
              paddingTop: insets.top + spacing.md,
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing.lg,
              backgroundColor: colors.bgSurface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.lg,
            }}
          >
            {showBack && (
              <TouchableOpacity
                onPress={() => router.canGoBack() && router.back()}
                hitSlop={8}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            <Text
              style={[textStyles.h3, { color: colors.text, flex: 1 }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {headerRight}
          </View>
        )}

        {/* Content */}
        {scrollable ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              { flexGrow: 1 },
              padding && {
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.xl,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View
            style={[
              { flex: 1 },
              padding && {
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.xl,
              },
            ]}
          >
            {children}
          </View>
        )}

        {/* Footer */}
        {footer && (
          <View
            style={{
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
              backgroundColor: colors.bgSurface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            {footer}
          </View>
        )}
      </View>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSProductCard — E-commerce product card
// ═══════════════════════════════════════════════════════════════════════

interface DSProductCardProps {
  image: string;
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  rating?: number;
  sold?: number;
  badge?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const DSProductCard = memo<DSProductCardProps>(
  ({
    image,
    title,
    price,
    originalPrice,
    discount,
    rating,
    sold,
    badge,
    onPress,
    style,
  }) => {
    const { colors, radius, spacing, shadow, text: textStyles } = useDS();

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          {
            width: DS.layout.productCardWidth,
            backgroundColor: colors.card,
            borderRadius: radius.md,
            overflow: "hidden",
            ...shadow.xs,
          },
          style,
        ]}
      >
        {/* Image */}
        <View
          style={{
            width: "100%",
            aspectRatio: 1,
            backgroundColor: colors.bgMuted,
          }}
        >
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {badge && (
            <View
              style={{
                position: "absolute",
                top: spacing.md,
                left: 0,
                backgroundColor: colors.accent,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xxs,
                borderTopRightRadius: radius.xs,
                borderBottomRightRadius: radius.xs,
              }}
            >
              <Text style={[textStyles.badge, { color: colors.white }]}>
                {badge}
              </Text>
            </View>
          )}
          {discount && (
            <View
              style={{
                position: "absolute",
                top: spacing.md,
                right: spacing.md,
                backgroundColor: colors.accent,
                borderRadius: radius.xs,
                paddingHorizontal: spacing.xs,
                paddingVertical: spacing.xxs,
              }}
            >
              <Text style={[textStyles.badge, { color: colors.white }]}>
                -{discount}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ padding: spacing.md }}>
          <Text
            style={[textStyles.small, { color: colors.text }]}
            numberOfLines={2}
          >
            {title}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: spacing.xs,
              gap: spacing.xs,
            }}
          >
            <Text style={[textStyles.bodySemibold, { color: colors.accent }]}>
              {price}
            </Text>
            {originalPrice && (
              <Text
                style={[
                  textStyles.caption,
                  {
                    color: colors.textTertiary,
                    textDecorationLine: "line-through",
                  },
                ]}
              >
                {originalPrice}
              </Text>
            )}
          </View>

          {(rating !== undefined || sold !== undefined) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: spacing.xs,
                gap: spacing.xs,
              }}
            >
              {rating !== undefined && (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
                >
                  <Ionicons name="star" size={10} color={colors.gold} />
                  <Text
                    style={[textStyles.badge, { color: colors.textSecondary }]}
                  >
                    {rating.toFixed(1)}
                  </Text>
                </View>
              )}
              {sold !== undefined && (
                <Text
                  style={[textStyles.badge, { color: colors.textTertiary }]}
                >
                  Đã bán {sold > 1000 ? `${(sold / 1000).toFixed(1)}k` : sold}
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

// ═══════════════════════════════════════════════════════════════════════
// DSHorizontalGrid — Scrollable 2-row grid (like home sections)
// ═══════════════════════════════════════════════════════════════════════

interface DSHorizontalGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => ReactNode;
  columns?: number;
  rows?: number;
}

export function DSHorizontalGrid<T extends { id: string | number }>({
  data,
  renderItem,
  columns = 4,
  rows = 2,
}: DSHorizontalGridProps<T>) {
  const pageSize = columns * rows;
  const pages: T[][] = [];

  for (let i = 0; i < data.length; i += pageSize) {
    pages.push(data.slice(i, i + pageSize));
  }

  const pageWidth = DS.screen.width - DS.spacing.xl * 2;

  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
      {pages.map((pageItems, pageIndex) => (
        <View
          key={pageIndex}
          style={{
            width: pageWidth,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {pageItems.map((item, idx) =>
            renderItem(item, pageIndex * pageSize + idx),
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DSTag — Simple tag/label
// ═══════════════════════════════════════════════════════════════════════

interface DSTagProps {
  label: string;
  color?: string;
  bg?: string;
}

export const DSTag = memo<DSTagProps>(({ label, color, bg }) => {
  const { colors, radius, spacing, text: textStyles } = useDS();
  return (
    <View
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xxs,
        borderRadius: radius.xs,
        backgroundColor: bg || colors.primaryBg,
      }}
    >
      <Text style={[textStyles.badge, { color: color || colors.primary }]}>
        {label}
      </Text>
    </View>
  );
});
