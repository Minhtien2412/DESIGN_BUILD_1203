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
    TouchableOpacity,
    View,
} from "react-native";

const promotions = [
  {
    id: "1",
    title: "Giảm 20% Sơn Dulux",
    description: "Áp dụng cho tất cả sản phẩm sơn Dulux",
    code: "DULUX20",
    discount: "20%",
    minOrder: 500000,
    expiry: "31/01/2026",
    image:
      "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=200&q=80",
    category: "paint",
    used: 1250,
    remaining: 250,
  },
  {
    id: "2",
    title: "Freeship đơn từ 1 triệu",
    description: "Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ",
    code: "FREESHIP1M",
    discount: "Freeship",
    minOrder: 1000000,
    expiry: "15/01/2026",
    image:
      "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400&h=200&q=80",
    category: "shipping",
    used: 3200,
    remaining: 800,
  },
  {
    id: "3",
    title: "Giảm 500K Thiết bị vệ sinh",
    description: "Giảm 500.000đ cho đơn thiết bị vệ sinh từ 5 triệu",
    code: "SANITARY500",
    discount: "500K",
    minOrder: 5000000,
    expiry: "28/02/2026",
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=200&q=80",
    category: "sanitary",
    used: 456,
    remaining: 544,
  },
  {
    id: "4",
    title: "Flash Sale - Giảm 30%",
    description: "Chỉ áp dụng trong khung giờ 12h-14h",
    code: "FLASH30",
    discount: "30%",
    minOrder: 0,
    expiry: "10/01/2026",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&q=80",
    category: "flash",
    used: 980,
    remaining: 20,
  },
];

const categories = ["Tất cả", "Sơn", "Vận chuyển", "Vệ sinh", "Flash Sale"];

export default function PromotionsScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const handleCopyCode = (code: string) => {
    // In real app, copy to clipboard
    alert(`Đã sao chép mã: ${code}`);
  };

  const renderPromotion = ({ item }: { item: (typeof promotions)[0] }) => (
    <TouchableOpacity style={[styles.promoCard, { backgroundColor: cardBg }]}>
      <Image source={{ uri: item.image }} style={styles.promoImage} />

      <View style={styles.promoContent}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}</Text>
        </View>

        <Text style={[styles.promoTitle, { color: textColor }]}>
          {item.title}
        </Text>
        <Text style={styles.promoDesc}>{item.description}</Text>

        {item.minOrder > 0 && (
          <Text style={styles.minOrder}>
            Đơn tối thiểu: {formatPrice(item.minOrder)}
          </Text>
        )}

        <View style={styles.promoFooter}>
          <View>
            <Text style={styles.expiryText}>HSD: {item.expiry}</Text>
            <Text style={styles.remainingText}>Còn {item.remaining} mã</Text>
          </View>

          <TouchableOpacity
            style={styles.copyBtn}
            onPress={() => handleCopyCode(item.code)}
          >
            <Ionicons name="copy-outline" size={16} color="#FF6B35" />
            <Text style={styles.codeText}>{item.code}</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(item.used / (item.used + item.remaining)) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.usedText}>Đã dùng {item.used}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Khuyến mãi", headerShown: true }} />

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              activeCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Promotions List */}
      <FlatList
        data={promotions}
        renderItem={renderPromotion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có khuyến mãi</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoriesContainer: { maxHeight: 60 },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 12 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: "#FF6B35" },
  categoryText: { color: "#666", fontSize: 14 },
  categoryTextActive: { color: "#fff", fontWeight: "500" },
  listContent: { padding: 16 },
  promoCard: { borderRadius: 12, marginBottom: 16, overflow: "hidden" },
  promoImage: { width: "100%", height: 120, backgroundColor: "#f0f0f0" },
  promoContent: { padding: 16 },
  discountBadge: {
    position: "absolute",
    top: -30,
    right: 16,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  discountText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  promoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  promoDesc: { color: "#666", fontSize: 14, marginBottom: 8 },
  minOrder: { color: "#999", fontSize: 13, marginBottom: 12 },
  promoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  expiryText: { color: "#F44336", fontSize: 12, fontWeight: "500" },
  remainingText: { color: "#666", fontSize: 12, marginTop: 2 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B35",
    borderStyle: "dashed",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  codeText: { color: "#FF6B35", fontWeight: "600" },
  progressContainer: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBar: { height: "100%", backgroundColor: "#FF6B35", borderRadius: 2 },
  usedText: { color: "#999", fontSize: 11 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: "#999", marginTop: 12 },
});
