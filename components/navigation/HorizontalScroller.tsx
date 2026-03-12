/**
 * HorizontalScroller - Optimized horizontal scroll container
 * Used for LAYER 4 (Finishing Works) and similar sections
 * Features: Snap scrolling, momentum, performance optimized
 */

import React from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

export interface HorizontalScrollerProps {
  /** Child components */
  children: React.ReactNode;
  /** Item width (default: 120) */
  itemWidth?: number;
  /** Gap between items */
  gap?: number;
  /** Container style */
  style?: ViewStyle;
  /** Enable snap to item */
  snapToInterval?: boolean;
  /** Show scroll indicator */
  showsScrollIndicator?: boolean;
}

export const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({
  children,
  itemWidth = 120,
  gap = 12,
  style,
  snapToInterval = true,
  showsScrollIndicator = false,
}) => {
  const snapInterval = snapToInterval ? itemWidth + gap : undefined;

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={showsScrollIndicator}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: 16, gap },
        ]}
      >
        {React.Children.map(children, (child, index) => (
          <View
            key={index}
            style={[styles.item, { width: itemWidth }]}
          >
            {child}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Container wrapper
  },
  scrollContent: {
    flexDirection: 'row',
  },
  item: {
    // Individual item wrapper
  },
});
