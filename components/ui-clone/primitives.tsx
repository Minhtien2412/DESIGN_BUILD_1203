import { uiCloneLayout, uiCloneTheme } from "@/constants/uiCloneTheme";
import { navMock } from "@/data/uiCloneMock";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import {
    GestureResponderEvent,
    Image,
    ImageSourcePropType,
    Pressable,
    PressableStateCallbackType,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewProps,
    ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const t = uiCloneTheme;

function buttonPressedStyle(state: PressableStateCallbackType): ViewStyle {
  return {
    opacity: state.pressed ? 0.9 : 1,
    transform: [{ scale: state.pressed ? 0.995 : 1 }],
  };
}

export function ScreenContainer({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={[styles.safe, style]} edges={["top", "left", "right"]}>
      {children}
    </SafeAreaView>
  );
}

export function ScreenScroll({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
      <View style={{ height: 18 }} />
    </ScrollView>
  );
}

export function AppHeader({
  title,
  subtitle,
  showBack = true,
  rightIcons,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcons?: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: (event: GestureResponderEvent) => void;
  }>;
}) {
  const router = useRouter();

  return (
    <View style={styles.headerRoot}>
      {showBack ? (
        <Pressable style={styles.headerIconBtn} onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={t.iconSize.md}
            color={t.colors.textPrimary}
          />
        </Pressable>
      ) : (
        <View style={styles.headerIconSlot} />
      )}

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.headerSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.headerRightGroup}>
        {rightIcons?.length ? (
          rightIcons.map((item, idx) => (
            <Pressable
              key={`${item.icon}-${idx}`}
              style={styles.headerIconBtn}
              onPress={item.onPress}
            >
              <Ionicons
                name={item.icon}
                size={t.iconSize.md}
                color={t.colors.textSecondary}
              />
            </Pressable>
          ))
        ) : (
          <View style={styles.headerIconSlot} />
        )}
      </View>
    </View>
  );
}

export function SectionHeading({
  title,
  step,
  actionLabel,
  actionColor,
}: {
  title: string;
  step?: string | number;
  actionLabel?: string;
  actionColor?: string;
}) {
  return (
    <View style={styles.sectionHeadingRow}>
      <View style={styles.sectionHeadingLeft}>
        {step !== undefined ? (
          <View style={styles.sectionStepBadge}>
            <Text style={styles.sectionStepText}>{step}</Text>
          </View>
        ) : null}
        <Text style={styles.sectionHeadingTitle}>{title}</Text>
      </View>
      {actionLabel ? (
        <Text
          style={[
            styles.sectionAction,
            actionColor ? { color: actionColor } : null,
          ]}
        >
          {actionLabel}
        </Text>
      ) : null}
    </View>
  );
}

export function BaseCard({
  children,
  style,
  shadow = "sm",
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  shadow?: keyof typeof uiCloneTheme.shadows;
}) {
  return (
    <View style={[styles.cardBase, uiCloneTheme.shadows[shadow], style]}>
      {children}
    </View>
  );
}

export function SoftBadge({
  label,
  tone = "brand",
}: {
  label: string;
  tone?: "brand" | "success" | "warning" | "neutral";
}) {
  const toneMap = {
    brand: {
      bg: t.colors.brandSoft,
      fg: t.colors.brandDark,
      bd: t.colors.borderBrand,
    },
    success: { bg: t.colors.successSoft, fg: t.colors.success, bd: "#CFECCE" },
    warning: { bg: t.colors.warningSoft, fg: t.colors.warning, bd: "#FBE3B0" },
    neutral: {
      bg: t.colors.neutralSoft,
      fg: t.colors.textSecondary,
      bd: t.colors.borderMuted,
    },
  };

  return (
    <View
      style={[
        styles.badgeBase,
        { backgroundColor: toneMap[tone].bg, borderColor: toneMap[tone].bd },
      ]}
    >
      <Text style={[styles.badgeLabel, { color: toneMap[tone].fg }]}>
        {label}
      </Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  leftIcon,
  onPress,
  style,
}: {
  label: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={(s) => [styles.primaryBtn, style, buttonPressedStyle(s)]}
    >
      {leftIcon ? (
        <Ionicons
          name={leftIcon}
          size={t.iconSize.sm}
          color={t.colors.textOnBrand}
        />
      ) : null}
      <Text style={styles.primaryBtnLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  leftIcon,
  onPress,
  style,
}: {
  label: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={(s) => [styles.secondaryBtn, style, buttonPressedStyle(s)]}
    >
      {leftIcon ? (
        <Ionicons
          name={leftIcon}
          size={t.iconSize.sm}
          color={t.colors.textSecondary}
        />
      ) : null}
      <Text style={styles.secondaryBtnLabel}>{label}</Text>
    </Pressable>
  );
}

export function InfoRow({
  label,
  value,
  valueColor,
  borderBottom = true,
}: {
  label: string;
  value: string;
  valueColor?: string;
  borderBottom?: boolean;
}) {
  return (
    <View
      style={[styles.infoRow, !borderBottom ? { borderBottomWidth: 0 } : null]}
    >
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, valueColor ? { color: valueColor } : null]}
      >
        {value}
      </Text>
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

export function TabPill({
  label,
  active,
  trailing,
}: {
  label: string;
  active?: boolean;
  trailing?: string;
}) {
  return (
    <View style={[styles.tabPill, active ? styles.tabPillActive : null]}>
      <Text
        style={[styles.tabPillText, active ? styles.tabPillTextActive : null]}
      >
        {label}
      </Text>
      {trailing ? (
        <Text
          style={[
            styles.tabPillTrailing,
            active ? styles.tabPillTextActive : null,
          ]}
        >
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}

export function PriceText({
  value,
  tone = "brand",
  size = "md",
}: {
  value: string;
  tone?: "brand" | "normal" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const fontSizeMap = {
    sm: 15,
    md: 21,
    lg: 31,
  };

  const colorMap = {
    brand: t.colors.brandStrong,
    normal: t.colors.textPrimary,
    danger: t.colors.danger,
  };

  return (
    <Text
      style={[
        styles.priceText,
        { color: colorMap[tone], fontSize: fontSizeMap[size] },
      ]}
    >
      {value}
    </Text>
  );
}

export function EmptyQR({
  label,
  subLabel,
  dashed = false,
}: {
  label?: string;
  subLabel?: string;
  dashed?: boolean;
}) {
  return (
    <View style={[styles.qrWrap, dashed ? styles.qrWrapDashed : null]}>
      <Ionicons
        name="qr-code-outline"
        size={t.iconSize.xxl}
        color={t.colors.textTertiary}
      />
      {label ? <Text style={styles.qrLabel}>{label}</Text> : null}
      {subLabel ? <Text style={styles.qrSubLabel}>{subLabel}</Text> : null}
    </View>
  );
}

export function BottomNav({
  activeKey,
  items,
}: {
  activeKey: string;
  items?: typeof navMock.bottomItems;
}) {
  const navItems = items ?? navMock.bottomItems;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.bottomSafe}>
      <View style={styles.bottomNavRoot}>
        {navItems.map((item) => {
          const active = item.key === activeKey;
          return (
            <View key={item.key} style={styles.bottomNavItem}>
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={t.iconSize.md}
                color={active ? t.colors.brandStrong : t.colors.textTertiary}
              />
              <Text
                style={[
                  styles.bottomNavLabel,
                  active ? styles.bottomNavLabelActive : null,
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export function StickyActionBar({
  left,
  right,
  style,
}: {
  left?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView edges={["bottom"]} style={[styles.stickySafe, style]}>
      <View style={styles.stickyRoot}>
        <View style={styles.stickyLeft}>{left}</View>
        <View style={styles.stickyRight}>{right}</View>
      </View>
    </SafeAreaView>
  );
}

export function AvatarCircle({
  source,
  icon,
  size = 62,
}: {
  source?: ImageSourcePropType;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.avatarCircle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Ionicons
          name={icon ?? "person-outline"}
          size={Math.max(18, size * 0.36)}
          color={t.colors.brandStrong}
        />
      )}
    </View>
  );
}

export function Surface({
  children,
  style,
  ...rest
}: ViewProps & { children: ReactNode }) {
  return (
    <View {...rest} style={[styles.surface, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: t.colors.bgCanvas,
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: uiCloneLayout.screenHorizontalPadding,
    paddingTop: t.spacing.s4,
    paddingBottom: t.spacing.s8,
    gap: uiCloneLayout.sectionGap,
  },

  headerRoot: {
    minHeight: t.dimensions.headerHeight,
    borderRadius: t.radius.r6,
    backgroundColor: t.colors.bgHeader,
    borderWidth: 1,
    borderColor: t.colors.borderSoft,
    paddingHorizontal: t.spacing.s6,
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s4,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: t.radius.rPill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.bgSurfaceSoft,
    borderWidth: 1,
    borderColor: t.colors.borderSoft,
  },
  headerIconSlot: {
    width: 34,
    height: 34,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
  },
  headerSubtitle: {
    ...t.typography.caption,
    color: t.colors.textSecondary,
    marginTop: 1,
  },
  headerRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s3,
  },

  sectionHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.spacing.s4,
  },
  sectionHeadingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s4,
    flex: 1,
  },
  sectionStepBadge: {
    width: t.dimensions.sectionBadgeSize,
    height: t.dimensions.sectionBadgeSize,
    borderRadius: t.radius.r3,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.colors.brand,
  },
  sectionStepText: {
    ...t.typography.caption,
    color: t.colors.textOnBrand,
    fontWeight: "700",
  },
  sectionHeadingTitle: {
    ...t.typography.titleSm,
    color: t.colors.textPrimary,
    flexShrink: 1,
  },
  sectionAction: {
    ...t.typography.bodySm,
    color: t.colors.brandStrong,
    fontWeight: "700",
  },

  cardBase: {
    backgroundColor: t.colors.bgSurface,
    borderRadius: t.radius.r7,
    borderWidth: 1,
    borderColor: t.colors.borderSoft,
    padding: uiCloneLayout.cardPadding,
    minHeight: t.dimensions.cardMinHeight,
  },

  badgeBase: {
    borderRadius: t.radius.rPill,
    borderWidth: 1,
    paddingHorizontal: t.spacing.s5,
    paddingVertical: t.spacing.s2,
    alignSelf: "flex-start",
  },
  badgeLabel: {
    ...t.typography.caption,
    fontWeight: "700",
  },

  primaryBtn: {
    minHeight: t.dimensions.buttonHeightLg,
    borderRadius: t.radius.r6,
    backgroundColor: t.colors.brand,
    borderWidth: 1,
    borderColor: t.colors.brandStrong,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: t.spacing.s3,
    paddingHorizontal: t.spacing.s8,
  },
  primaryBtnLabel: {
    ...t.typography.bodyLg,
    color: t.colors.textOnBrand,
    fontWeight: "800",
  },
  secondaryBtn: {
    minHeight: t.dimensions.buttonHeightLg,
    borderRadius: t.radius.r6,
    backgroundColor: t.colors.bgSurface,
    borderWidth: 1,
    borderColor: t.colors.borderMuted,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: t.spacing.s3,
    paddingHorizontal: t.spacing.s8,
  },
  secondaryBtnLabel: {
    ...t.typography.bodyLg,
    color: t.colors.textSecondary,
    fontWeight: "700",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: t.spacing.s4,
    paddingVertical: t.spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderSoft,
  },
  infoLabel: {
    ...t.typography.bodyMd,
    color: t.colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    ...t.typography.bodyMd,
    color: t.colors.textPrimary,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: t.colors.borderSoft,
    marginVertical: t.spacing.s4,
  },

  tabPill: {
    minHeight: t.dimensions.buttonHeightSm,
    borderRadius: t.radius.rPill,
    borderWidth: 1,
    borderColor: t.colors.borderMuted,
    backgroundColor: t.colors.bgSurface,
    paddingHorizontal: t.spacing.s6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: t.spacing.s2,
  },
  tabPillActive: {
    backgroundColor: t.colors.brand,
    borderColor: t.colors.brandStrong,
  },
  tabPillText: {
    ...t.typography.label,
    color: t.colors.textSecondary,
  },
  tabPillTextActive: {
    color: t.colors.textOnBrand,
  },
  tabPillTrailing: {
    ...t.typography.label,
  },

  priceText: {
    ...t.typography.price,
  },

  qrWrap: {
    minHeight: 102,
    borderRadius: t.radius.r5,
    borderWidth: 1,
    borderColor: t.colors.borderMuted,
    backgroundColor: t.colors.bgSurfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    padding: t.spacing.s5,
    gap: t.spacing.s2,
  },
  qrWrapDashed: {
    borderStyle: "dashed",
    borderColor: t.colors.borderBrand,
    backgroundColor: t.colors.bgSurface,
  },
  qrLabel: {
    ...t.typography.bodySm,
    color: t.colors.textSecondary,
    fontWeight: "700",
    textAlign: "center",
  },
  qrSubLabel: {
    ...t.typography.caption,
    color: t.colors.textTertiary,
  },

  bottomSafe: {
    backgroundColor: t.colors.bgSurface,
  },
  bottomNavRoot: {
    height: t.dimensions.bottomNavHeight,
    borderTopWidth: 1,
    borderTopColor: t.colors.borderSoft,
    backgroundColor: t.colors.bgSurface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: t.spacing.s6,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: t.spacing.s1,
  },
  bottomNavLabel: {
    ...t.typography.caption,
    color: t.colors.textTertiary,
  },
  bottomNavLabelActive: {
    color: t.colors.brandStrong,
    fontWeight: "700",
  },

  stickySafe: {
    backgroundColor: t.colors.bgSurface,
  },
  stickyRoot: {
    minHeight: t.dimensions.stickyActionHeight,
    borderTopWidth: 1,
    borderTopColor: t.colors.borderSoft,
    backgroundColor: t.colors.bgSurface,
    paddingHorizontal: t.spacing.s8,
    paddingVertical: t.spacing.s6,
    flexDirection: "row",
    alignItems: "center",
    gap: t.spacing.s6,
  },
  stickyLeft: {
    flex: 1,
  },
  stickyRight: {
    flex: 1.4,
  },

  avatarCircle: {
    backgroundColor: t.colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.colors.borderBrand,
    overflow: "hidden",
  },

  surface: {
    backgroundColor: t.colors.bgSurface,
  },
});
