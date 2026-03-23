import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { HomeProductItem } from "./types";

interface ProductCardProps {
  item: HomeProductItem;
  onPress?: (id: string) => void;
}

export function ProductCard({ item, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity
      style={s.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(item.id)}
    >
      <Image source={item.image} style={s.image} resizeMode="cover" />
      <View style={s.body}>
        <Text style={s.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={s.price}>{item.price}</Text>
        <Text style={s.sold}>{item.sold}</Text>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    width: 146,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAECEF",
  },
  image: {
    width: "100%",
    height: 112,
    backgroundColor: "#F3F4F6",
  },
  body: {
    padding: 9,
  },
  name: {
    fontSize: 11,
    color: "#111827",
    lineHeight: 14,
    minHeight: 28,
    fontWeight: "500",
  },
  price: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 28,
  },
  sold: {
    marginTop: 2,
    fontSize: 10,
    color: "#9CA3AF",
  },
});
