/**
 * Lưu trữ - Personal Storage Screen
 * Quản lý tài liệu cá nhân, lưu trữ local và cloud
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { useAuth } from "@/context/AuthContext";
import { useStorage } from "@/hooks/useStorage";
import type { FileInfo } from "@/services/storage/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Storage Categories
const STORAGE_CATEGORIES = [
  {
    id: "all",
    name: "Tất cả",
    icon: "folder-open" as const,
    color: "#2563eb",
    filter: null,
  },
  {
    id: "images",
    name: "Hình ảnh",
    icon: "image" as const,
    color: "#22c55e",
    filter: "image",
  },
  {
    id: "documents",
    name: "Tài liệu",
    icon: "document-text" as const,
    color: "#ef4444",
    filter: "application",
  },
  {
    id: "videos",
    name: "Video",
    icon: "videocam" as const,
    color: "#8b5cf6",
    filter: "video",
  },
  {
    id: "audio",
    name: "Âm thanh",
    icon: "musical-notes" as const,
    color: "#f59e0b",
    filter: "audio",
  },
  {
    id: "downloads",
    name: "Tải xuống",
    icon: "download" as const,
    color: "#06b6d4",
    filter: null,
  },
];

// Quick Actions
const QUICK_ACTIONS = [
  {
    id: "upload",
    name: "Tải lên",
    icon: "cloud-upload" as const,
    color: "#2563eb",
    route: "/file-upload",
  },
  {
    id: "scan",
    name: "Scan",
    icon: "scan" as const,
    color: "#22c55e",
    route: "/tools/document-scanner",
  },
  {
    id: "share",
    name: "Chia sẻ",
    icon: "share-social" as const,
    color: "#8b5cf6",
    route: null,
  },
  {
    id: "offline",
    name: "Offline",
    icon: "cloud-offline" as const,
    color: "#f59e0b",
    route: null,
  },
];

// File type icons
const getFileIcon = (
  mimeType: string,
): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
  if (mimeType.startsWith("image")) return { icon: "image", color: "#22c55e" };
  if (mimeType.startsWith("video"))
    return { icon: "videocam", color: "#8b5cf6" };
  if (mimeType.startsWith("audio"))
    return { icon: "musical-notes", color: "#f59e0b" };
  if (mimeType.includes("pdf"))
    return { icon: "document-text", color: "#ef4444" };
  if (mimeType.includes("word") || mimeType.includes("document"))
    return { icon: "document", color: "#2563eb" };
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return { icon: "grid", color: "#22c55e" };
  if (mimeType.includes("zip") || mimeType.includes("archive"))
    return { icon: "archive", color: "#f59e0b" };
  return { icon: "document-outline", color: "#64748b" };
};

export default function StorageScreen() {
  const { user } = useAuth();
  const userId = user?.id;

  const { files, stats, loading, refresh, formatSize } = useStorage({
    userId,
    folder: "",
    autoLoad: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  // Storage stats
  const storageStats = useMemo(() => {
    const used = stats?.totalSize || 0;
    const total = 1024 * 1024 * 1024; // 1GB limit
    const percentage = (used / total) * 100;
    return {
      used,
      total,
      percentage: Math.min(percentage, 100),
      usedFormatted: formatSize
        ? formatSize(used)
        : `${(used / (1024 * 1024)).toFixed(2)} MB`,
      totalFormatted: "1 GB",
    };
  }, [stats, formatSize]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    let result = files || [];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(query));
    }

    // Category filter
    const category = STORAGE_CATEGORIES.find((c) => c.id === selectedCategory);
    if (category?.filter) {
      result = result.filter((f) => f.mimeType.startsWith(category.filter!));
    }

    return result;
  }, [files, searchQuery, selectedCategory]);

  // Recent files (last 10)
  const recentFiles = useMemo(() => {
    return [...(files || [])]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 10);
  }, [files]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: files?.length || 0 };
    STORAGE_CATEGORIES.forEach((cat) => {
      if (cat.filter) {
        counts[cat.id] =
          files?.filter((f) => f.mimeType.startsWith(cat.filter!)).length || 0;
      }
    });
    return counts;
  }, [files]);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    Haptics.selectionAsync();
    setSelectedCategory(categoryId);
  }, []);

  const handleFilePress = useCallback((file: FileInfo) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to file viewer or handle file
    router.push(`/storage/file/${file.id}` as any);
  }, []);

  const handleQuickAction = useCallback((action: (typeof QUICK_ACTIONS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (action.route) {
      router.push(action.route as any);
    }
  }, []);

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hôm nay";
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString("vi-VN");
  };

  // Render file item
  const renderFileItem = useCallback(
    ({ item }: { item: FileInfo }) => {
      const fileIcon = getFileIcon(item.mimeType);
      const isImage = item.mimeType.startsWith("image");

      return (
        <TouchableOpacity
          style={styles.fileCard}
          onPress={() => handleFilePress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.fileIconContainer}>
            {isImage && item.url ? (
              <Image
                source={{ uri: item.url }}
                style={styles.fileThumbnail}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.fileIconBg,
                  { backgroundColor: fileIcon.color + "15" },
                ]}
              >
                <Ionicons
                  name={fileIcon.icon}
                  size={24}
                  color={fileIcon.color}
                />
              </View>
            )}
          </View>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.fileMeta}>
              {formatSize
                ? formatSize(item.size)
                : `${(item.size / 1024).toFixed(1)} KB`}{" "}
              • {formatDate(item.updatedAt)}
            </Text>
          </View>
          <TouchableOpacity style={styles.fileMoreBtn}>
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={MODERN_COLORS.textSecondary}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [handleFilePress, formatSize],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lưu trữ</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/storage/settings" as any)}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={MODERN_COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={MODERN_COLORS.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tài liệu..."
              placeholderTextColor={MODERN_COLORS.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={MODERN_COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Storage Stats Card */}
        <View style={styles.storageCard}>
          <LinearGradient
            colors={["#2563eb", "#7c3aed"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.storageGradient}
          >
            <View style={styles.storageHeader}>
              <View style={styles.storageIconContainer}>
                <Ionicons name="cloud" size={28} color="#fff" />
              </View>
              <View style={styles.storageInfo}>
                <Text style={styles.storageTitle}>Dung lượng lưu trữ</Text>
                <Text style={styles.storageSize}>
                  {storageStats.usedFormatted}{" "}
                  <Text style={styles.storageSizeTotal}>
                    / {storageStats.totalFormatted}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${storageStats.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {storageStats.percentage.toFixed(1)}%
              </Text>
            </View>

            {/* Storage Breakdown */}
            <View style={styles.storageBreakdown}>
              {STORAGE_CATEGORIES.slice(1, 5).map((cat) => (
                <View key={cat.id} style={styles.breakdownItem}>
                  <View
                    style={[
                      styles.breakdownDot,
                      { backgroundColor: cat.color },
                    ]}
                  />
                  <Text style={styles.breakdownText}>
                    {cat.name} ({categoryCounts[cat.id] || 0})
                  </Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionBtn}
                onPress={() => handleQuickAction(action)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color + "15" },
                  ]}
                >
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionText}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {STORAGE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => handleCategorySelect(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={18}
                  color={
                    selectedCategory === cat.id ? "#fff" : MODERN_COLORS.text
                  }
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
                {categoryCounts[cat.id] !== undefined && (
                  <View
                    style={[
                      styles.categoryBadge,
                      selectedCategory === cat.id && styles.categoryBadgeActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        selectedCategory === cat.id &&
                          styles.categoryBadgeTextActive,
                      ]}
                    >
                      {categoryCounts[cat.id]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Files */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tài liệu gần đây</Text>
            <TouchableOpacity
              onPress={() => router.push("/file-manager" as any)}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : recentFiles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-outline"
                size={48}
                color={MODERN_COLORS.textTertiary}
              />
              <Text style={styles.emptyText}>Chưa có tài liệu nào</Text>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => router.push("/file-upload" as any)}
              >
                <Ionicons name="cloud-upload" size={20} color="#fff" />
                <Text style={styles.uploadBtnText}>Tải lên ngay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={
                selectedCategory === "all"
                  ? recentFiles
                  : filteredFiles.slice(0, 10)
              }
              renderItem={renderFileItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/file-upload" as any)}
      >
        <LinearGradient
          colors={["#2563eb", "#7c3aed"]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    padding: MODERN_SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  settingsButton: {
    padding: MODERN_SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },

  // Search
  searchContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.sm,
    ...MODERN_SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: MODERN_COLORS.text,
  },

  // Storage Card
  storageCard: {
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.xl,
    overflow: "hidden",
    ...MODERN_SHADOWS.md,
  },
  storageGradient: {
    padding: MODERN_SPACING.lg,
  },
  storageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: MODERN_SPACING.md,
  },
  storageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.md,
  },
  storageInfo: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  storageSize: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  storageSizeTotal: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255,255,255,0.7)",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    minWidth: 45,
    textAlign: "right",
  },
  storageBreakdown: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.sm,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  // Section
  section: {
    marginBottom: MODERN_SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.text,
    paddingHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
  },
  seeAllText: {
    fontSize: 14,
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: "row",
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingVertical: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.xs,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },

  // Categories
  categoriesScroll: {
    paddingHorizontal: MODERN_SPACING.md,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.full,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    marginRight: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
    ...MODERN_SHADOWS.sm,
  },
  categoryChipActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  categoryBadge: {
    backgroundColor: MODERN_COLORS.border,
    borderRadius: MODERN_RADIUS.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  categoryBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: MODERN_COLORS.textSecondary,
  },
  categoryBadgeTextActive: {
    color: "#fff",
  },

  // File List
  fileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    padding: MODERN_SPACING.md,
    ...MODERN_SHADOWS.sm,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
    marginRight: MODERN_SPACING.md,
  },
  fileThumbnail: {
    width: 48,
    height: 48,
    borderRadius: MODERN_RADIUS.md,
  },
  fileIconBg: {
    width: 48,
    height: 48,
    borderRadius: MODERN_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  fileMoreBtn: {
    padding: MODERN_SPACING.xs,
  },
  separator: {
    height: MODERN_SPACING.sm,
  },

  // Empty & Loading
  loadingContainer: {
    alignItems: "center",
    paddingVertical: MODERN_SPACING.xl,
  },
  loadingText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: MODERN_SPACING.xl,
    marginHorizontal: MODERN_SPACING.md,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
  },
  emptyText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.md,
  },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    ...MODERN_SHADOWS.lg,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
