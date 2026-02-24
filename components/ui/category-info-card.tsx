/**
 * CategoryInfoCard Component
 * Hiển thị thông tin chi tiết của category với metadata
 */

import type { Category } from '@/data/categories';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface CategoryInfoCardProps {
  category: Category;
  showStats?: boolean;
  compact?: boolean;
}

export function CategoryInfoCard({ 
  category, 
  showStats = true,
  compact = false 
}: CategoryInfoCardProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View style={[
      styles.container,
      { backgroundColor },
      compact && styles.compact
    ]}>
      {/* Icon & Title */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
          <MaterialIcons 
            name={category.icon} 
            size={compact ? 20 : 28} 
            color={category.color} 
          />
        </View>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: textColor }]}>
            {category.title}
          </Text>
          {category.trending && (
            <View style={styles.trendingBadge}>
              <MaterialIcons name="trending-up" size={12} color="#000000" />
              <Text style={styles.trendingText}>Trending</Text>
            </View>
          )}
        </View>
      </View>

      {/* Description */}
      {!compact && category.description && (
        <Text style={[styles.description, { color: textColor }]} numberOfLines={2}>
          {category.description}
        </Text>
      )}

      {/* Stats */}
      {showStats && (
        <View style={styles.stats}>
          {category.itemCount !== undefined && (
            <View style={styles.stat}>
              <MaterialIcons name="inventory" size={14} color="#666" />
              <Text style={styles.statText}>
                {category.itemCount.toLocaleString('vi-VN')} items
              </Text>
            </View>
          )}
          {category.metadata?.averageRating && (
            <View style={styles.stat}>
              <MaterialIcons name="star" size={14} color="#FFB800" />
              <Text style={styles.statText}>
                {category.metadata.averageRating.toFixed(1)}
              </Text>
            </View>
          )}
          {category.popularity && (
            <View style={styles.stat}>
              <MaterialIcons name="local-fire-department" size={14} color="#0D9488" />
              <Text style={styles.statText}>
                {category.popularity}/5
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tags */}
      {!compact && category.tags && category.tags.length > 0 && (
        <View style={styles.tags}>
          {category.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
          {category.tags.length > 3 && (
            <Text style={styles.moreText}>+{category.tags.length - 3}</Text>
          )}
        </View>
      )}

      {/* Price Range */}
      {!compact && category.priceRange && (
        <View style={styles.priceRange}>
          <MaterialIcons name="attach-money" size={14} color="#0D9488" />
          <Text style={styles.priceText}>
            {(category.priceRange.min / 1000000).toFixed(1)}tr - {(category.priceRange.max / 1000000).toFixed(0)}tr
          </Text>
        </View>
      )}

      {/* Subcategories */}
      {!compact && category.subcategories && category.subcategories.length > 0 && (
        <View style={styles.subcategories}>
          <Text style={styles.subcategoryTitle}>Danh mục con:</Text>
          <View style={styles.subcategoryList}>
            {category.subcategories.slice(0, 4).map((sub, index) => (
              <Text key={index} style={styles.subcategoryItem}>
                • {sub}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  compact: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendingText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
  },
  moreText: {
    fontSize: 11,
    color: '#999',
    alignSelf: 'center',
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '600',
  },
  subcategories: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  subcategoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  subcategoryList: {
    gap: 4,
  },
  subcategoryItem: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
});
