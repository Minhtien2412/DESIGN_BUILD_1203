/**
 * Social Tab (Community Feed) - Redesigned with DS
 * Facebook-style community feed using unified design system
 * Same functionality, cleaner code, consistent theme
 */
import { DSColors } from "@/constants/ds";
import { useDS } from "@/hooks/useDS";
import { useI18n } from "@/services/i18nService";
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

// ═══════════════════════════════════════════════════════════════════════
// FILTER TABS CONFIG
// ═══════════════════════════════════════════════════════════════════════
interface FilterTab {
  id: FeedItemType | "all";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_TABS: FilterTab[] = [
  { id: "all", label: "social.all", icon: "apps" },
  { id: "development_plan", label: "social.plans", icon: "flag" },
  { id: "announcement", label: "social.announcements", icon: "megaphone" },
  { id: "news", label: "social.news", icon: "newspaper" },
  { id: "video", label: "social.videos", icon: "videocam" },
  { id: "photo", label: "social.photos", icon: "images" },
];

// ═══════════════════════════════════════════════════════════════════════
// HEADER (animated)
// ═══════════════════════════════════════════════════════════════════════
function Header({
  scrollY,
  onSearchPress,
  onMessagesPress,
  colors,
}: {
  scrollY: SharedValue<number>;
  onSearchPress: () => void;
  onMessagesPress: () => void;
  colors: DSColors;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const animStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 50], [0, 1], "clamp");
    return {
      backgroundColor: `rgba(255,255,255,${opacity})`,
      borderBottomColor: `rgba(206,208,212,${opacity})`,
    };
  });

  return (
    <Animated.View
      style={[
        s.header,
        { paddingTop: insets.top, borderBottomWidth: 1 },
        animStyle,
      ]}
    >
      <View style={[s.headerContent, { backgroundColor: colors.bgSurface }]}>
        <Text style={[s.headerTitle, { color: colors.primary }]}>
          {t("social.title")}
        </Text>
        <View style={s.headerActions}>
          <TouchableOpacity
            style={[s.headerBtn, { backgroundColor: colors.bgMuted }]}
            onPress={onSearchPress}
          >
            <Ionicons name="search" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.headerBtn, { backgroundColor: colors.bgMuted }]}
            onPress={onMessagesPress}
          >
            <Ionicons
              name="chatbubble-ellipses"
              size={22}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STORIES SECTION
// ═══════════════════════════════════════════════════════════════════════
function StoriesSection({
  items,
  onStoryPress,
  onCreateStory,
  colors,
}: {
  items: CommunityFeedItem[];
  onStoryPress: (item: CommunityFeedItem) => void;
  onCreateStory: () => void;
  colors: DSColors;
}) {
  const { user } = useAuth();
  const storyItems = useMemo(
    () => items.filter((item) => item.imageUrl).slice(0, 10),
    [items],
  );

  if (storyItems.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[s.storiesContainer, { backgroundColor: colors.bgSurface }]}
    >
      <FlatList
        data={storyItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.storiesList}
        keyExtractor={(item) => `story-${item.id}`}
        ListHeaderComponent={
          <TouchableOpacity
            style={[
              s.createStoryCard,
              { backgroundColor: colors.bgMuted, borderColor: colors.border },
            ]}
            onPress={onCreateStory}
          >
            <View style={s.createStoryImageContainer}>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={s.createStoryUserImage}
                />
              ) : (
                <View
                  style={[
                    s.createStoryPlaceholder,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={32}
                    color={colors.textSecondary}
                  />
                </View>
              )}
              <View
                style={[
                  s.createStoryPlusBtn,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.bgSurface,
                  },
                ]}
              >
                <Ionicons name="add" size={18} color="white" />
              </View>
            </View>
            <Text style={[s.createStoryText, { color: colors.text }]}>
              Tạo tin
            </Text>
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

// ═══════════════════════════════════════════════════════════════════════
// FILTER CHIPS
// ═══════════════════════════════════════════════════════════════════════
function FilterChips({
  activeFilter,
  onFilterChange,
  counts,
  colors,
}: {
  activeFilter: FeedItemType | "all";
  onFilterChange: (filter: FeedItemType | "all") => void;
  counts: Record<string, number>;
  colors: DSColors;
}) {
  const { t } = useI18n();
  return (
    <View style={[s.filterContainer, { backgroundColor: colors.bgSurface }]}>
      <FlatList
        data={FILTER_TABS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isActive = activeFilter === item.id;
          const count = counts[item.id] || 0;
          return (
            <TouchableOpacity
              style={[
                s.filterChip,
                { backgroundColor: isActive ? colors.primary : colors.bgMuted },
              ]}
              onPress={() => onFilterChange(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={16}
                color={isActive ? "white" : colors.text}
              />
              <Text
                style={[
                  s.filterChipText,
                  { color: isActive ? "white" : colors.text },
                ]}
              >
                {t(item.label)}
              </Text>
              {count > 0 && item.id !== "all" && (
                <View
                  style={[
                    s.filterBadge,
                    {
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.3)"
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.filterBadgeText,
                      { color: isActive ? "white" : colors.text },
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

// ═══════════════════════════════════════════════════════════════════════
// SEARCH MODAL
// ═══════════════════════════════════════════════════════════════════════
function SearchModal({
  visible,
  onClose,
  onSearch,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  colors: DSColors;
}) {
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const handleSearch = () => {
    if (text.trim()) {
      onSearch(text.trim());
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={[
          s.searchModalWrap,
          { paddingTop: insets.top, backgroundColor: colors.bgSurface },
        ]}
      >
        <View
          style={[s.searchModalHeader, { borderBottomColor: colors.border }]}
        >
          <TouchableOpacity onPress={onClose} style={s.searchBackBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View
            style={[s.searchInputWrap, { backgroundColor: colors.bgMuted }]}
          >
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              nativeID="social-search"
              accessibilityLabel={t("social.searchPlaceholder")}
              style={[s.searchInput, { color: colors.text }]}
              placeholder={t("social.searchPlaceholder") + "..."}
              placeholderTextColor={colors.textTertiary}
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSearch}
              autoFocus
              returnKeyType="search"
            />
            {text.length > 0 && (
              <TouchableOpacity onPress={() => setText("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={[s.suggestTitle, { color: colors.textSecondary }]}>
            Tìm kiếm gần đây
          </Text>
          {["Tin tức xây dựng", "Kế hoạch phát triển", "Thông báo mới"].map(
            (suggestion, i) => (
              <TouchableOpacity
                key={i}
                style={s.suggestItem}
                onPress={() => {
                  setText(suggestion);
                  onSearch(suggestion);
                  onClose();
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={[s.suggestText, { color: colors.text }]}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STATUS COMPONENTS
// ═══════════════════════════════════════════════════════════════════════
function LoadingFooter({ colors }: { colors: DSColors }) {
  const { t } = useI18n();
  return (
    <View style={s.loadingFooter}>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={[s.loadingFooterText, { color: colors.textSecondary }]}>
        {t("common.loading")}
      </Text>
    </View>
  );
}

function EmptyState({ filter, colors }: { filter: string; colors: DSColors }) {
  const { t } = useI18n();
  const label =
    filter === "all" ? t("social.emptyFeed") : t("social.emptyFeed");

  return (
    <View style={s.emptyState}>
      <Ionicons
        name="newspaper-outline"
        size={64}
        color={colors.textTertiary}
      />
      <Text style={[s.emptyTitle, { color: colors.text }]}>
        {t("common.noData")}
      </Text>
      <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

function ErrorState({
  message,
  onRetry,
  colors,
}: {
  message: string;
  onRetry: () => void;
  colors: DSColors;
}) {
  return (
    <View style={s.emptyState}>
      <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
      <Text style={[s.emptyTitle, { color: colors.text }]}>Có lỗi xảy ra</Text>
      <Text style={[s.emptySubtitle, { color: colors.textSecondary }]}>
        {message}
      </Text>
      <TouchableOpacity
        style={[s.retryBtn, { backgroundColor: colors.primary }]}
        onPress={onRetry}
      >
        <Ionicons name="refresh" size={18} color="white" />
        <Text style={s.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════
export default function SocialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useDS();
  const { user } = useAuth();
  const mediaViewer = useFullMediaViewer();

  // State
  const [activeFilter, setActiveFilter] = useState<FeedItemType | "all">("all");
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  const scrollY = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  // Community feed
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
  } = useCommunityFeed({ pageSize: 30, autoRefresh: false });

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = items;
    if (activeFilter !== "all") {
      result = result.filter((item) => item.type === activeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, activeFilter, searchQuery]);

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((item) => {
      c[item.type] = (c[item.type] || 0) + 1;
    });
    return c;
  }, [items]);

  const allVideoItems = useMemo(
    () => filteredItems.filter((item) => item.type === "video"),
    [filteredItems],
  );

  // ── Handlers ──────────────────────────────────────────
  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    setSearchQuery("");
    refresh();
  }, [refresh]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) loadMore();
  }, [isLoadingMore, hasMore, loadMore]);

  const handleFilterChange = useCallback((filter: FeedItemType | "all") => {
    setActiveFilter(filter);
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
      if (item.type === "news" && (item as any).url) {
        router.push(
          `/webview?url=${encodeURIComponent((item as any).url)}` as any,
        );
      }
    },
    [router, mediaViewer],
  );

  const handleCreatePost = useCallback(() => {
    router.push("/social/create-post" as any);
  }, [router]);

  const handleCreateStory = useCallback(() => {
    console.log("Create story");
  }, []);

  // Viewability
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 250,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems: vi }: { viewableItems: ViewToken[] }) => {
      const newSet = new Set<string>();
      vi.forEach((vt) => {
        if (vt.isViewable && vt.item) newSet.add(vt.item.id);
      });
      setVisibleItems(newSet);
    },
  ).current;

  // ── List Header ───────────────────────────────────────
  const renderListHeader = useCallback(() => {
    return (
      <View>
        <StoriesSection
          items={items}
          onStoryPress={handleStoryPress}
          onCreateStory={handleCreateStory}
          colors={colors}
        />
        <CreatePostCard userAvatar={user?.avatar} onPress={handleCreatePost} />
        <FilterChips
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={typeCounts}
          colors={colors}
        />
        {/* Source stats */}
        <View style={[s.sourceBar, { backgroundColor: colors.bgSurface }]}>
          {[
            { label: `Backend: ${sources.backend}`, color: colors.success },
            { label: `GNews: ${sources.gnews}`, color: colors.primary },
            { label: `Pexels: ${sources.pexels}`, color: colors.info },
          ].map((src) => (
            <View key={src.label} style={s.sourceItem}>
              <View style={[s.sourceDot, { backgroundColor: src.color }]} />
              <Text style={[s.sourceLabel, { color: colors.textSecondary }]}>
                {src.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }, [
    items,
    activeFilter,
    typeCounts,
    sources,
    user,
    colors,
    handleStoryPress,
    handleCreateStory,
    handleCreatePost,
    handleFilterChange,
  ]);

  // ── Render Feed Item ──────────────────────────────────
  const renderItem = useCallback(
    ({ item, index }: { item: CommunityFeedItem; index: number }) => {
      const isVisible = visibleItems.has(item.id);
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

  const renderFooter = useCallback(() => {
    if (isLoadingMore) return <LoadingFooter colors={colors} />;
    if (!hasMore && filteredItems.length > 0) {
      return (
        <View style={s.endFeed}>
          <Text style={[s.endFeedText, { color: colors.textSecondary }]}>
            Bạn đã xem hết nội dung 🎉
          </Text>
        </View>
      );
    }
    return null;
  }, [isLoadingMore, hasMore, filteredItems.length, colors]);

  // ── Render ────────────────────────────────────────────
  return (
    <View
      style={[
        s.container,
        { backgroundColor: colors.bg, paddingTop: insets.top },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.bgSurface}
      />
      <Header
        scrollY={scrollY}
        onSearchPress={() => setSearchModalVisible(true)}
        onMessagesPress={() => router.push("/chat" as any)}
        colors={colors}
      />

      {isLoading && !isRefreshing ? (
        <View style={s.centerWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[s.loadingText, { color: colors.textSecondary }]}>
            Đang tải nội dung...
          </Text>
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={handleRefresh} colors={colors} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => `feed-${item.id}-${item.type}`}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <EmptyState filter={activeFilter} colors={colors} />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.feedList}
          removeClippedSubviews={Platform.OS === "android"}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      )}

      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSearch={handleSearch}
        colors={colors}
      />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES (layout-only, colors injected via DS)
// ═══════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  container: { flex: 1 },
  centerWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14 },

  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  headerActions: { flexDirection: "row", gap: 4 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  // Feed
  feedList: { paddingTop: 56 },

  // Stories
  storiesContainer: { paddingVertical: 12, marginBottom: 8 },
  storiesList: { paddingHorizontal: 12 },
  createStoryCard: {
    width: 110,
    height: 180,
    marginRight: 8,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  createStoryImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  createStoryUserImage: { width: 80, height: 120, borderRadius: 8 },
  createStoryPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  createStoryPlusBtn: {
    position: "absolute",
    bottom: -14,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
  },
  createStoryText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    paddingVertical: 8,
  },

  // Filters
  filterContainer: { paddingVertical: 8, marginBottom: 8 },
  filterList: { paddingHorizontal: 12, gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  filterChipText: { fontSize: 13, fontWeight: "500" },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  filterBadgeText: { fontSize: 11, fontWeight: "600" },

  // Source stats
  sourceBar: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  sourceItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  sourceDot: { width: 8, height: 8, borderRadius: 4 },
  sourceLabel: { fontSize: 11 },

  // Search Modal
  searchModalWrap: { flex: 1 },
  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  searchBackBtn: { padding: 8, marginRight: 8 },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  suggestTitle: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  suggestItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  suggestText: { fontSize: 15 },

  // States
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  loadingFooterText: { fontSize: 13 },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: "center", marginTop: 8 },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  retryText: { fontSize: 14, fontWeight: "600", color: "white" },
  endFeed: { paddingVertical: 20, alignItems: "center" },
  endFeedText: { fontSize: 14 },
});
