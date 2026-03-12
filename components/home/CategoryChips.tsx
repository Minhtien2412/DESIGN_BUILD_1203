/**
 * CategoryChips — Quick-access category pills
 *
 * Horizontal scrollable colored pills with MaterialCommunityIcons.
 * Data from @/data/home-data CATEGORY_ITEMS.
 *
 * @created 2026-02-26
 */

import type { CategoryItem } from "@/data/home-data";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { memo, useCallback } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ChipItem = memo<{ item: CategoryItem }>(({ item }) => {
  const onPress = useCallback(() => {
    router.push(item.route as Href);
  }, [item.route]);

  return (
    <TouchableOpacity style={s.chip} onPress={onPress} activeOpacity={0.7}>
      <View style={[s.iconDot, { backgroundColor: item.color + "18" }]}>
        <MaterialCommunityIcons
          name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={16}
          color={item.color}
        />
      </View>
      <Text style={s.label}>{item.label}</Text>
    </TouchableOpacity>
  );
});

export interface CategoryChipsProps {
  data: CategoryItem[];
}

export const CategoryChips = memo<CategoryChipsProps>(({ data }) => {
  if (!data.length) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.scroll}
    >
      {data.map((item) => (
        <ChipItem key={item.id} item={item} />
      ))}
    </ScrollView>
  );
});

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 16, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
});
