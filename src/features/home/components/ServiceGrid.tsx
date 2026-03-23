import { Dimensions, StyleSheet, View } from "react-native";

import { spacing } from "../../shared/theme/spacing";
import { ServiceItem } from "../mock/home.types";
import ServiceGridItem from "./ServiceGridItem";

type ServiceGridProps = {
  items: ServiceItem[];
  compact?: boolean;
  onItemPress?: (item: ServiceItem) => void;
};

export default function ServiceGrid({
  items,
  compact = false,
  onItemPress,
}: ServiceGridProps) {
  const screenWidth = Dimensions.get("window").width;
  const itemWidth = Math.floor((screenWidth - spacing.md * 2 - 10 * 3 - 4) / 4);

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <ServiceGridItem
          key={item.id}
          item={item}
          width={itemWidth}
          compact={compact}
          onPress={onItemPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.xs,
  },
});
