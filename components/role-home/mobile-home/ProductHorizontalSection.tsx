import { ScrollView, StyleSheet, View } from "react-native";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";
import type { HomeProductItem } from "./types";

interface ProductHorizontalSectionProps {
  title: string;
  items: HomeProductItem[];
  onItemPress?: (id: string) => void;
  onSeeAllPress?: () => void;
}

export function ProductHorizontalSection({
  title,
  items,
  onItemPress,
  onSeeAllPress,
}: ProductHorizontalSectionProps) {
  return (
    <View style={s.container}>
      <SectionHeader
        title={title}
        titleColor="#7BB049"
        actionText="Xem tất cả >"
        onActionPress={onSeeAllPress}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.listContent}
      >
        {items.map((item) => (
          <ProductCard key={item.id} item={item} onPress={onItemPress} />
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
});
