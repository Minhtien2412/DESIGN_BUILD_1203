/**
 * Filter & Sort Modal for Products
 * Bottom sheet popup for filtering/sorting product listings
 *
 * Features:
 * - Category filter chips
 * - Price range slider
 * - Rating filter
 * - Sort options (price, rating, newest, bestselling)
 * - Apply/Reset buttons
 *
 * API: GET /products/categories
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");
const MODAL_HEIGHT = SH * 0.7;

const THEME = {
  primary: "#0D9488",
  primaryDark: "#0F766E",
  background: "#FFFFFF",
  surface: "#F8FAFB",
  text: "#1A1A1A",
  textSecondary: "#757575",
  border: "#E8E8E8",
  star: "#FFCE3D",
  error: "#EF4444",
};

export type SortOption =
  | "default"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "newest"
  | "bestselling";

export interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  minRating: number;
  sortBy: SortOption;
  inStock: boolean;
}

const DEFAULT_FILTER: FilterState = {
  category: "all",
  minPrice: "",
  maxPrice: "",
  minRating: 0,
  sortBy: "default",
  inStock: false,
};

interface FilterSortModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: "default", label: "Mặc định", icon: "apps-outline" },
  { key: "price_asc", label: "Giá tăng dần", icon: "arrow-up-outline" },
  { key: "price_desc", label: "Giá giảm dần", icon: "arrow-down-outline" },
  { key: "rating", label: "Đánh giá cao", icon: "star-outline" },
  { key: "newest", label: "Mới nhất", icon: "time-outline" },
  { key: "bestselling", label: "Bán chạy", icon: "flame-outline" },
];

const RATING_OPTIONS = [0, 3, 3.5, 4, 4.5];

export function FilterSortModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterSortModalProps) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTER,
    ...initialFilters,
  });
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; count?: number }>
  >([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(MODAL_HEIGHT)).current;

  // Fetch categories from API
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    const fetchCategories = async () => {
      setLoadingCats(true);
      try {
        // Try fetching categories endpoint
        const { get } = require("@/services/api");
        const catsResponse = await get("/products/categories");
        const cats = Array.isArray(catsResponse)
          ? catsResponse
          : catsResponse?.data || catsResponse?.categories || [];

        if (!cancelled && cats.length > 0) {
          setCategories(cats);
        }
      } catch {
        // Use fallback categories
        if (!cancelled) {
          setCategories([
            { id: "construction", name: "Vật liệu xây dựng" },
            { id: "tools", name: "Dụng cụ" },
            { id: "electrical", name: "Thiết bị điện" },
            { id: "plumbing", name: "Ống nước" },
            { id: "paint", name: "Sơn" },
            { id: "furniture", name: "Nội thất" },
            { id: "safety", name: "Bảo hộ lao động" },
            { id: "other", name: "Khác" },
          ]);
        }
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [visible]);

  // Reset on open
  useEffect(() => {
    if (visible) {
      setFilters({ ...DEFAULT_FILTER, ...initialFilters });
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleApply = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters(DEFAULT_FILTER);
  }, []);

  const activeCount = [
    filters.category !== "all",
    filters.minPrice !== "",
    filters.maxPrice !== "",
    filters.minRating > 0,
    filters.sortBy !== "default",
    filters.inStock,
  ].filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <Pressable onPress={() => {}}>
            {/* Handle */}
            <View style={styles.handleBar}>
              <View style={styles.handle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Lọc & Sắp xếp
                {activeCount > 0 && (
                  <Text style={styles.activeCount}> ({activeCount})</Text>
                )}
              </Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.resetText}>Đặt lại</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {/* Sort */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sắp xếp</Text>
                <View style={styles.sortGrid}>
                  {SORT_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.key}
                      style={[
                        styles.sortOption,
                        filters.sortBy === opt.key && styles.sortOptionActive,
                      ]}
                      onPress={() =>
                        setFilters((f) => ({ ...f, sortBy: opt.key }))
                      }
                    >
                      <Ionicons
                        name={opt.icon as any}
                        size={16}
                        color={
                          filters.sortBy === opt.key
                            ? THEME.primary
                            : THEME.textSecondary
                        }
                      />
                      <Text
                        style={[
                          styles.sortText,
                          filters.sortBy === opt.key && styles.sortTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Categories */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Danh mục</Text>
                {loadingCats ? (
                  <ActivityIndicator
                    color={THEME.primary}
                    style={{ padding: 20 }}
                  />
                ) : (
                  <View style={styles.catGrid}>
                    <TouchableOpacity
                      style={[
                        styles.catChip,
                        filters.category === "all" && styles.catChipActive,
                      ]}
                      onPress={() =>
                        setFilters((f) => ({ ...f, category: "all" }))
                      }
                    >
                      <Text
                        style={[
                          styles.catText,
                          filters.category === "all" && styles.catTextActive,
                        ]}
                      >
                        Tất cả
                      </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.catChip,
                          filters.category === cat.id && styles.catChipActive,
                        ]}
                        onPress={() =>
                          setFilters((f) => ({ ...f, category: cat.id }))
                        }
                      >
                        <Text
                          style={[
                            styles.catText,
                            filters.category === cat.id && styles.catTextActive,
                          ]}
                        >
                          {cat.name}
                          {cat.count !== undefined && ` (${cat.count})`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Price Range */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Khoảng giá</Text>
                <View style={styles.priceRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Từ"
                    placeholderTextColor="#CCC"
                    value={filters.minPrice}
                    onChangeText={(v) =>
                      setFilters((f) => ({
                        ...f,
                        minPrice: v.replace(/[^0-9]/g, ""),
                      }))
                    }
                    keyboardType="numeric"
                  />
                  <Text style={styles.priceSep}>—</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Đến"
                    placeholderTextColor="#CCC"
                    value={filters.maxPrice}
                    onChangeText={(v) =>
                      setFilters((f) => ({
                        ...f,
                        maxPrice: v.replace(/[^0-9]/g, ""),
                      }))
                    }
                    keyboardType="numeric"
                  />
                  <Text style={styles.priceUnit}>đ</Text>
                </View>
              </View>

              {/* Rating Filter */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Đánh giá từ</Text>
                <View style={styles.ratingRow}>
                  {RATING_OPTIONS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.ratingChip,
                        filters.minRating === r && styles.ratingChipActive,
                      ]}
                      onPress={() =>
                        setFilters((f) => ({ ...f, minRating: r }))
                      }
                    >
                      {r === 0 ? (
                        <Text
                          style={[
                            styles.ratingChipText,
                            filters.minRating === r &&
                              styles.ratingChipTextActive,
                          ]}
                        >
                          Tất cả
                        </Text>
                      ) : (
                        <View style={styles.ratingStars}>
                          <Ionicons
                            name="star"
                            size={14}
                            color={
                              filters.minRating === r
                                ? THEME.star
                                : THEME.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.ratingChipText,
                              filters.minRating === r &&
                                styles.ratingChipTextActive,
                            ]}
                          >
                            {r}+
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* In Stock Toggle */}
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.toggleRow}
                  onPress={() =>
                    setFilters((f) => ({
                      ...f,
                      inStock: !f.inStock,
                    }))
                  }
                >
                  <Text style={styles.toggleLabel}>Chỉ còn hàng</Text>
                  <View
                    style={[
                      styles.toggle,
                      filters.inStock && styles.toggleActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        filters.inStock && styles.toggleKnobActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Apply Button */}
            <View style={styles.applyRow}>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.applyText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: THEME.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: MODAL_HEIGHT,
    overflow: "hidden",
  },
  handleBar: { alignItems: "center", paddingVertical: 10 },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.text,
  },
  activeCount: {
    color: THEME.primary,
    fontWeight: "600",
  },
  resetText: {
    fontSize: 14,
    color: THEME.error,
    fontWeight: "500",
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.text,
    marginBottom: 10,
  },

  // Sort
  sortGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FAFAFA",
  },
  sortOptionActive: {
    borderColor: THEME.primary,
    backgroundColor: "#F0FDFA",
  },
  sortText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  sortTextActive: {
    color: THEME.primary,
    fontWeight: "600",
  },

  // Categories
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FAFAFA",
  },
  catChipActive: {
    borderColor: THEME.primary,
    backgroundColor: "#F0FDFA",
  },
  catText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  catTextActive: {
    color: THEME.primary,
    fontWeight: "600",
  },

  // Price
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: THEME.text,
    backgroundColor: "#FAFAFA",
  },
  priceSep: {
    fontSize: 16,
    color: THEME.textSecondary,
  },
  priceUnit: {
    fontSize: 14,
    color: THEME.textSecondary,
    fontWeight: "500",
  },

  // Rating
  ratingRow: {
    flexDirection: "row",
    gap: 8,
  },
  ratingChip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    backgroundColor: "#FAFAFA",
  },
  ratingChipActive: {
    borderColor: THEME.primary,
    backgroundColor: "#F0FDFA",
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingChipText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: "500",
  },
  ratingChipTextActive: {
    color: THEME.primary,
    fontWeight: "600",
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: THEME.text,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0E0E0",
    padding: 3,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: THEME.primary,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFF",
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },

  // Apply
  applyRow: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
});

export default FilterSortModal;
