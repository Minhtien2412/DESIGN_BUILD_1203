import type { ImageSourcePropType } from "react-native";
import { Dimensions, StyleSheet, View } from "react-native";
import { SectionHeader } from "./SectionHeader";
import { ServiceIconItem } from "./ServiceIconItem";
import type { HomeIconItem } from "./types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SIDE_PADDING = 16;
const COLS = 4;
const GAP = 10;
const ITEM_WIDTH = (SCREEN_WIDTH - SIDE_PADDING * 2 - GAP * (COLS - 1)) / COLS;

interface IconGridSectionProps {
  title: string;
  items: HomeIconItem[];
  onItemPress?: (id: string) => void;
  titleColor?: string;
  searchPlaceholder?: string;
  searchBackgroundColor?: string;
  searchIconColor?: string;
  searchTextColor?: string;
  searchIconSource?: ImageSourcePropType;
}

export function IconGridSection({
  title,
  items,
  onItemPress,
  titleColor = "#111827",
  searchPlaceholder,
  searchBackgroundColor,
  searchIconColor,
  searchTextColor,
  searchIconSource,
}: IconGridSectionProps) {
  return (
    <View style={s.container}>
      <SectionHeader
        title={title}
        titleColor={titleColor}
        searchPlaceholder={searchPlaceholder}
        searchBackgroundColor={searchBackgroundColor}
        searchIconColor={searchIconColor}
        searchTextColor={searchTextColor}
        searchIconSource={searchIconSource}
      />

      <View style={s.grid}>
        {items.map((item) => (
          <ServiceIconItem
            key={item.id}
            item={item}
            width={ITEM_WIDTH}
            onPress={onItemPress}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SIDE_PADDING,
    gap: GAP,
  },
});
