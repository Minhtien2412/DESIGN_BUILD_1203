import { useCart } from "@/context/cart-context";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const compareProducts = [
  {
    id: "1",
    name: "Bồn cầu TOTO 1 khối",
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=150&q=80",
    price: 8500000,
    rating: 4.8,
    brand: "TOTO",
    specs: {
      "Kích thước": "680x370x765mm",
      "Chất liệu": "Sứ cao cấp",
      "Công nghệ xả": "Tornado Flush",
      "Bảo hành": "3 năm",
      "Tiết kiệm nước": "4.8L/lần xả",
    },
    features: ["Nắp đóng êm", "Kháng khuẩn", "Dễ vệ sinh"],
  },
  {
    id: "2",
    name: "Bồn cầu Inax 1 khối",
    image:
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=150&q=80",
    price: 6200000,
    rating: 4.6,
    brand: "Inax",
    specs: {
      "Kích thước": "670x365x755mm",
      "Chất liệu": "Sứ men Aqua",
      "Công nghệ xả": "Hyper Kilamic",
      "Bảo hành": "2 năm",
      "Tiết kiệm nước": "5L/lần xả",
    },
    features: ["Nắp đóng êm", "Chống bám bẩn", "Men nhẵn"],
  },
];

export default function CompareScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedProducts, setSelectedProducts] = useState(compareProducts);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const handleRemoveProduct = useCallback(
    (id: string) => {
      if (selectedProducts.length <= 1) {
        Alert.alert("Thông báo", "Cần ít nhất 1 sản phẩm để so sánh");
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    },
    [selectedProducts.length],
  );

  const handleBuy = useCallback(
    (product: (typeof compareProducts)[0]) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      } as any);
      Alert.alert("Thêm vào giỏ hàng! 🛒", product.name);
    },
    [addToCart],
  );

  const handleAddProduct = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/search" as any);
  }, [router]);

  const allSpecs = Object.keys(selectedProducts[0]?.specs || {});

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{ title: "So sánh sản phẩm", headerShown: true }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Headers */}
        <View style={[styles.headerRow, { backgroundColor: cardBg }]}>
          <View style={styles.specLabel} />
          {selectedProducts.map((product) => (
            <View key={product.id} style={styles.productHeader}>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemoveProduct(product.id)}
              >
                <Ionicons name="close-circle" size={24} color="#14B8A6" />
              </TouchableOpacity>
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
              />
              <Text
                style={[styles.productName, { color: textColor }]}
                numberOfLines={2}
              >
                {product.name}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.rating}>{product.rating}</Text>
              </View>
            </View>
          ))}
          {selectedProducts.length < 3 && (
            <TouchableOpacity
              style={styles.addProductBtn}
              onPress={handleAddProduct}
            >
              <Ionicons name="add-circle-outline" size={40} color="#14B8A6" />
              <Text style={styles.addText}>Thêm SP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Price Row */}
        <View style={[styles.compareRow, { backgroundColor: "#14B8A610" }]}>
          <Text
            style={[styles.specLabel, { color: textColor, fontWeight: "600" }]}
          >
            Giá
          </Text>
          {selectedProducts.map((product) => (
            <View key={product.id} style={styles.specValue}>
              <Text style={[styles.price, { color: "#14B8A6" }]}>
                {formatPrice(product.price)}
              </Text>
            </View>
          ))}
          {selectedProducts.length < 3 && <View style={styles.specValue} />}
        </View>

        {/* Brand Row */}
        <View style={[styles.compareRow, { backgroundColor: cardBg }]}>
          <Text style={[styles.specLabel, { color: textColor }]}>
            Thương hiệu
          </Text>
          {selectedProducts.map((product) => (
            <View key={product.id} style={styles.specValue}>
              <Text style={[styles.specText, { color: textColor }]}>
                {product.brand}
              </Text>
            </View>
          ))}
          {selectedProducts.length < 3 && <View style={styles.specValue} />}
        </View>

        {/* Specs */}
        {allSpecs.map((spec, index) => (
          <View
            key={spec}
            style={[
              styles.compareRow,
              { backgroundColor: index % 2 === 0 ? cardBg : backgroundColor },
            ]}
          >
            <Text style={[styles.specLabel, { color: textColor }]}>{spec}</Text>
            {selectedProducts.map((product) => (
              <View key={product.id} style={styles.specValue}>
                <Text style={[styles.specText, { color: textColor }]}>
                  {product.specs[spec as keyof typeof product.specs]}
                </Text>
              </View>
            ))}
            {selectedProducts.length < 3 && <View style={styles.specValue} />}
          </View>
        ))}

        {/* Features */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Tính năng nổi bật
          </Text>
          <View style={styles.featuresGrid}>
            <View style={styles.specLabel} />
            {selectedProducts.map((product) => (
              <View key={product.id} style={styles.specValue}>
                {product.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={[styles.featureText, { color: textColor }]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
            {selectedProducts.length < 3 && <View style={styles.specValue} />}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {selectedProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.buyBtn}
              onPress={() => handleBuy(product)}
            >
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.buyBtnText}>Mua ngay</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  headerRow: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  specLabel: { width: 100 },
  productHeader: { flex: 1, alignItems: "center", position: "relative" },
  removeBtn: { position: "absolute", top: -8, right: 0, zIndex: 1 },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
  },
  productName: { fontSize: 12, textAlign: "center", marginTop: 8, height: 32 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  rating: { fontSize: 12, color: "#666", marginLeft: 2 },
  addProductBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  addText: { color: "#0D9488", fontSize: 12, marginTop: 4, fontWeight: "600" },
  compareRow: {
    flexDirection: "row",
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  specValue: { flex: 1, alignItems: "center" },
  specText: { fontSize: 13, textAlign: "center" },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: -0.3,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  featuresGrid: { flexDirection: "row" },
  featureItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  featureText: { fontSize: 12, marginLeft: 6 },
  actionsContainer: { flexDirection: "row", padding: 16, gap: 12 },
  buyBtn: {
    flex: 1,
    backgroundColor: "#0D9488",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buyBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
