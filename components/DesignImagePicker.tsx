/**
 * Design Image Picker
 * Component chọn ảnh từ thư viện nội thất/ngoại thất cho bài đăng
 * Created: 19/01/2026
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
} from "@/constants/modern-minimal-styles";
import pexelsService, { type PexelsPhoto } from "@/services/pexelsService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ==================== QUICK CATEGORIES ====================

const QUICK_CATEGORIES = [
  {
    id: "living",
    label: "Phòng khách",
    query: "modern living room interior",
    icon: "home",
  },
  {
    id: "bedroom",
    label: "Phòng ngủ",
    query: "bedroom interior design",
    icon: "bed",
  },
  {
    id: "kitchen",
    label: "Phòng bếp",
    query: "modern kitchen design",
    icon: "restaurant",
  },
  {
    id: "bathroom",
    label: "Phòng tắm",
    query: "luxury bathroom design",
    icon: "water",
  },
  {
    id: "villa",
    label: "Biệt thự",
    query: "modern villa exterior",
    icon: "business",
  },
  {
    id: "garden",
    label: "Sân vườn",
    query: "garden landscape design",
    icon: "leaf",
  },
  {
    id: "pool",
    label: "Hồ bơi",
    query: "swimming pool design",
    icon: "water-outline",
  },
  {
    id: "office",
    label: "Văn phòng",
    query: "modern home office",
    icon: "briefcase",
  },
] as const;

// ==================== TYPES ====================

export interface SelectedImage {
  id: string;
  url: string;
  thumbnail: string;
  photographer: string;
  width: number;
  height: number;
  avgColor: string;
  source: "pexels";
}

interface DesignImagePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectImages: (images: SelectedImage[]) => void;
  maxSelection?: number;
  initialCategory?: string;
  title?: string;
}

// ==================== COMPONENT ====================

export default function DesignImagePicker({
  visible,
  onClose,
  onSelectImages,
  maxSelection = 5,
  initialCategory,
  title = "Chọn ảnh thiết kế",
}: DesignImagePickerProps) {
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    initialCategory || "living"
  );
  const [selectedPhotos, setSelectedPhotos] = useState<PexelsPhoto[]>([]);
  const [page, setPage] = useState(1);

  // Load photos
  const loadPhotos = useCallback(
    async (query: string, pageNum = 1, append = false) => {
      if (loading && !append) return;

      setLoading(true);
      try {
        const response = await pexelsService.searchPhotos(query, {
          page: pageNum,
          per_page: 20,
          orientation: "landscape",
        });

        if (append) {
          setPhotos((prev) => [...prev, ...response.photos]);
        } else {
          setPhotos(response.photos);
        }
        setPage(pageNum);
      } catch (error) {
        console.error("Error loading photos:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Load initial category
  useEffect(() => {
    if (visible) {
      const category = QUICK_CATEGORIES.find((c) => c.id === activeCategory);
      if (category) {
        loadPhotos(category.query, 1);
      }
    }
  }, [visible, activeCategory]);

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = QUICK_CATEGORIES.find((c) => c.id === categoryId);
    if (category) {
      setSearchQuery("");
      loadPhotos(category.query, 1);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadPhotos(searchQuery.trim(), 1);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && photos.length > 0) {
      const query =
        searchQuery.trim() ||
        QUICK_CATEGORIES.find((c) => c.id === activeCategory)?.query ||
        "";
      loadPhotos(query, page + 1, true);
    }
  };

  // Toggle photo selection
  const toggleSelection = (photo: PexelsPhoto) => {
    setSelectedPhotos((prev) => {
      const exists = prev.find((p) => p.id === photo.id);
      if (exists) {
        return prev.filter((p) => p.id !== photo.id);
      }
      if (prev.length >= maxSelection) {
        return prev;
      }
      return [...prev, photo];
    });
  };

  // Confirm selection
  const handleConfirm = () => {
    const images: SelectedImage[] = selectedPhotos.map((photo) => ({
      id: `pexels-${photo.id}`,
      url: photo.src.large2x || photo.src.large,
      thumbnail: photo.src.medium,
      photographer: photo.photographer,
      width: photo.width,
      height: photo.height,
      avgColor: photo.avg_color,
      source: "pexels",
    }));
    onSelectImages(images);
    setSelectedPhotos([]);
    onClose();
  };

  // Reset on close
  const handleClose = () => {
    setSelectedPhotos([]);
    onClose();
  };

  // Render photo item
  const renderPhoto = ({ item }: { item: PexelsPhoto }) => {
    const isSelected = selectedPhotos.some((p) => p.id === item.id);
    const selectionIndex = selectedPhotos.findIndex((p) => p.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.photoItem, isSelected && styles.photoItemSelected]}
        onPress={() => toggleSelection(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.src.medium }}
          style={[styles.photoImage, { backgroundColor: item.avg_color }]}
          resizeMode="cover"
        />

        {/* Selection badge */}
        <View
          style={[
            styles.selectionBadge,
            isSelected && styles.selectionBadgeActive,
          ]}
        >
          {isSelected ? (
            <Text style={styles.selectionNumber}>{selectionIndex + 1}</Text>
          ) : (
            <View style={styles.selectionEmpty} />
          )}
        </View>

        {/* Photo info */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.photoGradient}
        >
          <Text style={styles.photographerText} numberOfLines={1}>
            📷 {item.photographer}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons
              name="close"
              size={24}
              color={MODERN_COLORS.textPrimary}
            />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>
              {selectedPhotos.length}/{maxSelection} ảnh đã chọn
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              selectedPhotos.length === 0 && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedPhotos.length === 0}
          >
            <Text
              style={[
                styles.confirmText,
                selectedPhotos.length === 0 && styles.confirmTextDisabled,
              ]}
            >
              Xong
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInput}>
            <Ionicons
              name="search"
              size={20}
              color={MODERN_COLORS.textSecondary}
            />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Tìm kiếm ảnh thiết kế..."
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
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {QUICK_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                activeCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryChange(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={
                  activeCategory === category.id
                    ? "#fff"
                    : MODERN_COLORS.primary
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category.id && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected preview */}
        {selectedPhotos.length > 0 && (
          <View style={styles.selectedPreview}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedPhotos.map((photo, index) => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.previewItem}
                  onPress={() => toggleSelection(photo)}
                >
                  <Image
                    source={{ uri: photo.src.tiny }}
                    style={styles.previewImage}
                  />
                  <View style={styles.previewRemove}>
                    <Ionicons name="close" size={12} color="#fff" />
                  </View>
                  <View style={styles.previewIndex}>
                    <Text style={styles.previewIndexText}>{index + 1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Photo grid */}
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => `photo-${item.id}`}
          numColumns={2}
          columnWrapperStyle={styles.photoRow}
          contentContainerStyle={styles.photoList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            loading && photos.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải ảnh...</Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            loading && photos.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={MODERN_COLORS.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="images-outline"
                  size={48}
                  color={MODERN_COLORS.textSecondary}
                />
                <Text style={styles.emptyText}>Không tìm thấy ảnh</Text>
              </View>
            ) : null
          }
        />

        {/* Pexels attribution */}
        <View style={styles.attribution}>
          <Text style={styles.attributionText}>Ảnh từ </Text>
          <Text style={styles.attributionBrand}>Pexels</Text>
          <Text style={styles.attributionText}> - Miễn phí sử dụng</Text>
        </View>
      </View>
    </Modal>
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
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: MODERN_COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: MODERN_COLORS.textSecondary,
    marginTop: 2,
  },
  confirmButton: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.primary,
  },
  confirmTextDisabled: {
    color: MODERN_COLORS.textSecondary,
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
    height: 44,
    gap: MODERN_SPACING.sm,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 15,
    color: MODERN_COLORS.textPrimary,
  },
  categoriesContainer: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: MODERN_SPACING.sm,
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
    borderColor: MODERN_COLORS.primary + "30",
    marginRight: MODERN_SPACING.xs,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: MODERN_COLORS.primary,
  },
  categoryTextActive: {
    color: "#fff",
  },
  selectedPreview: {
    backgroundColor: MODERN_COLORS.surface,
    paddingVertical: MODERN_SPACING.sm,
    paddingHorizontal: MODERN_SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  previewItem: {
    width: 60,
    height: 60,
    marginRight: MODERN_SPACING.sm,
    borderRadius: MODERN_RADIUS.sm,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewRemove: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewIndex: {
    position: "absolute",
    bottom: 2,
    left: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  previewIndexText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  photoList: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingBottom: 80,
  },
  photoRow: {
    gap: MODERN_SPACING.sm,
    marginBottom: MODERN_SPACING.sm,
  },
  photoItem: {
    flex: 1,
    aspectRatio: 4 / 3,
    borderRadius: MODERN_RADIUS.md,
    overflow: "hidden",
    backgroundColor: MODERN_COLORS.surface,
  },
  photoItemSelected: {
    borderWidth: 3,
    borderColor: MODERN_COLORS.primary,
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  selectionBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: MODERN_COLORS.border,
  },
  selectionBadgeActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },
  selectionNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  selectionEmpty: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: MODERN_COLORS.textSecondary,
  },
  photoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: MODERN_SPACING.sm,
    paddingTop: MODERN_SPACING.lg,
  },
  photographerText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.xxl,
  },
  loadingText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.sm,
  },
  loadingMore: {
    paddingVertical: MODERN_SPACING.lg,
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: MODERN_SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: 14,
    color: MODERN_COLORS.textSecondary,
    marginTop: MODERN_SPACING.sm,
  },
  attribution: {
    position: "absolute",
    bottom: 20,
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
