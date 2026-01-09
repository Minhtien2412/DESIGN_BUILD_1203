/**
 * NotificationBadge Component
 * ===========================
 * 
 * Hiển thị badge số thông báo từ nhiều nguồn
 * - Icon bell với badge đỏ
 * - Có thể hiển thị chi tiết từng nguồn
 * - Animation khi có thông báo mới
 * 
 * @author ThietKeResort Team
 * @created 2025-01-08
 */

import { useNotificationBadge } from '@/context/NotificationBadgeContext';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

// ==================== TYPES ====================

interface NotificationBadgeProps {
  /** Hiển thị dạng nhỏ gọn (chỉ icon + số) */
  compact?: boolean;
  /** Hiển thị chi tiết từng nguồn */
  showSources?: boolean;
  /** Icon size */
  iconSize?: number;
  /** Icon color */
  iconColor?: string;
  /** Badge background color */
  badgeColor?: string;
  /** Callback khi bấm */
  onPress?: () => void;
  /** Custom style */
  style?: ViewStyle;
}

interface SourceBadgeProps {
  source: {
    id: string;
    name: string;
    count: number;
    icon: string;
    color: string;
  };
  onPress?: (sourceId: string) => void;
}

// ==================== MAIN COMPONENT ====================

export function NotificationBadge({
  compact = true,
  showSources = false,
  iconSize = 24,
  iconColor = '#1a1a1a',
  badgeColor = '#ef4444',
  onPress,
  style,
}: NotificationBadgeProps) {
  const { totalUnread, badgeCounts, isLoading } = useNotificationBadge();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const prevCount = useRef(totalUnread);

  // Animate khi có thông báo mới
  useEffect(() => {
    if (totalUnread > prevCount.current) {
      // Bounce animation
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCount.current = totalUnread;
  }, [totalUnread, bounceAnim, scaleAnim]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  const formatCount = (count: number): string => {
    if (count > 99) return '99+';
    return count.toString();
  };

  if (compact) {
    return (
      <Pressable onPress={onPress} style={[styles.compactContainer, style]}>
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              transform: [{ scale: scaleAnim }, { translateY }],
            },
          ]}
        >
          <Ionicons name="notifications-outline" size={iconSize} color={iconColor} />
          {totalUnread > 0 && (
            <Animated.View
              style={[
                styles.badge,
                { backgroundColor: badgeColor },
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Text style={styles.badgeText}>{formatCount(totalUnread)}</Text>
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    );
  }

  // Extended view với chi tiết nguồn
  return (
    <View style={[styles.extendedContainer, style]}>
      <Pressable onPress={onPress} style={styles.mainBadge}>
        <Animated.View
          style={[
            styles.iconWrapper,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Ionicons name="notifications" size={iconSize} color={iconColor} />
          {totalUnread > 0 && (
            <View style={[styles.badge, { backgroundColor: badgeColor }]}>
              <Text style={styles.badgeText}>{formatCount(totalUnread)}</Text>
            </View>
          )}
        </Animated.View>
        <Text style={styles.totalText}>
          {totalUnread} thông báo mới
        </Text>
      </Pressable>

      {showSources && (
        <View style={styles.sourcesContainer}>
          {badgeCounts.sources
            .filter(source => source.count > 0)
            .map(source => (
              <SourceBadge key={source.id} source={source} />
            ))}
        </View>
      )}
    </View>
  );
}

// ==================== SOURCE BADGE ====================

function SourceBadge({ source, onPress }: SourceBadgeProps) {
  return (
    <Pressable
      onPress={() => onPress?.(source.id)}
      style={[styles.sourceItem, { borderLeftColor: source.color }]}
    >
      <View style={[styles.sourceIcon, { backgroundColor: source.color + '15' }]}>
        <Ionicons name={source.icon as any} size={16} color={source.color} />
      </View>
      <Text style={styles.sourceName}>{source.name}</Text>
      <View style={[styles.sourceCount, { backgroundColor: source.color }]}>
        <Text style={styles.sourceCountText}>{source.count}</Text>
      </View>
    </Pressable>
  );
}

// ==================== NOTIFICATION SOURCES SUMMARY ====================

interface NotificationSourcesSummaryProps {
  onSourcePress?: (sourceId: string) => void;
  style?: ViewStyle;
}

export function NotificationSourcesSummary({
  onSourcePress,
  style,
}: NotificationSourcesSummaryProps) {
  const { badgeCounts, refreshBadges, isLoading, lastSync } = useNotificationBadge();

  const activeSources = badgeCounts.sources.filter(s => s.count > 0);

  if (activeSources.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
        <Text style={styles.emptyText}>Không có thông báo mới</Text>
        <Text style={styles.emptySubtext}>
          Cập nhật lần cuối: {lastSync ? new Date(lastSync).toLocaleTimeString('vi-VN') : 'Chưa đồng bộ'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.summaryContainer, style]}>
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Thông báo theo nguồn</Text>
        <Pressable onPress={refreshBadges} disabled={isLoading}>
          <Ionicons
            name="refresh"
            size={20}
            color={isLoading ? '#9ca3af' : '#2563eb'}
          />
        </Pressable>
      </View>

      <View style={styles.sourcesList}>
        {activeSources.map(source => (
          <Pressable
            key={source.id}
            onPress={() => onSourcePress?.(source.id)}
            style={styles.sourceCard}
          >
            <View style={[styles.sourceCardIcon, { backgroundColor: source.color + '20' }]}>
              <Ionicons name={source.icon as any} size={24} color={source.color} />
            </View>
            <View style={styles.sourceCardInfo}>
              <Text style={styles.sourceCardName}>{source.name}</Text>
              <Text style={[styles.sourceCardCount, { color: source.color }]}>
                {source.count} mới
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ==================== MINI BADGE (for tab bar) ====================

interface MiniBadgeProps {
  count: number;
  color?: string;
  style?: ViewStyle;
}

export function MiniBadge({ count, color = '#ef4444', style }: MiniBadgeProps) {
  if (count <= 0) return null;

  return (
    <View style={[styles.miniBadge, { backgroundColor: color }, style]}>
      <Text style={styles.miniBadgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  // Compact Badge
  compactContainer: {
    padding: 8,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Extended Badge
  extendedContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  // Sources
  sourcesContainer: {
    marginTop: 16,
    gap: 8,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    gap: 10,
  },
  sourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  sourceCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sourceCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Summary
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  sourcesList: {
    gap: 12,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  sourceCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceCardInfo: {
    flex: 1,
  },
  sourceCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  sourceCardCount: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },

  // Mini Badge
  miniBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  miniBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default NotificationBadge;
