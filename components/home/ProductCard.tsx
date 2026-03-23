/**
 * ProductCard — Product display card for Worker home furniture section
 */
import { createShadow } from "@/utils/shadowStyles";
import { Href, router } from "expo-router";
import { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ProductCardItem {
  id: number;
  name: string;
  price: string;
  image: string;
  discount?: string;
  soldCount?: number;
  route: string;
}

export const ProductCard = memo<{ item: ProductCardItem }>(({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => router.push(item.route as Href)}
    activeOpacity={0.8}
  >
    <Image
      source={{ uri: item.image }}
      style={styles.image}
      resizeMode="cover"
    />
    {item.discount && (
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{item.discount}</Text>
      </View>
    )}
    <View style={styles.info}>
      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.price}>{item.price}</Text>
      {item.soldCount != null && item.soldCount > 0 && (
        <Text style={styles.sold}>Đã bán {item.soldCount}</Text>
      )}
    </View>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  card: {
    width: 148,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    ...createShadow({ offsetY: 1, blurRadius: 3, opacity: 0.06 }),
  },
  image: {
    width: 148,
    height: 134,
    backgroundColor: "#F3F4F6",
  },
  discountBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#EF4444",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
  info: {
    padding: 8,
    gap: 4,
  },
  name: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 15,
  },
  price: {
    fontSize: 13,
    fontWeight: "800",
    color: "#EF4444",
    letterSpacing: -0.3,
  },
  sold: {
    fontSize: 9,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 1,
  },
});
