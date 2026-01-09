/**
 * Service Category Item Component
 * Hiển thị một danh mục dịch vụ bảo trì nhà
 * 
 * @author AI Assistant
 * @date 05/01/2026
 */

import type { ServiceCategory } from '@/services/api/homeMaintenanceApi';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ServiceCategoryItemProps {
  category: ServiceCategory;
  onPress: (category: ServiceCategory) => void;
  size?: 'small' | 'medium' | 'large';
}

const ServiceCategoryItem = memo(function ServiceCategoryItemComponent({
  category,
  onPress,
  size = 'medium'
}: ServiceCategoryItemProps) {
  const iconSize = size === 'small' ? 24 : size === 'large' ? 36 : 28;
  const containerSize = size === 'small' ? 56 : size === 'large' ? 80 : 64;
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(category)}
      activeOpacity={0.7}
    >
      {/* Icon container */}
      <View 
        style={[
          styles.iconContainer, 
          { 
            backgroundColor: category.color,
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2
          }
        ]}
      >
        <Ionicons 
          name={category.iconName as any} 
          size={iconSize} 
          color="#fff" 
        />
        
        {/* Hot badge */}
        {category.isHot && (
          <View style={styles.hotBadge}>
            <Ionicons name="flame" size={10} color="#fff" />
          </View>
        )}
      </View>
      
      {/* Category name */}
      <Text 
        style={[
          styles.categoryName,
          size === 'small' && styles.categoryNameSmall,
          size === 'large' && styles.categoryNameLarge
        ]} 
        numberOfLines={2}
      >
        {category.name.replace('\n', '\n')}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 80,
    marginHorizontal: 4,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  hotBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    color: '#374151',
    lineHeight: 14,
  },
  categoryNameSmall: {
    fontSize: 10,
  },
  categoryNameLarge: {
    fontSize: 13,
    fontWeight: '600',
  }
});

export default ServiceCategoryItem;
