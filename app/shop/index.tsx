import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const categories = [
  { id: "1", name: "Gạch ốp lát", icon: "grid-outline", count: 1234 },
  { id: "2", name: "Sơn nước", icon: "color-fill-outline", count: 567 },
  { id: "3", name: "Thiết bị VS", icon: "water-outline", count: 890 },
  { id: "4", name: "Đèn LED", icon: "bulb-outline", count: 456 },
  { id: "5", name: "Cửa", icon: "enter-outline", count: 234 },
  { id: "6", name: "Sàn gỗ", icon: "layers-outline", count: 345 },
  { id: "7", name: "Phụ kiện", icon: "construct-outline", count: 678 },
  { id: "8", name: "Xem thêm", icon: "ellipsis-horizontal-outline", count: 0 },
];

const featuredProducts = [
  {
    id: "1",
    name: "Gạch Granite 60x60",
    price: 185000,
    originalPrice: 220000,
    rating: 4.8,
    sold: 2345,
    image:
      "https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: "2",
    name: "Sơn Dulux 5 in 1",
    price: 890000,
    originalPrice: 1050000,
    rating: 4.9,
    sold: 1234,
    image:
      "https://images.pexels.com/photos/6474471/pexels-photo-6474471.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: "3",
    name: "Bồn cầu TOTO",
    price: 8500000,
    originalPrice: 9800000,
    rating: 4.9,
    sold: 567,
    image:
      "https://images.pexels.com/photos/6585763/pexels-photo-6585763.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
  {
    id: "4",
    name: "Đèn LED panel",
    price: 450000,
    originalPrice: 550000,
    rating: 4.7,
    sold: 890,
    image:
      "https://images.pexels.com/photos/3935333/pexels-photo-3935333.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
];

const banners = [
  {
    id: "1",
    image:
      "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=350",
    title: "Giảm đến 50%",
  },
  {
    id: "2",
    image:
      "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=350",
    title: "Freeship mọi đơn",
  },
];

export default function ShopScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Get query params for filtering
  const { category, type } = useLocalSearchParams<{
    category?: string;
    type?: string;
  }>();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Set category from URL param on mount
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
      // If type is specified, can filter further (e.g., furniture -> sofa)
      if (type) {
        setSearchQuery(type);
      }
    }
  }, [category, type]);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: "Cửa hàng", headerShown: true }} />

      {/* Search Header */}
      <View style={[styles.searchHeader, { backgroundColor: "#FF6B35" }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm sản phẩm..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => router.push("/cart" as any)}
        >
          <Ionicons name="cart-outline" size={24} color="#fff" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banners */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerContainer}
        >
          {banners.map((banner) => (
            <TouchableOpacity key={banner.id} style={styles.bannerItem}>
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: cardBg }]}>
          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FFE0E0" }]}
            >
              <Ionicons name="flash" size={20} color="#F44336" />
            </View>
            <Text style={[styles.quickActionText, { color: textColor }]}>
              Flash Sale
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E3F2FD" }]}
            >
              <Ionicons name="ticket-outline" size={20} color="#2196F3" />
            </View>
            <Text style={[styles.quickActionText, { color: textColor }]}>
              Voucher
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#FFF3E0" }]}
            >
              <Ionicons name="gift-outline" size={20} color="#FF9800" />
            </View>
            <Text style={[styles.quickActionText, { color: textColor }]}>
              Ưu đãi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#E8F5E9" }]}
            >
              <Ionicons name="ribbon-outline" size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.quickActionText, { color: textColor }]}>
              Thương hiệu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Danh mục
          </Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: "#FF6B3515" },
                  ]}
                >
                  <Ionicons name={cat.icon as any} size={24} color="#FF6B35" />
                </View>
                <Text style={[styles.categoryName, { color: textColor }]}>
                  {cat.name}
                </Text>
                {cat.count > 0 && (
                  <Text style={styles.categoryCount}>{cat.count}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              🔥 Sản phẩm hot
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[styles.productCard, { backgroundColor: cardBg }]}
              >
                <Image
                  source={{ uri: product.image }}
                  style={styles.productImage}
                />
                <View style={styles.productContent}>
                  <Text
                    style={[styles.productName, { color: textColor }]}
                    numberOfLines={2}
                  >
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatPrice(product.price)}
                  </Text>
                  <Text style={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </Text>
                  <View style={styles.productFooter}>
                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={10} color="#FFB800" />
                      <Text style={styles.ratingText}>{product.rating}</Text>
                    </View>
                    <Text style={styles.soldText}>Đã bán {product.sold}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingTop: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  cartBtn: { marginLeft: 12, position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#F44336",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  bannerContainer: { marginVertical: 12 },
  bannerItem: {
    width: width - 32,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  bannerImage: { width: "100%", height: 120, backgroundColor: "#f0f0f0" },
  quickActions: {
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  quickAction: { flex: 1, alignItems: "center" },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  quickActionText: { fontSize: 11 },
  section: { margin: 16, marginTop: 12, padding: 16, borderRadius: 12 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  viewAll: { color: "#FF6B35", fontSize: 14 },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryItem: { width: "23%", alignItems: "center", marginBottom: 16 },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryName: { fontSize: 11, textAlign: "center" },
  categoryCount: { fontSize: 9, color: "#999", marginTop: 2 },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  productImage: { width: "100%", height: 140, backgroundColor: "#f0f0f0" },
  productContent: { padding: 10 },
  productName: { fontSize: 13, height: 36 },
  productPrice: {
    color: "#FF6B35",
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 4,
  },
  originalPrice: {
    color: "#999",
    fontSize: 11,
    textDecorationLine: "line-through",
  },
  productFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  ratingBox: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 10, marginLeft: 2 },
  soldText: { color: "#666", fontSize: 10 },
});
