/**
 * Custom Tab Bar - Modern Gradient Design
 * Phong cách Shopee/Zalo với gradient đẹp, animation mượt mà
 * Features:
 * - Gradient background matching MainHeader
 * - Large icons (26px) with smooth scale animations
 * - Floating center FAB button with glow effect
 * - Active tab indicator with pill background
 * - Badge notifications from UnifiedBadgeContext
 * - 4 tabs only: Trang chủ | Cộng đồng | Dự án | Cá nhân
 * @updated 2025-01-15
 */
import { useUnifiedBadge } from "@/context/UnifiedBadgeContext";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuickActionSheet } from "./quick-action-sheet";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================================================
// THEME CONFIG (Matching MainHeader)
// ============================================================================
const COLORS = {
  // Gradient colors
  gradientStart: "#1a1a2e",
  gradientMiddle: "#16213e",
  gradientEnd: "#0f3460",

  // Tab colors
  activeTab: "#00D4FF",
  inactiveTab: "rgba(255,255,255,0.5)",
  activeTabBg: "rgba(0,212,255,0.15)",

  // FAB colors
  fabGradientStart: "#E94560",
  fabGradientEnd: "#7B2CBF",
  fabShadow: "#E94560",

  // Badge
  badgeBg: "#E94560",
  badgeText: "#FFFFFF",
  badgeBorder: "#16213e",

  // Others
  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.4)",
};

const SIZES = {
  tabBarHeight: 70,
  iconSize: 24,
  fabSize: 60,
  fabIconSize: 28,
  labelSize: 11,
  badgeSize: 18,
  activeIndicatorHeight: 3,
};

// ============================================================================
// TAB CONFIG
// ============================================================================
const TABS_CONFIG = [
  {
    name: "index",
    label: "Trang chủ",
    icon: "home-outline" as const,
    activeIcon: "home" as const,
  },
  {
    name: "shop",
    label: "Cửa hàng",
    icon: "storefront-outline" as const,
    activeIcon: "storefront" as const,
  },
  {
    name: "social",
    label: "Cộng đồng",
    icon: "people-outline" as const,
    activeIcon: "people" as const,
  },
  {
    name: "projects",
    label: "Dự án",
    icon: "briefcase-outline" as const,
    activeIcon: "briefcase" as const,
  },
  {
    name: "profile",
    label: "Cá nhân",
    icon: "person-outline" as const,
    activeIcon: "person" as const,
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState(false);

  // Animation refs
  const scaleAnims = useRef(
    TABS_CONFIG.map(() => new Animated.Value(1)),
  ).current;
  const fabScaleAnim = useRef(new Animated.Value(1)).current;
  const fabRotateAnim = useRef(new Animated.Value(0)).current;

  // Get badge counts from unified context
  const { badges } = useUnifiedBadge();

  // Calculate badge for each tab
  const getTabBadge = useCallback(
    (tabName: string): number => {
      switch (tabName) {
        case "social":
          return badges.messages + badges.missedCalls + badges.social;
        case "projects":
          return badges.projects + badges.tasks;
        case "profile":
          return badges.notifications + badges.orders;
        default:
          return 0;
      }
    },
    [badges],
  );

  // Tab press handler
  const handleTabPress = useCallback(
    (routeName: string, routeIndex: number) => {
      const isFocused = state.index === routeIndex;

      if (!isFocused) {
        // Find animation index
        const animIndex = TABS_CONFIG.findIndex(
          (tab) => tab.name === routeName,
        );

        if (animIndex !== -1 && scaleAnims[animIndex]) {
          // Bounce animation
          Animated.sequence([
            Animated.spring(scaleAnims[animIndex], {
              toValue: 0.8,
              useNativeDriver: true,
              speed: 50,
              bounciness: 0,
            }),
            Animated.spring(scaleAnims[animIndex], {
              toValue: 1.1,
              useNativeDriver: true,
              speed: 40,
              bounciness: 6,
            }),
            Animated.spring(scaleAnims[animIndex], {
              toValue: 1,
              useNativeDriver: true,
              speed: 40,
              bounciness: 4,
            }),
          ]).start();
        }

        navigation.navigate(routeName);
      }
    },
    [state.index, scaleAnims, navigation],
  );

  // FAB press handler
  const handleFabPress = useCallback(() => {
    // Animate FAB
    Animated.parallel([
      Animated.sequence([
        Animated.spring(fabScaleAnim, {
          toValue: 0.85,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(fabScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 6,
        }),
      ]),
      Animated.timing(fabRotateAnim, {
        toValue: sheetVisible ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSheetVisible(!sheetVisible);
  }, [fabScaleAnim, fabRotateAnim, sheetVisible]);

  // Action press handler
  const handleActionPress = useCallback(
    (actionId: string) => {
      setSheetVisible(false);
      switch (actionId) {
        case "cost-estimator":
          navigation.navigate("calculators/cost-estimator" as any);
          break;
        case "store-locator":
          navigation.navigate("contact" as any);
          break;
        case "schedule":
          navigation.navigate("booking" as any);
          break;
        case "quote-request":
          navigation.navigate("quote-request" as any);
          break;
        case "ai-assistant":
          navigation.navigate("ai-hub" as any);
          break;
        case "messages":
          navigation.navigate("messages" as any);
          break;
      }
    },
    [navigation],
  );

  // FAB rotation interpolation
  const fabRotation = fabRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  // Render badge
  const renderBadge = (count: number) => {
    if (count <= 0) return null;
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
      </View>
    );
  };

  // Render single tab
  const renderTab = (tab: (typeof TABS_CONFIG)[0], configIndex: number) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
    const isFocused = state.index === routeIndex;
    const route = state.routes[routeIndex];
    const badgeCount = getTabBadge(tab.name);

    if (routeIndex === -1) return null;

    return (
      <Pressable
        key={tab.name}
        onPress={() => handleTabPress(route.name, routeIndex)}
        style={styles.tabButton}
        android_ripple={{
          color: "rgba(0, 212, 255, 0.2)",
          borderless: true,
        }}
        accessibilityRole="button"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: isFocused }}
      >
        <Animated.View
          style={[
            styles.tabContent,
            { transform: [{ scale: scaleAnims[configIndex] }] },
          ]}
        >
          {/* Active Indicator */}
          {isFocused && <View style={styles.activeIndicator} />}

          {/* Icon Container */}
          <View
            style={[
              styles.iconContainer,
              isFocused && styles.iconContainerActive,
            ]}
          >
            <Ionicons
              name={isFocused ? tab.activeIcon : tab.icon}
              size={SIZES.iconSize}
              color={isFocused ? COLORS.activeTab : COLORS.inactiveTab}
            />
            {renderBadge(badgeCount)}
          </View>

          {/* Label */}
          <Text
            style={[styles.label, isFocused && styles.labelActive]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* Main Tab Bar */}
      <LinearGradient
        colors={[
          COLORS.gradientStart,
          COLORS.gradientMiddle,
          COLORS.gradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            paddingBottom: Platform.select({
              ios: insets.bottom > 0 ? insets.bottom : 12,
              android: Math.max(insets.bottom, 12),
              default: 12,
            }),
          },
        ]}
      >
        {/* Top Glow Line */}
        <View style={styles.topGlow} />

        <View style={styles.tabsContainer}>
          {/* Left tabs (Home, Shop) */}
          {TABS_CONFIG.slice(0, 2).map((tab, index) => renderTab(tab, index))}

          {/* Center FAB Spacer */}
          <View style={styles.fabSpacer} />

          {/* Right tabs (Social, Projects, Profile) */}
          {TABS_CONFIG.slice(2).map((tab, index) => renderTab(tab, index + 2))}
        </View>
      </LinearGradient>

      {/* Floating Action Button */}
      <View style={styles.fabWrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFabPress}
          style={styles.fabTouchable}
        >
          <Animated.View
            style={[styles.fabShadow, { transform: [{ scale: fabScaleAnim }] }]}
          >
            <LinearGradient
              colors={[COLORS.fabGradientStart, COLORS.fabGradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fab}
            >
              <Animated.View style={{ transform: [{ rotate: fabRotation }] }}>
                <Ionicons
                  name="add"
                  size={SIZES.fabIconSize}
                  color={COLORS.white}
                />
              </Animated.View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Quick Action Sheet */}
      <QuickActionSheet
        visible={sheetVisible}
        onClose={() => {
          setSheetVisible(false);
          Animated.timing(fabRotateAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }}
        onActionPress={handleActionPress}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  container: {
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0,212,255,0.3)",
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    minHeight: 56,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -10,
    width: 24,
    height: SIZES.activeIndicatorHeight,
    backgroundColor: COLORS.activeTab,
    borderRadius: SIZES.activeIndicatorHeight / 2,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 32,
    borderRadius: 16,
    position: "relative",
  },
  iconContainerActive: {
    backgroundColor: COLORS.activeTabBg,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -8,
    minWidth: SIZES.badgeSize,
    height: SIZES.badgeSize,
    borderRadius: SIZES.badgeSize / 2,
    backgroundColor: COLORS.badgeBg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.badgeBorder,
  },
  badgeText: {
    color: COLORS.badgeText,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 12,
  },
  label: {
    fontSize: SIZES.labelSize,
    color: COLORS.inactiveTab,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  labelActive: {
    color: COLORS.activeTab,
    fontWeight: "600",
  },

  // FAB Spacer
  fabSpacer: {
    width: SIZES.fabSize + 20,
  },

  // Floating Action Button
  fabWrapper: {
    position: "absolute",
    top: -SIZES.fabSize / 2 + 4,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fabTouchable: {
    width: SIZES.fabSize,
    height: SIZES.fabSize,
  },
  fabShadow: {
    width: SIZES.fabSize,
    height: SIZES.fabSize,
    borderRadius: SIZES.fabSize / 2,
    shadowColor: COLORS.fabShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  fab: {
    width: SIZES.fabSize,
    height: SIZES.fabSize,
    borderRadius: SIZES.fabSize / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
});

export default CustomTabBar;
