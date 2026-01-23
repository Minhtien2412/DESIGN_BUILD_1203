import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, Layout, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export type AnimatedGridItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

type GridCellProps = { item: AnimatedGridItem; index: number; columns: 3 | 4 };

const GridCell = React.memo(function GridCell({ item, index, columns }: GridCellProps) {
  const pressed = useSharedValue(0);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value ? 0.97 : 1, { duration: 120 }) }],
  }));

  // Subtle icon bob to add life
  const bob = useSharedValue(0);
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(bob.value, { duration: 0 }) }],
  }));

  React.useEffect(() => {
    bob.value = withRepeat(
      withSequence(withTiming(-1.5, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true
    );
     
  }, []);

  return (
    <Animated.View
      entering={FadeInDown.duration(280).delay(40 * index)}
      exiting={FadeOut.duration(120)}
      layout={Layout.springify().damping(16)}
      style={[styles.cellWrap, { width: `${100 / columns - 1}%` }]}
    >
      <Pressable
        onPressIn={() => (pressed.value = 1)}
        onPressOut={() => (pressed.value = 0)}
        onPress={item.onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <Animated.View style={[styles.iconCircle, scaleStyle]}>
          <Animated.View style={iconStyle}>{item.icon}</Animated.View>
        </Animated.View>
        <Text style={styles.label} numberOfLines={2}>
          {item.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

export function AnimatedCategoryGrid({ items, columns = 4, header, contentPaddingBottom = 24, paddingHorizontal = 16 }: { items: readonly AnimatedGridItem[]; columns?: 3 | 4; header?: React.ReactNode; contentPaddingBottom?: number; paddingHorizontal?: number }) {
  const data = useMemo(() => items.slice(), [items]);

  const renderItem = ({ item, index }: { item: AnimatedGridItem; index: number }) => (
    <GridCell item={item} index={index} columns={columns} />
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(it) => it.key}
      renderItem={renderItem}
      numColumns={columns}
      ListHeaderComponent={header ? <View style={{ paddingBottom: 8 }}>{header}</View> : null}
      contentContainerStyle={[styles.list, { paddingBottom: contentPaddingBottom, paddingHorizontal }]}
      columnWrapperStyle={columns === 4 ? { gap: 8 } : undefined}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: { rowGap: 8 },
  cellWrap: { },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cardPressed: { opacity: 0.95 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#0066CC',
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  label: { textAlign: 'center', fontSize: 12, color: '#1f2937', minHeight: 32 },
});
