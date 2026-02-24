/**
 * Facebook-Style Community Feed Screen
 * ======================================
 *
 * Infinite scroll feed combining content from multiple sources
 * with Facebook-like UI/UX for seamless browsing experience.
 *
 * Features:
 * - Infinite scroll with FlatList
 * - Stories carousel at top
 * - Create post section
 * - Pull-to-refresh
 * - Multi-source content aggregation
 * - Smooth animations
 *
 * @author ThietKeResort Team
 * @created 2025-01-20
 */

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewToken,
} from "react-native";
import Animated, {
    FadeInDown,
    interpolate,
    SharedValue,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
    CreatePostCard,
    FacebookFeedCard,
    StoryCard,
} from "../../components/community/FacebookFeedCard";
import {
    MediaFile,
    useFullMediaViewer,
} from "../../components/ui/full-media-viewer";
import { useAuth } from "../../context/AuthContext";
import { useCommunityFeed } from "../../hooks/useCommunityFeed";
import {
    CommunityFeedItem,
    FeedItemType,
} from "../../services/communityFeedService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============================================
// Theme Constants
// ============================================
const COLORS = {
  background: "#F0F2F5",
  surface: "#FFFFFF",
  primary: "#1877F2",
  text: "#1C1E21",
  textSecondary: "#65676B",
  textTertiary: "#8A8D91",
  border: "#E4E6EB",
  divider: "#CED0D4",
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

// ============================================
// Filter Tabs
// ============================================
interface FilterTab {
  id: FeedItemType | "all";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_TABS: FilterTab[] = [
  { id: "all", label: "Tất cả", icon: "apps" },
  { id: "development_plan", label: "Kế hoạch", icon: "flag" },
  { id: "announcement", label: "Thông báo", icon: "megaphone" },
  { id: "news", label: "Tin tức", icon: "newspaper" },
  { id: "video", label: "Video", icon: "videocam" },
  { id: "photo", label: "Ảnh", icon: "images" },
];

// ============================================
// Header Component
// ============================================
interface HeaderProps {
  scrollY: SharedValue<number>;
  onSearchPress: () => void;
  onMessagesPress: () => void;
}

function Header({ scrollY, onSearchPress, onMessagesPress }: HeaderProps) {
  const insets = useSafeAreaInsets();

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 50], [0, 1], "clamp");
    return {
      backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      borderBottomColor: `rgba(206, 208, 212, ${opacity})`,
    };
  });

  return (
    <Animated.View
      style={[styles.header, { paddingTop: insets.top }, headerAnimatedStyle]}
    >
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Cộng đồng</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={onSearchPress}>
            <Ionicons name="search" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={onMessagesPress}>
            <Ionicons
              name="chatbubble-ellipses"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ============================================
// Stories Section
// ============================================
interface StoriesSectionProps {
  items: CommunityFeedItem[];
  onStoryPress: (item: CommunityFeedItem) => void;
  onCreateStory: () => void;
}

function StoriesSection({
  items,
  onStoryPress,
  onCreateStory,
}: StoriesSectionProps) {
  const { user } = useAuth();

  // Get items with images for stories
  const storyItems = useMemo(() => {
    return items.filter((item) => item.imageUrl).slice(0, 10);
  }, [items]);

  if (storyItems.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.storiesContainer}
    >
      <FlatList
        data={storyItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesList}
        keyExtractor={(item) => `story-${item.id}`}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.createStoryCard}
            onPress={onCreateStory}
          >
            <View style={styles.createStoryImageContainer}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.createStoryUserImage}
                />
              ) : (
                <View style={styles.createStoryPlaceholder}>
                  <Ionicons
                    name="person"
                    size={32}
                    color={COLORS.textSecondary}
                  />
                </View>
              )}
              <View style={styles.createStoryPlusBtn}>
                <Ionicons name="add" size={18} color="white" />
              </View>
            </View>
            <Text style={styles.createStoryText}>Tạo tin</Text>
          </TouchableOpacity>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={SlideInRight.delay(index * 50).duration(300)}
          >
            <StoryCard item={item} onPress={() => onStoryPress(item)} />
          </Animated.View>
        )}
      />
    </Animated.View>
  );
}

// ============================================
// Filter Chips
// ============================================
interface FilterChipsProps {
  activeFilter: FeedItemType | "all";
  onFilterChange: (filter: FeedItemType | "all") => void;
  counts: Record<string, number>;
}

function FilterChips({
  activeFilter,
  onFilterChange,
  counts,
}: FilterChipsProps) {
  return (
    <View style={styles.filterChipsContainer}>
      <FlatList
        data={FILTER_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isActive = activeFilter === item.id;
          const count = counts[item.id] || 0;

          return (
            <TouchableOpacity
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => onFilterChange(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={isActive ? "white" : COLORS.text}
              />
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
              {count > 0 && item.id !== "all" && (
                <View
                  style={[
                    styles.filterChipBadge,
                    isActive && styles.filterChipBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipBadgeText,
                      isActive && styles.filterChipBadgeTextActive,
                    ]}
                  >
                    {count > 99 ? "99+" : count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

// ============================================
// Search Modal
// ============================================
interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

function SearchModal({ visible, onClose, onSearch }: SearchModalProps) {
  const [searchText, setSearchText] = useState("");
  const insets = useSafeAreaInsets();

  const handleSearch = () => {
    if (searchText.trim()) {
      onSearch(searchText.trim());
      onClose();
    }
  };

  const handleClear = () => setSearchText("");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.searchModalContainer, { paddingTop: insets.top }]}>
        <View style={styles.searchModalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.searchBackBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm trong cộng đồng..."
              placeholderTextColor={COLORS.textTertiary}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleClear}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Suggestions */}
        <View style={styles.searchSuggestions}>
          <Text style={styles.searchSuggestionsTitle}>Tìm kiếm gần đây</Text>
          {["Tin tức xây dựng", "Kế hoạch phát triển", "Thông báo mới"].map(
            (suggestion, i) => (
              <TouchableOpacity
                key={i}
                style={styles.searchSuggestionItem}
                onPress={() => {
                  setSearchText(suggestion);
                  onSearch(suggestion);
                  onClose();
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.searchSuggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>
    </Modal>
  );
}

// ============================================
// Loading / Empty / Error States
// ============================================
function LoadingFooter() {
  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator size="small" color={COLORS.primary} />
      <Text style={styles.loadingFooterText}>Đang tải thêm...</Text>
    </View>
  );
}

function EmptyState({ filter }: { filter: string }) {
  const message =
    filter === "all"
      ? "Chưa có nội dung nào trong cộng đồng"
      : `Chưa có ${FILTER_TABS.find((t) => t.id === filter)?.label.toLowerCase() || "nội dung"} nào`;

  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="newspaper-outline"
        size={64}
        color={COLORS.textTertiary}
      />
      <Text style={styles.emptyStateTitle}>Không có nội dung</Text>
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.errorState}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={styles.errorStateTitle}>Có lỗi xảy ra</Text>
      <Text style={styles.errorStateText}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Ionicons name="refresh" size={18} color="white" />
        <Text style={styles.retryButtonText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// Main Screen Component
// ============================================
export default function SocialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const mediaViewer = useFullMediaViewer();

  // State
  const [activeFilter, setActiveFilter] = useState<FeedItemType | "all">("all");
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  // Animation
  const scrollY = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  // Use community feed hook
  const {
    items,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    sources,
    refresh,
    loadMore,
    search,
  } = useCommunityFeed({
    pageSize: 30,
    autoRefresh: false,
  });

  // Filter items based on active filter and search
  const filteredItems = useMemo(() => {
    let result = items;

    // Apply type filter
    if (activeFilter !== "all") {
      result = result.filter((item) => item.type === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [items, activeFilter, searchQuery]);

  // Count items by type
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Handlers
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = event.nativeEvent.contentOffset.y;
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    setSearchQuery("");
    refresh();
  }, [refresh]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadMore();
    }
  }, [isLoadingMore, hasMore, loadMore]);

  const handleFilterChange = useCallback((filter: FeedItemType | "all") => {
    setActiveFilter(filter);
    // Scroll to top when filter changes
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      search(query);
    },
    [search],
  );

  const handleStoryPress = useCallback(
    (item: CommunityFeedItem) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // For video/photo, open MediaViewer directly (Facebook style)
      if (item.type === "video" || item.type === "photo") {
        const videoItem = item.type === "video" ? (item as any) : null;
        const mediaUrl =
          videoItem?.videoUrl || videoItem?.thumbnailUrl || item.imageUrl;

        if (mediaUrl) {
          const mediaFile: MediaFile = {
            id: item.id,
            uri: mediaUrl,
            type: item.type === "video" ? "video" : "image",
            title: item.title,
            description: item.description,
            thumbnail: item.imageUrl || videoItem?.thumbnailUrl,
            createdAt: item.createdAt,
          };

          mediaViewer.open([mediaFile], 0, {
            allowDelete: false,
            allowEdit: false,
            allowShare: true,
            allowDownload: true,
            showInfo: true,
            headerTitle: item.title,
          });
          return;
        }
      }

      // Navigate for other types
      switch (item.type) {
        case "news":
          if ((item as any).url) {
            router.push(
              `/webview?url=${encodeURIComponent((item as any).url)}` as any,
            );
          }
          break;
        default:
          break;
      }
    },
    [router, mediaViewer],
  );

  const handleCreatePost = useCallback(() => {
    router.push("/community/create-post" as any);
  }, [router]);

  const handleCreateStory = useCallback(() => {
    // Navigate to create story screen
    console.log("Create story");
  }, []);

  // Viewability config for video auto-play
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item is "visible" when 50% is shown
    minimumViewTime: 250, // Minimum time visible before triggering
  }).current;

  // Handle viewable items changed for video auto-play
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const newVisibleSet = new Set<string>();
      viewableItems.forEach((viewToken) => {
        if (viewToken.isViewable && viewToken.item) {
          newVisibleSet.add(viewToken.item.id);
        }
      });
      setVisibleItems(newVisibleSet);
    },
  ).current;

  // Render Header Component (stories + create post + filters)
  const renderListHeader = useCallback(() => {
    return (
      <View>
        {/* Stories */}
        <StoriesSection
          items={items}
          onStoryPress={handleStoryPress}
          onCreateStory={handleCreateStory}
        />

        {/* Create Post */}
        <CreatePostCard userAvatar={user?.avatar} onPress={handleCreatePost} />

        {/* Filter Chips */}
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={typeCounts}
        />

        {/* Source Stats (mini) */}
        <View style={styles.sourceStatsBar}>
          <View style={styles.sourceStatItem}>
            <View
              style={[styles.sourceStatDot, { backgroundColor: "#10B981" }]}
            />
            <Text style={styles.sourceStatLabel}>
              Backend: {sources.backend}
            </Text>
          </View>
          <View style={styles.sourceStatItem}>
            <View
              style={[styles.sourceStatDot, { backgroundColor: "#0D9488" }]}
            />
            <Text style={styles.sourceStatLabel}>GNews: {sources.gnews}</Text>
          </View>
          <View style={styles.sourceStatItem}>
            <View
              style={[styles.sourceStatDot, { backgroundColor: "#8B5CF6" }]}
            />
            <Text style={styles.sourceStatLabel}>Pexels: {sources.pexels}</Text>
          </View>
        </View>
      </View>
    );
  }, [
    items,
    activeFilter,
    typeCounts,
    sources,
    user,
    handleStoryPress,
    handleCreateStory,
    handleCreatePost,
    handleFilterChange,
  ]);

  // Get all video items for vertical video feed navigation
  const allVideoItems = useMemo(() => {
    return filteredItems.filter((item) => item.type === "video");
  }, [filteredItems]);

  // Render Item with visibility tracking for video auto-play
  const renderItem = useCallback(
    ({ item, index }: { item: CommunityFeedItem; index: number }) => {
      const isVisible = visibleItems.has(item.id);
      // Find video index if this is a video item
      const videoIndex =
        item.type === "video"
          ? allVideoItems.findIndex((v) => v.id === item.id)
          : 0;
      return (
        <FacebookFeedCard
          item={item}
          isVisible={isVisible}
          index={index}
          allVideos={allVideoItems}
          videoIndex={videoIndex}
        />
      );
    },
    [visibleItems, allVideoItems],
  );

  // Render Footer
  const renderListFooter = useCallback(() => {
    if (isLoadingMore) {
      return <LoadingFooter />;
    }
    if (!hasMore && filteredItems.length > 0) {
      return (
        <View style={styles.endOfFeed}>
          <Text style={styles.endOfFeedText}>Bạn đã xem hết nội dung 🎉</Text>
        </View>
      );
    }
    return null;
  }, [isLoadingMore, hasMore, filteredItems.length]);

  // Key extractor
  const keyExtractor = useCallback(
    (item: CommunityFeedItem) => `feed-${item.id}-${item.type}`,
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Header */}
      <Header
        scrollY={scrollY}
        onSearchPress={() => setSearchModalVisible(true)}
        onMessagesPress={() => router.push("/messages" as any)}
      />

      {/* Main Content */}
      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải nội dung...</Text>
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={handleRefresh} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={<EmptyState filter={activeFilter} />}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.feedList}
          removeClippedSubviews={Platform.OS === "android"}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
          // Video auto-play viewability tracking
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSearch={handleSearch}
      />
    </View>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  headerActions: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },

  // Feed List
  feedList: {
    paddingTop: 56, // Header height
  },

  // Stories
  storiesContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.sm,
  },
  storiesList: {
    paddingHorizontal: SPACING.md,
  },
  createStoryCard: {
    width: 110,
    height: 180,
    marginRight: SPACING.sm,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  createStoryImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  createStoryUserImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  createStoryPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  createStoryPlusBtn: {
    position: "absolute",
    bottom: -14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
  createStoryText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },

  // Filter Chips
  filterChipsContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterChipsList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    gap: 6,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.text,
  },
  filterChipTextActive: {
    color: "white",
  },
  filterChipBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  filterChipBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterChipBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.text,
  },
  filterChipBadgeTextActive: {
    color: "white",
  },

  // Source Stats Bar
  sourceStatsBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  sourceStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sourceStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sourceStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // Search Modal
  searchModalContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBackBtn: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  searchSuggestions: {
    padding: SPACING.lg,
  },
  searchSuggestionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  searchSuggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  searchSuggestionText: {
    fontSize: 15,
    color: COLORS.text,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  loadingFooterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.sm,
  },

  // Error State
  errorState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  errorStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  errorStateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },

  // End of Feed
  endOfFeed: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
  },
  endOfFeedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
