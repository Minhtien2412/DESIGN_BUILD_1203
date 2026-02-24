/**
 * Social Posts Screen - Bài viết cộng đồng
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  pink: "#E91E63",
  text: "#212121",
  textLight: "#757575",
};

const categories = [
  "Tất cả",
  "Thiết kế",
  "Thi công",
  "Nội thất",
  "Kinh nghiệm",
  "Hỏi đáp",
];

const posts = [
  {
    id: "p1",
    author: "KTS. Nguyễn Minh",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    title: "Xu hướng thiết kế nhà phố năm 2026",
    content:
      "Năm 2026 đánh dấu sự trở lại của phong cách tối giản kết hợp với yếu tố thiên nhiên. Các không gian xanh trong nhà được ưu tiên...",
    category: "Thiết kế",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    ],
    likes: 234,
    comments: 45,
    shares: 12,
    time: "2 giờ trước",
    isLiked: true,
  },
  {
    id: "p2",
    author: "Đội thi công ABC",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    title: "Kinh nghiệm thi công móng cọc trong mùa mưa",
    content:
      "Chia sẻ kinh nghiệm thực tế về việc xử lý nền móng khi trời mưa liên tục. Những điểm cần lưu ý để đảm bảo chất lượng...",
    category: "Thi công",
    images: [],
    likes: 156,
    comments: 32,
    shares: 8,
    time: "5 giờ trước",
    isLiked: false,
  },
  {
    id: "p3",
    author: "Interior Design Studio",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    title: "Phòng khách 20m² vẫn đẹp và tiện nghi",
    content:
      "Với diện tích hạn chế, việc bố trí nội thất cần được tính toán kỹ lưỡng. Hôm nay mình chia sẻ bí quyết...",
    category: "Nội thất",
    images: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400",
    ],
    likes: 412,
    comments: 67,
    shares: 35,
    time: "Hôm qua",
    isLiked: true,
  },
  {
    id: "p4",
    author: "Anh Tuấn - Chủ nhà",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    title: "Hỏi về chi phí xây nhà 3 tầng",
    content:
      "Mọi người cho mình hỏi, với diện tích đất 5x20m muốn xây 3 tầng thì chi phí khoảng bao nhiêu ạ? Mình muốn làm phong cách hiện đại...",
    category: "Hỏi đáp",
    images: [],
    likes: 45,
    comments: 89,
    shares: 2,
    time: "Hôm qua",
    isLiked: false,
    isQuestion: true,
  },
  {
    id: "p5",
    author: "Công ty TNHH XD Hoàng Gia",
    avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    title: "Bài học từ 10 năm kinh nghiệm xây dựng",
    content:
      "10 bài học đắt giá mà chúng tôi rút ra sau 10 năm hoạt động trong ngành xây dựng. Hy vọng giúp ích cho các bạn mới...",
    category: "Kinh nghiệm",
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    ],
    likes: 567,
    comments: 123,
    shares: 78,
    time: "2 ngày trước",
    isLiked: false,
  },
];

export default function SocialPostsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchText, setSearchText] = useState("");

  const filteredPosts = posts.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.content.toLowerCase().includes(searchText.toLowerCase());
    if (activeCategory === "Tất cả") return matchesSearch;
    return matchesSearch && item.category === activeCategory;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Thiết kế":
        return COLORS.purple;
      case "Thi công":
        return COLORS.accent;
      case "Nội thất":
        return COLORS.pink;
      case "Kinh nghiệm":
        return COLORS.primary;
      case "Hỏi đáp":
        return COLORS.secondary;
      default:
        return COLORS.textLight;
    }
  };

  const renderPost = ({ item }: { item: (typeof posts)[0] }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        {/* Author */}
        <View style={styles.authorRow}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: textColor }]}>
              {item.author}
            </Text>
            <View style={styles.postMeta}>
              <Text style={styles.postTime}>{item.time}</Text>
              <View
                style={[
                  styles.categoryTag,
                  { backgroundColor: categoryColor + "15" },
                ]}
              >
                <Text
                  style={[styles.categoryTagText, { color: categoryColor }]}
                >
                  {item.category}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Text style={[styles.postTitle, { color: textColor }]}>
          {item.title}
        </Text>
        <Text style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Text>

        {/* Images */}
        {item.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imagesRow}
          >
            {item.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.postImage} />
            ))}
          </ScrollView>
        )}

        {/* Question badge */}
        {item.isQuestion && (
          <View style={styles.questionBadge}>
            <Ionicons name="help-circle" size={16} color={COLORS.secondary} />
            <Text style={styles.questionText}>Đang chờ câu trả lời</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={22}
              color={item.isLiked ? COLORS.danger : COLORS.textLight}
            />
            <Text
              style={[
                styles.actionText,
                item.isLiked && { color: COLORS.danger },
              ]}
            >
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons
              name="chatbubble-outline"
              size={20}
              color={COLORS.textLight}
            />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons
              name="share-social-outline"
              size={20}
              color={COLORS.textLight}
            />
            <Text style={styles.actionText}>{item.shares}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons
              name="bookmark-outline"
              size={20}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Bài viết Cộng đồng",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Ionicons name="create" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Create post card */}
      <View style={[styles.createCard, { backgroundColor: cardBg }]}>
        <View style={styles.createAvatar}>
          <Ionicons name="person-circle" size={40} color={COLORS.textLight} />
        </View>
        <TouchableOpacity style={styles.createInput}>
          <Text style={styles.createPlaceholder}>Bạn đang nghĩ gì?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.createImageBtn}>
          <Ionicons name="image" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm bài viết..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && { backgroundColor: COLORS.primary },
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat && { color: "#fff" },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  createCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: 12,
    marginBottom: 0,
    borderRadius: 12,
    gap: 10,
  },
  createAvatar: {},
  createInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  createPlaceholder: { color: COLORS.textLight, fontSize: 14 },
  createImageBtn: { padding: 8 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categoriesContainer: { paddingHorizontal: 12, paddingVertical: 10 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  listContent: { padding: 12, paddingBottom: 100 },
  card: { padding: 14, borderRadius: 12, marginBottom: 12 },
  authorRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  authorInfo: { flex: 1, marginLeft: 10 },
  authorName: { fontSize: 14, fontWeight: "600" },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },
  postTime: { fontSize: 11, color: COLORS.textLight },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  categoryTagText: { fontSize: 10, fontWeight: "500" },
  moreBtn: { padding: 4 },
  postTitle: { fontSize: 15, fontWeight: "600", marginBottom: 6 },
  postContent: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 10,
  },
  imagesRow: { marginBottom: 10 },
  postImage: { width: 200, height: 140, borderRadius: 10, marginRight: 8 },
  questionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10,
    gap: 6,
  },
  questionText: { fontSize: 12, color: COLORS.secondary, fontWeight: "500" },
  actionsRow: {
    flexDirection: "row",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  actionText: { fontSize: 12, color: COLORS.textLight },
});
