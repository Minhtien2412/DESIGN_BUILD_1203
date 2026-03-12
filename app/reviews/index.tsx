import { useThemeColor } from "@/hooks/use-theme-color";
import { get } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const reviews = [
  {
    id: "1",
    productName: "Gạch lát nền Granite 60x60",
    productImage:
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=100&q=80",
    rating: 5,
    comment: "Sản phẩm rất đẹp, giao hàng nhanh. Chất lượng tốt như mô tả.",
    date: "05/01/2026",
    images: [
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=80&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=80&q=80",
    ],
    likes: 12,
    helpful: true,
  },
  {
    id: "2",
    productName: "Sơn nội thất Dulux",
    productImage:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=100&q=80",
    rating: 4,
    comment:
      "Sơn lên rất mịn, màu đúng như hình. Chỉ tiếc là phải chờ hơi lâu.",
    date: "02/01/2026",
    images: [],
    likes: 8,
    helpful: false,
  },
  {
    id: "3",
    workerName: "Nguyễn Văn An",
    workerImage:
      "https://ui-avatars.com/api/?name=An&background=FF6B35&color=fff",
    workerSpecialty: "Thợ điện",
    rating: 5,
    comment:
      "Anh thợ rất nhiệt tình, làm việc cẩn thận và chuyên nghiệp. Sẽ thuê lại lần sau!",
    date: "28/12/2025",
    images: [
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=80&q=80",
    ],
    likes: 24,
    helpful: true,
  },
];

const tabs = ["Tất cả", "Sản phẩm", "Dịch vụ", "Chờ đánh giá"];

export default function ReviewsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [refreshing, setRefreshing] = useState(false);
  const [reviewList, setReviewList] = useState(reviews);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await get("/api/reviews/my");
      if (res?.data) setReviewList(res.data);
    } catch {
      /* mock */
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchReviews();
    setRefreshing(false);
  }, [fetchReviews]);

  const handleLike = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReviewList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, likes: r.likes + 1, helpful: true } : r,
      ),
    );
  }, []);

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color="#FFB800"
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: (typeof reviews)[0] }) => (
    <View style={[styles.reviewCard, { backgroundColor: cardBg }]}>
      {/* Product/Worker Info */}
      <View style={styles.itemRow}>
        <Image
          source={{ uri: item.productImage || item.workerImage }}
          style={styles.itemImage}
        />
        <View style={styles.itemInfo}>
          <Text
            style={[styles.itemName, { color: textColor }]}
            numberOfLines={2}
          >
            {item.productName || item.workerName}
          </Text>
          {item.workerSpecialty && (
            <Text style={styles.itemSub}>{item.workerSpecialty}</Text>
          )}
        </View>
      </View>

      {/* Rating & Date */}
      <View style={styles.ratingRow}>
        {renderStars(item.rating)}
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      {/* Comment */}
      <Text style={[styles.comment, { color: textColor }]}>{item.comment}</Text>

      {/* Review Images */}
      {item.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesRow}
        >
          {item.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
          ))}
        </ScrollView>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons
            name={item.helpful ? "thumbs-up" : "thumbs-up-outline"}
            size={18}
            color={item.helpful ? "#14B8A6" : "#666"}
          />
          <Text
            style={[styles.actionText, item.helpful && { color: "#0D9488" }]}
          >
            Hữu ích ({item.likes})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-outline" size={18} color="#666" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="create-outline" size={18} color="#666" />
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{ title: "Đánh giá của tôi", headerShown: true }}
      />

      {/* Stats */}
      <View style={[styles.statsCard, { backgroundColor: "#0D9488" }]}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>23</Text>
          <Text style={styles.statLabel}>Đánh giá</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>TB sao</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>Lượt thích</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: cardBg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviewList}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có đánh giá</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  statsCard: {
    flexDirection: "row",
    margin: 16,
    padding: 20,
    borderRadius: 20,
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statNumber: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: { color: "#fff", opacity: 0.9, fontSize: 13, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  tabsContainer: { paddingVertical: 4, paddingHorizontal: 16 },
  tab: { paddingVertical: 12, paddingHorizontal: 16 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#0D9488" },
  tabText: { color: "#6B7280", fontSize: 14, fontWeight: "500" },
  tabTextActive: { color: "#0D9488", fontWeight: "700" },
  listContent: { padding: 16 },
  reviewCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  itemRow: { flexDirection: "row", marginBottom: 12 },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemName: { fontSize: 15, fontWeight: "600", letterSpacing: -0.2 },
  itemSub: { color: "#666", fontSize: 13, marginTop: 2 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  starsRow: { flexDirection: "row", gap: 2 },
  dateText: { color: "#999", fontSize: 12 },
  comment: { fontSize: 14, lineHeight: 22, marginBottom: 12, color: "#374151" },
  imagesRow: { marginBottom: 12 },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "#F3F4F6",
  },
  actionsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    gap: 24,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { color: "#666", fontSize: 13 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: "#999", marginTop: 12 },
});
