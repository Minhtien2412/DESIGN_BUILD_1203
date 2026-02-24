/**
 * Social Groups Screen - Nhóm cộng đồng
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
  teal: "#009688",
  text: "#212121",
  textLight: "#757575",
};

const tabs = ["Đã tham gia", "Khám phá", "Quản lý"];

const myGroups = [
  {
    id: "g1",
    name: "Hội Kiến Trúc Sư Việt Nam",
    cover: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
    members: 12500,
    posts: 45,
    category: "Thiết kế",
    isAdmin: false,
    lastActivity: "2 phút trước",
    newPosts: 12,
  },
  {
    id: "g2",
    name: "Thi Công Xây Dựng Chuyên Nghiệp",
    cover: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400",
    members: 8200,
    posts: 32,
    category: "Thi công",
    isAdmin: true,
    lastActivity: "15 phút trước",
    newPosts: 5,
  },
  {
    id: "g3",
    name: "Nội Thất & Decor",
    cover: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400",
    members: 25600,
    posts: 120,
    category: "Nội thất",
    isAdmin: false,
    lastActivity: "1 giờ trước",
    newPosts: 28,
  },
];

const discoverGroups = [
  {
    id: "g4",
    name: "Smart Home & IoT Việt Nam",
    cover: "https://images.unsplash.com/photo-1558002038-1055e2dae1b4?w=400",
    members: 5600,
    category: "Công nghệ",
    description: "Chia sẻ kiến thức về nhà thông minh và IoT trong xây dựng",
  },
  {
    id: "g5",
    name: "Vật Liệu Xây Dựng Xanh",
    cover: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400",
    members: 3400,
    category: "Vật liệu",
    description:
      "Trao đổi về vật liệu xây dựng bền vững và thân thiện môi trường",
  },
  {
    id: "g6",
    name: "Dự Án Bất Động Sản",
    cover: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    members: 15800,
    category: "BĐS",
    description: "Thông tin dự án, đầu tư và kinh doanh bất động sản",
  },
  {
    id: "g7",
    name: "Phong Thủy Nhà Ở",
    cover: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400",
    members: 9200,
    category: "Phong thủy",
    description: "Tư vấn phong thủy trong thiết kế và xây dựng nhà ở",
  },
];

export default function SocialGroupsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Đã tham gia");
  const [searchText, setSearchText] = useState("");

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Thiết kế":
        return COLORS.purple;
      case "Thi công":
        return COLORS.accent;
      case "Nội thất":
        return COLORS.pink;
      case "Công nghệ":
        return COLORS.secondary;
      case "Vật liệu":
        return COLORS.teal;
      case "BĐS":
        return COLORS.primary;
      case "Phong thủy":
        return COLORS.danger;
      default:
        return COLORS.textLight;
    }
  };

  const formatMembers = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderMyGroup = ({ item }: { item: (typeof myGroups)[0] }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <TouchableOpacity
        style={[styles.myGroupCard, { backgroundColor: cardBg }]}
      >
        <Image source={{ uri: item.cover }} style={styles.groupCover} />
        <View style={styles.groupContent}>
          <View style={styles.groupHeader}>
            <Text
              style={[styles.groupName, { color: textColor }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            {item.isAdmin && (
              <View style={styles.adminBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color={COLORS.secondary}
                />
                <Text style={styles.adminText}>Quản trị</Text>
              </View>
            )}
          </View>

          <View style={styles.groupMeta}>
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: categoryColor + "15" },
              ]}
            >
              <Text style={[styles.categoryTagText, { color: categoryColor }]}>
                {item.category}
              </Text>
            </View>
            <Text style={styles.membersText}>
              {formatMembers(item.members)} thành viên
            </Text>
          </View>

          <View style={styles.activityRow}>
            <View style={styles.activityItem}>
              <Ionicons
                name="time-outline"
                size={14}
                color={COLORS.textLight}
              />
              <Text style={styles.activityText}>{item.lastActivity}</Text>
            </View>
            {item.newPosts > 0 && (
              <View style={styles.newPostsBadge}>
                <Text style={styles.newPostsText}>
                  {item.newPosts} bài viết mới
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiscoverGroup = ({
    item,
  }: {
    item: (typeof discoverGroups)[0];
  }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <View style={[styles.discoverCard, { backgroundColor: cardBg }]}>
        <Image source={{ uri: item.cover }} style={styles.discoverCover} />
        <View style={styles.discoverContent}>
          <View
            style={[
              styles.categoryTag,
              {
                backgroundColor: categoryColor + "15",
                alignSelf: "flex-start",
              },
            ]}
          >
            <Text style={[styles.categoryTagText, { color: categoryColor }]}>
              {item.category}
            </Text>
          </View>
          <Text
            style={[styles.discoverName, { color: textColor }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <Text style={styles.discoverDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.discoverFooter}>
            <Text style={styles.discoverMembers}>
              {formatMembers(item.members)} thành viên
            </Text>
            <TouchableOpacity style={styles.joinBtn}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.joinBtnText}>Tham gia</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Nhóm Cộng đồng",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.secondary },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: 12 }}>
              <Ionicons name="add-circle" size={28} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats summary */}
      <View style={styles.statsRow}>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.primary + "15" }]}
        >
          <Ionicons name="people" size={20} color={COLORS.primary} />
          <Text style={[styles.statValue, { color: COLORS.primary }]}>
            {myGroups.length}
          </Text>
          <Text style={styles.statLabel}>Đã tham gia</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.secondary + "15" }]}
        >
          <Ionicons
            name="shield-checkmark"
            size={20}
            color={COLORS.secondary}
          />
          <Text style={[styles.statValue, { color: COLORS.secondary }]}>
            {myGroups.filter((g) => g.isAdmin).length}
          </Text>
          <Text style={styles.statLabel}>Quản trị</Text>
        </View>
        <View
          style={[styles.statBox, { backgroundColor: COLORS.accent + "15" }]}
        >
          <Ionicons name="notifications" size={20} color={COLORS.accent} />
          <Text style={[styles.statValue, { color: COLORS.accent }]}>
            {myGroups.reduce((acc, g) => acc + g.newPosts, 0)}
          </Text>
          <Text style={styles.statLabel}>Bài mới</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm nhóm..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.tabsContainer}>
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

      {activeTab === "Đã tham gia" && (
        <FlatList
          data={myGroups}
          keyExtractor={(item) => item.id}
          renderItem={renderMyGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {activeTab === "Khám phá" && (
        <FlatList
          data={discoverGroups}
          keyExtractor={(item) => item.id}
          renderItem={renderDiscoverGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

      {activeTab === "Quản lý" && (
        <FlatList
          data={myGroups.filter((g) => g.isAdmin)}
          keyExtractor={(item) => item.id}
          renderItem={renderMyGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={60}
                color={COLORS.textLight}
              />
              <Text style={styles.emptyText}>Bạn chưa quản lý nhóm nào</Text>
              <TouchableOpacity style={styles.createGroupBtn}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createGroupText}>Tạo nhóm mới</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsRow: { flexDirection: "row", padding: 12, gap: 10 },
  statBox: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold", marginTop: 4 },
  statLabel: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  tabsContainer: { paddingHorizontal: 12, paddingVertical: 10 },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  tabActive: { backgroundColor: COLORS.secondary },
  tabText: { fontSize: 13, color: COLORS.textLight, fontWeight: "500" },
  tabTextActive: { color: "#fff" },
  listContent: { padding: 12, paddingBottom: 100 },
  columnWrapper: { justifyContent: "space-between" },

  // My groups card
  myGroupCard: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  groupCover: { width: 100, height: 100 },
  groupContent: { flex: 1, padding: 12, justifyContent: "space-between" },
  groupHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  groupName: { flex: 1, fontSize: 14, fontWeight: "600" },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary + "15",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  adminText: { fontSize: 10, color: COLORS.secondary, fontWeight: "500" },
  groupMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  categoryTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  categoryTagText: { fontSize: 10, fontWeight: "500" },
  membersText: { fontSize: 11, color: COLORS.textLight },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  activityItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  activityText: { fontSize: 11, color: COLORS.textLight },
  newPostsBadge: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newPostsText: { fontSize: 10, color: "#fff", fontWeight: "500" },

  // Discover group card
  discoverCard: {
    width: "48%",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  discoverCover: { width: "100%", height: 90 },
  discoverContent: { padding: 10 },
  discoverName: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 4,
  },
  discoverDesc: {
    fontSize: 11,
    color: COLORS.textLight,
    lineHeight: 16,
    marginBottom: 8,
  },
  discoverFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  discoverMembers: { fontSize: 10, color: COLORS.textLight },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 3,
  },
  joinBtnText: { fontSize: 11, color: "#fff", fontWeight: "500" },

  // Empty state
  emptyState: { alignItems: "center", paddingTop: 60 },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 16,
    marginBottom: 20,
  },
  createGroupBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  createGroupText: { fontSize: 14, color: "#fff", fontWeight: "600" },
});
