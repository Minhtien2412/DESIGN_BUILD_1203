/**
 * Profile Tab Screen — Role-Based
 *
 * Renders differently for: customer, worker, architect, engineer, supervisor, admin.
 * Uses features/profile/* architecture for config, types, and components.
 *
 * Data sources:
 * - AuthContext: user identity, role, auth state
 * - RoleContext: AppRole (khach/tho)
 * - ProfileContext: full profile, stats, points, ratings
 * - FavoritesContext: favorite count
 */

import { useAuth } from "@/context/AuthContext";
import { useRole } from "@/context/RoleContext";
import {
    CompletionChecklist,
    GreetingHeader,
    ProfileHeroCard,
    QuickActionsRow,
    SettingsList,
    StatCardsGrid,
    VerificationBadge,
} from "@/features/profile/components";
import {
    buildCompletionState,
    buildGreeting,
    getQuickActions,
    getSettingsSections,
    getStatCards,
    getVerificationState,
    resolveEffectiveRole,
    ROLE_CONFIGS,
} from "@/features/profile/profileConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileTabScreen() {
  const { user, signOut } = useAuth();
  const { role: appRole } = useRole();

  // Resolve effective role from all sources
  const effectiveRole = useMemo(
    () => resolveEffectiveRole(user, appRole),
    [user, appRole],
  );

  const config = ROLE_CONFIGS[effectiveRole];

  // Build all role-specific data
  const greeting = useMemo(
    () => buildGreeting(user, effectiveRole),
    [user, effectiveRole],
  );

  const verification = useMemo(
    () => getVerificationState(user, null), // null profile → safe fallback
    [user],
  );

  const stats = useMemo(
    () => getStatCards(effectiveRole, null),
    [effectiveRole],
  );

  const quickActions = useMemo(
    () => getQuickActions(effectiveRole),
    [effectiveRole],
  );

  const completion = useMemo(
    () => buildCompletionState(effectiveRole, user, null),
    [effectiveRole, user],
  );

  const settingsSections = useMemo(
    () => getSettingsSections(effectiveRole),
    [effectiveRole],
  );

  return (
    <LinearGradient colors={config.gradient} style={styles.bg}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* ── Greeting ── */}
          <GreetingHeader greeting={greeting} />

          {/* ── Profile Hero Card ── */}
          <ProfileHeroCard
            name={user?.name || user?.email?.split("@")[0] || "Người dùng"}
            phone={user?.phone}
            email={user?.email}
            avatarUri={user?.avatar}
            config={config}
            verification={verification}
            onEditPress={() => router.push("/profile/info" as any)}
          />

          {/* ── Quick Actions ── */}
          <QuickActionsRow actions={quickActions} />

          {/* ── Completion Checklist (workers + professionals) ── */}
          {config.requiresCompletion && (
            <CompletionChecklist
              completion={completion}
              accentColor={config.accentColor}
            />
          )}

          {/* ── KPI Stats ── */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              {effectiveRole === "customer" ? "Tổng quan" : "Thống kê"}
            </Text>
            <StatCardsGrid stats={stats} />
          </View>

          {/* ── Verification (expanded for workers) ── */}
          {effectiveRole !== "customer" && effectiveRole !== "admin" && (
            <VerificationBadge verification={verification} />
          )}

          {/* ── Customer: Referral Card ── */}
          {effectiveRole === "customer" && (
            <View style={styles.referralCard}>
              <View style={styles.referralHeader}>
                <Ionicons name="gift-outline" size={20} color="#22D3EE" />
                <Text style={styles.referralTitle}>
                  Giới thiệu bạn bè nhận ưu đãi
                </Text>
              </View>
              <Text style={styles.referralDesc}>
                Chia sẻ mã giới thiệu để nhận điểm thưởng cho mỗi đơn dịch vụ
                thành công.
              </Text>
              <Pressable
                style={styles.referralBtn}
                onPress={() => router.push("/profile/rewards" as any)}
              >
                <Ionicons name="share-outline" size={14} color="#F0F9FF" />
                <Text style={styles.referralBtnText}>Mời bạn ngay</Text>
              </Pressable>
            </View>
          )}

          {/* ── Customer: Quick Menu ── */}
          {effectiveRole === "customer" && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Tiện ích</Text>
              <View style={styles.menuList}>
                {CUSTOMER_MENU.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.menuItem}
                    onPress={() => router.push(item.route as any)}
                  >
                    <View
                      style={[
                        styles.menuIcon,
                        { backgroundColor: item.color + "18" },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={17}
                        color={item.color}
                      />
                    </View>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color="#475569"
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ── Settings (role-aware) ── */}
          <SettingsList sections={settingsSections} onLogout={signOut} />

          {/* Version */}
          <Text style={styles.versionText}>
            BaoTienWeb v2.0 • Phiên bản đầy đủ
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ═══════════════════════════════════════════════════════════════
// Customer-specific utilities menu
// ═══════════════════════════════════════════════════════════════

const CUSTOMER_MENU = [
  {
    id: "payment-history",
    title: "Lịch sử giao dịch",
    icon: "time-outline",
    color: "#60A5FA",
    route: "/profile/payment-history",
  },
  {
    id: "favorites",
    title: "Thợ yêu thích",
    icon: "heart-outline",
    color: "#F87171",
    route: "/profile/favorites",
  },
  {
    id: "history",
    title: "Lịch sử xem",
    icon: "eye-outline",
    color: "#A78BFA",
    route: "/profile/history",
  },
  {
    id: "payment-methods",
    title: "Phương thức thanh toán",
    icon: "card-outline",
    color: "#34D399",
    route: "/profile/payment-methods",
  },
  {
    id: "addresses",
    title: "Địa chỉ đã lưu",
    icon: "location-outline",
    color: "#FB923C",
    route: "/profile/addresses",
  },
];

// ═══════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 130,
    gap: 14,
  },
  sectionCard: {
    backgroundColor: "rgba(15,23,42,0.68)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.15)",
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  sectionTitle: {
    color: "#E2E8F0",
    fontWeight: "700",
    fontSize: 15,
  },
  referralCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(34,211,238,0.30)",
    backgroundColor: "rgba(6,182,212,0.10)",
    padding: 16,
    gap: 8,
  },
  referralHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  referralTitle: {
    color: "#E0F2FE",
    fontWeight: "700",
    fontSize: 15,
  },
  referralDesc: {
    color: "#BAE6FD",
    lineHeight: 18,
    fontSize: 12,
  },
  referralBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0EA5E9",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  referralBtnText: {
    color: "#F0F9FF",
    fontWeight: "700",
    fontSize: 13,
  },
  menuList: {
    gap: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuTitle: {
    flex: 1,
    color: "#E2E8F0",
    fontWeight: "600",
    fontSize: 14,
  },
  versionText: {
    color: "#475569",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
});
