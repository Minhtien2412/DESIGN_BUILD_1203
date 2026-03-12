import { useThemeColor } from "@/hooks/use-theme-color";
import { get } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);
  const [promoList, setPromoList] = useState(promotions);

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await get("/api/promotions");
      if (res?.data) setPromoList(res.data);
    } catch {
      /* mock */
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPromotions();
    setRefreshing(false);
  }, [fetchPromotions]);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const handleCopyCode = async (code: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await Clipboard.setStringAsync(code);
    Alert.alert("Đã sao chép! ✅", `Mã: ${code}`);
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
            <Ionicons name="copy-outline" size={16} color="#14B8A6" />
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
        data={promoList}
        renderItem={renderPromotion}
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
            <Ionicons name="pricetag-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có khuyến mãi</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  categoriesContainer: { maxHeight: 60 },
  categoriesContent: { paddingHorizontal: 16, paddingVertical: 12 },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipActive: { backgroundColor: "#0D9488", borderColor: "#0D9488" },
  categoryText: { color: "#6B7280", fontSize: 14, fontWeight: "500" },
  categoryTextActive: { color: "#fff", fontWeight: "600" },
  listContent: { padding: 16 },
  promoCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  promoImage: { width: "100%", height: 120, backgroundColor: "#F3F4F6" },
  promoContent: { padding: 16 },
  discountBadge: {
    position: "absolute",
    top: -30,
    right: 16,
    backgroundColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  discountText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.3,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 8,
    letterSpacing: -0.3,
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
    borderWidth: 1.5,
    borderColor: "#0D9488",
    borderStyle: "dashed",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  codeText: { color: "#0D9488", fontWeight: "700" },
  progressContainer: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBar: { height: "100%", backgroundColor: "#0D9488", borderRadius: 2 },
  usedText: { color: "#999", fontSize: 11 },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyText: { color: "#999", marginTop: 12 },
});
