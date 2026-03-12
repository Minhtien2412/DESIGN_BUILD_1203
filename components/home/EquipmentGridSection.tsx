/**
 * EquipmentGrid — Thiết bị & Shopping
 *
 * 2 rows × 4 cols pageable grid using the same ServiceItem shape.
 * Data from @/data/home-data EQUIPMENT_ITEMS.
 *
 * @created 2026-02-26
 */

import type { ServiceItem } from "@/data/home-data";
import { Href, router } from "expo-router";
import { memo, useMemo } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SW = Dimensions.get("window").width;
const PAD = 16;

function groupPages<T>(items: T[], size: number): T[][] {
  const p: T[][] = [];
  for (let i = 0; i < items.length; i += size) p.push(items.slice(i, i + size));
  return p;
}

export interface EquipmentGridProps {
  data: ServiceItem[];
}

export const EquipmentGrid = memo<EquipmentGridProps>(({ data }) => {
  const pages = useMemo(() => groupPages(data, 8), [data]);
  const cellW = (SW - PAD * 2) / 4;

  return (
    <FlatList
      data={pages}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, i) => `eq-${i}`}
      renderItem={({ item: pageItems }) => (
        <View style={s.page}>
          {pageItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[s.cell, { width: cellW }]}
              onPress={() => router.push(item.route as Href)}
              activeOpacity={0.7}
            >
              <View style={s.iconBox}>
                <Image source={item.icon} style={s.img} resizeMode="contain" />
              </View>
              <Text style={s.label} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    />
  );
});

const s = StyleSheet.create({
  page: {
    width: SW,
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: PAD,
  },
  cell: {
    alignItems: "center",
    marginBottom: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    overflow: "hidden",
  },
  img: { width: 38, height: 38 },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#334155",
    textAlign: "center",
    lineHeight: 14,
  },
});
