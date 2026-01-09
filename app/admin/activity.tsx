import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useActivityLog } from '@/hooks/useAdmin';
import { hasPermission } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

const ACTIVITY_TYPES = [
  { value: '', label: 'Tất cả' },
  { value: 'login', label: 'Đăng nhập' },
  { value: 'logout', label: 'Đăng xuất' },
  { value: 'create', label: 'Tạo mới' },
  { value: 'update', label: 'Cập nhật' },
  { value: 'delete', label: 'Xóa' },
  { value: 'view', label: 'Xem' },
];

const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'login': return 'log-in-outline';
    case 'logout': return 'log-out-outline';
    case 'create': return 'add-circle-outline';
    case 'update': return 'create-outline';
    case 'delete': return 'trash-outline';
    case 'view': return 'eye-outline';
    default: return 'information-circle-outline';
  }
};

const getActivityColor = (type: string): string => {
  switch (type) {
    case 'login': return '#0066CC';
    case 'logout': return '#6b7280';
    case 'create': return '#3b82f6';
    case 'update': return '#0066CC';
    case 'delete': return '#000000';
    case 'view': return '#666666';
    default: return '#64748b';
  }
};

export default function ActivityLogScreen() {
  const { user } = useAuth();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'surface');

  // Permission check
  useEffect(() => {
    if (!user?.admin || !hasPermission(user.permissions, 'reports', 'view')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền xem nhật ký hoạt động', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [user]);

  // Filters
  const [filters, setFilters] = useState({
    type: '',
    date_from: '',
    date_to: '',
  });

  const { activities, loading, hasMore, fetchMore, refresh } = useActivityLog();

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        onRefresh={refresh}
        refreshing={loading && activities.length === 0}
        ListHeaderComponent={
          <Container>
            {/* Header */}
            <Section>
              <View style={styles.header}>
                <View>
                  <ThemedText type="title">Nhật ký hoạt động</ThemedText>
                  <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
                    {activities.length} hoạt động
                  </ThemedText>
                </View>
              </View>
            </Section>

            {/* Filters */}
            <Section>
              <ThemedText type="defaultSemiBold" style={styles.filterLabel}>
                Loại hoạt động
              </ThemedText>
              <View style={styles.filterGrid}>
                {ACTIVITY_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={filters.type === type.value ? 'primary' : 'ghost'}
                    size="sm"
                    onPress={() => setFilters(prev => ({ ...prev, type: type.value }))}
                    style={styles.filterButton}
                  >
                    {type.label}
                  </Button>
                ))}
              </View>
            </Section>
          </Container>
        }
        renderItem={({ item }) => (
          <Container fullWidth>
            <View style={[styles.activityCard, { backgroundColor: cardBg, borderColor }]}>
              <View style={styles.activityHeader}>
                {/* Icon */}
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${getActivityColor(item.type)}20` }
                  ]}
                >
                  <Ionicons
                    name={getActivityIcon(item.type)}
                    size={20}
                    color={getActivityColor(item.type)}
                  />
                </View>

                {/* Content */}
                <View style={styles.activityContent}>
                  {/* Staff info */}
                  <View style={styles.staffRow}>
                    {item.staff.profile_image ? (
                      <View style={styles.avatar}>
                        {/* Avatar would be here */}
                      </View>
                    ) : (
                      <View style={[styles.avatarPlaceholder, { borderColor }]}>
                        <ThemedText style={styles.avatarText}>
                          {item.staff.firstname.charAt(0)}{item.staff.lastname.charAt(0)}
                        </ThemedText>
                      </View>
                    )}
                    <ThemedText type="defaultSemiBold">
                      {item.staff.firstname} {item.staff.lastname}
                    </ThemedText>
                  </View>

                  {/* Description */}
                  <ThemedText style={styles.description}>
                    {item.description}
                  </ThemedText>

                  {/* Metadata */}
                  {item.metadata && Object.keys(item.metadata).length > 0 && (
                    <View style={[styles.metadata, { borderColor }]}>
                      {Object.entries(item.metadata).slice(0, 3).map(([key, value]) => (
                        <View key={key} style={styles.metadataRow}>
                          <ThemedText style={[styles.metadataKey, { color: mutedColor }]}>
                            {key}:
                          </ThemedText>
                          <ThemedText style={styles.metadataValue}>
                            {String(value)}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Footer */}
                  <View style={styles.activityFooter}>
                    <View style={styles.footerLeft}>
                      <Ionicons name="time-outline" size={14} color={mutedColor} />
                      <ThemedText style={[styles.timestamp, { color: mutedColor }]}>
                        {formatDate(item.created_at)}
                      </ThemedText>
                    </View>
                    {item.ip_address && (
                      <View style={styles.footerRight}>
                        <Ionicons name="location-outline" size={14} color={mutedColor} />
                        <ThemedText style={[styles.ipAddress, { color: mutedColor }]}>
                          {item.ip_address}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </Container>
        )}
        ListFooterComponent={
          loading && activities.length > 0 ? (
            <View style={styles.footer}>
              <Loader height={60} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Container>
              <Section>
                <View style={styles.empty}>
                  <Ionicons name="document-text-outline" size={64} color={mutedColor} />
                  <ThemedText style={[styles.emptyText, { color: mutedColor }]}>
                    Không có hoạt động nào
                  </ThemedText>
                </View>
              </Section>
            </Container>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  filterLabel: {
    marginBottom: 12,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    minWidth: 80,
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  avatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  metadata: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    gap: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metadataKey: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 80,
  },
  metadataValue: {
    fontSize: 12,
    flex: 1,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  ipAddress: {
    fontSize: 12,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
});
