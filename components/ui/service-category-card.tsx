/**
 * ServiceCategoryCard Component
 * Hiển thị thông tin dịch vụ với category, pricing, features
 */

import type { Service } from '@/data/services';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServiceCategoryCardProps {
  service: Service;
  onPress?: () => void;
  compact?: boolean;
}

const CATEGORY_CONFIG = {
  construction: { 
    label: 'Thi công', 
    color: '#0D9488',
    icon: 'construct' as const
  },
  labor: { 
    label: 'Nhân công', 
    color: '#0D9488',
    icon: 'people' as const
  },
  material: { 
    label: 'Vật tư', 
    color: '#0D9488',
    icon: 'cube' as const
  },
  finishing: { 
    label: 'Hoàn thiện', 
    color: '#666666',
    icon: 'brush' as const
  },
  tech: { 
    label: 'Kỹ thuật', 
    color: '#666666',
    icon: 'settings' as const
  },
};

export function ServiceCategoryCard({ 
  service, 
  onPress,
  compact = false 
}: ServiceCategoryCardProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const categoryConfig = CATEGORY_CONFIG[service.category];

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        { backgroundColor },
        compact && styles.compact
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{service.icon}</Text>
          <View style={styles.titleSection}>
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {service.name}
            </Text>
            <Text style={styles.nameEn} numberOfLines={1}>
              {service.nameEn}
            </Text>
          </View>
        </View>
        
        {/* Category Badge */}
        <View style={[
          styles.categoryBadge,
          { backgroundColor: categoryConfig.color + '20' }
        ]}>
          <Ionicons 
            name={categoryConfig.icon} 
            size={12} 
            color={categoryConfig.color} 
          />
          <Text style={[styles.categoryText, { color: categoryConfig.color }]}>
            {categoryConfig.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      {!compact && (
        <Text style={[styles.description, { color: textColor }]} numberOfLines={2}>
          {service.description}
        </Text>
      )}

      {/* Pricing Info */}
      <View style={styles.pricingSection}>
        <View style={styles.priceRange}>
          <Text style={styles.fromLabel}>Từ</Text>
          <Text style={styles.price}>
            {service.pricing[0].price.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.unit}>/{service.unit}</Text>
        </View>
        {service.pricing.length > 1 && (
          <View style={styles.optionsCount}>
            <Ionicons name="list" size={12} color="#666" />
            <Text style={styles.optionsText}>
              {service.pricing.length} tùy chọn
            </Text>
          </View>
        )}
      </View>

      {/* Key Features */}
      {!compact && service.features && service.features.length > 0 && (
        <View style={styles.features}>
          {service.features.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={12} color="#0D9488" />
              <Text style={styles.featureText} numberOfLines={1}>
                {feature}
              </Text>
            </View>
          ))}
          {service.features.length > 3 && (
            <Text style={styles.moreFeatures}>
              +{service.features.length - 3} tính năng khác
            </Text>
          )}
        </View>
      )}

      {/* Footer Info */}
      <View style={styles.footer}>
        {service.deliveryTime && (
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={12} color="#666" />
            <Text style={styles.footerText}>{service.deliveryTime}</Text>
          </View>
        )}
        {service.minOrder && (
          <View style={styles.footerItem}>
            <Ionicons name="cart-outline" size={12} color="#666" />
            <Text style={styles.footerText}>
              Tối thiểu: {service.minOrder} {service.unit}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  titleSection: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  nameEn: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.7,
    marginBottom: 12,
  },
  pricingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  fromLabel: {
    fontSize: 11,
    color: '#666',
    marginRight: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  unit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  optionsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionsText: {
    fontSize: 11,
    color: '#666',
  },
  features: {
    gap: 6,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  moreFeatures: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '500',
    marginLeft: 18,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: '#666',
  },
});
