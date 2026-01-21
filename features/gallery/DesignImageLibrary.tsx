/**
 * Design Image Library
 * Thư viện hình ảnh nội thất/ngoại thất đẹp từ Pexels
 * Cho phép lọc, xem và chọn ảnh cho bài đăng mẫu
 * Created: 19/01/2026
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SHADOWS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import pexelsService, { type PexelsPhoto } from "@/services/pexelsService";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const PHOTO_GAP = MODERN_SPACING.sm;
const PHOTO_WIDTH =
  (SCREEN_WIDTH - MODERN_SPACING.lg * 2 - PHOTO_GAP) / COLUMN_COUNT;

// ==================== DESIGN CATEGORIES ====================

export interface DesignCategory {
  id: string;
  label: string;
  labelEn: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  keywords: string[];
  type: "interior" | "exterior" | "both";
}

export const DESIGN_CATEGORIES: DesignCategory[] = [
  // Nội thất
  {
    id: "living_room",
    label: "Phòng khách",
    labelEn: "Living Room",
    icon: "home",
    color: "#6366f1",
    keywords: [
      "modern living room",
      "luxury living room interior",
      "living room design",
      "sofa interior",
    ],
    type: "interior",
  },
  {
    id: "bedroom",
    label: "Phòng ngủ",
    labelEn: "Bedroom",
    icon: "bed",
    color: "#8b5cf6",
    keywords: [
      "bedroom interior design",
      "modern bedroom",
      "luxury bedroom",
      "master bedroom",
    ],
    type: "interior",
  },
  {
    id: "kitchen",
    label: "Phòng bếp",
    labelEn: "Kitchen",
    icon: "restaurant",
    color: "#ec4899",
    keywords: [
      "modern kitchen design",
      "luxury kitchen",
      "kitchen interior",
      "kitchen island",
    ],
    type: "interior",
  },
  {
    id: "bathroom",
    label: "Phòng tắm",
    labelEn: "Bathroom",
    icon: "water",
    color: "#06b6d4",
    keywords: [
      "modern bathroom design",
      "luxury bathroom",
      "bathroom interior",
      "spa bathroom",
    ],
    type: "interior",
  },
  {
    id: "office",
    label: "Văn phòng",
    labelEn: "Office",
    icon: "briefcase",
    color: "#10b981",
    keywords: [
      "home office design",
      "modern office interior",
      "workspace design",
      "study room",
    ],
    type: "interior",
  },
  {
    id: "dining",
    label: "Phòng ăn",
    labelEn: "Dining",
    icon: "cafe",
    color: "#f59e0b",
    keywords: [
      "dining room design",
      "modern dining room",
      "dining interior",
      "dining table design",
    ],
    type: "interior",
  },
  // Ngoại thất
  {
    id: "villa_exterior",
    label: "Biệt thự",
    labelEn: "Villa",
    icon: "business",
    color: "#3b82f6",
    keywords: [
      "modern villa exterior",
      "luxury villa",
      "villa architecture",
      "villa facade",
    ],
    type: "exterior",
  },
  {
    id: "garden",
    label: "Sân vườn",
    labelEn: "Garden",
    icon: "leaf",
    color: "#22c55e",
    keywords: [
      "garden design",
      "landscaping",
      "modern garden",
      "backyard design",
    ],
    type: "exterior",
  },
  {
    id: "pool",
    label: "Hồ bơi",
    labelEn: "Pool",
    icon: "water-outline",
    color: "#0ea5e9",
    keywords: [
      "swimming pool design",
      "luxury pool",
      "infinity pool",
      "pool landscape",
    ],
    type: "exterior",
  },
  {
    id: "terrace",
    label: "Sân thượng",
    labelEn: "Terrace",
    icon: "sunny",
    color: "#eab308",
    keywords: [
      "rooftop terrace design",
      "outdoor living",
      "terrace garden",
      "balcony design",
    ],
    type: "exterior",
  },
  {
    id: "entrance",
    label: "Lối vào",
    labelEn: "Entrance",
    icon: "enter",
    color: "#a855f7",
    keywords: [
      "house entrance design",
      "front door design",
      "entryway",
      "foyer design",
    ],
    type: "both",
  },
  {
    id: "modern_house",
    label: "Nhà hiện đại",
    labelEn: "Modern House",
    icon: "cube",
    color: "#64748b",
    keywords: [
      "modern house design",
      "contemporary architecture",
      "minimalist house",
      "modern home",
    ],
    type: "exterior",
  },
];

// ==================== FILTER OPTIONS ====================

type FilterType = "all" | "interior" | "exterior";
type OrientationType = "all" | "landscape" | "portrait" | "square";
type ColorTone = "all" | "warm" | "cool" | "neutral" | "dark" | "light";

const ORIENTATION_OPTIONS: {
  value: OrientationType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "all", label: "Tất cả", icon: "apps" },
  { value: "landscape", label: "Ngang", icon: "tablet-landscape" },
  { value: "portrait", label: "Dọc", icon: "tablet-portrait" },
  { value: "square", label: "Vuông", icon: "square" },
];

const COLOR_TONE_OPTIONS: {
  value: ColorTone;
  label: string;
  colors: string[];
}[] = [
  { value: "all", label: "Tất cả", colors: ["#6366f1", "#ec4899", "#22c55e"] },
  { value: "warm", label: "Ấm", colors: ["#f59e0b", "#ef4444", "#f97316"] },
  { value: "cool", label: "Lạnh", colors: ["#3b82f6", "#06b6d4", "#8b5cf6"] },
  {
    value: "neutral",
    label: "Trung tính",
    colors: ["#78716c", "#a8a29e", "#d6d3d1"],
  },
  { value: "dark", label: "Tối", colors: ["#1f2937", "#374151", "#4b5563"] },
  { value: "light", label: "Sáng", colors: ["#f9fafb", "#f3f4f6", "#e5e7eb"] },
];

// ==================== COMPONENTS ====================

interface PhotoItemProps {
  photo: PexelsPhoto;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
  selectionMode: boolean;
  index: number;
}

const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  isSelected,
  onPress,
  onLongPress,
  selectionMode,
  index,
}) => {
  const aspectRatio = photo.width / photo.height;
  const imageHeight = PHOTO_WIDTH / aspectRatio;

  return (
    <TouchableOpacity
      style={[
        styles.photoItem,
        { height: Math.min(imageHeight, PHOTO_WIDTH * 1.5) },
        isSelected && styles.photoItemSelected,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: photo.src.medium }}
        style={[styles.photoImage, { backgroundColor: photo.avg_color }]}
        resizeMode="cover"
      />

      {/* Selection indicator */}
      {selectionMode && (
        <View
          style={[
            styles.selectionIndicator,
            isSelected && styles.selectionIndicatorActive,
          ]}
        >
          {isSelected ? (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={MODERN_COLORS.primary}
            />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#fff" />
          )}
        </View>
      )}

      {/* Photographer info */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.photoGradient}
      >
        <Text style={styles.photographerName} numberOfLines={1}>
          📷 {photo.photographer}
        </Text>
      </LinearGradient>

      {/* Dimensions badge */}
      <View style={styles.dimensionsBadge}>
        <Text style={styles.dimensionsText}>
          {photo.width}×{photo.height}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

interface CategoryChipProps {
  category: DesignCategory;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.categoryChip,
      isSelected && {
        backgroundColor: category.color,
        borderColor: category.color,
      },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Ionicons
      name={category.icon}
      size={16}
      color={isSelected ? "#fff" : category.color}
    />
    <Text style={[styles.categoryChipText, isSelected && { color: "#fff" }]}>
      {category.label}
    </Text>
  </TouchableOpacity>
);

// ==================== MAIN COMPONENT ====================

interface DesignImageLibraryProps {
  onSelectImages?: (photos: PexelsPhoto[]) => void;
  maxSelection?: number;
  mode?: "browse" | "select";
}

export default function DesignImageLibrary({
  onSelectImages,
  maxSelection = 10,
  mode = "browse",
}: DesignImageLibraryProps) {
  const params = useLocalSearchParams<{ category?: string; mode?: string }>();

  // States
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category || null
  );
  const [orientation, setOrientation] = useState<OrientationType>("all");
  const [colorTone, setColorTone] = useState<ColorTone>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Selection states
  const [selectedPhotos, setSelectedPhotos] = useState<PexelsPhoto[]>([]);
  const [selectionMode, setSelectionMode] = useState(mode === "select");

  // Modal states
  const [viewingPhoto, setViewingPhoto] = useState<PexelsPhoto | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (filterType === "all") return DESIGN_CATEGORIES;
    return DESIGN_CATEGORIES.filter(
      (cat) => cat.type === filterType || cat.type === "both"
    );
  }, [filterType]);

  // Build search query
  const buildSearchQuery = useCallback(() => {
    if (searchQuery.trim()) {
      return searchQuery.trim();
    }

    if (selectedCategory) {
      const category = DESIGN_CATEGORIES.find((c) => c.id === selectedCategory);
      if (category) {
        const randomKeyword =
          category.keywords[
            Math.floor(Math.random() * category.keywords.length)
          ];
        return randomKeyword;
      }
    }

    // Default query based on filter type
    const defaultQueries = {
      all: "interior design architecture",
      interior: "modern interior design",
      exterior: "house exterior architecture",
    };
    return defaultQueries[filterType];
  }, [searchQuery, selectedCategory, filterType]);

  // Load photos
  const loadPhotos = useCallback(
    async (pageNum = 1, refresh = false) => {
      if (loading && !refresh) return;

      setLoading(true);
      try {
        const query = buildSearchQuery();
        const orientationParam =
          orientation === "all" ? undefined : orientation;

        const response = await pexelsService.searchPhotos(query, {
          page: pageNum,
          per_page: 20,
          orientation: orientationParam as
            | "landscape"
            | "portrait"
            | "square"
            | undefined,
        });

        let newPhotos = response.photos;

        // Filter by color tone if needed
        if (colorTone !== "all") {
          newPhotos = filterByColorTone(newPhotos, colorTone);
        }

        if (refresh || pageNum === 1) {
          setPhotos(newPhotos);
        } else {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }

        setHasMore(response.photos.length === 20);
        setPage(pageNum);
      } catch (error) {
        console.error("Error loading photos:", error);
        Alert.alert("Lỗi", "Không thể tải ảnh. Vui lòng thử lại.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buildSearchQuery, orientation, colorTone, loading]
  );

  // Filter photos by color tone
  const filterByColorTone = (
    photos: PexelsPhoto[],
    tone: ColorTone
  ): PexelsPhoto[] => {
    return photos.filter((photo) => {
      const color = photo.avg_color;
      if (!color) return true;

      // Parse hex color to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const brightness = (r + g + b) / 3;
      const warmth = r - b;

      switch (tone) {
        case "warm":
          return warmth > 30;
        case "cool":
          return warmth < -20;
        case "neutral":
          return Math.abs(warmth) <= 30 && brightness > 80 && brightness < 180;
        case "dark":
          return brightness < 100;
        case "light":
          return brightness > 180;
        default:
          return true;
      }
    });
  };

  // Effect to load photos when filters change
  useEffect(() => {
    loadPhotos(1, true);
  }, [selectedCategory, orientation, colorTone, filterType]);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    loadPhotos(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadPhotos(page + 1);
    }
  };

  const handleSearch = () => {
    loadPhotos(1, true);
  };

  const handlePhotoPress = (photo: PexelsPhoto) => {
    if (selectionMode) {
      togglePhotoSelection(photo);
    } else {
      setViewingPhoto(photo);
    }
  };

  const handlePhotoLongPress = (photo: PexelsPhoto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedPhotos([photo]);
    }
  };

  const togglePhotoSelection = (photo: PexelsPhoto) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPhotos((prev) => {
      const exists = prev.find((p) => p.id === photo.id);
      if (exists) {
        return prev.filter((p) => p.id !== photo.id);
      }
      if (prev.length >= maxSelection) {
        Alert.alert("Giới hạn", `Chỉ được chọn tối đa ${maxSelection} ảnh`);
        return prev;
      }
      return [...prev, photo];
    });
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedPhotos([]);
  };

  const handleConfirmSelection = () => {
    if (onSelectImages) {
      onSelectImages(selectedPhotos);
    }
    // If used as standalone, show success
    Alert.alert("Đã chọn", `${selectedPhotos.length} ảnh đã được chọn`, [
      { text: "OK", onPress: handleCancelSelection },
    ]);
  };

  const handleDownloadPhoto = async (photo: PexelsPhoto) => {
    try {
      setDownloading(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Cần quyền truy cập thư viện ảnh");
        return;
      }

      // Download file
      const fileUri =
        (FileSystem.documentDirectory || "") + `pexels_${photo.id}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(
        photo.src.large2x || photo.src.large,
        fileUri
      );

      // Save to gallery
      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Thành công", "Ảnh đã được lưu vào thư viện");
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Lỗi", "Không thể tải ảnh");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyUrl = async (photo: PexelsPhoto) => {
    await Clipboard.setStringAsync(photo.src.original);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Đã sao chép", "URL ảnh đã được sao chép");
  };

  const handleSharePhoto = async (photo: PexelsPhoto) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        const fileUri =
          (FileSystem.cacheDirectory || "") + `share_${photo.id}.jpg`;
        await FileSystem.downloadAsync(photo.src.large, fileUri);
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  // Render filter section
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Type filter tabs */}
      <View style={styles.typeFilterRow}>
        {(["all", "interior", "exterior"] as FilterType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeFilterTab,
              filterType === type && styles.typeFilterTabActive,
            ]}
            onPress={() => setFilterType(type)}
          >
            <Ionicons
              name={
                type === "all"
                  ? "apps"
                  : type === "interior"
                    ? "home"
                    : "business"
              }
              size={18}
              color={filterType === type ? "#fff" : MODERN_COLORS.textSecondary}
            />
            <Text
              style={[
                styles.typeFilterText,
                filterType === type && styles.typeFilterTextActive,
              ]}
            >
              {type === "all"
                ? "Tất cả"
                : type === "interior"
                  ? "Nội thất"
                  : "Ngoại thất"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search input */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Ionicons
            name="search"
            size={20}
            color={MODERN_COLORS.textSecondary}
          />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Tìm kiếm ảnh..."
            placeholderTextColor={MODERN_COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
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
        <TouchableOpacity
          style={[
            styles.filterButton,
            showFilters && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options"
            size={20}
            color={showFilters ? "#fff" : MODERN_COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Ionicons
            name="grid"
            size={16}
            color={!selectedCategory ? "#fff" : MODERN_COLORS.primary}
          />
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategory && { color: "#fff" },
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        {filteredCategories.map((category) => (
          <CategoryChip
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onPress={() =>
              setSelectedCategory(
                category.id === selectedCategory ? null : category.id
              )
            }
          />
        ))}
      </ScrollView>

      {/* Extended filters */}
      {showFilters && (
        <View style={styles.extendedFilters}>
          {/* Orientation */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Hướng ảnh</Text>
            <View style={styles.filterOptions}>
              {ORIENTATION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.filterOption,
                    orientation === opt.value && styles.filterOptionActive,
                  ]}
                  onPress={() => setOrientation(opt.value)}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={
                      orientation === opt.value
                        ? "#fff"
                        : MODERN_COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      orientation === opt.value && { color: "#fff" },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color tone */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Tông màu</Text>
            <View style={styles.filterOptions}>
              {COLOR_TONE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.filterOption,
                    colorTone === opt.value && styles.filterOptionActive,
                  ]}
                  onPress={() => setColorTone(opt.value)}
                >
                  <View style={styles.colorPreview}>
                    {opt.colors.map((c, i) => (
                      <View
                        key={i}
                        style={[styles.colorDot, { backgroundColor: c }]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.filterOptionText,
                      colorTone === opt.value && { color: "#fff" },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );

  // Render photo viewer modal
  const renderPhotoViewer = () => (
    <Modal
      visible={!!viewingPhoto}
      transparent
      animationType="fade"
      onRequestClose={() => setViewingPhoto(null)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={90} style={StyleSheet.absoluteFill} tint="dark" />

        {/* Close button */}
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setViewingPhoto(null)}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {viewingPhoto && (
          <>
            {/* Image */}
            <Image
              source={{
                uri: viewingPhoto.src.large2x || viewingPhoto.src.large,
              }}
              style={styles.modalImage}
              resizeMode="contain"
            />

            {/* Info panel */}
            <View style={styles.modalInfoPanel}>
              <View style={styles.modalInfoHeader}>
                <View>
                  <Text style={styles.modalPhotographer}>
                    📷 {viewingPhoto.photographer}
                  </Text>
                  <Text style={styles.modalDimensions}>
                    {viewingPhoto.width} × {viewingPhoto.height}
                  </Text>
                </View>
                <View
                  style={[
                    styles.modalColorSwatch,
                    { backgroundColor: viewingPhoto.avg_color },
                  ]}
                />
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleDownloadPhoto(viewingPhoto)}
                  disabled={downloading}
                >
                  {downloading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="download" size={22} color="#fff" />
                  )}
                  <Text style={styles.modalActionText}>Tải xuống</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleCopyUrl(viewingPhoto)}
                >
                  <Ionicons name="copy" size={22} color="#fff" />
                  <Text style={styles.modalActionText}>Sao chép</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleSharePhoto(viewingPhoto)}
                >
                  <Ionicons name="share-social" size={22} color="#fff" />
                  <Text style={styles.modalActionText}>Chia sẻ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    { backgroundColor: MODERN_COLORS.primary },
                  ]}
                  onPress={() => {
                    setViewingPhoto(null);
                    setSelectionMode(true);
                    setSelectedPhotos([viewingPhoto]);
                  }}
                >
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                  <Text style={styles.modalActionText}>Chọn ảnh</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </Modal>
  );

  // Render selection bar
  const renderSelectionBar = () => {
    if (!selectionMode) return null;

    return (
      <View style={styles.selectionBar}>
        <TouchableOpacity
          style={styles.selectionCancelBtn}
          onPress={handleCancelSelection}
        >
          <Ionicons name="close" size={24} color={MODERN_COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.selectionCount}>
          Đã chọn {selectedPhotos.length}/{maxSelection}
        </Text>

        <TouchableOpacity
          style={[
            styles.selectionConfirmBtn,
            selectedPhotos.length === 0 && styles.selectionConfirmBtnDisabled,
          ]}
          onPress={handleConfirmSelection}
          disabled={selectedPhotos.length === 0}
        >
          <Ionicons name="checkmark" size={24} color="#fff" />
          <Text style={styles.selectionConfirmText}>Xong</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render photo item
  const renderPhoto = ({
    item,
    index,
  }: {
    item: PexelsPhoto;
    index: number;
  }) => (
    <PhotoItem
      photo={item}
      isSelected={selectedPhotos.some((p) => p.id === item.id)}
      onPress={() => handlePhotoPress(item)}
      onLongPress={() => handlePhotoLongPress(item)}
      selectionMode={selectionMode}
      index={index}
    />
  );

  // Render footer
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Thư viện hình ảnh</Text>
          <Text style={styles.headerSubtitle}>Nội thất & Ngoại thất đẹp</Text>
        </View>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => {
            if (selectionMode) {
              handleCancelSelection();
            } else {
              setSelectionMode(true);
            }
          }}
        >
          <Ionicons
            name={selectionMode ? "close-circle" : "checkbox"}
            size={24}
            color={MODERN_COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Selection bar */}
      {renderSelectionBar()}

      {/* Photo grid */}
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => `photo-${item.id}`}
        numColumns={COLUMN_COUNT}
        columnWrapperStyle={styles.photoRow}
        contentContainerStyle={styles.photoList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[MODERN_COLORS.primary]}
            tintColor={MODERN_COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="images-outline"
                size={64}
                color={MODERN_COLORS.textSecondary}
              />
              <Text style={styles.emptyText}>Không tìm thấy ảnh</Text>
              <Text style={styles.emptySubtext}>
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Text>
            </View>
          ) : null
        }
      />

      {/* Photo viewer modal */}
      {renderPhotoViewer()}

      {/* Pexels attribution */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>Powered by </Text>
        <Text style={styles.attributionBrand}>Pexels</Text>
      </View>
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
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: MODERN_SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: MODERN_RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersContainer: {
    backgroundColor: MODERN_COLORS.background,
    paddingBottom: MODERN_SPACING.sm,
  },
  typeFilterRow: {
    flexDirection: "row",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    gap: MODERN_SPACING.xs,
  },
  typeFilterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.surface,
    gap: MODERN_SPACING.xs,
  },
  typeFilterTabActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  typeFilterText: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
  },
  typeFilterTextActive: {
    color: "#fff",
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.sm,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.lg,
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.sm,
    height: 44,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 14,
    color: MODERN_COLORS.textPrimary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: MODERN_RADIUS.md,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary,
  },
  filterButtonActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  categoriesScroll: {
    paddingHorizontal: MODERN_SPACING.md,
    gap: MODERN_SPACING.xs,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.surface,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    gap: MODERN_SPACING.xs,
    marginRight: MODERN_SPACING.xs,
  },
  categoryChipActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: MODERN_COLORS.textPrimary,
  },
  extendedFilters: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingTop: MODERN_SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
    marginTop: MODERN_SPACING.sm,
  },
  filterSection: {
    marginBottom: MODERN_SPACING.md,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: MODERN_COLORS.textSecondary,
    marginBottom: MODERN_SPACING.sm,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: MODERN_SPACING.xs,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
    borderRadius: MODERN_RADIUS.sm,
    backgroundColor: MODERN_COLORS.surface,
    gap: 6,
  },
  filterOptionActive: {
    backgroundColor: MODERN_COLORS.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
  },
  colorPreview: {
    flexDirection: "row",
    gap: 2,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  selectionCancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionCount: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  selectionConfirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: MODERN_SPACING.xs,
  },
  selectionConfirmBtnDisabled: {
    opacity: 0.5,
  },
  selectionConfirmText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  photoList: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: 100,
  },
  photoRow: {
    gap: PHOTO_GAP,
    marginBottom: PHOTO_GAP,
  },
  photoItem: {
    width: PHOTO_WIDTH,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
    backgroundColor: MODERN_COLORS.surface,
    ...MODERN_SHADOWS.sm,
  },
  photoItemSelected: {
    borderWidth: 3,
    borderColor: MODERN_COLORS.primary,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  selectionIndicator: {
    position: "absolute",
    top: MODERN_SPACING.sm,
    right: MODERN_SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectionIndicatorActive: {
    backgroundColor: "#fff",
  },
  photoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: MODERN_SPACING.sm,
    paddingVertical: MODERN_SPACING.xs,
    paddingTop: MODERN_SPACING.lg,
  },
  photographerName: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "500",
  },
  dimensionsBadge: {
    position: "absolute",
    top: MODERN_SPACING.sm,
    left: MODERN_SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dimensionsText: {
    fontSize: 9,
    color: "#fff",
    fontWeight: "500",
  },
  loadingFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.lg,
    gap: MODERN_SPACING.sm,
  },
  loadingText: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
    marginTop: MODERN_SPACING.md,
  },
  emptySubtext: {
    fontSize: 13,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  modalCloseButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  modalImage: {
    flex: 1,
    width: SCREEN_WIDTH,
    marginTop: 60,
  },
  modalInfoPanel: {
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: MODERN_SPACING.lg,
    paddingBottom: Platform.OS === "ios" ? 40 : MODERN_SPACING.lg,
  },
  modalInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: MODERN_SPACING.md,
  },
  modalPhotographer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  modalDimensions: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  modalColorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  modalActions: {
    flexDirection: "row",
    gap: MODERN_SPACING.sm,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.md,
    gap: 6,
  },
  modalActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  attribution: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  attributionText: {
    fontSize: 11,
    color: MODERN_COLORS.textSecondary,
  },
  attributionBrand: {
    fontSize: 11,
    fontWeight: "700",
    color: "#05A081",
  },
});
