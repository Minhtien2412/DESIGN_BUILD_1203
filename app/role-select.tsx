/**
 * Role Selection Screen — 4 roles: Thợ, KS/KTS, Nhà thầu, Khách hàng
 *
 * Bright, modern card-based selection. Lime green accent.
 * Shown on first app launch or when role is cleared.
 *
 * @created 2026-03-05
 * @updated 2026-03-21 — Expanded from 2 roles to 4 roles
 */

import {
    type AppRole,
    ROLE_LIST,
    ROLE_THEME,
    type RoleMeta,
} from "@/constants/roleTheme";
import { useRole } from "@/context/RoleContext";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW } = Dimensions.get("window");
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = (SW - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const { setRole } = useRole();
  const [selected, setSelected] = useState<AppRole>("customer");

  const handleContinue = async () => {
    await setRole(selected);
    router.replace("/(tabs)" as Href);
  };

  const renderRoleCard = (roleMeta: RoleMeta) => {
    const isActive = selected === roleMeta.key;
    return (
      <TouchableOpacity
        key={roleMeta.key}
        style={[
          s.card,
          isActive && {
            borderColor: roleMeta.accent,
            backgroundColor: roleMeta.accentLight,
          },
        ]}
        onPress={() => setSelected(roleMeta.key)}
        activeOpacity={0.75}
      >
        {/* Icon circle */}
        <View
          style={[
            s.cardIcon,
            {
              backgroundColor: isActive ? roleMeta.accent : ROLE_THEME.bgMuted,
            },
          ]}
        >
          <Ionicons
            name={roleMeta.icon as any}
            size={28}
            color={isActive ? "#FFFFFF" : ROLE_THEME.textSecondary}
          />
        </View>

        {/* Label */}
        <Text style={[s.cardLabel, isActive && { color: roleMeta.accent }]}>
          {roleMeta.shortLabel}
        </Text>
        <Text style={s.cardDesc} numberOfLines={2}>
          {roleMeta.description}
        </Text>

        {/* Selected indicator */}
        {isActive ? (
          <View style={[s.selectedBadge, { backgroundColor: roleMeta.accent }]}>
            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            <Text style={s.selectedText}>Đã chọn</Text>
          </View>
        ) : (
          <View style={s.unselectedBadge}>
            <View style={s.emptyCircle} />
            <Text style={s.unselectedText}>Chọn</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top + 16 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={ROLE_THEME.bg} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.topIcon}>
            <Ionicons
              name="people-outline"
              size={32}
              color={ROLE_THEME.primary}
            />
          </View>
          <Text style={s.title}>Bạn là ai?</Text>
          <Text style={s.subtitle}>
            Chọn vai trò phù hợp để trải nghiệm giao diện riêng
          </Text>
        </View>

        {/* Role Card Grid (2×2) */}
        <View style={s.grid}>{ROLE_LIST.map(renderRoleCard)}</View>

        {/* Info note */}
        <View style={s.infoRow}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={ROLE_THEME.textMuted}
          />
          <Text style={s.infoText}>
            Bạn có thể đổi vai trò bất cứ lúc nào từ góc trên màn hình
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View
        style={[s.bottomArea, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        <TouchableOpacity
          style={s.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={s.continueTxt}>Tiếp tục</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ROLE_THEME.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 12,
  },
  topIcon: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: ROLE_THEME.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: ROLE_THEME.fontSize.heading,
    fontWeight: "800",
    color: ROLE_THEME.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: ROLE_THEME.fontSize.md,
    color: ROLE_THEME.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: ROLE_THEME.card,
    borderRadius: ROLE_THEME.radius.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: ROLE_THEME.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: ROLE_THEME.fontSize.xl,
    fontWeight: "700",
    color: ROLE_THEME.textPrimary,
    marginTop: 4,
  },
  cardDesc: {
    fontSize: ROLE_THEME.fontSize.sm,
    color: ROLE_THEME.textSecondary,
    lineHeight: 17,
  },
  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ROLE_THEME.radius.full,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  selectedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  unselectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ROLE_THEME.radius.full,
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: ROLE_THEME.bgMuted,
  },
  emptyCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: ROLE_THEME.border,
  },
  unselectedText: {
    fontSize: 11,
    fontWeight: "600",
    color: ROLE_THEME.textMuted,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    justifyContent: "center",
  },
  infoText: {
    fontSize: 12,
    color: ROLE_THEME.textMuted,
    flex: 1,
    textAlign: "center",
  },
  bottomArea: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: ROLE_THEME.borderLight,
    backgroundColor: ROLE_THEME.bg,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: ROLE_THEME.primary,
    width: "100%",
    paddingVertical: 16,
    borderRadius: ROLE_THEME.radius.full,
    shadowColor: ROLE_THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueTxt: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
