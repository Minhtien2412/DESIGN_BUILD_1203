/**
 * FurnitureProductsRow — SẢN PHẨM NỘI THẤT
 * Horizontal scrollable product cards with name, price, sold count
 */
import type { FurnitureProduct } from "@/data/role-home/customerHomeData";
import { Ionicons } from "@expo/vector-icons";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  products: FurnitureProduct[];
  onItemPress?: (id: string) => void;
  onSeeAllPress?: () => void;
}

export function FurnitureProductsRow({
  products,
  onItemPress,
  onSeeAllPress,
}: Props) {
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>SẢN PHẨM NỘI THẤT</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAllPress}>
          <Text style={s.seeAll}>Xem tất cả &gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal scroll */}
      <FlatList
        data={products}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.7}
            onPress={() => onItemPress?.(item.id)}
          >
            <View style={s.cardImage}>
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            </View>
            <View style={s.cardBody}>
              <Text style={s.cardName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={s.cardPrice}>{item.price}</Text>
              <Text style={s.cardSold}>{item.sold}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  seeAll: {
    fontSize: 12,
    color: "#90B44C",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 155,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardImage: {
    height: 130,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    padding: 10,
    gap: 3,
  },
  cardName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A2E",
    lineHeight: 16,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: 2,
  },
  cardSold: {
    fontSize: 10,
    color: "#9CA3AF",
  },
});
