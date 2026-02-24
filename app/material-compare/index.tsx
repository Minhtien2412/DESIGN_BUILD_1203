import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const materials = [
  {
    id: "1",
    name: "Gạch Granite Viglacera",
    category: "Gạch lát",
    price: 185000,
    unit: "m²",
    image:
      "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=150&q=80",
    specs: {
      "Kích thước": "60x60 cm",
      "Độ dày": "9.5 mm",
      "Độ bóng": "95%",
      "Độ hút nước": "< 0.5%",
      "Độ cứng": "7/10 Mohs",
      "Chống trơn": "R10",
    },
    features: ["Chống trầy", "Chống bám bẩn", "Dễ lau chùi", "Kháng axit"],
    rating: 4.8,
    reviews: 234,
  },
  {
    id: "2",
    name: "Gạch Ceramic Prime",
    category: "Gạch lát",
    price: 145000,
    unit: "m²",
    image:
      "https://images.unsplash.com/photo-1581430872221-d1cfed785922?w=150&q=80",
    specs: {
      "Kích thước": "60x60 cm",
      "Độ dày": "8.5 mm",
      "Độ bóng": "85%",
      "Độ hút nước": "< 3%",
      "Độ cứng": "6/10 Mohs",
      "Chống trơn": "R9",
    },
    features: ["Chống trầy", "Dễ lau chùi", "Màu sắc đa dạng"],
    rating: 4.5,
    reviews: 156,
  },
  {
    id: "3",
    name: "Gạch Porcelain Đồng Tâm",
    category: "Gạch lát",
    price: 225000,
    unit: "m²",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=150&q=80",
    specs: {
      "Kích thước": "80x80 cm",
      "Độ dày": "10.5 mm",
      "Độ bóng": "98%",
      "Độ hút nước": "< 0.1%",
      "Độ cứng": "8/10 Mohs",
      "Chống trơn": "R11",
    },
    features: [
      "Chống trầy",
      "Chống bám bẩn",
      "Dễ lau chùi",
      "Kháng axit",
      "Chịu lực cao",
    ],
    rating: 4.9,
    reviews: 312,
  },
];

export default function MaterialCompareScreen() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardBg = useThemeColor({}, "card");
  const router = useRouter();
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([
    "1",
    "2",
  ]);

  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "đ";

  const comparedMaterials = materials.filter((m) =>
    selectedMaterials.includes(m.id),
  );
  const allSpecs = Array.from(
    new Set(comparedMaterials.flatMap((m) => Object.keys(m.specs))),
  );
  const allFeatures = Array.from(
    new Set(comparedMaterials.flatMap((m) => m.features)),
  );

  const toggleMaterial = (id: string) => {
    if (selectedMaterials.includes(id)) {
      if (selectedMaterials.length > 2) {
        setSelectedMaterials((prev) => prev.filter((mId) => mId !== id));
      }
    } else {
      if (selectedMaterials.length < 3) {
        setSelectedMaterials((prev) => [...prev, id]);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{ title: "So sánh vật liệu", headerShown: true }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Material Selector */}
        <View style={styles.selectorSection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Chọn vật liệu so sánh (tối đa 3)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {materials.map((material) => (
              <TouchableOpacity
                key={material.id}
                style={[
                  styles.selectorCard,
                  { backgroundColor: cardBg },
                  selectedMaterials.includes(material.id) &&
                    styles.selectorCardActive,
                ]}
                onPress={() => toggleMaterial(material.id)}
              >
                <View style={styles.selectorImagePlaceholder}>
                  <Ionicons name="layers-outline" size={24} color="#999" />
                </View>
                <Text
                  style={[styles.selectorName, { color: textColor }]}
                  numberOfLines={1}
                >
                  {material.name}
                </Text>
                {selectedMaterials.includes(material.id) && (
                  <View style={styles.selectorCheck}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Comparison Header */}
        <View style={[styles.comparisonHeader, { backgroundColor: cardBg }]}>
          <View style={styles.headerLabel}>
            <Text style={[styles.headerLabelText, { color: textColor }]}>
              Sản phẩm
            </Text>
          </View>
          {comparedMaterials.map((material) => (
            <View key={material.id} style={styles.headerItem}>
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="layers-outline" size={32} color="#14B8A6" />
              </View>
              <Text
                style={[styles.productName, { color: textColor }]}
                numberOfLines={2}
              >
                {material.name}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.ratingText}>{material.rating}</Text>
                <Text style={styles.reviewsText}>({material.reviews})</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Price Comparison */}
        <View style={[styles.comparisonRow, { backgroundColor: cardBg }]}>
          <View style={styles.rowLabel}>
            <Ionicons name="pricetag-outline" size={18} color="#14B8A6" />
            <Text style={[styles.rowLabelText, { color: textColor }]}>Giá</Text>
          </View>
          {comparedMaterials.map((material) => (
            <View key={material.id} style={styles.rowItem}>
              <Text style={styles.priceValue}>
                {formatPrice(material.price)}
              </Text>
              <Text style={styles.priceUnit}>/{material.unit}</Text>
            </View>
          ))}
        </View>

        {/* Specs Comparison */}
        <Text
          style={[
            styles.sectionTitle,
            { color: textColor, marginTop: 20, marginLeft: 16 },
          ]}
        >
          Thông số kỹ thuật
        </Text>
        {allSpecs.map((spec) => (
          <View
            key={spec}
            style={[styles.comparisonRow, { backgroundColor: cardBg }]}
          >
            <View style={styles.rowLabel}>
              <Text style={styles.specLabel}>{spec}</Text>
            </View>
            {comparedMaterials.map((material) => (
              <View key={material.id} style={styles.rowItem}>
                <Text style={[styles.specValue, { color: textColor }]}>
                  {material.specs[spec as keyof typeof material.specs] || "-"}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Features Comparison */}
        <Text
          style={[
            styles.sectionTitle,
            { color: textColor, marginTop: 20, marginLeft: 16 },
          ]}
        >
          Tính năng
        </Text>
        {allFeatures.map((feature) => (
          <View
            key={feature}
            style={[styles.comparisonRow, { backgroundColor: cardBg }]}
          >
            <View style={styles.rowLabel}>
              <Text style={styles.specLabel}>{feature}</Text>
            </View>
            {comparedMaterials.map((material) => (
              <View key={material.id} style={styles.rowItem}>
                {material.features.includes(feature) ? (
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                ) : (
                  <Ionicons name="close-circle" size={20} color="#ccc" />
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: cardBg }]}
          >
            <Ionicons name="share-outline" size={20} color="#666" />
            <Text style={styles.actionBtnText}>Chia sẻ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: cardBg }]}
          >
            <Ionicons name="download-outline" size={20} color="#666" />
            <Text style={styles.actionBtnText}>Tải PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Add to Cart */}
        <View style={styles.cartSection}>
          {comparedMaterials.map((material) => (
            <TouchableOpacity key={material.id} style={styles.addToCartBtn}>
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.addToCartText}>
                {material.name.split(" ").slice(0, 2).join(" ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFB" },
  selectorSection: { padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  selectorCard: {
    width: 100,
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    alignItems: "center",
    position: "relative",
  },
  selectorCardActive: { borderWidth: 2, borderColor: "#0D9488" },
  selectorImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  selectorName: { fontSize: 11, marginTop: 8, textAlign: "center" },
  selectorCheck: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0D9488",
    justifyContent: "center",
    alignItems: "center",
  },
  comparisonHeader: {
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
  },
  headerLabel: { width: 80 },
  headerLabelText: { fontSize: 12, fontWeight: "600" },
  headerItem: { flex: 1, alignItems: "center" },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#0D948815",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  productName: { fontSize: 12, fontWeight: "500", textAlign: "center" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ratingText: { fontSize: 11, color: "#6B7280", marginLeft: 2 },
  reviewsText: { fontSize: 10, color: "#9CA3AF", marginLeft: 2 },
  comparisonRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  rowLabel: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowLabelText: { fontSize: 13, fontWeight: "500" },
  specLabel: { fontSize: 12, color: "#6B7280" },
  rowItem: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  priceValue: {
    color: "#0D9488",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  priceUnit: { color: "#9CA3AF", fontSize: 11 },
  specValue: { fontSize: 13 },
  actionsSection: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  actionBtnText: { color: "#6B7280", fontSize: 14 },
  cartSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    padding: 16,
    marginBottom: 32,
  },
  addToCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addToCartText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
