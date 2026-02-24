/**
 * Contract Templates Screen - Mẫu hợp đồng
 * Thư viện mẫu hợp đồng xây dựng
 * @updated 2026-02-04
 */
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#7CB342",
  secondary: "#2196F3",
  accent: "#FF9800",
  danger: "#F44336",
  success: "#4CAF50",
  purple: "#9C27B0",
  text: "#212121",
  textLight: "#757575",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

// Template categories
const categories = [
  { id: "all", label: "Tất cả", icon: "albums-outline", count: 15 },
  {
    id: "construction",
    label: "Thi công",
    icon: "construct-outline",
    count: 5,
  },
  { id: "design", label: "Thiết kế", icon: "brush-outline", count: 4 },
  { id: "supplier", label: "Cung cấp", icon: "cube-outline", count: 3 },
  { id: "labor", label: "Nhân công", icon: "people-outline", count: 3 },
];

// Mock templates
const templates = [
  {
    id: "1",
    name: "Hợp đồng thi công xây dựng",
    description: "Mẫu HĐ thi công toàn bộ công trình từ móng đến hoàn thiện",
    category: "construction",
    version: "2.1",
    lastUpdated: "01/01/2026",
    downloads: 1250,
    rating: 4.8,
    pages: 12,
    isFree: true,
  },
  {
    id: "2",
    name: "Hợp đồng thiết kế kiến trúc",
    description: "Mẫu HĐ thiết kế kiến trúc công trình nhà ở dân dụng",
    category: "design",
    version: "1.5",
    lastUpdated: "15/12/2025",
    downloads: 890,
    rating: 4.6,
    pages: 8,
    isFree: true,
  },
  {
    id: "3",
    name: "Hợp đồng cung cấp vật liệu",
    description: "Mẫu HĐ mua bán, cung cấp vật liệu xây dựng",
    category: "supplier",
    version: "1.8",
    lastUpdated: "20/12/2025",
    downloads: 650,
    rating: 4.5,
    pages: 6,
    isFree: true,
  },
  {
    id: "4",
    name: "Hợp đồng thuê nhân công",
    description: "Mẫu HĐ thuê khoán công nhân xây dựng theo hạng mục",
    category: "labor",
    version: "1.2",
    lastUpdated: "10/12/2025",
    downloads: 420,
    rating: 4.4,
    pages: 5,
    isFree: true,
  },
  {
    id: "5",
    name: "Hợp đồng thi công phần thô",
    description: "Mẫu HĐ chuyên thi công phần thô (móng, khung, sàn)",
    category: "construction",
    version: "2.0",
    lastUpdated: "05/01/2026",
    downloads: 780,
    rating: 4.7,
    pages: 10,
    isFree: false,
    price: 150000,
  },
  {
    id: "6",
    name: "Hợp đồng thiết kế nội thất",
    description: "Mẫu HĐ thiết kế và thi công nội thất trọn gói",
    category: "design",
    version: "1.3",
    lastUpdated: "28/12/2025",
    downloads: 560,
    rating: 4.6,
    pages: 9,
    isFree: false,
    price: 200000,
  },
  {
    id: "7",
    name: "Hợp đồng bảo trì công trình",
    description: "Mẫu HĐ bảo trì, bảo dưỡng công trình sau hoàn công",
    category: "construction",
    version: "1.0",
    lastUpdated: "25/12/2025",
    downloads: 320,
    rating: 4.3,
    pages: 7,
    isFree: true,
  },
  {
    id: "8",
    name: "Phụ lục thanh toán theo đợt",
    description: "Phụ lục quy định tiến độ thanh toán theo giai đoạn",
    category: "construction",
    version: "1.1",
    lastUpdated: "22/12/2025",
    downloads: 580,
    rating: 4.5,
    pages: 3,
    isFree: true,
  },
];

export default function ContractTemplatesScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    if (activeCategory === "all") return matchesSearch;
    return matchesSearch && template.category === activeCategory;
  });

  const handleDownload = (template: (typeof templates)[0]) => {
    if (template.isFree) {
      Alert.alert("Tải xuống", `Đang tải "${template.name}"...`);
    } else {
      Alert.alert(
        "Mẫu trả phí",
        `Mẫu này có giá ${template.price?.toLocaleString("vi-VN")}đ. Bạn có muốn mua không?`,
        [
          { text: "Hủy", style: "cancel" },
          { text: "Mua ngay", onPress: () => console.log("Purchase") },
        ],
      );
    }
  };

  const handlePreview = (template: (typeof templates)[0]) => {
    Alert.alert("Xem trước", `Đang mở xem trước "${template.name}"...`);
  };

  const renderTemplate = ({ item }: { item: (typeof templates)[0] }) => {
    const categoryInfo = categories.find((c) => c.id === item.category);

    return (
      <TouchableOpacity
        style={[styles.templateCard, { backgroundColor: cardBg }]}
        onPress={() => handlePreview(item)}
      >
        <View style={styles.templateHeader}>
          <View
            style={[
              styles.templateIcon,
              { backgroundColor: COLORS.secondary + "15" },
            ]}
          >
            <Ionicons name="document-text" size={28} color={COLORS.secondary} />
          </View>
          <View style={styles.templateInfo}>
            <Text
              style={[styles.templateName, { color: textColor }]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View style={styles.templateMeta}>
              <View style={styles.categoryBadge}>
                <Ionicons
                  name={categoryInfo?.icon as any}
                  size={12}
                  color={COLORS.textLight}
                />
                <Text style={styles.categoryText}>{categoryInfo?.label}</Text>
              </View>
              <Text style={styles.versionText}>v{item.version}</Text>
            </View>
          </View>
          {!item.isFree && (
            <View style={styles.priceBadge}>
              <Ionicons name="diamond" size={12} color={COLORS.accent} />
              <Text style={styles.priceText}>{item.price || 0 / 1000}K</Text>
            </View>
          )}
        </View>

        <Text style={styles.templateDesc} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.templateStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="download" size={14} color={COLORS.textLight} />
            <Text style={styles.statText}>{item.downloads}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="document" size={14} color={COLORS.textLight} />
            <Text style={styles.statText}>{item.pages} trang</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={14} color={COLORS.textLight} />
            <Text style={styles.statText}>{item.lastUpdated}</Text>
          </View>
        </View>

        <View style={styles.templateActions}>
          <TouchableOpacity
            style={styles.previewBtn}
            onPress={() => handlePreview(item)}
          >
            <Ionicons name="eye-outline" size={16} color={COLORS.secondary} />
            <Text style={[styles.actionText, { color: COLORS.secondary }]}>
              Xem trước
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.downloadBtn, !item.isFree && styles.purchaseBtn]}
            onPress={() => handleDownload(item)}
          >
            <Ionicons
              name={item.isFree ? "download-outline" : "cart-outline"}
              size={16}
              color="#fff"
            />
            <Text style={styles.downloadText}>
              {item.isFree
                ? "Tải xuống"
                : `${item.price?.toLocaleString("vi-VN")}đ`}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: "Mẫu hợp đồng",
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.secondary },
          headerTintColor: "#fff",
        }}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
        <Ionicons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm mẫu hợp đồng..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={activeCategory === cat.id ? "#fff" : COLORS.textLight}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat.id && styles.categoryChipTextActive,
                ]}
              >
                {cat.label} ({cat.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Templates List */}
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        renderItem={renderTemplate}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="document-outline"
              size={48}
              color={COLORS.textLight}
            />
            <Text style={styles.emptyText}>Không tìm thấy mẫu hợp đồng</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: COLORS.secondary,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 12,
    paddingTop: 0,
    paddingBottom: 100,
  },
  templateCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: "row",
    marginBottom: 10,
  },
  templateIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  templateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  templateName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  templateMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  priceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accent + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  priceText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: "600",
  },
  templateDesc: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
    marginBottom: 12,
  },
  templateStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  templateActions: {
    flexDirection: "row",
    gap: 10,
  },
  previewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.secondary + "15",
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
  downloadBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    gap: 6,
  },
  purchaseBtn: {
    backgroundColor: COLORS.accent,
  },
  downloadText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 12,
  },
});
