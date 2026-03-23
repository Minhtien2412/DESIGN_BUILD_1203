/**
 * HomeHeader — Role-aware header for home screens
 * Shows greeting, role badge, and switcher trigger.
 *
 * @created 2026-03-21
 */

import { ROLE_THEME, ROLES, type AppRole } from "@/constants/roleTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  role: AppRole;
  userName?: string;
  notifCount?: number;
  onRoleSwitcherPress: () => void;
  onNotificationPress?: () => void;
  onSearchPress?: () => void;
}

export function HomeHeader({
  role,
  userName = "Bạn",
  notifCount = 0,
  onRoleSwitcherPress,
  onNotificationPress,
  onSearchPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const meta = ROLES[role];

  return (
    <View style={[s.container, { paddingTop: insets.top + 8 }]}>
      <View style={s.topRow}>
        {/* Role badge / switcher trigger */}
        <TouchableOpacity
          style={[s.roleBadge, { backgroundColor: meta.accentLight }]}
          onPress={onRoleSwitcherPress}
          activeOpacity={0.7}
        >
          <Ionicons name={meta.icon as any} size={16} color={meta.accent} />
          <Text style={[s.roleBadgeText, { color: meta.accent }]}>
            {meta.shortLabel}
          </Text>
          <Ionicons name="chevron-down" size={14} color={meta.accent} />
        </TouchableOpacity>

        {/* Right actions */}
        <View style={s.actions}>
          {onSearchPress && (
            <TouchableOpacity style={s.actionBtn} onPress={onSearchPress}>
              <Ionicons
                name="search-outline"
                size={22}
                color={ROLE_THEME.textPrimary}
              />
            </TouchableOpacity>
          )}
          {onNotificationPress && (
            <TouchableOpacity style={s.actionBtn} onPress={onNotificationPress}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={ROLE_THEME.textPrimary}
              />
              {notifCount > 0 && (
                <View style={s.notifBadge}>
                  <Text style={s.notifBadgeText}>
                    {notifCount > 99 ? "99+" : notifCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Greeting */}
      <Text style={s.greeting}>Xin chào, {userName}! 👋</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: ROLE_THEME.bg,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: ROLE_THEME.borderLight,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: ROLE_THEME.radius.full,
  },
  roleBadgeText: {
    fontSize: ROLE_THEME.fontSize.sm,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ROLE_THEME.bgSoft,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  greeting: {
    fontSize: ROLE_THEME.fontSize.title,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
  },
});
