/**
 * NotificationSourcesSummary Component
 * =====================================
 * 
 * Hiển thị tóm tắt số thông báo từ các nguồn khác nhau:
 * - CRM (tasks, tickets, projects)
 * - App (notifications)
 * - Chat (messages)
 * - Calls (missed calls)
 * 
 * @author ThietKeResort Team
 * @created 2025-01-08
 */

import { useUnifiedBadge } from '@/context/UnifiedBadgeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import {
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from 'react-native';

// ==================== TYPES ====================

interface NotificationSourcesSummaryProps {
  /** Callback khi bấm vào nguồn */
  onSourcePress?: (sourceId: string) => void;
  /** Hiển thị tất cả nguồn hay chỉ có count > 0 */
  showAll?: boolean;
  /** Custom style */
  style?: ViewStyle;
}

interface SourceCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  lastUpdated: string;
  onPress?: () => void;
}

// ==================== SOURCE CARD ====================

function SourceCard({ id, name, icon, color, count, lastUpdated, onPress }: SourceCardProps) {
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.sourceCard,
        { backgroundColor: surface, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      {/* Icon */}
      <View style={[styles.sourceIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>

      {/* Info */}
      <View style={styles.sourceInfo}>
        <Text style={[styles.sourceName, { color: text }]}>{name}</Text>
        {count > 0 ? (
          <Text style={[styles.sourceSubtext, { color }]}>
            {count} mới
          </Text>
        ) : (
          <Text style={[styles.sourceSubtext, { color: textMuted }]}>
            Không có mới
          </Text>
        )}
      </View>

      {/* Badge */}
      {count > 0 && (
        <View style={[styles.sourceBadge, { backgroundColor: color }]}>
          <Text style={styles.sourceBadgeText}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
      )}

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={18} color={textMuted} />
    </Pressable>
  );
}

// ==================== MAIN COMPONENT ====================

export function NotificationSourcesSummary({
  onSourcePress,
  showAll = false,
  style,
}: NotificationSourcesSummaryProps) {
  const { 
    badges, 
    badgeSources, 
    totalBadge, 
    refreshAllBadges, 
    isLoading, 
    lastSyncAt 
  } = useUnifiedBadge();
  
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const primary = useThemeColor({}, 'primary');

  // Danh sách nguồn hiển thị
  const ALL_SOURCES = [
    { id: 'messages', name: 'Tin nhắn', icon: 'chatbubbles', color: '#dc2626' },
    { id: 'missedCalls', name: 'Cuộc gọi nhỡ', icon: 'call', color: '#ea580c' },
    { id: 'notifications', name: 'Thông báo', icon: 'notifications', color: '#16a34a' },
    { id: 'tasks', name: 'Công việc', icon: 'checkbox', color: '#0D9488' },
    { id: 'tickets', name: 'Hỗ trợ', icon: 'ticket', color: '#7c3aed' },
    { id: 'projects', name: 'Dự án', icon: 'briefcase', color: '#0891b2' },
    { id: 'crm', name: 'CRM', icon: 'business', color: '#be185d' },
  ];

  const displaySources = showAll 
    ? ALL_SOURCES.map(s => ({ ...s, count: badges[s.id as keyof typeof badges] || 0 }))
    : badgeSources;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: background }, style]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refreshAllBadges}
          colors={[primary]}
          tintColor={primary}
        />
      }
    >
      {/* Header Summary */}
      <View style={[styles.headerCard, { backgroundColor: primary }]}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="notifications" size={32} color="#fff" />
          {totalBadge > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {totalBadge > 99 ? '99+' : totalBadge}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {totalBadge > 0 ? `${totalBadge} thông báo mới` : 'Không có thông báo mới'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Cập nhật: {lastSyncAt 
              ? new Date(lastSyncAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : 'Chưa đồng bộ'
            }
          </Text>
        </View>
        <Pressable onPress={refreshAllBadges} style={styles.refreshButton}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </Pressable>
      </View>

      {/* Sources List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: text }]}>Theo nguồn</Text>
        
        {displaySources.length > 0 ? (
          displaySources.map(source => (
            <SourceCard
              key={source.id}
              id={source.id}
              name={source.name}
              icon={source.icon}
              color={source.color}
              count={source.count}
              lastUpdated={lastSyncAt?.toISOString() || ''}
              onPress={() => onSourcePress?.(source.id)}
            />
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: surface }]}>
            <Ionicons name="checkmark-circle" size={48} color="#16a34a" />
            <Text style={[styles.emptyText, { color: text }]}>
              Không có thông báo mới
            </Text>
            <Text style={[styles.emptySubtext, { color: textMuted }]}>
              Bạn đã xem hết tất cả thông báo
            </Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: text }]}>Thống kê nhanh</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="chatbubbles"
            label="Tin nhắn"
            value={badges.messages}
            color="#dc2626"
          />
          <StatCard
            icon="call"
            label="Cuộc gọi"
            value={badges.missedCalls}
            color="#ea580c"
          />
          <StatCard
            icon="checkbox"
            label="Công việc"
            value={badges.tasks}
            color="#0D9488"
          />
          <StatCard
            icon="briefcase"
            label="Dự án"
            value={badges.projects}
            color="#0891b2"
          />
        </View>
      </View>
    </ScrollView>
  );
}

// ==================== STAT CARD ====================

function StatCard({ icon, label, value, color }: { 
  icon: string; 
  label: string; 
  value: number; 
  color: string;
}) {
  const surface = useThemeColor({}, 'surface');
  const textMuted = useThemeColor({}, 'textMuted');

  return (
    <View style={[styles.statCard, { backgroundColor: surface }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: textMuted }]}>{label}</Text>
    </View>
  );
}

// ==================== COMPACT BADGE FOR HEADER ====================

interface HeaderBadgeProps {
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export function HeaderNotificationBadge({ onPress, size = 'medium' }: HeaderBadgeProps) {
  const { totalBadge, isLoading } = useUnifiedBadge();
  
  const iconSize = size === 'small' ? 20 : size === 'large' ? 28 : 24;
  
  return (
    <Pressable onPress={onPress} style={styles.headerNotificationBadge}>
      <Ionicons 
        name={totalBadge > 0 ? "notifications" : "notifications-outline"} 
        size={iconSize} 
        color={totalBadge > 0 ? "#dc2626" : "#374151"} 
      />
      {totalBadge > 0 && (
        <View style={styles.headerNotificationBadgeCount}>
          <Text style={styles.headerNotificationBadgeText}>
            {totalBadge > 99 ? '99+' : totalBadge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },

  // Header Card
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  headerIconContainer: {
    position: 'relative',
  },
  headerBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    color: '#dc2626',
    fontSize: 11,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },

  // Source Card
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
  },
  sourceSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  sourceBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sourceBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 12,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },

  // Header Notification Badge
  headerNotificationBadge: {
    padding: 8,
    position: 'relative',
  },
  headerNotificationBadgeCount: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#dc2626',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  headerNotificationBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
});

export default NotificationSourcesSummary;
