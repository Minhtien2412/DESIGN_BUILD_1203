/**
 * Equipment Card Component
 * Modern rental equipment display with pricing, availability
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export interface Equipment {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  image?: string;
  rating?: number;
  available?: boolean;
  condition?: 'new' | 'good' | 'fair';
  specs?: string[];
}

interface EquipmentCardProps {
  equipment: Equipment;
  onPress?: () => void;
  onRent?: () => void;
}

export function EquipmentCard({
  equipment,
  onPress,
  onRent,
}: EquipmentCardProps) {
  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'new':
        return '#0D9488';
      case 'good':
        return '#0D9488';
      case 'fair':
        return '#0D9488';
      default:
        return Colors.light.textMuted;
    }
  };

  const getConditionLabel = (condition?: string) => {
    switch (condition) {
      case 'new':
        return 'Mới';
      case 'good':
        return 'Tốt';
      case 'fair':
        return 'Khá';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {equipment.image ? (
          <Image source={{ uri: equipment.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="construct" size={40} color={Colors.light.textMuted} />
          </View>
        )}

        {/* Condition Badge */}
        {equipment.condition && (
          <View
            style={[
              styles.conditionBadge,
              { backgroundColor: getConditionColor(equipment.condition) },
            ]}
          >
            <Text style={styles.conditionText}>
              {getConditionLabel(equipment.condition)}
            </Text>
          </View>
        )}

        {/* Availability Badge */}
        {equipment.available === false && (
          <View style={styles.unavailableOverlay}>
            <Text style={styles.unavailableText}>Đã thuê</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Category */}
        <Text style={styles.category}>{equipment.category}</Text>

        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>
          {equipment.name}
        </Text>

        {/* Rating */}
        {equipment.rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#0D9488" />
            <Text style={styles.ratingText}>{equipment.rating.toFixed(1)}</Text>
          </View>
        )}

        {/* Specs */}
        {equipment.specs && equipment.specs.length > 0 && (
          <View style={styles.specsContainer}>
            {equipment.specs.slice(0, 2).map((spec, index) => (
              <View key={index} style={styles.specChip}>
                <Text style={styles.specText} numberOfLines={1}>
                  {spec}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Ngày:</Text>
            <Text style={styles.price}>
              {equipment.pricePerDay.toLocaleString('vi-VN')}đ
            </Text>
          </View>
          {equipment.pricePerWeek && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tuần:</Text>
              <Text style={styles.priceSecondary}>
                {equipment.pricePerWeek.toLocaleString('vi-VN')}đ
              </Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        {equipment.available !== false && (
          <TouchableOpacity
            style={styles.rentButton}
            onPress={(e) => {
              e.stopPropagation();
              onRent?.();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={16} color="#fff" />
            <Text style={styles.rentButtonText}>Thuê ngay</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1.2,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  conditionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  conditionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 12,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
    height: 38,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  specsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  specChip: {
    backgroundColor: Colors.light.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specText: {
    fontSize: 11,
    color: Colors.light.textMuted,
  },
  pricingContainer: {
    gap: 4,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  priceSecondary: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  rentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 10,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
