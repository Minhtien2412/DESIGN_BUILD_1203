/**
 * Video Discovery Page - Khám phá video
 * Route: /social/video-discovery
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router, Stack } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/useThemeColor";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIDEO_WIDTH = (SCREEN_WIDTH - 48) / 2;
const VIDEO_HEIGHT = VIDEO_WIDTH * 1.6;

interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  author: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  tags: string[];
  isLive?: boolean;
}

const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "vid-1",
    title: "Hướng dẫn lát gạch phòng tắm chuẩn kỹ thuật",
    thumbnail: "https://picsum.photos/400/640?random=1",
    duration: "12:35",
    views: 125000,
    likes: 8500,
    author: {
      id: "u1",
      name: "Thợ Xây Minh",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true,
    },
    tags: ["lát gạch", "phòng tắm", "hướng dẫn"],
  },
  {
    id: "vid-2",
    title: "Review máy khoan Bosch GSB 13RE sau 2 năm sử dụng",
    thumbnail: "https://picsum.photos/400/640?random=2",
    duration: "8:20",
    views: 45600,
    likes: 3200,
    author: {
      id: "u2",
      name: "KTS Hùng",
      avatar: "https://i.pravatar.cc/150?img=2",
      verified: true,
    },
    tags: ["review", "dụng cụ", "Bosch"],
  },
  {
    id: "vid-3",
    title: "Thi công sàn gỗ công nghiệp - Những lưu ý quan trọng",
    thumbnail: "https://picsum.photos/400/640?random=3",
    duration: "15:45",
    views: 89000,
    likes: 6700,
    author: {
      id: "u3",
      name: "Nội thất Hoàng Gia",
      avatar: "https://i.pravatar.cc/150?img=3",
      verified: false,
    },
    tags: ["sàn gỗ", "thi công", "tips"],
  },
  {
    id: "vid-4",
    title: "🔴 LIVE: Thi công trần thạch cao hiện đại",
    thumbnail: "https://picsum.photos/400/640?random=4",
    duration: "LIVE",
    views: 1234,
    likes: 450,
    author: {
      id: "u4",
      name: "Thạch cao Tân Phát",
      avatar: "https://i.pravatar.cc/150?img=4",
      verified: true,
    },
    tags: ["thạch cao", "trần", "live"],
    isLive: true,
  },
  {
    id: "vid-5",
    title: "So sánh các loại sơn ngoại thất phổ biến 2024",
    thumbnail: "https://picsum.photos/400/640?random=5",
    duration: "18:30",
    views: 67800,
    likes: 4500,
    author: {
      id: "u5",
      name: "Sơn Việt",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: true,
    },
    tags: ["sơn", "so sánh", "ngoại thất"],
  },
  {
    id: "vid-6",
    title: "Cách đọc bản vẽ xây dựng cho người mới bắt đầu",
    thumbnail: "https://picsum.photos/400/640?random=6",
    duration: "22:15",
    views: 234000,
    likes: 15800,
    author: {
      id: "u6",
      name: "Học Xây Dựng",
      avatar: "https://i.pravatar.cc/150?img=6",
      verified: true,
    },
    tags: ["bản vẽ", "hướng dẫn", "cơ bản"],
  },
];

const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: "apps" },
  { id: "live", label: "Đang Live", icon: "radio-outline" },
  { id: "tutorial", label: "Hướng dẫn", icon: "school-outline" },
  { id: "review", label: "Review", icon: "star-outline" },
  { id: "tips", label: "Mẹo hay", icon: "bulb-outline" },
];

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

function VideoCard({
  video,
  onPress,
}: {
  video: VideoItem;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.videoCard} onPress={onPress}>
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: video.thumbnail }} style={styles.thumbnail} />

        {video.isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>LIVE</ThemedText>
          </View>
        ) : (
          <View style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>
              {video.duration}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.videoInfo}>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: video.author.avatar }}
            style={styles.authorAvatar}
          />
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <ThemedText style={styles.authorName} numberOfLines={1}>
                {video.author.name}
              </ThemedText>
              {video.author.verified && (
                <Ionicons name="checkmark-circle" size={12} color="#2196F3" />
              )}
            </View>
          </View>
        </View>

        <ThemedText style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </ThemedText>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={12} color="#888" />
            <ThemedText style={styles.statText}>
              {formatViews(video.views)}
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={12} color="#888" />
            <ThemedText style={styles.statText}>
              {formatViews(video.likes)}
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function VideoDiscoveryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const backgroundColor = useThemeColor({}, "background");

  const filteredVideos =
    selectedCategory === "all"
      ? MOCK_VIDEOS
      : selectedCategory === "live"
        ? MOCK_VIDEOS.filter((v) => v.isLive)
        : MOCK_VIDEOS;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Khám phá Video",
          headerStyle: { backgroundColor: "#FF5722" },
          headerTintColor: "#FFFFFF",
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable style={styles.headerButton}>
                <Ionicons name="search" size={22} color="#FFFFFF" />
              </Pressable>
              <Pressable
                style={styles.headerButton}
                onPress={() => router.push("/social/create-post" as Href)}
              >
                <Ionicons name="videocam" size={22} color="#FFFFFF" />
              </Pressable>
            </View>
          ),
        }}
      />

      <View style={[styles.container, { backgroundColor }]}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.categoryChip,
                  selectedCategory === item.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={16}
                  color={selectedCategory === item.id ? "#FFFFFF" : "#666"}
                />
                <ThemedText
                  style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.categoryTextActive,
                  ]}
                >
                  {item.label}
                </ThemedText>
              </Pressable>
            )}
          />
        </View>

        {/* Featured Banner */}
        <Pressable style={styles.featuredBanner}>
          <View style={styles.featuredGradient}>
            <Ionicons name="play-circle" size={48} color="#FFFFFF" />
            <View style={styles.featuredInfo}>
              <ThemedText style={styles.featuredLabel}>Xu hướng</ThemedText>
              <ThemedText style={styles.featuredTitle}>
                Video Hot Tuần Này
              </ThemedText>
              <ThemedText style={styles.featuredSubtitle}>
                Khám phá những video được xem nhiều nhất
              </ThemedText>
            </View>
          </View>
        </Pressable>

        {/* Video Grid */}
        <FlatList
          data={filteredVideos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.videoRow}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              onPress={() => router.push(`/social/shorts` as Href)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF5722"]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="video-off-outline"
                size={64}
                color="#CCCCCC"
              />
              <ThemedText style={styles.emptyText}>
                Chưa có video nào
              </ThemedText>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  categoriesContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#FF5722",
  },
  categoryText: {
    fontSize: 13,
    color: "#666666",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  featuredBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FF5722",
  },
  featuredGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 4,
  },
  featuredSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingTop: 12,
  },
  videoRow: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  videoCard: {
    width: VIDEO_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  thumbnailContainer: {
    width: "100%",
    height: VIDEO_HEIGHT * 0.6,
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    backgroundColor: "#E0E0E0",
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F44336",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  liveText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  videoInfo: {
    padding: 10,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  authorName: {
    fontSize: 11,
    color: "#666666",
    flex: 1,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#212121",
    lineHeight: 18,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: "#888888",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#888888",
  },
});
