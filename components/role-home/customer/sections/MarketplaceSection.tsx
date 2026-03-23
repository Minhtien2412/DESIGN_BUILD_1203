/**
 * MarketplaceSection — TIỆN ÍCH MARKET PLACE
 * Search bar + product thumbnail grid + category chips
 */
import type { MarketplaceProduct } from "@/data/role-home/customerHomeData";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;
const COLS = 4;
const THUMB_SIZE = (SW - PAD * 2 - (COLS - 1) * 10) / COLS;

interface Props {
  products: MarketplaceProduct[];
  searchPlaceholder: string;
  onItemPress?: (id: string) => void;
}

export function MarketplaceSection({
  products,
  searchPlaceholder,
  onItemPress,
}: Props) {
  return (
    <View style={s.container}>
      {/* Title */}
      <View style={s.titleRow}>
        <Text style={s.sectionTitle}>TIỆN ÍCH MARKET PLACE</Text>
      </View>

      {/* Search bar */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor="#9CA3AF"
            editable={false}
          />
        </View>
      </View>

      {/* Product thumbnail grid */}
      <View style={s.grid}>
        {products.slice(0, 4).map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.thumbCard, { width: THUMB_SIZE }]}
            activeOpacity={0.7}
            onPress={() => onItemPress?.(item.id)}
          >
            <View style={s.thumbImage}>
              <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category chip scrolls */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipRow}
      >
        {products.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={s.chip}
            activeOpacity={0.7}
            onPress={() => onItemPress?.(item.id)}
          >
            <Text style={s.chipText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  titleRow: {
    paddingHorizontal: PAD,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#90B44C",
    letterSpacing: 0.5,
  },
  searchRow: {
    paddingHorizontal: PAD,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: "#1A1A2E",
    padding: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
    gap: 10,
    marginBottom: 12,
  },
  thumbCard: {
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  chipRow: {
    paddingHorizontal: PAD,
    gap: 8,
  },
  chip: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A2E",
  },
});
