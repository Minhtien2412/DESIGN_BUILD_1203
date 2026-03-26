/**
 * Custom Tab Bar - Vua Tho style
 * 4 main tabs + centered AI button — role-aware labels & icons
 *
 * @updated 2026-03-21 — Role-aware tab config from constants/tabConfig
 */
import { DEFAULT_TABS, TAB_CONFIG } from "@/constants/tabConfig";
import { useRole } from "@/context/RoleContext";
import { useUnifiedBadge } from "@/context/UnifiedBadgeContext";
import { useI18n } from "@/services/i18nService";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useRef } from "react";
import {
    Animated,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FAB_SIZE = 62;
const ICON_SIZE = 21;
const TAB_HEIGHT = 62;

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export function CustomTabBar({
  state,
  descriptors: _descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { role } = useRole();

  // ── Role-aware tab config ──────────────────────────
  const TABS = useMemo(() => (role ? TAB_CONFIG[role] : DEFAULT_TABS), [role]);

  const scaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;
  const fabScaleAnim = useRef(new Animated.Value(1)).current;

  const { badges } = useUnifiedBadge();

  const getTabBadge = useCallback(
    (name: string): number => {
      switch (name) {
        case "communication":
          return badges.notifications + badges.messages + badges.missedCalls;
        case "profile":
          return badges.orders;
        default:
          return 0;
      }
    },
    [badges],
  );

  // ── Tab press with smooth bounce ─────────────────────
  const handleTabPress = useCallback(
    (routeIndex: number, cfgIdx: number) => {
      const route = state.routes[routeIndex];
      const isFocused = state.index === routeIndex;
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (isFocused || event.defaultPrevented) return;

      const idx = cfgIdx;
      if (idx !== -1 && scaleAnims[idx]) {
        Animated.sequence([
          Animated.spring(scaleAnims[idx], {
            toValue: 0.85,
            useNativeDriver: true,
            speed: 50,
            bounciness: 0,
          }),
          Animated.spring(scaleAnims[idx], {
            toValue: 1.05,
            useNativeDriver: true,
            speed: 40,
            bounciness: 4,
          }),
          Animated.spring(scaleAnims[idx], {
            toValue: 1,
            useNativeDriver: true,
            speed: 40,
            bounciness: 3,
          }),
        ]).start();
      }

      navigation.navigate(route.name, route.params);
    },
    [state.index, scaleAnims, navigation],
  );

  // ── FAB ───────────────────────────────────────────────
  const handleFabPress = useCallback(() => {
    Animated.sequence([
      Animated.spring(fabScaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        speed: 60,
      }),
      Animated.spring(fabScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 45,
        bounciness: 6,
      }),
    ]).start();
    navigation.navigate("ai-assistant");
  }, [fabScaleAnim, navigation]);

  // ── Render tab ────────────────────────────────────────
  const renderTab = (tab: (typeof TABS)[0], cfgIdx: number) => {
    const routeIdx = state.routes.findIndex((r) => r.name === tab.name);
    if (routeIdx === -1) return null;
    const isFocused = state.index === routeIdx;
    const badge = getTabBadge(tab.name);

    return (
      <Pressable
        key={tab.name}
        onPress={() => handleTabPress(routeIdx, cfgIdx)}
        style={s.tabBtn}
        android_ripple={{ color: "rgba(13,148,136,0.15)", borderless: true }}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={t(tab.label)}
        accessibilityState={{ selected: isFocused }}
      >
        <Animated.View
          style={[s.tabContent, { transform: [{ scale: scaleAnims[cfgIdx] }] }]}
        >
          {/* Active pill indicator at top */}
          {isFocused && <View style={s.activeIndicator} />}
          <View style={[s.iconWrap, isFocused && s.iconWrapActive]}>
            <Ionicons
              name={isFocused ? tab.activeIcon : tab.icon}
              size={ICON_SIZE}
              color={isFocused ? "#FFFFFF" : "#9CA3AF"}
            />
            {badge > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>{badge > 99 ? "99+" : badge}</Text>
              </View>
            )}
          </View>
          <Text
            style={[s.label, isFocused ? s.labelActive : s.labelInactive]}
            numberOfLines={1}
          >
            {t(tab.label)}
          </Text>
        </Animated.View>
      </Pressable>
    );
  };

  const bottomPadding = Platform.select({
    ios: insets.bottom > 0 ? insets.bottom : 8,
    android: Math.max(insets.bottom, 8),
    default: 8,
  });

  // ── Render ────────────────────────────────────────────
  return (
    <View style={[s.wrapper, { paddingBottom: bottomPadding }]}>
      {/* Tab bar background */}
      <View style={s.container}>
        <View style={s.tabsRow}>
          {TABS.slice(0, 2).map((t, i) => renderTab(t, i))}
          <View style={s.fabSpacer} />
          {TABS.slice(2).map((t, i) => renderTab(t, i + 2))}
        </View>
      </View>

      {/* Centered AI button */}
      <View style={s.fabWrapper} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleFabPress}
          style={s.fabTouch}
        >
          <Animated.View
            style={[s.fabShadow, { transform: [{ scale: fabScaleAnim }] }]}
          >
            <LinearGradient
              colors={["#3B82F6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.fab}
            >
              <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
        <Text style={s.aiLabel} pointerEvents="none">
          {t("tabs.aiAssistant")}
        </Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES — Clean, balanced, professional
// ═══════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  wrapper: {
    position: "relative",
    backgroundColor: "transparent",
  },
  container: {
    backgroundColor: "#0F172A",
    borderRadius: 32,
    marginHorizontal: 14,
    marginBottom: 4,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.2)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 16 },
    }),
  },
  tabsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    minHeight: TAB_HEIGHT,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: -9,
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#60A5FA",
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 32,
    borderRadius: 16,
    position: "relative",
  },
  iconWrapActive: {
    backgroundColor: "rgba(96,165,250,0.18)",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1.5,
    borderColor: "#0F172A",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 11,
    color: "#FFFFFF",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.1,
    marginTop: 1,
  },
  labelActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  labelInactive: {
    color: "#94A3B8",
  },
  fabSpacer: { width: FAB_SIZE + 18 },
  fabWrapper: {
    position: "absolute",
    top: -(FAB_SIZE / 2) + 4,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  fabTouch: { width: FAB_SIZE, height: FAB_SIZE },
  fabShadow: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    ...Platform.select({
      ios: {
        shadowColor: "#38BDF8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
    }),
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#0F172A",
  },
  aiLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#93C5FD",
  },
});

export default CustomTabBar;
