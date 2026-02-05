/**
 * AI Hub Screen
 * Trung tâm tất cả tính năng AI của ứng dụng
 * Created: 19/01/2026
 */

import AISearchBar from "@/components/ai/AISearchBar";
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { aiRouterService, type AIFeature } from "@/services/aiRouterService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ==================== CATEGORY CONFIG ====================

const CATEGORY_CONFIG: Record<
  string,
  {
    icon: string;
    color: string;
    gradient: [string, string];
    label: string;
    description: string;
  }
> = {
  assistant: {
    icon: "chatbubbles",
    color: "#6366f1",
    gradient: ["#6366f1", "#818cf8"],
    label: "Trợ lý AI",
    description: "Chat với AI thông minh",
  },
  design: {
    icon: "color-palette",
    color: "#ec4899",
    gradient: ["#ec4899", "#f472b6"],
    label: "Thiết kế",
    description: "AI hỗ trợ thiết kế nội thất",
  },
  construction: {
    icon: "construct",
    color: "#f59e0b",
    gradient: ["#f59e0b", "#fbbf24"],
    label: "Thi công",
    description: "Kiểm tra và theo dõi thi công",
  },
  analysis: {
    icon: "analytics",
    color: "#10b981",
    gradient: ["#10b981", "#34d399"],
    label: "Phân tích",
    description: "Phân tích chi phí và tiến độ",
  },
  tools: {
    icon: "build",
    color: "#06b6d4",
    gradient: ["#06b6d4", "#22d3ee"],
    label: "Công cụ",
    description: "Máy tính và tiện ích",
  },
  search: {
    icon: "search",
    color: "#8b5cf6",
    gradient: ["#8b5cf6", "#a78bfa"],
    label: "Tìm kiếm",
    description: "Tìm kiếm thông minh",
  },
};

// ==================== COMPONENTS ====================

interface FeatureItemProps {
  feature: AIFeature;
  onPress: () => void;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature, onPress }) => {
  const categoryConfig = CATEGORY_CONFIG[feature.category];

  return (
    <TouchableOpacity
      style={styles.featureItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.featureIcon,
          { backgroundColor: categoryConfig.color + "15" },
        ]}
      >
        <Ionicons
          name={feature.icon as any}
          size={22}
          color={categoryConfig.color}
        />
      </View>
      <View style={styles.featureInfo}>
        <Text style={styles.featureName}>{feature.nameVi}</Text>
        <Text style={styles.featureDescription} numberOfLines={1}>
          {feature.description}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={MODERN_COLORS.textSecondary}
      />
    </TouchableOpacity>
  );
};

interface CategorySectionProps {
  categoryId: string;
  features: AIFeature[];
  onFeaturePress: (feature: AIFeature) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryId,
  features,
  onFeaturePress,
}) => {
  const config = CATEGORY_CONFIG[categoryId];
  const [expanded, setExpanded] = useState(true);

  return (
    <View style={styles.categorySection}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={[styles.categoryIcon, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={18} color="#fff" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryLabel}>{config.label}</Text>
          <Text style={styles.categoryCount}>{features.length} tính năng</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={MODERN_COLORS.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.categoryFeatures}>
          {features.map((feature) => (
            <FeatureItem
              key={feature.id}
              feature={feature}
              onPress={() => onFeaturePress(feature)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// ==================== MAIN SCREEN ====================

export default function AIHubScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);

  // Group features by category
  const featuresByCategory = useMemo(() => {
    const allFeatures = aiRouterService.getAllFeatures();
    return Object.keys(CATEGORY_CONFIG)
      .map((categoryId) => ({
        categoryId,
        features: allFeatures.filter((f) => f.category === categoryId),
      }))
      .filter((group) => group.features.length > 0);
  }, []);

  // Quick stats
  const stats = useMemo(
    () => ({
      totalFeatures: aiRouterService.getAllFeatures().length,
      categories: Object.keys(CATEGORY_CONFIG).length,
    }),
    [],
  );

  // Handlers
  const handleFeaturePress = useCallback((feature: AIFeature) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(feature.route as any);
  }, []);

  const handleSearchPress = useCallback((query?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (query) {
      router.push(`/unified-search?q=${encodeURIComponent(query)}` as any);
    } else {
      router.push("/unified-search" as any);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={MODERN_COLORS.textPrimary}
          />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <LinearGradient
            colors={["#6366f1", "#8b5cf6"]}
            style={styles.headerIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={16} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerText}>AI Hub</Text>
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={MODERN_COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* AI Search Bar */}
        <View style={styles.searchSection}>
          <AISearchBar
            onPress={handleSearchPress}
            placeholder="Hỏi AI: thiết kế phòng khách, chi phí xây nhà..."
            showHints={true}
          />
        </View>

        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <LinearGradient
            colors={["#6366f1", "#8b5cf6", "#a855f7"]}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.statsContent}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalFeatures}</Text>
                <Text style={styles.statLabel}>Tính năng AI</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.categories}</Text>
                <Text style={styles.statLabel}>Danh mục</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>Hỗ trợ</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Truy cập nhanh</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickActionsScroll}
          >
            <View style={styles.quickActionsRow}>
              {aiRouterService.getPopularFeatures(6).map((feature) => (
                <TouchableOpacity
                  key={feature.id}
                  style={styles.quickActionCard}
                  onPress={() => handleFeaturePress(feature)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      CATEGORY_CONFIG[feature.category]?.gradient || [
                        "#6366f1",
                        "#818cf8",
                      ]
                    }
                    style={styles.quickActionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name={feature.icon as any}
                      size={24}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text style={styles.quickActionLabel} numberOfLines={2}>
                    {feature.nameVi}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* All Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>📂 Tất cả tính năng</Text>
          {featuresByCategory.map(({ categoryId, features }) => (
            <CategorySection
              key={categoryId}
              categoryId={categoryId}
              features={features}
              onFeaturePress={handleFeaturePress}
            />
          ))}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: MODERN_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  infoButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: MODERN_SPACING.md,
  },
  statsBanner: {
    marginHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.md,
  },
  statsGradient: {
    padding: MODERN_SPACING.md,
  },
  statsContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.md,
  },
  quickActionsSection: {
    paddingVertical: MODERN_SPACING.lg,
  },
  quickActionsScroll: {
    paddingLeft: MODERN_SPACING.md,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: MODERN_SPACING.md,
    paddingRight: MODERN_SPACING.md,
  },
  quickActionCard: {
    alignItems: "center",
    width: 80,
  },
  quickActionGradient: {
    width: 56,
    height: 56,
    borderRadius: MODERN_RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.xs,
    ...MODERN_SHADOWS.sm,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: MODERN_COLORS.textPrimary,
    textAlign: "center",
    lineHeight: 14,
  },
  categoriesSection: {
    paddingVertical: MODERN_SPACING.md,
  },
  categorySection: {
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
    ...MODERN_SHADOWS.sm,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: MODERN_SPACING.md,
    gap: MODERN_SPACING.md,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  categoryCount: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 1,
  },
  categoryFeatures: {
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: MODERN_SPACING.md,
    gap: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureInfo: {
    flex: 1,
  },
  featureName: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.textPrimary,
  },
  featureDescription: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
});
