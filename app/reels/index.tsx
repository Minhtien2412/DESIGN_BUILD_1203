/**
 * Reels Feed Screen — TikTok/Instagram-style vertical video feed
 *
 * Features:
 * - Fullscreen vertical swipe feed
 * - Video auto-play/pause on scroll
 * - Like, comment, share, save actions
 * - Category filter tabs
 * - Pull to refresh

 * API: GET /reels/feed, GET /reels/categories, POST /reels/:id/like
 *
 * @created 2026-02-27
 */

import { ReelsPlayer } from "@/components/reels-player";
import { useAuth } from "@/context/AuthContext";
import {
    getServerFeed,
    getServerReels,
    type Reel,
    type ReelsResponse,
} from "@/services/reelsService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");
const CARD_WIDTH = (SW - 48) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.6;

const THEME = {
  primary: "#0D9488",
  bg: "#000000",
  card: "#1A1A2E",
  text: "#FFFFFF",
  textSec: "#94A3B8",
  border: "#2D2D3F",
};

const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: "grid-outline" },
  { id: "construction", label: "Xây dựng", icon: "construct-outline" },
  { id: "design", label: "Thiết kế", icon: "color-palette-outline" },
  { id: "material", label: "Vật liệu", icon: "cube-outline" },
  { id: "tutorial", label: "Hướng dẫn", icon: "school-outline" },
  { id: "review", label: "Review", icon: "star-outline" },
];

// ═══════════════════════════════════════════════════════════════════════
// REEL THUMBNAIL CARD
// ═══════════════════════════════════════════════════════════════════════

interface ReelCardProps {
  reel: Reel;
  onPress: () => void;
  index: number;
}

const ReelCard = React.memo<ReelCardProps>(({ reel, onPress, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.9}>
        <Image
          source={{
            uri:
              reel.thumbnail ||
              `https://picsum.photos/300/480?random=${reel.id}`,
          }}
          style={s.cardImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={s.cardGradient}
        />

        {/* Duration badge */}
        <View style={s.durationBadge}>
          <Text style={s.durationText}>{reel.duration || "0:30"}</Text>
        </View>

        {/* Views count */}
        <View style={s.viewsBadge}>
          <Ionicons name="play" size={10} color="#fff" />
          <Text style={s.viewsText}>{reel.views || "0"}</Text>
        </View>

        {/* Bottom info */}
        <View style={s.cardInfo}>
          <Text style={s.cardTitle} numberOfLines={2}>
            {reel.description || reel.title || "Video"}
          </Text>
          <View style={s.cardMeta}>
            <View style={s.cardUser}>
              {reel.user?.avatar ? (
                <Image
                  source={{ uri: reel.user.avatar }}
                  style={s.userAvatar}
                />
              ) : (
                <View
                  style={[s.userAvatar, { backgroundColor: THEME.primary }]}
                >
                  <Ionicons name="person" size={8} color="#fff" />
                </View>
              )}
              <Text style={s.userName} numberOfLines={1}>
                {reel.user?.name || "User"}
              </Text>
            </View>
            <View style={s.cardStats}>
              <Ionicons
                name={reel.liked ? "heart" : "heart-outline"}
                size={12}
                color={reel.liked ? "#EF4444" : "#fff"}
              />
              <Text style={s.statText}>
                {reel.likes > 999
                  ? `${(reel.likes / 1000).toFixed(1)}k`
                  : reel.likes}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ═══════════════════════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════════════════════

const ReelSkeleton = React.memo(() => (
  <View style={s.skeletonGrid}>
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={s.skeletonCard}>
        <View style={s.skeletonPulse} />
      </View>
    ))}
  </View>
));

// ═══════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════

export default function ReelsFeedScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Player state
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  // Load reels
  const loadReels = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setPage(1);
        } else if (!refresh && page === 1) {
          setLoading(true);
        }

        let response: ReelsResponse;

        if (selectedCategory === "all") {
          response = await getServerFeed(12);
        } else {
          response = await getServerReels(
            selectedCategory,
            refresh ? 1 : page,
            12,
          );
        }

        if (refresh || page === 1) {
          setReels(response.reels);
        } else {
          setReels((prev) => [...prev, ...response.reels]);
        }

        setHasMore(response.hasMore);
      } catch (error) {
        console.error("[ReelsFeed] Error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, page],
  );

  useEffect(() => {
    loadReels(true);
  }, [selectedCategory]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);

    try {
      const response = await getServerReels(selectedCategory, nextPage, 12);
      setReels((prev) => [...prev, ...response.reels]);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("[ReelsFeed] LoadMore error:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, selectedCategory, loadingMore, hasMore]);

  const onRefresh = useCallback(() => {
    loadReels(true);
  }, [loadReels]);

  // ── Render ──

  const renderReel = useCallback(
    ({ item, index }: { item: Reel; index: number }) => (
      <ReelCard reel={item} index={index} onPress={() => setActiveReel(item)} />
    ),
    [],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        {/* Category Tabs */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoryScroll}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isActive = item.id === selectedCategory;
            return (
              <TouchableOpacity
                style={[s.categoryChip, isActive && s.categoryChipActive]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={14}
                  color={isActive ? "#fff" : THEME.textSec}
                />
                <Text
                  style={[s.categoryLabel, isActive && s.categoryLabelActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Stats bar */}
        <View style={s.statsBar}>
          <Text style={s.statsText}>{reels.length} video</Text>
          <View style={s.statsRight}>
            <TouchableOpacity style={s.sortBtn}>
              <Ionicons name="funnel-outline" size={14} color={THEME.textSec} />
              <Text style={s.sortText}>Phổ biến</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [selectedCategory, reels.length],
  );

  const renderFooter = useCallback(
    () =>
      loadingMore ? (
        <View style={s.footerLoader}>
          <ActivityIndicator size="small" color={THEME.primary} />
          <Text style={s.footerText}>Đang tải thêm...</Text>
        </View>
      ) : null,
    [loadingMore],
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[s.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Reels</Text>
          <View style={s.headerActions}>
            <TouchableOpacity style={s.headerBtn}>
              <Ionicons name="search-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={s.headerBtn}>
              <Ionicons name="camera-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ReelSkeleton />
        ) : reels.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons
              name="videocam-off-outline"
              size={64}
              color={THEME.textSec}
            />
            <Text style={s.emptyTitle}>Chưa có video</Text>
            <Text style={s.emptyDesc}>
              Hãy quay lại sau hoặc thử danh mục khác
            </Text>
            <TouchableOpacity
              style={s.retryBtn}
              onPress={() => loadReels(true)}
            >
              <Text style={s.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={reels}
            renderItem={renderReel}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={s.gridRow}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            contentContainerStyle={s.gridContent}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={THEME.primary}
                colors={[THEME.primary]}
              />
            }
          />
        )}

        {/* Fullscreen Player Modal */}
        {activeReel && (
          <ReelsPlayer
            visible={!!activeReel}
            videoUrl={activeReel.videoUrl}
            videoId={activeReel.id}
            title={activeReel.description || activeReel.title}
            views={parseInt(activeReel.views) || 0}
            likes={activeReel.likes}
            onClose={() => setActiveReel(null)}
          />
        )}
      </View>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    padding: 6,
  },

  // Categories
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: THEME.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  categoryChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.textSec,
  },
  categoryLabelActive: {
    color: "#fff",
  },

  // Stats bar
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  statsText: {
    fontSize: 13,
    color: THEME.textSec,
    fontWeight: "500",
  },
  statsRight: {
    flexDirection: "row",
    gap: 8,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: THEME.card,
    borderRadius: 6,
  },
  sortText: {
    fontSize: 11,
    color: THEME.textSec,
    fontWeight: "500",
  },

  // Grid
  gridContent: {
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  // Card
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: THEME.card,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  durationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
  },
  viewsBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewsText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    lineHeight: 16,
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flex: 1,
  },
  userAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    flex: 1,
  },
  cardStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  statText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "500",
  },

  // Skeleton
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    paddingTop: 60,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: THEME.card,
    overflow: "hidden",
  },
  skeletonPulse: {
    width: "100%",
    height: "100%",
    backgroundColor: "#2D2D3F",
    opacity: 0.5,
  },

  // Empty
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: THEME.textSec,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: THEME.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // Footer
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: THEME.textSec,
  },
});
