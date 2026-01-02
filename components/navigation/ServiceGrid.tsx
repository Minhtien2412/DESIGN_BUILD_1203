/**
 * ServiceGrid - Smart grid layout for service cards
 * Automatically adjusts columns based on screen size
 * Supports 2-column and 4-column layouts
 */

import React from 'react';
import {
    Dimensions,
    StyleSheet,
    View,
    ViewStyle,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ServiceGridProps {
  /** Number of columns (2 or 4) */
  columns?: 2 | 4;
  /** Gap between items */
  gap?: number;
  /** Container style */
  style?: ViewStyle;
  /** Child components */
  children: React.ReactNode;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  columns = 4,
  gap = 12,
  style,
  children,
}) => {
  const paddingHorizontal = 16;
  const totalGapWidth = (columns - 1) * gap;
  const itemWidth = (SCREEN_WIDTH - 2 * paddingHorizontal - totalGapWidth) / columns;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.grid, { gap }]}>
        {React.Children.map(children, (child, index) => (
          <View
            key={index}
            style={[
              styles.gridItem,
              { width: itemWidth },
            ]}
          >
            {child}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    marginBottom: 12,
  },
});
