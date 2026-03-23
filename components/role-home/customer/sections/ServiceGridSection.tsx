/**
 * ServiceGridSection — DỊCH VỤ section
 * Label + 12-icon grid (3×4) matching reference design
 */
import type { GridItem } from "@/data/role-home/customerHomeData";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const PAD = 16;
const COLS = 4;
const ITEM_W = (SW - PAD * 2 - (COLS - 1) * 10) / COLS;

interface Props {
  items: GridItem[];
  onItemPress?: (id: string) => void;
}

export function ServiceGridSection({ items, onItemPress }: Props) {
  return (
    <View style={s.container}>
      <Text style={s.sectionLabel}>DỊCH VỤ</Text>
      <View style={s.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.item, { width: ITEM_W }]}
            activeOpacity={0.7}
            onPress={() => onItemPress?.(item.id)}
          >
            <View style={[s.iconBox, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={s.label} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#90B44C",
    letterSpacing: 0.5,
    paddingHorizontal: PAD,
    marginBottom: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
    gap: 10,
  },
  item: {
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "#1A1A2E",
    textAlign: "center",
    lineHeight: 13,
  },
});
