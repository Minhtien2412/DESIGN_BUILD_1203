/**
 * AI Command Center
 * Trung tâm điều khiển AI - Tìm kiếm và truy cập nhanh tất cả tính năng AI
 * Created: 19/01/2026
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import {
    aiRouterService,
    type AIFeature,
    type AIRouterResult,
} from "@/services/aiRouterService";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ==================== TYPES ====================

interface AICommandCenterProps {
  visible: boolean;
  onClose: () => void;
  initialQuery?: string;
}

// ==================== CATEGORY ICONS & COLORS ====================

const CATEGORY_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  assistant: { icon: "chatbubbles", color: "#6366f1", label: "Trợ lý" },
  design: { icon: "color-palette", color: "#ec4899", label: "Thiết kế" },
  construction: { icon: "construct", color: "#f59e0b", label: "Thi công" },
  analysis: { icon: "analytics", color: "#10b981", label: "Phân tích" },
  tools: { icon: "build", color: "#06b6d4", label: "Công cụ" },
  search: { icon: "search", color: "#8b5cf6", label: "Tìm kiếm" },
};

// ==================== COMPONENTS ====================

interface FeatureCardProps {
  feature: AIFeature;
  onPress: () => void;
  compact?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  onPress,
  compact,
}) => {
  const categoryConfig =
    CATEGORY_CONFIG[feature.category] || CATEGORY_CONFIG.assistant;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactCard}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.compactIconContainer,
            { backgroundColor: categoryConfig.color + "20" },
          ]}
        >
          <Ionicons
            name={feature.icon as any}
            size={20}
            color={categoryConfig.color}
          />
        </View>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {feature.nameVi}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[categoryConfig.color + "15", categoryConfig.color + "05"]}
        style={styles.featureGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={[
            styles.featureIconContainer,
            { backgroundColor: categoryConfig.color },
          ]}
        >
          <Ionicons name={feature.icon as any} size={24} color="#fff" />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{feature.nameVi}</Text>
          <Text style={styles.featureDescription} numberOfLines={2}>
            {feature.description}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={MODERN_COLORS.textSecondary}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

interface QuickActionProps {
  action: {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    route: string;
    color: string;
  };
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ action, onPress }) => (
  <TouchableOpacity
    style={styles.quickAction}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
      <Ionicons name={action.icon as any} size={22} color="#fff" />
    </View>
    <Text style={styles.quickActionTitle} numberOfLines={1}>
      {action.title}
    </Text>
    <Text style={styles.quickActionSubtitle} numberOfLines={1}>
      {action.subtitle}
    </Text>
  </TouchableOpacity>
);

// ==================== MAIN COMPONENT ====================

export default function AICommandCenter({
  visible,
  onClose,
  initialQuery,
}: AICommandCenterProps) {
  // State
  const [query, setQuery] = useState(initialQuery || "");
  const [isSearching, setIsSearching] = useState(false);
  const [routerResult, setRouterResult] = useState<AIRouterResult | null>(null);
  const [searchResults, setSearchResults] = useState<AIFeature[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Refs
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  // Memoized data
  const quickActions = useMemo(() => aiRouterService.getQuickActions(), []);
  const popularFeatures = useMemo(
    () => aiRouterService.getPopularFeatures(8),
    []
  );

  // Animation
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();

      // Focus input after animation
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(100);
      setQuery("");
      setRouterResult(null);
      setSearchResults([]);
      setShowResults(false);
    }
  }, [visible]);

  // Search handler
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setRouterResult(null);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      // Quick local search first
      const localResults = aiRouterService.searchFeatures(searchQuery);
      setSearchResults(localResults);

      // Then AI-powered routing
      const result = await aiRouterService.routeQuery(searchQuery);
      setRouterResult(result);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Navigate to feature
  const handleNavigate = useCallback(
    (route: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Keyboard.dismiss();
      onClose();
      setTimeout(() => router.push(route as any), 100);
    },
    [onClose]
  );

  // Handle AI result action
  const handleResultAction = useCallback(() => {
    if (routerResult?.feature && routerResult.action === "navigate") {
      handleNavigate(routerResult.feature.route);
    }
  }, [routerResult, handleNavigate]);

  // Render AI response card
  const renderAIResponse = () => {
    if (!routerResult) return null;

    return (
      <View style={styles.aiResponseCard}>
        <View style={styles.aiResponseHeader}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
          <Text style={styles.aiResponseLabel}>AI Gợi ý</Text>
          {isSearching && (
            <ActivityIndicator size="small" color={MODERN_COLORS.primary} />
          )}
        </View>
        <Text style={styles.aiResponseText}>{routerResult.response}</Text>

        {routerResult.feature && routerResult.action === "navigate" && (
          <TouchableOpacity
            style={styles.aiActionButton}
            onPress={handleResultAction}
          >
            <Ionicons
              name={routerResult.feature.icon as any}
              size={18}
              color="#fff"
            />
            <Text style={styles.aiActionText}>
              Mở {routerResult.feature.nameVi}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}

        {routerResult.alternatives.length > 0 && (
          <View style={styles.alternativesContainer}>
            <Text style={styles.alternativesLabel}>Có thể bạn cũng muốn:</Text>
            <View style={styles.alternativesList}>
              {routerResult.alternatives.map((alt) => (
                <TouchableOpacity
                  key={alt.id}
                  style={styles.alternativeChip}
                  onPress={() => handleNavigate(alt.route)}
                >
                  <Ionicons
                    name={alt.icon as any}
                    size={14}
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.alternativeText}>{alt.nameVi}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render search results
  const renderSearchResults = () => {
    if (!showResults || searchResults.length === 0) return null;

    return (
      <View style={styles.searchResultsContainer}>
        <Text style={styles.sectionTitle}>Kết quả tìm kiếm</Text>
        {searchResults.slice(0, 5).map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onPress={() => handleNavigate(feature.route)}
          />
        ))}
      </View>
    );
  };

  // Render quick actions grid
  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>⚡ Truy cập nhanh</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <QuickAction
            key={action.id}
            action={action}
            onPress={() => handleNavigate(action.route)}
          />
        ))}
      </View>
    </View>
  );

  // Render popular features
  const renderPopularFeatures = () => (
    <View style={styles.popularContainer}>
      <Text style={styles.sectionTitle}>🔥 Phổ biến</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.popularList}>
          {popularFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onPress={() => handleNavigate(feature.route)}
              compact
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Render categories
  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>📂 Danh mục AI</Text>
      <View style={styles.categoriesGrid}>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const features = aiRouterService.getFeaturesByCategory(key as any);
          return (
            <TouchableOpacity
              key={key}
              style={styles.categoryCard}
              onPress={() => {
                // Navigate to first feature of category
                if (features.length > 0) {
                  handleNavigate(features[0].route);
                }
              }}
            >
              <View
                style={[styles.categoryIcon, { backgroundColor: config.color }]}
              >
                <Ionicons name={config.icon as any} size={20} color="#fff" />
              </View>
              <Text style={styles.categoryLabel}>{config.label}</Text>
              <Text style={styles.categoryCount}>
                {features.length} tính năng
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoid}
      >
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragIndicator} />
            <View style={styles.headerContent}>
              <View style={styles.aiTitleContainer}>
                <LinearGradient
                  colors={["#6366f1", "#8b5cf6"]}
                  style={styles.aiTitleIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" />
                </LinearGradient>
                <Text style={styles.headerTitle}>AI Command Center</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={MODERN_COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInput}>
              <Ionicons
                name="search"
                size={20}
                color={MODERN_COLORS.textSecondary}
              />
              <TextInput
                ref={inputRef}
                style={styles.searchTextInput}
                placeholder="Tìm kiếm tính năng AI... (vd: phong thủy, chi phí, thiết kế)"
                placeholderTextColor={MODERN_COLORS.textSecondary}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(query)}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={MODERN_COLORS.textSecondary}
                  />
                </TouchableOpacity>
              )}
              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={MODERN_COLORS.primary}
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* AI Response */}
            {renderAIResponse()}

            {/* Search Results */}
            {renderSearchResults()}

            {/* Show default content when no search */}
            {!showResults && (
              <>
                {renderQuickActions()}
                {renderPopularFeatures()}
                {renderCategories()}
              </>
            )}

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: MODERN_COLORS.background,
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    maxHeight: SCREEN_HEIGHT * 0.9,
    ...MODERN_SHADOWS.lg,
  },
  header: {
    alignItems: "center",
    paddingTop: MODERN_SPACING.sm,
    paddingBottom: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: MODERN_COLORS.border,
    borderRadius: 2,
    marginBottom: MODERN_SPACING.sm,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: MODERN_SPACING.md,
  },
  aiTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  aiTitleIcon: {
    width: 32,
    height: 32,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    height: 48,
    gap: MODERN_SPACING.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 15,
    color: MODERN_COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
  },
  aiResponseCard: {
    margin: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary + "30",
  },
  aiResponseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.sm,
  },
  aiIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  aiResponseLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
    flex: 1,
  },
  aiResponseText: {
    fontSize: 14,
    color: MODERN_COLORS.textPrimary,
    lineHeight: 20,
  },
  aiActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingVertical: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    marginTop: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  aiActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  alternativesContainer: {
    marginTop: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.md,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },
  alternativesLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
  },
  alternativesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.xs,
  },
  alternativeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary + "10",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: 6,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
  },
  alternativeText: {
    fontSize: 12,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },
  searchResultsContainer: {
    paddingVertical: MODERN_SPACING.sm,
  },
  featureCard: {
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
  },
  featureGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: MODERN_SPACING.md,
    gap: MODERN_SPACING.md,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    lineHeight: 16,
  },
  compactCard: {
    alignItems: "center",
    marginRight: MODERN_SPACING.md,
    width: 80,
  },
  compactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  compactTitle: {
    fontSize: 11,
    fontWeight: "500",
    color: MODERN_COLORS.textPrimary,
    textAlign: "center",
  },
  quickActionsContainer: {
    paddingVertical: MODERN_SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  quickAction: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm * 2) / 3,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.sm,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    textAlign: "center",
    marginTop: 2,
  },
  popularContainer: {
    paddingVertical: MODERN_SPACING.md,
  },
  popularList: {
    flexDirection: "row",
    paddingHorizontal: MODERN_SPACING.md,
  },
  categoriesContainer: {
    paddingVertical: MODERN_SPACING.md,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    alignItems: "center",
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  categoryCount: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
});
