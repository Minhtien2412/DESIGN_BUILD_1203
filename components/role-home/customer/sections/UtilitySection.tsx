/**
 * UtilitySection — Reusable section for TIỆN ÍCH blocks
 *
 * Used 4 times: Thiết kế, Xây dựng, Hoàn thiện, Bảo trì
 * Layout: Title → mini search bar → icon grid (2×4) → promo banner card
 */
import type { UtilitySectionData } from "@/data/role-home/customerHomeData";
import { Ionicons } from "@expo/vector-icons";
import {
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SW } = Dimensions.get("window");
const GRID_PAD = 16;
const COLS = 4;
const ICON_SIZE = (SW - GRID_PAD * 2 - (COLS - 1) * 10) / COLS;

interface Props {
  data: UtilitySectionData;
  onItemPress?: (id: string) => void;
  onPromoPress?: (sectionId: string) => void;
}

export function UtilitySection({ data, onItemPress, onPromoPress }: Props) {
  return (
    <View style={s.container}>
      {/* Section title */}
      <Text style={s.sectionTitle}>{data.title}</Text>

      {/* Mini search bar */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search-outline" size={16} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            placeholder={data.searchPlaceholder}
            placeholderTextColor="#9CA3AF"
            editable={false}
          />
        </View>
      </View>

      {/* Icon grid (2×4) */}
      <View style={s.grid}>
        {data.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[s.gridItem, { width: ICON_SIZE }]}
            activeOpacity={0.7}
            onPress={() => onItemPress?.(item.id)}
          >
            <View style={[s.iconBox, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={s.iconLabel} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Promo banner card */}
      <TouchableOpacity
        style={[s.promoBanner, { backgroundColor: data.promo.bgColor }]}
        activeOpacity={0.8}
        onPress={() => onPromoPress?.(data.id)}
      >
        <View style={s.promoContent}>
          <View style={s.promoTagRow}>
            <View style={s.promoHotBadge}>
              <Text style={s.promoHotText}>TIỆN ÍCH HOT</Text>
            </View>
          </View>
          <Text style={s.promoTitle}>{data.promo.title}</Text>
          <Text style={s.promoSubtitle}>{data.promo.subtitle}</Text>
          <View style={s.promoCta}>
            <Text style={s.promoCtaText}>{data.promo.ctaLabel}</Text>
          </View>
        </View>
        <View style={s.promoImageArea}>
          <Ionicons name="construct" size={48} color="rgba(255,255,255,0.3)" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#90B44C",
    letterSpacing: 0.5,
    paddingHorizontal: GRID_PAD,
    marginBottom: 10,
  },
  // Search
  searchRow: {
    paddingHorizontal: GRID_PAD,
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
  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: GRID_PAD,
    gap: 10,
    marginBottom: 14,
  },
  gridItem: {
    alignItems: "center",
    gap: 5,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#1A1A2E",
    textAlign: "center",
    lineHeight: 13,
  },
  // Promo banner
  promoBanner: {
    marginHorizontal: GRID_PAD,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    minHeight: 150,
  },
  promoContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    gap: 4,
  },
  promoTagRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  promoHotBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  promoHotText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 26,
  },
  promoSubtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 14,
    marginTop: 2,
  },
  promoCta: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 8,
  },
  promoCtaText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1A1A2E",
  },
  promoImageArea: {
    width: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});
