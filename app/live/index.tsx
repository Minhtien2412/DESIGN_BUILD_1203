/**
 * Live Streaming Hub
 * Trang chủ livestream - xem livestream và tạo stream
 * Fetches real user & stream data from API
 */

import { BorderRadius, Spacing } from "@/constants/spacing";
import { useThemeColor } from "@/hooks/use-theme-color";
import { apiFetch } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

interface LiveStream {
  id: string;
  title: string;
  thumbnail: string;
  broadcaster: string;
  broadcasterId?: string;
  avatar: string;
  viewers: number;
  category: string;
  isLive: boolean;
  scheduledAt?: string;
}

// Fallback mock data when API unavailable
const MOCK_LIVE_STREAMS: LiveStream[] = [
  {
    id: "1",
    title: "Hướng dẫn ốp lát gạch men chuyên nghiệp",
    thumbnail: "https://picsum.photos/400/225?random=1",
    broadcaster: "Thợ Hùng Pro",
    broadcasterId: "1",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    viewers: 1245,
    category: "Hoàn thiện",
    isLive: true,
  },
  {
    id: "2",
    title: "Review vật liệu xây dựng tháng 2/2026",
    thumbnail: "https://picsum.photos/400/225?random=2",
    broadcaster: "KTS Minh Đức",
    broadcasterId: "2",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    viewers: 856,
    category: "Vật liệu",
    isLive: true,
  },
  {
    id: "3",
    title: "Thiết kế nội thất phòng khách hiện đại",
    thumbnail: "https://picsum.photos/400/225?random=3",
    broadcaster: "Design Studio",
    broadcasterId: "3",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    viewers: 2341,
    category: "Thiết kế",
    isLive: true,
  },
];

const MOCK_SCHEDULED_STREAMS: LiveStream[] = [
  {
    id: "4",
    title: "Q&A: Xây nhà năm 2026 cần biết gì?",
    thumbnail: "https://picsum.photos/400/225?random=4",
    broadcaster: "Chuyên gia XD",
    broadcasterId: "4",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    viewers: 0,
    category: "Tư vấn",
    isLive: false,
    scheduledAt: "2026-02-05 19:00",
  },
  {
    id: "5",
    title: "Demo sản phẩm thiết bị vệ sinh TOTO",
    thumbnail: "https://picsum.photos/400/225?random=5",
    broadcaster: "TOTO Vietnam",
    broadcasterId: "5",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    viewers: 0,
    category: "Sản phẩm",
    isLive: false,
    scheduledAt: "2026-02-06 14:00",
  },
];

const CATEGORIES = [
  "Tất cả",
  "Thiết kế",
  "Xây dựng",
  "Hoàn thiện",
  "Vật liệu",
  "Tư vấn",
];

export default function LiveIndexScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  // Real data from API
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [scheduledStreams, setScheduledStreams] = useState<LiveStream[]>([]);

  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const mutedColor = useThemeColor({}, "textMuted");
  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");

  // Fetch live streams from API
  const fetchLiveStreams = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch live streams
      const liveRes = await apiFetch("/livestreams?status=live&limit=10");
      const liveData = liveRes?.data || liveRes || [];

      // Fetch scheduled streams
      const scheduledRes = await apiFetch(
        "/livestreams?status=scheduled&limit=5",
      );
      const scheduledData = scheduledRes?.data || scheduledRes || [];

      // Transform API data to LiveStream format
      const transformStream = (item: any): LiveStream => ({
        id: String(item.id),
        title: item.title || "Livestream",
        thumbnail:
          item.thumbnail ||
          item.image ||
          `https://picsum.photos/400/225?random=${item.id}`,
        broadcaster:
          item.broadcaster?.name ||
          item.hostName ||
          item.user?.name ||
          "Người phát",
        broadcasterId: String(
          item.broadcaster?.id || item.hostId || item.userId,
        ),
        avatar:
          item.broadcaster?.avatar ||
          item.hostAvatar ||
          item.user?.avatar ||
          `https://randomuser.me/api/portraits/men/${item.id || 1}.jpg`,
        viewers: item.viewerCount || item.viewers || 0,
        category: item.category || "Khác",
        isLive: item.status === "live" || item.isLive || false,
        scheduledAt: item.scheduledAt || item.startTime,
      });

      if (Array.isArray(liveData) && liveData.length > 0) {
        setLiveStreams(liveData.map(transformStream));
      } else {
        // Fallback to mock data
        setLiveStreams(MOCK_LIVE_STREAMS);
      }

      if (Array.isArray(scheduledData) && scheduledData.length > 0) {
        setScheduledStreams(scheduledData.map(transformStream));
      } else {
        setScheduledStreams(MOCK_SCHEDULED_STREAMS);
      }
    } catch (err) {
      console.error("[Live] Error fetching streams:", err);
      // Fallback to mock data
      setLiveStreams(MOCK_LIVE_STREAMS);
      setScheduledStreams(MOCK_SCHEDULED_STREAMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveStreams();
  }, [fetchLiveStreams]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLiveStreams();
    setRefreshing(false);
  }, [fetchLiveStreams]);

  // Filter streams by category
  const filteredLiveStreams =
    selectedCategory === "Tất cả"
      ? liveStreams
      : liveStreams.filter((s) => s.category === selectedCategory);

  const formatViewers = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const renderLiveCard = (
    stream: LiveStream,
    size: "large" | "small" = "small",
  ) => {
    const cardWidth = size === "large" ? width - 32 : (width - 48) / 2;
    const cardHeight = size === "large" ? 200 : 120;

    return (
      <TouchableOpacity
        key={stream.id}
        style={[styles.liveCard, { width: cardWidth }]}
        onPress={() => router.push(`/live/${stream.id}` as any)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: stream.thumbnail }}
          style={[styles.thumbnail, { height: cardHeight }]}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />

        {stream.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}

        <View style={styles.viewerBadge}>
          <Ionicons name="eye" size={12} color="#fff" />
          <Text style={styles.viewerText}>{formatViewers(stream.viewers)}</Text>
        </View>

        <View style={styles.cardOverlay}>
          <Text style={styles.streamTitle} numberOfLines={2}>
            {stream.title}
          </Text>
          <View style={styles.broadcasterRow}>
            <Image
              source={{ uri: stream.avatar }}
              style={styles.broadcasterAvatar}
            />
            <Text style={styles.broadcasterName}>{stream.broadcaster}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Livestream",
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerRight: () => (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/live/create" as any)}
            >
              <Ionicons name="videocam" size={24} color={primaryColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === cat ? primaryColor : cardColor,
                  borderColor,
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === cat ? "#fff" : textColor },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Live */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <Text style={[styles.loadingText, { color: mutedColor }]}>
              Đang tải livestream...
            </Text>
          </View>
        ) : (
          filteredLiveStreams.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.liveIndicatorBig} />
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Đang phát trực tiếp
                  </Text>
                </View>
                <Text style={[styles.liveCount, { color: primaryColor }]}>
                  {filteredLiveStreams.length} streams
                </Text>
              </View>

              {/* Featured stream */}
              {renderLiveCard(filteredLiveStreams[0], "large")}

              {/* Other live streams */}
              <View style={styles.gridContainer}>
                {filteredLiveStreams
                  .slice(1)
                  .map((stream) => renderLiveCard(stream, "small"))}
              </View>
            </View>
          )
        )}

        {/* Scheduled */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="calendar" size={18} color={primaryColor} />
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Sắp phát
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: primaryColor }]}>
                Xem tất cả
              </Text>
            </TouchableOpacity>
          </View>

          {scheduledStreams.map((stream) => (
            <TouchableOpacity
              key={stream.id}
              style={[
                styles.scheduledCard,
                { backgroundColor: cardColor, borderColor },
              ]}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: stream.thumbnail }}
                style={styles.scheduledThumb}
              />
              <View style={styles.scheduledInfo}>
                <Text
                  style={[styles.scheduledTitle, { color: textColor }]}
                  numberOfLines={2}
                >
                  {stream.title}
                </Text>
                <Text
                  style={[styles.scheduledBroadcaster, { color: mutedColor }]}
                >
                  {stream.broadcaster}
                </Text>
                <View style={styles.scheduleTime}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={primaryColor}
                  />
                  <Text
                    style={[styles.scheduleTimeText, { color: primaryColor }]}
                  >
                    {stream.scheduledAt}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.notifyButton, { borderColor: primaryColor }]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={primaryColor}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start Streaming CTA */}
        <TouchableOpacity
          style={[styles.ctaCard, { backgroundColor: primaryColor }]}
          onPress={() => router.push("/live/create" as any)}
          activeOpacity={0.9}
        >
          <Ionicons name="videocam" size={32} color="#fff" />
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Bắt đầu phát trực tiếp</Text>
            <Text style={styles.ctaSubtitle}>
              Chia sẻ kiến thức và kinh nghiệm của bạn
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  createButton: {
    marginRight: Spacing[2],
  },
  categoriesContent: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[2],
  },
  categoryChip: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing[2],
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: Spacing[4],
    marginBottom: Spacing[5],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing[3],
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  liveCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  liveIndicatorBig: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E53935",
  },
  liveCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing[3],
  },
  thumbnail: {
    width: "100%",
    borderRadius: BorderRadius.lg,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
  },
  liveBadge: {
    position: "absolute",
    top: Spacing[2],
    left: Spacing[2],
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  liveText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  viewerBadge: {
    position: "absolute",
    top: Spacing[2],
    right: Spacing[2],
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  viewerText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing[3],
  },
  streamTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing[2],
  },
  broadcasterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
  broadcasterAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  broadcasterName: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing[3],
  },
  scheduledCard: {
    flexDirection: "row",
    padding: Spacing[3],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing[3],
    alignItems: "center",
  },
  scheduledThumb: {
    width: 80,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  scheduledInfo: {
    flex: 1,
    marginLeft: Spacing[3],
  },
  scheduledTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  scheduledBroadcaster: {
    fontSize: 12,
    marginBottom: 4,
  },
  scheduleTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scheduleTimeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  notifyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing[4],
    marginHorizontal: Spacing[4],
    borderRadius: BorderRadius.lg,
    gap: Spacing[3],
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  ctaSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
});
