/**
 * Category Filter Component
 * Horizontal scrollable filter chips
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface Category {
  id: string;
  name: string;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  showCount?: boolean;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  showCount = true,
}: CategoryFilterProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All Categories */}
        <TouchableOpacity
          style={[
            styles.chip,
            selectedCategory === null && styles.chipActive,
          ]}
          onPress={() => onSelectCategory(null)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="apps"
            size={16}
            color={selectedCategory === null ? '#fff' : Colors.light.text}
          />
          <Text
            style={[
              styles.chipText,
              selectedCategory === null && styles.chipTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {/* Category Chips */}
        {categories.map((category) => {
          const isActive = selectedCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.7}
            >
              {category.icon && (
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={isActive ? '#fff' : Colors.light.text}
                />
              )}
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {category.name}
              </Text>
              {showCount && category.count !== undefined && (
                <View
                  style={[
                    styles.countBadge,
                    isActive && styles.countBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isActive && styles.countTextActive,
                    ]}
                  >
                    {category.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  chipTextActive: {
    color: '#fff',
  },
  countBadge: {
    backgroundColor: Colors.light.border,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.text,
  },
  countTextActive: {
    color: '#fff',
  },
});
