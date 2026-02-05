/**
 * Design Library - Thư viện mẫu thiết kế
 * ======================================
 * - Đa dạng mẫu thiết kế
 * - Sắp xếp: Admin & Người đăng lên đầu
 * - Bộ lọc hiện đại, đơn giản
 */

import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// ==================== TYPES ====================

export type DesignCategory =
  | "all"
  | "architecture"
  | "interior"
  | "landscape"
  | "furniture"
  | "material"
  | "lighting"
  | "color"
  | "template";

export type SortOption =
  | "recommended"
  | "newest"
  | "popular"
  | "name_asc"
  | "name_desc";

export type AuthorType = "admin" | "staff" | "user" | "verified";

export interface DesignTemplate {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  category: DesignCategory;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
    type: AuthorType;
    isVerified: boolean;
  };
  stats: {
    views: number;
    likes: number;
    downloads: number;
    saves: number;
  };
  isPremium: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DesignLibraryProps {
  templates?: DesignTemplate[];
  onTemplatePress?: (template: DesignTemplate) => void;
  onSaveTemplate?: (template: DesignTemplate) => void;
  onDownloadTemplate?: (template: DesignTemplate) => void;
  currentUserId?: string;
}

// ==================== CONSTANTS ====================

const CATEGORIES: { type: DesignCategory; label: string; icon: string }[] = [
  { type: "all", label: "Tất cả", icon: "grid-outline" },
  { type: "architecture", label: "Kiến trúc", icon: "business-outline" },
  { type: "interior", label: "Nội thất", icon: "bed-outline" },
  { type: "landscape", label: "Cảnh quan", icon: "leaf-outline" },
  { type: "furniture", label: "Nội thất", icon: "cube-outline" },
  { type: "material", label: "Vật liệu", icon: "layers-outline" },
  { type: "lighting", label: "Ánh sáng", icon: "bulb-outline" },
  { type: "color", label: "Màu sắc", icon: "color-palette-outline" },
  { type: "template", label: "Mẫu", icon: "documents-outline" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recommended", label: "Đề xuất" },
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Phổ biến" },
  { value: "name_asc", label: "A → Z" },
  { value: "name_desc", label: "Z → A" },
];

const AUTHOR_PRIORITY: Record<AuthorType, number> = {
  admin: 0,
  staff: 1,
  verified: 2,
  user: 3,
};

// ==================== SAMPLE DATA ====================

const SAMPLE_TEMPLATES: DesignTemplate[] = [
  {
    id: "1",
    title: "Villa Hiện Đại",
    description: "Thiết kế biệt thự phong cách hiện đại với không gian mở",
    thumbnail:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
    images: [],
    category: "architecture",
    tags: ["villa", "modern", "luxury"],
    author: {
      id: "admin1",
      name: "Admin Design",
      type: "admin",
      isVerified: true,
    },
    stats: { views: 1520, likes: 234, downloads: 89, saves: 156 },
    isPremium: false,
    isFeatured: true,
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-01-25T10:00:00Z",
  },
  {
    id: "2",
    title: "Phòng Khách Minimalist",
    description: "Không gian phòng khách tối giản, tinh tế",
    thumbnail:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    images: [],
    category: "interior",
    tags: ["living room", "minimalist", "scandinavian"],
    author: {
      id: "staff1",
      name: "Designer Pro",
      type: "staff",
      isVerified: true,
    },
    stats: { views: 980, likes: 167, downloads: 45, saves: 98 },
    isPremium: true,
    isFeatured: false,
    createdAt: "2025-01-18T10:00:00Z",
    updatedAt: "2025-01-22T10:00:00Z",
  },
  {
    id: "3",
    title: "Sân Vườn Nhiệt Đới",
    description: "Thiết kế sân vườn phong cách nhiệt đới",
    thumbnail:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    images: [],
    category: "landscape",
    tags: ["garden", "tropical", "outdoor"],
    author: {
      id: "user1",
      name: "Nguyễn Văn A",
      type: "verified",
      isVerified: true,
    },
    stats: { views: 756, likes: 112, downloads: 34, saves: 67 },
    isPremium: false,
    isFeatured: false,
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
  },
  {
    id: "4",
    title: "Bếp Đảo Sang Trọng",
    description: "Thiết kế bếp với đảo bếp trung tâm",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    images: [],
    category: "interior",
    tags: ["kitchen", "island", "luxury"],
    author: {
      id: "admin2",
      name: "Head Designer",
      type: "admin",
      isVerified: true,
    },
    stats: { views: 1234, likes: 198, downloads: 67, saves: 145 },
    isPremium: true,
    isFeatured: true,
    createdAt: "2025-01-22T10:00:00Z",
    updatedAt: "2025-01-26T10:00:00Z",
  },
  {
    id: "5",
    title: "Đèn Trang Trí LED",
    description: "Bộ sưu tập đèn LED trang trí nội thất",
    thumbnail:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
    images: [],
    category: "lighting",
    tags: ["led", "decorative", "ambient"],
    author: {
      id: "user2",
      name: "Trần Thị B",
      type: "user",
      isVerified: false,
    },
    stats: { views: 432, likes: 56, downloads: 12, saves: 34 },
    isPremium: false,
    isFeatured: false,
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "6",
    title: "Bảng Màu Pastel",
    description: "Bảng phối màu pastel cho nội thất",
    thumbnail:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    images: [],
    category: "color",
    tags: ["pastel", "color palette", "soft"],
    author: {
      id: "staff2",
      name: "Color Expert",
      type: "staff",
      isVerified: true,
    },
    stats: { views: 876, likes: 145, downloads: 78, saves: 112 },
    isPremium: false,
    isFeatured: false,
    createdAt: "2025-01-12T10:00:00Z",
    updatedAt: "2025-01-18T10:00:00Z",
  },
];

// ==================== COMPONENTS ====================

const CategoryChip: React.FC<{
  category: { type: DesignCategory; label: string; icon: string };
  isSelected: boolean;
  onPress: () => void;
}> = ({ category, isSelected, onPress }) => {
  const primary = useThemeColor({}, "primary");
  const background = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[
        styles.categoryChip,
        {
          backgroundColor: isSelected ? primary : background,
          borderColor: isSelected ? primary : "#E5E7EB",
        },
      ]}
    >
      <Ionicons
        name={category.icon as any}
        size={16}
        color={isSelected ? "#FFF" : text}
      />
      <Text
        style={[styles.categoryChipText, { color: isSelected ? "#FFF" : text }]}
      >
        {category.label}
      </Text>
    </Pressable>
  );
};

const SortDropdown: React.FC<{
  value: SortOption;
  onChange: (value: SortOption) => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const background = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const primary = useThemeColor({}, "primary");

  const selectedOption = SORT_OPTIONS.find((o) => o.value === value);

  return (
    <View style={styles.sortContainer}>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={[styles.sortButton, { backgroundColor: background }]}
      >
        <Ionicons name="swap-vertical" size={18} color={primary} />
        <Text style={[styles.sortButtonText, { color: text }]}>
          {selectedOption?.label}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={text}
        />
      </Pressable>

      {isOpen && (
        <View style={[styles.sortDropdown, { backgroundColor: background }]}>
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setIsOpen(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.sortOption,
                value === option.value && { backgroundColor: `${primary}15` },
              ]}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  { color: value === option.value ? primary : text },
                ]}
              >
                {option.label}
              </Text>
              {value === option.value && (
                <Ionicons name="checkmark" size={18} color={primary} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const AuthorBadge: React.FC<{ type: AuthorType; isVerified: boolean }> = ({
  type,
  isVerified,
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case "admin":
        return {
          color: "#EF4444",
          bg: "#FEE2E2",
          label: "Admin",
          icon: "shield",
        };
      case "staff":
        return {
          color: "#3B82F6",
          bg: "#DBEAFE",
          label: "Staff",
          icon: "briefcase",
        };
      case "verified":
        return {
          color: "#10B981",
          bg: "#D1FAE5",
          label: "Verified",
          icon: "checkmark-circle",
        };
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  if (!config && !isVerified) return null;

  return (
    <View
      style={[styles.authorBadge, { backgroundColor: config?.bg || "#D1FAE5" }]}
    >
      <Ionicons
        name={(config?.icon || "checkmark-circle") as any}
        size={10}
        color={config?.color || "#10B981"}
      />
      {config && (
        <Text style={[styles.authorBadgeText, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
};

const TemplateCard: React.FC<{
  template: DesignTemplate;
  onPress: () => void;
  onSave?: () => void;
}> = ({ template, onPress, onSave }) => {
  const [isLiked, setIsLiked] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const background = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.templateCard, { backgroundColor: background }]}
      >
        {/* Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: template.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />

          {/* Badges */}
          <View style={styles.cardBadges}>
            {template.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={10} color="#FFF" />
                <Text style={styles.featuredText}>Nổi bật</Text>
              </View>
            )}
            {template.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="diamond" size={10} color="#FFF" />
              </View>
            )}
          </View>

          {/* Like button */}
          <Pressable onPress={handleLike} style={styles.likeButton}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#EF4444" : "#FFF"}
            />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: text }]} numberOfLines={1}>
            {template.title}
          </Text>

          {/* Author */}
          <View style={styles.authorRow}>
            <View style={styles.authorInfo}>
              {template.author.avatar ? (
                <Image
                  source={{ uri: template.author.avatar }}
                  style={styles.authorAvatar}
                />
              ) : (
                <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {template.author.name.charAt(0)}
                  </Text>
                </View>
              )}
              <Text
                style={[styles.authorName, { color: textMuted }]}
                numberOfLines={1}
              >
                {template.author.name}
              </Text>
            </View>
            <AuthorBadge
              type={template.author.type}
              isVerified={template.author.isVerified}
            />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={textMuted} />
              <Text style={[styles.statText, { color: textMuted }]}>
                {formatNumber(template.stats.views)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={14} color={textMuted} />
              <Text style={[styles.statText, { color: textMuted }]}>
                {formatNumber(template.stats.likes)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="download-outline" size={14} color={textMuted} />
              <Text style={[styles.statText, { color: textMuted }]}>
                {formatNumber(template.stats.downloads)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ==================== MAIN COMPONENT ====================

export function DesignLibrary({
  templates = SAMPLE_TEMPLATES,
  onTemplatePress,
  onSaveTemplate,
  currentUserId,
}: DesignLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<DesignCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false);

  const background = useThemeColor({}, "background");
  const cardBg = useThemeColor({}, "card");
  const text = useThemeColor({}, "text");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");

  // Filter & Sort logic
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          t.author.name.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Featured filter
    if (showOnlyFeatured) {
      result = result.filter((t) => t.isFeatured);
    }

    // Sort - Admin & Staff always first, then by selected sort
    result.sort((a, b) => {
      // Priority 1: Author type (Admin → Staff → Verified → User)
      const authorPriorityA = AUTHOR_PRIORITY[a.author.type];
      const authorPriorityB = AUTHOR_PRIORITY[b.author.type];

      if (authorPriorityA !== authorPriorityB) {
        return authorPriorityA - authorPriorityB;
      }

      // Priority 2: Current user's templates
      if (currentUserId) {
        if (a.author.id === currentUserId && b.author.id !== currentUserId)
          return -1;
        if (b.author.id === currentUserId && a.author.id !== currentUserId)
          return 1;
      }

      // Priority 3: Selected sort option
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popular":
          return (
            b.stats.views + b.stats.likes - (a.stats.views + a.stats.likes)
          );
        case "name_asc":
          return a.title.localeCompare(b.title, "vi");
        case "name_desc":
          return b.title.localeCompare(a.title, "vi");
        case "recommended":
        default:
          // Featured first, then by engagement
          if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
          return (
            b.stats.views +
            b.stats.likes * 2 -
            (a.stats.views + a.stats.likes * 2)
          );
      }
    });

    return result;
  }, [
    templates,
    searchQuery,
    selectedCategory,
    sortBy,
    showOnlyFeatured,
    currentUserId,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={textMuted} />
        <TextInput
          style={[styles.searchInput, { color: text }]}
          placeholder="Tìm kiếm mẫu thiết kế..."
          placeholderTextColor={textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={textMuted} />
          </Pressable>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <CategoryChip
            key={cat.type}
            category={cat}
            isSelected={selectedCategory === cat.type}
            onPress={() => setSelectedCategory(cat.type)}
          />
        ))}
      </ScrollView>

      {/* Filters Row */}
      <View style={styles.filtersRow}>
        <View style={styles.filterLeft}>
          <Pressable
            onPress={() => {
              setShowOnlyFeatured(!showOnlyFeatured);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.featuredFilter,
              {
                backgroundColor: showOnlyFeatured
                  ? `${primary}15`
                  : "transparent",
                borderColor: showOnlyFeatured ? primary : "#E5E7EB",
              },
            ]}
          >
            <Ionicons
              name="star"
              size={14}
              color={showOnlyFeatured ? primary : textMuted}
            />
            <Text
              style={[
                styles.featuredFilterText,
                { color: showOnlyFeatured ? primary : textMuted },
              ]}
            >
              Nổi bật
            </Text>
          </Pressable>

          <Text style={[styles.resultCount, { color: textMuted }]}>
            {filteredTemplates.length} mẫu
          </Text>
        </View>

        <SortDropdown value={sortBy} onChange={setSortBy} />
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={64} color={textMuted} />
      <Text style={[styles.emptyTitle, { color: text }]}>
        Không tìm thấy mẫu thiết kế
      </Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {renderHeader()}

      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TemplateCard
            template={item}
            onPress={() => onTemplatePress?.(item)}
            onSave={() => onSaveTemplate?.(item)}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[primary]}
            tintColor={primary}
          />
        }
      />
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categoriesScroll: {
    marginTop: 12,
  },
  categoriesContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  filtersRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 8,
  },
  filterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featuredFilter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  featuredFilterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  resultCount: {
    fontSize: 13,
  },
  sortContainer: {
    position: "relative",
    zIndex: 100,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  sortDropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    width: 140,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sortOptionText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  templateCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnailContainer: {
    position: "relative",
    height: CARD_WIDTH * 0.75,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  cardBadges: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    gap: 6,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  premiumBadge: {
    backgroundColor: "#8B5CF6",
    padding: 4,
    borderRadius: 12,
  },
  likeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  avatarPlaceholder: {
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  authorName: {
    fontSize: 11,
    flex: 1,
  },
  authorBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  authorBadgeText: {
    fontSize: 9,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});

export default DesignLibrary;
