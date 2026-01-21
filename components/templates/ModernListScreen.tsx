/**
 * ModernListScreen Template
 *
 * Template màn hình danh sách theo phong cách modern minimal
 * Sử dụng cho các màn hình con: thợ xây, thợ sơn, dịch vụ, v.v.
 *
 * @example
 * import { ModernListScreen, WorkerCardData } from '@/components/templates/ModernListScreen';
 *
 * const data: WorkerCardData[] = [...];
 *
 * <ModernListScreen
 *   title="Thợ sơn"
 *   data={data}
 *   emptyIcon="color-palette-outline"
 *   emptyText="Không tìm thấy thợ sơn"
 *   filters={filters}
 *   onItemPress={(item) => {...}}
 * />
 */

import {
    MODERN_COLORS,
    MODERN_FONT_SIZE,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

// ============================================
// TYPES
// ============================================
export interface FilterOption {
  key: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label?: string;
  options: FilterOption[];
  defaultValue: string;
}

export interface WorkerCardData {
  id: number | string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  experience: number;
  price: string;
  priceUnit: string;
  specialties: string[];
  teamSize?: number;
  completedProjects?: number;
  avatar: string;
  featured?: boolean;
  availability?: "available" | "busy" | "booked";
  priceAlt?: string;
}

export interface ModernListScreenProps<T extends WorkerCardData> {
  title: string;
  data: T[];
  filters?: FilterConfig[];
  searchPlaceholder?: string;
  emptyIcon?: string;
  emptyText?: string;
  emptySubtitle?: string;
  infoBannerTitle?: string;
  infoBannerText?: string;
  onItemPress?: (item: T) => void;
  onItemContact?: (item: T) => void;
  renderExtraContent?: (item: T) => React.ReactNode;
  headerRight?: React.ReactNode;
  style?: ViewStyle;
}

// ============================================
// MODERN WORKER CARD
// ============================================
interface WorkerCardProps<T extends WorkerCardData> {
  item: T;
  onPress?: () => void;
  onContact?: () => void;
  renderExtra?: (item: T) => React.ReactNode;
}

function ModernWorkerCardItem<T extends WorkerCardData>({
  item,
  onPress,
  onContact,
  renderExtra,
}: WorkerCardProps<T>) {
  return (
    <Pressable style={styles.workerCard} onPress={onPress}>
      {/* Featured Badge */}
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={10} color="#fff" />
          <Text style={styles.featuredText}>Đề xuất</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.workerName} numberOfLines={1}>
            {item.name}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={MODERN_COLORS.warning} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviews})</Text>
          </View>

          {/* Location & Experience */}
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={11}
              color={MODERN_COLORS.textLight}
            />
            <Text style={styles.metaText}>{item.location}</Text>
            <View style={styles.metaDot} />
            <Ionicons
              name="time-outline"
              size={11}
              color={MODERN_COLORS.textLight}
            />
            <Text style={styles.metaText}>{item.experience} năm</Text>
          </View>
        </View>
      </View>

      {/* Specialties */}
      <View style={styles.specialtiesRow}>
        {item.specialties.slice(0, 3).map((specialty, index) => (
          <View key={index} style={styles.specialtyChip}>
            <Text style={styles.specialtyText}>{specialty}</Text>
          </View>
        ))}
        {item.specialties.length > 3 && (
          <View style={[styles.specialtyChip, styles.specialtyMore]}>
            <Text style={styles.specialtyMoreText}>
              +{item.specialties.length - 3}
            </Text>
          </View>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {item.teamSize && (
          <>
            <View style={styles.statItem}>
              <Ionicons
                name="people-outline"
                size={14}
                color={MODERN_COLORS.primary}
              />
              <Text style={styles.statText}>{item.teamSize} người</Text>
            </View>
            <View style={styles.statDivider} />
          </>
        )}
        {item.completedProjects && (
          <>
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={14}
                color={MODERN_COLORS.accent}
              />
              <Text style={styles.statText}>
                {item.completedProjects} dự án
              </Text>
            </View>
            <View style={styles.statDivider} />
          </>
        )}
        {item.availability && (
          <View
            style={[
              styles.availabilityBadge,
              item.availability === "available"
                ? styles.availabilityAvailable
                : styles.availabilityBusy,
            ]}
          >
            <View
              style={[
                styles.availabilityDot,
                item.availability === "available"
                  ? styles.dotAvailable
                  : styles.dotBusy,
              ]}
            />
            <Text
              style={[
                styles.availabilityText,
                item.availability === "available"
                  ? styles.textAvailable
                  : styles.textBusy,
              ]}
            >
              {item.availability === "available" ? "Sẵn sàng" : "Đang bận"}
            </Text>
          </View>
        )}
      </View>

      {/* Extra Content */}
      {renderExtra && renderExtra(item)}

      {/* Price & Action */}
      <View style={styles.priceRow}>
        <View>
          <View style={styles.priceMain}>
            <Text style={styles.priceValue}>{item.price}</Text>
            <Text style={styles.priceUnit}>{item.priceUnit}</Text>
          </View>
          {item.priceAlt && (
            <Text style={styles.priceAlt}>{item.priceAlt}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.contactButton}
          onPress={onContact}
          activeOpacity={0.8}
        >
          <Ionicons name="call-outline" size={16} color="#fff" />
          <Text style={styles.contactButtonText}>Liên hệ</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function ModernListScreen<T extends WorkerCardData>({
  title,
  data,
  filters = [],
  searchPlaceholder = "Tìm kiếm...",
  emptyIcon = "search-outline",
  emptyText = "Không tìm thấy kết quả",
  emptySubtitle = "Thử thay đổi bộ lọc để tìm kiếm",
  infoBannerTitle,
  infoBannerText,
  onItemPress,
  onItemContact,
  renderExtraContent,
  headerRight,
  style,
}: ModernListScreenProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      filters.forEach((f) => {
        initial[f.id] = f.defaultValue;
      });
      return initial;
    }
  );

  // Filter data
  const filteredData = data.filter((item) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Custom filters
    const matchesFilters = filters.every((filter) => {
      const value = filterValues[filter.id];
      if (value === filter.defaultValue) return true;

      // Check specialties
      if (item.specialties.some((s) => s.includes(value))) return true;
      // Check location
      if (item.location === value) return true;

      return false;
    });

    return matchesSearch && matchesFilters;
  });

  const resetFilters = () => {
    setSearchQuery("");
    const initial: Record<string, string> = {};
    filters.forEach((f) => {
      initial[f.id] = f.defaultValue;
    });
    setFilterValues(initial);
  };

  const hasActiveFilters =
    searchQuery.length > 0 ||
    filters.some((f) => filterValues[f.id] !== f.defaultValue);

  const renderHeader = () => (
    <>
      {/* Modern Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color={MODERN_COLORS.textLight}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={MODERN_COLORS.textLight}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={MODERN_COLORS.textLight}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Bars */}
      {filters.map((filter) => (
        <View key={filter.id} style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filter.options.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterChip,
                  filterValues[filter.id] === option.label &&
                    styles.filterChipActive,
                ]}
                onPress={() =>
                  setFilterValues((prev) => ({
                    ...prev,
                    [filter.id]: option.label,
                  }))
                }
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterValues[filter.id] === option.label &&
                      styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ))}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          <Text style={styles.resultsNumber}>{filteredData.length}</Text> kết
          quả
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Ionicons
              name="refresh-outline"
              size={14}
              color={MODERN_COLORS.primary}
            />
            <Text style={styles.resetText}>Đặt lại</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name={emptyIcon as any}
          size={48}
          color={MODERN_COLORS.border}
        />
      </View>
      <Text style={styles.emptyTitle}>{emptyText}</Text>
      <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
      <TouchableOpacity onPress={resetFilters} style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Đặt lại bộ lọc</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <>
      {/* Info Banner */}
      {infoBannerTitle && (
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={MODERN_COLORS.primary}
            />
          </View>
          <View style={styles.infoBannerContent}>
            <Text style={styles.infoBannerTitle}>{infoBannerTitle}</Text>
            {infoBannerText && (
              <Text style={styles.infoBannerTextStyle}>{infoBannerText}</Text>
            )}
          </View>
        </View>
      )}
      <View style={{ height: MODERN_SPACING.xl }} />
    </>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={MODERN_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        {headerRight || (
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons
              name="options-outline"
              size={20}
              color={MODERN_COLORS.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <ModernWorkerCardItem
            item={item}
            onPress={() => onItemPress?.(item)}
            onContact={() => onItemContact?.(item)}
            renderExtra={renderExtraContent}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // Header
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
    width: 36,
    height: 36,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    letterSpacing: -0.3,
  },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  // List
  listContent: {
    paddingTop: MODERN_SPACING.md,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    paddingHorizontal: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.lg,
    height: 44,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    gap: MODERN_SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.text,
  },
  clearButton: {
    padding: 4,
  },

  // Filter Bar
  filterBar: {
    marginTop: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
  },
  filterChip: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    marginRight: MODERN_SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: MODERN_COLORS.primaryLight,
    borderColor: MODERN_COLORS.primary,
  },
  filterChipText: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  // Results Header
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.lg,
    marginBottom: MODERN_SPACING.sm,
  },
  resultsCount: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
  },
  resultsNumber: {
    fontWeight: "700",
    color: MODERN_COLORS.text,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  resetText: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },

  // Worker Card
  workerCard: {
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: MODERN_SPACING.md,
    marginBottom: MODERN_SPACING.sm,
    padding: MODERN_SPACING.md,
    borderRadius: MODERN_RADIUS.lg,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    ...MODERN_SHADOWS.sm,
  },
  featuredBadge: {
    position: "absolute",
    top: MODERN_SPACING.sm,
    right: MODERN_SPACING.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.warning,
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.full,
    gap: 3,
    zIndex: 1,
  },
  featuredText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: MODERN_SPACING.sm,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: MODERN_SPACING.sm,
  },
  avatarEmoji: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  workerName: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 2,
  },
  ratingText: {
    fontSize: MODERN_FONT_SIZE.xs,
    fontWeight: "600",
    color: MODERN_COLORS.text,
  },
  reviewCount: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textLight,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: MODERN_COLORS.textLight,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: 4,
  },

  // Specialties
  specialtiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.xs,
    marginBottom: MODERN_SPACING.sm,
  },
  specialtyChip: {
    backgroundColor: MODERN_COLORS.primaryLight,
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: 3,
    borderRadius: MODERN_RADIUS.sm,
  },
  specialtyText: {
    fontSize: 10,
    color: MODERN_COLORS.primary,
    fontWeight: "500",
  },
  specialtyMore: {
    backgroundColor: MODERN_COLORS.background,
  },
  specialtyMoreText: {
    fontSize: 10,
    color: MODERN_COLORS.textSecondary,
    fontWeight: "500",
  },

  // Stats Row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: MODERN_SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
    marginBottom: MODERN_SPACING.sm,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: MODERN_SPACING.sm,
  },
  availabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.xs,
    paddingVertical: 2,
    borderRadius: MODERN_RADIUS.full,
    gap: 4,
    marginLeft: "auto",
  },
  availabilityAvailable: {
    backgroundColor: `${MODERN_COLORS.accent}15`,
  },
  availabilityBusy: {
    backgroundColor: `${MODERN_COLORS.warning}15`,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotAvailable: {
    backgroundColor: MODERN_COLORS.accent,
  },
  dotBusy: {
    backgroundColor: MODERN_COLORS.warning,
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: "500",
  },
  textAvailable: {
    color: MODERN_COLORS.accent,
  },
  textBusy: {
    color: MODERN_COLORS.warning,
  },

  // Price Row
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceMain: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceValue: {
    fontSize: MODERN_FONT_SIZE.lg,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },
  priceUnit: {
    fontSize: MODERN_FONT_SIZE.xs,
    color: MODERN_COLORS.textSecondary,
    marginLeft: 2,
  },
  priceAlt: {
    fontSize: 10,
    color: MODERN_COLORS.textLight,
    marginTop: 1,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.md,
    gap: 6,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.xl * 2,
    paddingHorizontal: MODERN_SPACING.lg,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: MODERN_SPACING.md,
  },
  emptyTitle: {
    fontSize: MODERN_FONT_SIZE.md,
    fontWeight: "600",
    color: MODERN_COLORS.text,
    marginBottom: MODERN_SPACING.xs,
  },
  emptySubtitle: {
    fontSize: MODERN_FONT_SIZE.sm,
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.md,
    textAlign: "center",
  },
  emptyButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.lg,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
  },

  // Info Banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primaryLight,
    marginHorizontal: MODERN_SPACING.md,
    marginTop: MODERN_SPACING.md,
    padding: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.sm,
  },
  infoBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBannerContent: {
    flex: 1,
  },
  infoBannerTitle: {
    fontSize: MODERN_FONT_SIZE.sm,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  infoBannerTextStyle: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
    marginTop: 1,
  },
});

export default ModernListScreen;
