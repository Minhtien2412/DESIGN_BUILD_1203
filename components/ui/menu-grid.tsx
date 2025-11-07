import { StyleSheet, View, ViewStyle } from 'react-native';
import { MenuCard, type MenuCardItem } from './menu-card';

export function MenuGrid({
  items,
  columns = 4,
  style,
  itemStyle,
}: {
  items: MenuCardItem[];
  columns?: number;
  style?: ViewStyle;
  itemStyle?: ViewStyle;
}) {
  // Ensure exactly columns x rows layout by using fixed width
  const widthPercent = `${100 / columns - 3}%` as const; // subtract small gap compensation
  return (
    <View style={[styles.grid, style]}>
      {items.map((item) => (
        <View key={item.key} style={[styles.cell, { width: widthPercent }, itemStyle]}>
          <MenuCard item={item} style={itemStyle} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cell: {
    marginBottom: 12,
  },
});
