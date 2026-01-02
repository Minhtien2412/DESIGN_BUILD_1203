/**
 * RouteCard - Reusable navigation card component
 * Used across all 9 layers for consistent UI
 * @see app/(tabs)/index.tsx for usage examples
 */

import type { AppRoute } from '@/constants/typed-routes';
import { trackNavigation } from '@/utils/analytics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

export interface RouteCardProps {
  /** Navigation route */
  route: AppRoute;
  /** Display label */
  label: string;
  /** Ionicons name or emoji */
  icon: string;
  /** Card background color */
  color?: string;
  /** Optional price display */
  price?: string;
  /** Badge (HOT, NEW, PRO) */
  badge?: 'HOT' | 'NEW' | 'PRO' | null;
  /** Custom style */
  style?: ViewStyle;
  /** Press handler (overrides default navigation) */
  onPress?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  label,
  icon,
  color = '#F0F0F0',
  price,
  badge,
  style,
  onPress,
}) => {
  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else {
      // Track navigation
      await trackNavigation(route, {
        category: 'route_card',
        layer: undefined,
        sessionId: undefined,
      });
      router.push(route as any);
    }
  };

  const isEmoji = icon.length <= 2 && !/^[a-z-]+$/.test(icon);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color }, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Badge */}
      {badge && (
        <View style={[styles.badge, getBadgeStyle(badge)]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* Icon */}
      <View style={styles.iconContainer}>
        {isEmoji ? (
          <Text style={styles.emoji}>{icon}</Text>
        ) : (
          <Ionicons name={icon as any} size={24} color="#333" />
        )}
      </View>

      {/* Label */}
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>

      {/* Price */}
      {price && (
        <Text style={styles.price}>{price}</Text>
      )}
    </TouchableOpacity>
  );
};

const getBadgeStyle = (badge: 'HOT' | 'NEW' | 'PRO') => {
  switch (badge) {
    case 'HOT':
      return { backgroundColor: '#FF6B6B' };
    case 'NEW':
      return { backgroundColor: '#51CF66' };
    case 'PRO':
      return { backgroundColor: '#FFD43B' };
  }
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  iconContainer: {
    marginBottom: 8,
  },
  emoji: {
    fontSize: 32,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  price: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF6B6B',
    marginTop: 4,
  },
});
