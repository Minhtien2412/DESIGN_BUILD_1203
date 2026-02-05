/**
 * Construction Estimate Calculator - Trang chính dự toán xây dựng
 * Comprehensive construction cost estimation tools with CRUD
 */
import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import {
    changeEstimateStatus,
    deleteEstimate,
    duplicateEstimate,
    EstimateItem,
    EstimateStatus,
    formatEstimateCurrency,
    formatEstimateDate,
    getAllEstimates,
    getEstimatesStats,
    getEstimateTypeEmoji,
    getEstimateTypeLabel,
    searchEstimates,
} from "@/services/estimateService";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Calculator categories
const CALCULATOR_CATEGORIES = [
  {
    id: "total-estimate",
    title: "Dự toán Tổng hợp",
    subtitle: "Chi phí xây dựng toàn bộ ngôi nhà",
    emoji: "🏠",
    color: "#22c55e",
    bgColor: "#dcfce7",
    route: "/calculators/total-estimate",
    isPrimary: true,
  },
  {
    id: "structure",
    title: "Xây thô & Kết cấu",
    subtitle: "Móng, cột, dầm, sàn, mái",
    emoji: "🧱",
    color: "#f97316",
    bgColor: "#ffedd5",
    route: "/calculators/structure",
  },
  {
    id: "materials",
    title: "Vật liệu chi tiết",
    subtitle: "Gạch, xi măng, cát, sắt thép",
    emoji: "📦",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    route: "/calculators/materials",
  },
  {
    id: "finishing",
    title: "Hoàn thiện",
    subtitle: "Sơn, trát, ốp lát, điện nước",
    emoji: "✨",
    color: "#ec4899",
    bgColor: "#fce7f3",
    route: "/calculators/finishing",
  },
  {
    id: "mep",
    title: "Điện - Nước - PCCC",
    subtitle: "Hệ thống M&E hoàn chỉnh",
    emoji: "⚡",
    color: "#0ea5e9",
    bgColor: "#e0f2fe",
    route: "/calculators/mep",
  },
  {
    id: "interior",
    title: "Nội thất",
    subtitle: "Tủ, bàn, ghế, giường, đèn",
    emoji: "🛋️",
    color: "#14b8a6",
    bgColor: "#ccfbf1",
    route: "/calculators/interior-estimate",
  },
];

// Quick calculators
const QUICK_CALCULATORS = [
  {
    id: "paint",
    title: "Sơn",
    emoji: "🎨",
    color: "#e74c3c",
    route: "/calculators/paint",
  },
  {
    id: "tiles",
    title: "Gạch",
    emoji: "🧱",
    color: "#f39c12",
    route: "/calculators/tiles",
  },
  {
    id: "electrical",
    title: "Điện",
    emoji: "⚡",
    color: "#3498db",
    route: "/calculators/electrical",
  },
  {
    id: "plumbing",
    title: "Nước",
    emoji: "💧",
    color: "#1abc9c",
    route: "/calculators/plumbing",
  },
  {
    id: "concrete",
    title: "Bê tông",
    emoji: "🏗️",
    color: "#6b7280",
    route: "/calculators/concrete",
  },
  {
    id: "steel",
    title: "Thép",
    emoji: "🔩",
    color: "#374151",
    route: "/calculators/steel",
  },
];

// Tips
const TIPS = [
  { icon: "bulb-outline", text: "Luôn thêm 10-15% dự phòng khi tính vật liệu" },
  {
    icon: "shield-checkmark-outline",
    text: "Kiểm tra chất lượng vật liệu trước khi thi công",
  },
  {
    icon: "people-outline",
    text: "Tham khảo ý kiến chuyên gia và so sánh giá",
  },
  {
    icon: "calendar-outline",
    text: "Lên kế hoạch mua vật liệu theo tiến độ công trình",
  },
];

export default function CalculatorsIndexScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"calculators" | "saved">(
    "calculators",
  );

  // Saved estimates state
  const [savedEstimates, setSavedEstimates] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<EstimateStatus | "all">(
    "all",
  );
  const [stats, setStats] = useState<{
    total: number;
    draft: number;
    completed: number;
    totalValue: number;
  } | null>(null);

  // Selected estimate for actions
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateItem | null>(
    null,
  );
  const [showActionModal, setShowActionModal] = useState(false);

  // Load saved estimates
  const loadEstimates = useCallback(async () => {
    try {
      setLoading(true);
      const [estimates, statsData] = await Promise.all([
        searchQuery ? searchEstimates(searchQuery) : getAllEstimates(),
        getEstimatesStats(),
      ]);

      // Filter by status if needed
      const filtered =
        filterStatus === "all"
          ? estimates
          : estimates.filter((e) => e.status === filterStatus);

      setSavedEstimates(filtered);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading estimates:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filterStatus]);

  // Reload when screen focused
  useFocusEffect(
    useCallback(() => {
      loadEstimates();
    }, [loadEstimates]),
  );

  const handleBack = useCallback(() => router.back(), []);

  const handleCategoryPress = useCallback((route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as never);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadEstimates();
  }, [loadEstimates]);

  // Open estimate for editing
  const handleOpenEstimate = useCallback((estimate: EstimateItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to the appropriate calculator with estimate ID
    const routeMap: Record<string, string> = {
      total: "/calculators/total-estimate",
      structure: "/calculators/structure",
      materials: "/calculators/materials",
      finishing: "/calculators/finishing",
      mep: "/calculators/mep",
      interior: "/calculators/interior-estimate",
      concrete: "/calculators/concrete",
      steel: "/calculators/steel",
      paint: "/calculators/paint",
    };

    const route = routeMap[estimate.type] || "/calculators/total-estimate";
    router.push(`${route}?estimateId=${estimate.id}` as never);
  }, []);

  // Show action modal
  const handleShowActions = useCallback((estimate: EstimateItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEstimate(estimate);
    setShowActionModal(true);
  }, []);

  // Delete estimate
  const handleDeleteEstimate = useCallback(async () => {
    if (!selectedEstimate) return;

    Alert.alert(
      "Xóa dự toán",
      `Bạn có chắc muốn xóa "${selectedEstimate.name}"?\n\nHành động này không thể hoàn tác.`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEstimate(selectedEstimate.id);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              setShowActionModal(false);
              setSelectedEstimate(null);
              loadEstimates();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa dự toán");
            }
          },
        },
      ],
    );
  }, [selectedEstimate, loadEstimates]);

  // Duplicate estimate
  const handleDuplicateEstimate = useCallback(async () => {
    if (!selectedEstimate) return;

    try {
      await duplicateEstimate(selectedEstimate.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowActionModal(false);
      setSelectedEstimate(null);
      loadEstimates();
      Alert.alert("Thành công", "Đã tạo bản sao dự toán");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo bản sao");
    }
  }, [selectedEstimate, loadEstimates]);

  // Change status
  const handleChangeStatus = useCallback(
    async (status: EstimateStatus) => {
      if (!selectedEstimate) return;

      try {
        await changeEstimateStatus(selectedEstimate.id, status);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowActionModal(false);
        setSelectedEstimate(null);
        loadEstimates();
      } catch (error) {
        Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
      }
    },
    [selectedEstimate, loadEstimates],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>🧮 Tiện ích Dự toán</Text>
          <Text style={styles.headerSubtitle}>
            Công cụ tính toán chi phí xây dựng
          </Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons
            name="settings-outline"
            size={22}
            color={MODERN_COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "calculators" && styles.tabActive]}
          onPress={() => setActiveTab("calculators")}
        >
          <Ionicons
            name="calculator-outline"
            size={18}
            color={
              activeTab === "calculators"
                ? MODERN_COLORS.primary
                : MODERN_COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "calculators" && styles.tabTextActive,
            ]}
          >
            Công cụ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "saved" && styles.tabActive]}
          onPress={() => setActiveTab("saved")}
        >
          <Ionicons
            name="bookmark-outline"
            size={18}
            color={
              activeTab === "saved"
                ? MODERN_COLORS.primary
                : MODERN_COLORS.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "saved" && styles.tabTextActive,
            ]}
          >
            Đã lưu
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "calculators" ? (
          <>
            {/* Primary Calculator - Total Estimate */}
            <TouchableOpacity
              style={styles.primaryCard}
              onPress={() => handleCategoryPress("/calculators/total-estimate")}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#22c55e", "#16a34a"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryGradient}
              >
                <View style={styles.primaryLeft}>
                  <View style={styles.primaryIconBox}>
                    <Text style={styles.primaryEmoji}>🏠</Text>
                  </View>
                  <View style={styles.primaryInfo}>
                    <Text style={styles.primaryTitle}>Dự toán Tổng hợp</Text>
                    <Text style={styles.primarySubtitle}>
                      Tính toán chi phí xây dựng toàn bộ ngôi nhà
                    </Text>
                  </View>
                </View>
                <View style={styles.primaryArrow}>
                  <Ionicons name="arrow-forward" size={24} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Calculator Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dự toán theo hạng mục</Text>
              <View style={styles.categoriesGrid}>
                {CALCULATOR_CATEGORIES.slice(1).map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryCard}
                    onPress={() => handleCategoryPress(cat.route)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: cat.bgColor },
                      ]}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    </View>
                    <Text style={styles.categoryTitle}>{cat.title}</Text>
                    <Text style={styles.categorySubtitle}>{cat.subtitle}</Text>
                    <View
                      style={[
                        styles.categoryArrow,
                        { backgroundColor: cat.color },
                      ]}
                    >
                      <Ionicons name="chevron-forward" size={14} color="#fff" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick Calculators */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tính nhanh vật liệu</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickCalcList}
              >
                {QUICK_CALCULATORS.map((calc) => (
                  <TouchableOpacity
                    key={calc.id}
                    style={styles.quickCalcItem}
                    onPress={() => handleCategoryPress(calc.route)}
                  >
                    <View
                      style={[
                        styles.quickCalcIcon,
                        { backgroundColor: calc.color + "20" },
                      ]}
                    >
                      <Text style={styles.quickCalcEmoji}>{calc.emoji}</Text>
                    </View>
                    <Text style={styles.quickCalcTitle}>{calc.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Material Management */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.materialManageCard}
                onPress={() =>
                  handleCategoryPress("/calculators/material-management")
                }
                activeOpacity={0.8}
              >
                <View style={styles.materialManageLeft}>
                  <View style={styles.materialManageIcon}>
                    <Ionicons
                      name="cube-outline"
                      size={24}
                      color={MODERN_COLORS.textSecondary}
                    />
                  </View>
                  <View style={styles.materialManageInfo}>
                    <Text style={styles.materialManageTitle}>
                      Quản lý vật liệu
                    </Text>
                    <Text style={styles.materialManageSubtitle}>
                      Thêm, sửa, xóa vật liệu tùy chỉnh
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={MODERN_COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mẹo hay</Text>
              <View style={styles.tipsCard}>
                {TIPS.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons
                      name={tip.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={MODERN_COLORS.primary}
                    />
                    <Text style={styles.tipText}>{tip.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* Saved Estimates Tab */
          <ScrollView
            style={styles.flex1}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={MODERN_COLORS.primary}
              />
            }
          >
            {/* Stats Summary */}
            {stats && stats.total > 0 && (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Tổng cộng</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#f59e0b" }]}>
                    {stats.draft}
                  </Text>
                  <Text style={styles.statLabel}>Bản nháp</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#22c55e" }]}>
                    {stats.completed}
                  </Text>
                  <Text style={styles.statLabel}>Hoàn thành</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#3b82f6" }]}>
                    {formatEstimateCurrency(stats.totalValue)}
                  </Text>
                  <Text style={styles.statLabel}>Giá trị</Text>
                </View>
              </View>
            )}

            {/* Search & Filter */}
            <View style={styles.searchFilterRow}>
              <View style={styles.searchBox}>
                <Ionicons
                  name="search"
                  size={18}
                  color={MODERN_COLORS.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Tìm kiếm dự toán..."
                  placeholderTextColor={MODERN_COLORS.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={loadEstimates}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setSearchQuery("");
                      loadEstimates();
                    }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={MODERN_COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterTabs}
            >
              {[
                { key: "all", label: "Tất cả" },
                { key: "draft", label: "Bản nháp" },
                { key: "completed", label: "Hoàn thành" },
                { key: "archived", label: "Lưu trữ" },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.filterTab,
                    filterStatus === f.key && styles.filterTabActive,
                  ]}
                  onPress={() => {
                    setFilterStatus(f.key as EstimateStatus | "all");
                    loadEstimates();
                  }}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      filterStatus === f.key && styles.filterTabTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Estimates List */}
            <View style={styles.savedSection}>
              {loading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator
                    size="large"
                    color={MODERN_COLORS.primary}
                  />
                  <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
              ) : savedEstimates.length > 0 ? (
                savedEstimates.map((estimate) => (
                  <TouchableOpacity
                    key={estimate.id}
                    style={styles.savedCard}
                    onPress={() => handleOpenEstimate(estimate)}
                    onLongPress={() => handleShowActions(estimate)}
                  >
                    <View style={styles.savedLeft}>
                      <View
                        style={[
                          styles.savedIcon,
                          {
                            backgroundColor:
                              estimate.status === "completed"
                                ? "#dcfce7"
                                : estimate.status === "archived"
                                  ? "#f3f4f6"
                                  : "#fef3c7",
                          },
                        ]}
                      >
                        <Text style={styles.savedEmoji}>
                          {getEstimateTypeEmoji(estimate.type)}
                        </Text>
                      </View>
                      <View style={styles.savedInfo}>
                        <Text style={styles.savedName} numberOfLines={1}>
                          {estimate.name}
                        </Text>
                        <Text style={styles.savedType}>
                          {getEstimateTypeLabel(estimate.type)}
                        </Text>
                        <View style={styles.savedMeta}>
                          <Text style={styles.savedDate}>
                            #{estimate.localId} •{" "}
                            {formatEstimateDate(estimate.updatedAt)}
                          </Text>
                          {estimate.isSynced && (
                            <Ionicons
                              name="cloud-done"
                              size={12}
                              color="#22c55e"
                            />
                          )}
                        </View>
                      </View>
                    </View>
                    <View style={styles.savedRight}>
                      <Text style={styles.savedTotal}>
                        {formatEstimateCurrency(estimate.results.totalCost)}
                      </Text>
                      <View
                        style={[
                          styles.savedStatus,
                          estimate.status === "completed"
                            ? styles.savedStatusCompleted
                            : estimate.status === "archived"
                              ? styles.savedStatusArchived
                              : styles.savedStatusDraft,
                        ]}
                      >
                        <Text
                          style={[
                            styles.savedStatusText,
                            estimate.status === "completed"
                              ? styles.savedStatusTextCompleted
                              : estimate.status === "archived"
                                ? styles.savedStatusTextArchived
                                : styles.savedStatusTextDraft,
                          ]}
                        >
                          {estimate.status === "completed"
                            ? "Hoàn thành"
                            : estimate.status === "archived"
                              ? "Lưu trữ"
                              : "Bản nháp"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={() => handleShowActions(estimate)}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={18}
                          color={MODERN_COLORS.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="document-outline"
                    size={64}
                    color={MODERN_COLORS.textTertiary}
                  />
                  <Text style={styles.emptyTitle}>
                    {searchQuery
                      ? "Không tìm thấy dự toán"
                      : "Chưa có dự toán nào"}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery
                      ? "Thử tìm kiếm với từ khóa khác"
                      : "Bắt đầu tạo dự toán đầu tiên của bạn"}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={() =>
                        handleCategoryPress("/calculators/total-estimate")
                      }
                    >
                      <LinearGradient
                        colors={["#22c55e", "#16a34a"]}
                        style={styles.emptyButtonGradient}
                      >
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.emptyButtonText}>
                          Tạo dự toán mới
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionModal(false)}
        >
          <View style={styles.actionModalContent}>
            <View style={styles.actionModalHeader}>
              <Text style={styles.actionModalTitle} numberOfLines={1}>
                {selectedEstimate?.name}
              </Text>
              <Text style={styles.actionModalSubtitle}>
                #{selectedEstimate?.localId} •{" "}
                {selectedEstimate &&
                  formatEstimateCurrency(selectedEstimate.results.totalCost)}
              </Text>
            </View>

            <View style={styles.actionModalDivider} />

            {/* Actions */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowActionModal(false);
                if (selectedEstimate) handleOpenEstimate(selectedEstimate);
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={22}
                color={MODERN_COLORS.text}
              />
              <Text style={styles.actionItemText}>Chỉnh sửa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleDuplicateEstimate}
            >
              <Ionicons
                name="copy-outline"
                size={22}
                color={MODERN_COLORS.text}
              />
              <Text style={styles.actionItemText}>Tạo bản sao</Text>
            </TouchableOpacity>

            <View style={styles.actionModalDivider} />

            {/* Status Change */}
            <Text style={styles.actionSectionTitle}>Đổi trạng thái</Text>

            {selectedEstimate?.status !== "draft" && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => handleChangeStatus("draft")}
              >
                <Ionicons name="document-outline" size={22} color="#f59e0b" />
                <Text style={styles.actionItemText}>Bản nháp</Text>
              </TouchableOpacity>
            )}

            {selectedEstimate?.status !== "completed" && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => handleChangeStatus("completed")}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={22}
                  color="#22c55e"
                />
                <Text style={styles.actionItemText}>Hoàn thành</Text>
              </TouchableOpacity>
            )}

            {selectedEstimate?.status !== "archived" && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => handleChangeStatus("archived")}
              >
                <Ionicons name="archive-outline" size={22} color="#6b7280" />
                <Text style={styles.actionItemText}>Lưu trữ</Text>
              </TouchableOpacity>
            )}

            <View style={styles.actionModalDivider} />

            {/* Delete */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleDeleteEstimate}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={MODERN_COLORS.error}
              />
              <Text
                style={[styles.actionItemText, { color: MODERN_COLORS.error }]}
              >
                Xóa dự toán
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCancelBtn}
              onPress={() => setShowActionModal(false)}
            >
              <Text style={styles.actionCancelText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: MODERN_COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, marginLeft: MODERN_SPACING.sm },
  headerTitle: { fontSize: 20, fontWeight: "700", color: MODERN_COLORS.text },
  headerSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
  },
  tabActive: { backgroundColor: MODERN_COLORS.primaryLight },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.textSecondary,
  },
  tabTextActive: { color: MODERN_COLORS.primary, fontWeight: "600" },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingTop: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.md,
  },
  primaryCard: {
    borderRadius: MODERN_RADIUS.xl,
    overflow: "hidden",
    marginBottom: MODERN_SPACING.lg,
    ...MODERN_SHADOWS.lg,
  },
  primaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: MODERN_SPACING.lg,
  },
  primaryLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
  },
  primaryIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryEmoji: { fontSize: 28 },
  primaryInfo: {},
  primaryTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  primarySubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
    maxWidth: 180,
  },
  primaryArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  section: { marginBottom: MODERN_SPACING.lg },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.md,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - MODERN_SPACING.md * 2 - MODERN_SPACING.sm) / 2,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    position: "relative",
    ...MODERN_SHADOWS.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.sm,
  },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    lineHeight: 15,
  },
  categoryArrow: {
    position: "absolute",
    top: MODERN_SPACING.md,
    right: MODERN_SPACING.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickCalcList: { gap: MODERN_SPACING.sm, paddingRight: MODERN_SPACING.md },
  quickCalcItem: { alignItems: "center", width: 72 },
  quickCalcIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickCalcEmoji: { fontSize: 24 },
  quickCalcTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: MODERN_COLORS.text,
    textAlign: "center",
  },
  tipsCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    lineHeight: 18,
  },
  savedSection: {
    gap: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
  },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  savedLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
  },
  savedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  savedEmoji: { fontSize: 22 },
  savedInfo: { flex: 1 },
  savedName: { fontSize: 15, fontWeight: "600", color: MODERN_COLORS.text },
  savedType: { fontSize: 11, color: MODERN_COLORS.textSecondary, marginTop: 2 },
  savedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  savedDate: { fontSize: 11, color: MODERN_COLORS.textTertiary },
  savedRight: { alignItems: "flex-end" },
  savedTotal: { fontSize: 15, fontWeight: "700", color: MODERN_COLORS.primary },
  savedStatus: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.full,
  },
  savedStatusCompleted: { backgroundColor: "#dcfce7" },
  savedStatusDraft: { backgroundColor: "#fef3c7" },
  savedStatusArchived: { backgroundColor: "#f3f4f6" },
  savedStatusText: { fontSize: 10, fontWeight: "600" },
  savedStatusTextCompleted: { color: "#22c55e" },
  savedStatusTextDraft: { color: "#f59e0b" },
  savedStatusTextArchived: { color: "#6b7280" },
  moreBtn: { padding: 4, marginTop: 4 },
  emptyState: { alignItems: "center", paddingVertical: MODERN_SPACING.xxxl },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginTop: MODERN_SPACING.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: MODERN_SPACING.lg,
  },
  emptyButton: {
    marginTop: MODERN_SPACING.lg,
    borderRadius: MODERN_RADIUS.lg,
    overflow: "hidden",
  },
  emptyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyButtonText: { fontSize: 14, fontWeight: "600", color: "#fff" },

  // Stats
  statsRow: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700", color: MODERN_COLORS.text },
  statLabel: { fontSize: 10, color: MODERN_COLORS.textSecondary, marginTop: 2 },

  // Search & Filter
  searchFilterRow: {
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    paddingHorizontal: MODERN_SPACING.sm,
    gap: 8,
    height: 44,
    ...MODERN_SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: MODERN_COLORS.text,
    paddingVertical: 8,
  },
  filterTabs: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
  },
  filterTabActive: { backgroundColor: MODERN_COLORS.primary },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: MODERN_COLORS.textSecondary,
  },
  filterTabTextActive: { color: "#fff" },

  // Loading
  loadingState: {
    alignItems: "center",
    paddingVertical: MODERN_SPACING.xxxl,
  },
  loadingText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.md,
  },
  flex1: { flex: 1 },

  // Action Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  actionModalContent: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopLeftRadius: MODERN_RADIUS.xl,
    borderTopRightRadius: MODERN_RADIUS.xl,
    paddingBottom: 34,
  },
  actionModalHeader: {
    padding: MODERN_SPACING.lg,
  },
  actionModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  actionModalSubtitle: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    marginTop: 4,
  },
  actionModalDivider: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: MODERN_SPACING.lg,
  },
  actionSectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingTop: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.sm,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.md,
  },
  actionItemText: {
    fontSize: 16,
    color: MODERN_COLORS.text,
  },
  actionCancelBtn: {
    marginHorizontal: MODERN_SPACING.lg,
    marginTop: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
  },
  actionCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  // Material Management Card
  materialManageCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
    borderWidth: 1,
    borderColor: "#8b5cf620",
  },
  materialManageLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  materialManageIcon: {
    width: 48,
    height: 48,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: "#8b5cf615",
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.md,
  },
  materialManageInfo: {
    flex: 1,
  },
  materialManageTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  materialManageSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
});
