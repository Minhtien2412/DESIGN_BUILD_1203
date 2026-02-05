import { useThemeColor } from "@/hooks/use-theme-color";
import {
    CommunityFeedItem,
    FeedItemType,
    getCommunityFeed,
} from "@/services/communityFeedService";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const categories: { id: FeedItemType | "all"; label: string; icon: string }[] =
  [
    { id: "all", label: "Tất cả", icon: "apps-outline" },
    { id: "announcement", label: "Thông báo", icon: "megaphone-outline" },
    { id: "news", label: "Tin tức", icon: "newspaper-outline" },
    { id: "video", label: "Video", icon: "videocam-outline" },
    { id: "photo", label: "Hình ảnh", icon: "images-outline" },
    { id: "development_plan", label: "Kế hoạch", icon: "calendar-outline" },
  ];

const topContributors = [
  {
    id: "1",
    name: "Hùng Nguyễn",
    avatar: "https://ui-avatars.com/api/?name=Hung",
    posts: 45,
  },
  {
    id: "2",
    name: "Mai Trần",
    avatar: "https://ui-avatars.com/api/?name=Mai",
    posts: 38,
  },
  {
    id: "3",
    name: "An Phát",
    avatar: "https://ui-avatars.com/api/?name=AP",
    posts: 32,
  },
];

export default function CommunityScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<FeedItemType | "all">(
    "all",
  );
  const [feedItems, setFeedItems] = useState<CommunityFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeed = useCallback(
    async (pageNum = 1, refresh = false) => {
      try {
        if (pageNum === 1) {
          refresh ? setIsRefreshing(true) : setIsLoading(true);
        }

        const filter =
          activeCategory !== "all" ? { types: [activeCategory] } : undefined;
        const response = await getCommunityFeed({
          filter,
          page: pageNum,
          pageSize: 15,
        });

        if (pageNum === 1) {
          setFeedItems(response.items);
        } else {
          setFeedItems((prev) => [...prev, ...response.items]);
        }
        setHasMore(response.hasMore);
        setPage(pageNum);
      } catch (error) {
        console.error("[Community] Error fetching feed:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeCategory],
  );

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const handleRefresh = () => fetchFeed(1, true);
  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchFeed(page + 1);
    }
  };

  const getItemIcon = (type: FeedItemType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "announcement":
        return "megaphone";
      case "news":
        return "newspaper";
      case "video":
        return "play-circle";
      case "photo":
        return "image";
      case "development_plan":
        return "calendar";
      default:
        return "document";
    }
  };

  const getItemColor = (type: FeedItemType): string => {
    switch (type) {
      case "announcement":
        return "#E53935";
      case "news":
        return "#1976D2";
      case "video":
        return "#7B1FA2";
      case "photo":
        return "#388E3C";
      case "development_plan":
        return "#F57C00";
      default:
        return "#666";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const renderFeedItem = ({ item }: { item: CommunityFeedItem }) => (
    <TouchableOpacity
      style={[styles.postCard, { backgroundColor: cardBg }]}
      onPress={() => {
        if (item.type === "news" && "url" in item) {
          router.push(
            `/demo/webview?url=${encodeURIComponent(item.url)}` as any,
          );
        } else if (item.type === "video" && "videoUrl" in item) {
          router.push(
            `/demo-videos?url=${encodeURIComponent(item.videoUrl)}` as any,
          );
        }
      }}
    >
      {/* Type Badge */}
      <View
        style={[
          styles.typeBadge,
          { backgroundColor: `${getItemColor(item.type)}15` },
        ]}
      >
        <Ionicons
          name={getItemIcon(item.type)}
          size={14}
          color={getItemColor(item.type)}
        />
        <Text
          style={[styles.typeBadgeText, { color: getItemColor(item.type) }]}
        >
          {categories.find((c) => c.id === item.type)?.label || item.type}
        </Text>
      </View>

      {/* Image if available */}
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.feedImage}
          resizeMode="cover"
        />
      )}

      {/* Content */}
      <Text style={[styles.feedTitle, { color: textColor }]} numberOfLines={2}>
        {item.title}
      </Text>

      {item.description && (
        <Text style={styles.feedDescription} numberOfLines={3}>
          {item.description}
        </Text>
      )}

      {/* Progress bar for development plans */}
      {item.type === "development_plan" &&
        "progress" in item &&
        item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${item.progress}%` as any },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{item.progress}%</Text>
          </View>
        )}

      {/* Footer */}
      <View style={styles.feedFooter}>
        {item.author && (
          <View style={styles.authorRow}>
            {item.author.avatar ? (
              <Image
                source={{ uri: item.author.avatar }}
                style={styles.smallAvatar}
              />
            ) : (
              <View style={styles.smallAvatarPlaceholder}>
                <Ionicons name="person" size={12} color="#999" />
              </View>
            )}
            <Text style={styles.authorName}>{item.author.name}</Text>
          </View>
        )}
        <Text style={styles.feedTime}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && feedItems.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor }]}>
        <Stack.Screen options={{ title: "Cộng đồng", headerShown: true }} />
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={{ color: textColor, marginTop: 12 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Cộng đồng", headerShown: true }} />

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.categoriesContainer, { backgroundColor: cardBg }]}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryBtn,
              activeCategory === cat.id && styles.categoryBtnActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={activeCategory === cat.id ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat.id && styles.categoryTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={feedItems}
        renderItem={renderFeedItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#FF6B35"]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            {/* Create Post */}
            <TouchableOpacity
              style={[styles.createPostBtn, { backgroundColor: cardBg }]}
            >
              <View style={styles.createPostAvatar}>
                <Ionicons name="person-outline" size={20} color="#666" />
              </View>
              <Text style={styles.createPostPlaceholder}>
                Chia sẻ dự án, đặt câu hỏi...
              </Text>
              <View style={styles.createPostActions}>
                <Ionicons name="image-outline" size={20} color="#4CAF50" />
                <Ionicons name="videocam-outline" size={20} color="#F44336" />
              </View>
            </TouchableOpacity>

            {/* Top Contributors */}
            <View
              style={[styles.contributorsCard, { backgroundColor: cardBg }]}
            >
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                🏆 Top đóng góp
              </Text>
              <View style={styles.contributorsRow}>
                {topContributors.map((user, index) => (
                  <View key={user.id} style={styles.contributorItem}>
                    <View style={styles.contributorRank}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <Image
                      source={{ uri: user.avatar }}
                      style={styles.contributorAvatar}
                    />
                    <Text
                      style={[styles.contributorName, { color: textColor }]}
                      numberOfLines={1}
                    >
                      {user.name}
                    </Text>
                    <Text style={styles.contributorPosts}>
                      {user.posts} bài
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  categoriesContainer: { maxHeight: 54 },
  categoriesContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  categoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    gap: 6,
  },
  categoryBtnActive: { backgroundColor: "#FF6B35" },
  categoryText: { color: "#666", fontSize: 13 },
  categoryTextActive: { color: "#fff" },
  listContent: { padding: 16, paddingBottom: 80 },
  createPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  createPostPlaceholder: { flex: 1, marginLeft: 12, color: "#999" },
  createPostActions: { flexDirection: "row", gap: 12 },
  contributorsCard: { padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },
  contributorsRow: { flexDirection: "row", justifyContent: "space-between" },
  contributorItem: { alignItems: "center", width: "30%", position: "relative" },
  contributorRank: {
    position: "absolute",
    top: 0,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFB800",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  rankText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  contributorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
  },
  contributorName: { fontSize: 12, fontWeight: "500", marginTop: 6 },
  contributorPosts: { color: "#666", fontSize: 11 },
  postCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    overflow: "hidden",
  },
  // Feed item styles
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    gap: 4,
  },
  typeBadgeText: { fontSize: 12, fontWeight: "500" },
  feedImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#f0f0f0",
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 6,
  },
  feedDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  feedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  smallAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  authorName: { fontSize: 12, color: "#666" },
  feedTime: { fontSize: 12, color: "#999" },
  // Progress bar for development plans
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: { fontSize: 12, fontWeight: "600", color: "#4CAF50" },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
