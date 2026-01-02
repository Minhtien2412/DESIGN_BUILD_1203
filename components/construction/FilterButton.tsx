/**
 * FilterButton.tsx
 * Floating filter button with active filter indicator
 * 
 * Features:
 * - Shows filter icon with active count badge
 * - Animated badge appearance
 * - Opens FilterPanel modal on press
 * - Displays filter summary tooltip
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterButtonProps {
  activeFilterCount: number;
  onPress: () => void;
  filterSummary?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  activeFilterCount,
  onPress,
  filterSummary,
  position = 'top-right',
}) => {
  const badgeScale = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (activeFilterCount > 0) {
      Animated.spring(badgeScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }).start();
    } else {
      Animated.spring(badgeScale, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }).start();
    }
  }, [activeFilterCount, badgeScale]);

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return { top: 16, left: 16 };
      case 'top-right':
        return { top: 16, right: 16 };
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'bottom-right':
        return { bottom: 16, right: 16 };
      default:
        return { top: 16, right: 16 };
    }
  };

  return (
    <View style={[styles.container, getPositionStyles()]}>
      <TouchableOpacity
        style={[
          styles.button,
          activeFilterCount > 0 && styles.buttonActive,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons
          name={activeFilterCount > 0 ? 'filter' : 'filter-outline'}
          size={22}
          color={activeFilterCount > 0 ? '#FFF' : '#6B7280'}
        />
        {activeFilterCount > 0 && (
          <Animated.View
            style={[
              styles.badge,
              { transform: [{ scale: badgeScale }] },
            ]}
          >
            <Text style={styles.badgeText}>{activeFilterCount}</Text>
          </Animated.View>
        )}
      </TouchableOpacity>

      {/* Filter Summary Tooltip */}
      {activeFilterCount > 0 && filterSummary && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText} numberOfLines={1}>
            {filterSummary}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: '#3B82F6',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  tooltip: {
    position: 'absolute',
    top: 55,
    right: 0,
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
  },
});
