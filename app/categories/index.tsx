/**
 * Categories Hub Screen — Modern Design
 * Hiển thị tất cả danh mục chính của ứng dụng
 * @updated 2025-06-12
 */

import { CATEGORIES, getTotalModuleCount } from "@/constants/categories";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

const CATEGORY_GRADIENTS: Record<string, [string, string]> = {
  "new-features": ["#4F46E5", "#7C3AED"],
  construction: ["#0F172A", "#334155"],
  communication: ["#0D9488", "#06B6D4"],
  documents: ["#475569", "#64748B"],
  procurement: ["#0D9488", "#14B8A6"],
  contracts: ["#6D28D9", "#8B5CF6"],
  safety: ["#DC2626", "#F43F5E"],
  reports: ["#0F766E", "#0D9488"],
  media: ["#D97706", "#F59E0B"],
  utilities: ["#059669", "#10B981"],
};

export default function CategoriesHubScreen() {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const totalModules = useMemo(() => getTotalModuleCount(), []);

  const handleCategoryPress = useCallback((categoryId: string) => {
    router.push(`/categories/${categoryId}` as any);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F766E" />

      <Stack.Screen options={{ headerShown: false }} />

      {/* Gradient Header */}
      <LinearGradient
        colors={["#0F766E", "#115E59", "#0D9488"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Danh mục</Text>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => router.push("/search" as any)}
          >
            <Ionicons name="search-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Ionicons name="apps" size={14} color="#C5CAE9" />
            <Text style={styles.statText}>{CATEGORIES.length} danh mục</Text>
          </View>
          <View style={styles.statPill}>
            <Ionicons name="flash" size={14} color="#FFAB40" />
            <Text style={styles.statText}>{totalModules}+ chức năng</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0D9488"
          />
        }
      >
        {/* Featured Banner */}
        <TouchableOpacity
          style={styles.featuredBanner}
          onPress={() => router.push("/utilities/sitemap" as any)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#0F766E", "#14B8A6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredGradient}
          >
            <View style={styles.featuredLeft}>
              <View style={styles.featuredIconBox}>
                <Ionicons name="grid" size={26} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.featuredTitle}>
                  Khám phá tất cả tiện ích
                </Text>
                <Text style={styles.featuredSubtitle}>
                  {totalModules}+ công cụ chuyên nghiệp cho xây dựng
                </Text>
              </View>
            </View>
            <View style={styles.featuredArrow}>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories Grid */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Danh mục chính</Text>
            <Text style={styles.sectionSubtitle}>{CATEGORIES.length} nhóm</Text>
          </View>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => {
              const gradient = CATEGORY_GRADIENTS[category.id] || [
                category.color,
                category.color + "CC",
              ];
              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.categoryIconBox}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={styles.categoryLabel} numberOfLines={2}>
                    {category.label}
                  </Text>
                  <Text style={styles.categoryDescription} numberOfLines={2}>
                    {category.description}
                  </Text>
                  <View style={styles.categoryFooter}>
                    <View style={styles.moduleBadge}>
                      <Text style={styles.moduleBadgeText}>
                        {category.modules.length} chức năng
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color="#94A3B8"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.quickAccessSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Truy cập nhanh</Text>
            <Ionicons name="flash" size={16} color="#F59E0B" />
          </View>
          <View style={styles.quickAccessGrid}>
            {QUICK_ACCESS_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.quickAccessItem}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.75}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickAccessIcon}
                >
                  <Ionicons name={item.icon as any} size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.quickAccessLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trust Section */}
        <View style={styles.trustSection}>
          <LinearGradient
            colors={["#EEF2FF", "#E0E7FF"]}
            style={styles.trustCard}
          >
            <Ionicons name="shield-checkmark" size={28} color="#4338CA" />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.trustTitle}>Nền tảng xây dựng #1</Text>
              <Text style={styles.trustSubtitle}>
                Quản lý toàn diện dự án xây dựng từ A-Z
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const QUICK_ACCESS_ITEMS = [
  {
    id: 1,
    label: "Thiết kế",
    icon: "home-outline" as const,
    route: "/services/house-design",
    gradient: ["#4F46E5", "#7C3AED"] as [string, string],
  },
  {
    id: 2,
    label: "Thi công",
    icon: "construct-outline" as const,
    route: "/construction/progress",
    gradient: ["#0F172A", "#334155"] as [string, string],
  },
  {
    id: 3,
    label: "Vật liệu",
    icon: "cube-outline" as const,
    route: "/materials/index",
    gradient: ["#0D9488", "#14B8A6"] as [string, string],
  },
  {
    id: 4,
    label: "Hoàn thiện",
    icon: "color-fill-outline" as const,
    route: "/finishing/index",
    gradient: ["#0D9488", "#06B6D4"] as [string, string],
  },
  {
    id: 5,
    label: "Báo cáo",
    icon: "newspaper-outline" as const,
    route: "/reports/index",
    gradient: ["#0F766E", "#0D9488"] as [string, string],
  },
  {
    id: 6,
    label: "AI",
    icon: "sparkles" as const,
    route: "/ai",
    gradient: ["#D97706", "#F59E0B"] as [string, string],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },
  headerGradient: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E8EAF6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  featuredBanner: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#0F766E",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  featuredGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  featuredLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  featuredIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.3,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 3,
  },
  featuredArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  categoryDescription: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
    marginBottom: 10,
  },
  categoryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moduleBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4338CA",
  },
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAccessItem: {
    width: (width - 48 - 12) / 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  quickAccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickAccessLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },
  trustSection: {
    marginBottom: 16,
  },
  trustCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#312E81",
    marginBottom: 2,
  },
  trustSubtitle: {
    fontSize: 12,
    color: "#6366F1",
  },
});
