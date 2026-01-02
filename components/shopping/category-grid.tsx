/**
 * Category Grid - Shopee/Grab Style
 * Created: 12/12/2025
 * 
 * Features:
 * - 4 columns layout
 * - Horizontal scrollable
 * - Icon + label format
 * - White background cards
 * - Active state highlighting
 * - Customizable icons
 * 
 * Usage:
 * <CategoryGrid 
 *   categories={categories}
 *   onCategoryPress={handlePress}
 *   activeCategory="electronics"
 * />
 */

import {
    MODERN_COLORS,
    MODERN_RADIUS,
    MODERN_SPACING,
    MODERN_TYPOGRAPHY
} from '@/constants/modern-theme';
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
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  url?: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
  activeCategory?: string;
  scrollable?: boolean;
  columns?: number;
}

export default function CategoryGrid({
  categories,
  onCategoryPress,
  activeCategory,
  scrollable = true,
  columns = 4,
}: CategoryGridProps) {
  // Group categories by rows
  const rows: Category[][] = [];
  for (let i = 0; i < categories.length; i += columns) {
    rows.push(categories.slice(i, i + columns));
  }

  // Handle category press
  const handlePress = (category: Category) => {
    onCategoryPress?.(category);
  };

  // Render single category card
  const renderCategory = (category: Category) => {
    const isActive = activeCategory === category.id;
    
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryCard,
          isActive && styles.categoryCardActive,
        ]}
        onPress={() => handlePress(category)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.iconContainer,
            isActive && styles.iconContainerActive,
          ]}
        >
          <Ionicons
            name={category.icon}
            size={28}
            color={isActive ? MODERN_COLORS.primary : (category.color || MODERN_COLORS.textSecondary)}
          />
        </View>
        <Text
          style={[
            styles.categoryName,
            isActive && styles.categoryNameActive,
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const content = (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(renderCategory)}
        </View>
      ))}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {content}
      </ScrollView>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
  },
  
  // ScrollView Content
  scrollContent: {
    paddingHorizontal: MODERN_SPACING.md,
    paddingVertical: MODERN_SPACING.sm,
  },
  
  // Row
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MODERN_SPACING.sm,
  },
  
  // Category Card
  categoryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: MODERN_SPACING.sm,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: MODERN_RADIUS.md,
    width: 80,
    gap: MODERN_SPACING.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    backgroundColor: `${MODERN_COLORS.primary}10`,
    borderColor: MODERN_COLORS.primary,
  },
  
  // Icon Container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: MODERN_RADIUS.full,
    backgroundColor: MODERN_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: `${MODERN_COLORS.primary}20`,
  },
  
  // Category Name
  categoryName: {
    fontSize: MODERN_TYPOGRAPHY.fontSize.xs,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.medium,
    color: MODERN_COLORS.text,
    textAlign: 'center',
    lineHeight: MODERN_TYPOGRAPHY.lineHeight.tight,
  },
  categoryNameActive: {
    color: MODERN_COLORS.primary,
    fontWeight: MODERN_TYPOGRAPHY.fontWeight.semibold,
  },
});
