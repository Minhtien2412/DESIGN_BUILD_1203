/**
 * RepairServicesGrid — Dịch vụ sửa chữa tại nhà
 *
 * 2 rows × 4 cols grid with MaterialCommunityIcons, colored circles, and price labels.
 * Data from @/data/home-data REPAIR_SERVICES.
 *
 * @created 2026-02-26
 */

import type { RepairServiceItem } from "@/data/home-data";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SW = Dimensions.get("window").width;
const PAD = 16;

// Service → route mapping
const REPAIR_ROUTES: Record<string, string> = {
  ac: "/services?type=ac",
  elec: "/workers?type=THO_DIEN",
  plumb: "/workers?type=THO_NUOC",
  paint: "/workers?type=THO_SON",
  clean: "/services?type=cleaning",
  lock: "/services?type=locksmith",
  wood: "/workers?type=THO_MOC",
  cam: "/services?type=camera",
};

export interface RepairServicesGridProps {
  data: RepairServiceItem[];
}

export const RepairServicesGrid = memo<RepairServicesGridProps>(({ data }) => {
  const cellW = (SW - PAD * 2) / 4;

  return (
    <View style={s.container}>
      {data.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[s.cell, { width: cellW }]}
          onPress={() =>
            router.push((REPAIR_ROUTES[item.id] || "/services") as Href)
          }
          activeOpacity={0.7}
        >
          <View style={[s.iconCircle, { backgroundColor: item.color + "18" }]}>
            <MaterialCommunityIcons
              name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={26}
              color={item.color}
            />
          </View>
          <Text style={s.label} numberOfLines={2}>
            {item.label}
          </Text>
          <View style={s.priceTag}>
            <Text style={s.priceTxt}>Từ {item.price}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
  },
  cell: {
    alignItems: "center",
    marginBottom: 14,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    lineHeight: 14,
  },
  priceTag: {
    marginTop: 3,
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  priceTxt: {
    fontSize: 9,
    fontWeight: "600",
    color: "#16A34A",
  },
});
