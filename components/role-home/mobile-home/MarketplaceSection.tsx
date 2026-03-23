import type { ImageSourcePropType } from "react-native";
import { StyleSheet, View } from "react-native";
import { IconGridSection } from "./IconGridSection";
import type { HomeIconItem } from "./types";

interface MarketplaceSectionProps {
  items: HomeIconItem[];
  onItemPress?: (id: string) => void;
  searchIconSource?: ImageSourcePropType;
}

export function MarketplaceSection({
  items,
  onItemPress,
  searchIconSource,
}: MarketplaceSectionProps) {
  return (
    <View style={s.container}>
      <IconGridSection
        title="TIỆN ÍCH MARKET PLACE"
        titleColor="#FFFFFF"
        searchPlaceholder="Tìm nội thất ghế, đèn, kệ trưng bày..."
        searchBackgroundColor="#FFF2E5"
        searchIconColor="#A1A1AA"
        searchTextColor="#A1A1AA"
        searchIconSource={searchIconSource}
        items={items}
        onItemPress={onItemPress}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 14,
    backgroundColor: "#F9820F",
    borderRadius: 14,
    marginHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
});
