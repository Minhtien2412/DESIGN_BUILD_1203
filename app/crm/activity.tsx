/**
 * Project Activity Screen - Perfex CRM Style
 * ============================================
 * 
 * Log hoạt động dự án:
 * - Timeline activities
 * - Filter by type
 * - Staff activity tracking
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ActivityItem {
  id: string;
  type: 'task' | 'comment' | 'file' | 'milestone' | 'status' | 'member' | 'expense' | 'invoice';
  action: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: {
    taskName?: string;
    fileName?: string;
    milestoneName?: string;
    oldStatus?: string;
    newStatus?: string;
    amount?: number;
  };
}

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'task', label: 'Task' },
  { id: 'comment', label: 'Bình luận' },
  { id: 'file', label: 'Tập tin' },
  { id: 'milestone', label: 'Cột mốc' },
  { id: 'status', label: 'Trạng thái' },
];

export default function ActivityScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    loadActivities();
  }, [projectId]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      // Mock data với dữ liệu thực từ Perfex CRM
      // Projects: Nhà Anh Khương Q9, Biệt Thự 3 Tầng Anh Tiến Q7
      // Staff: NHÀ XINH Design, Admin
      setActivities([
        {
          id: '1',
          type: 'task',
          action: 'created',
          description: 'Tạo task mới: "Khảo sát mặt bằng Nhà Anh Khương Q9"',
          user: 'NHÀ XINH Design',
          timestamp: '2024-12-30T14:30:00',
          metadata: { taskName: 'Khảo sát mặt bằng Nhà Anh Khương Q9' },
        },
        {
          id: '2',
          type: 'status',
          action: 'updated',
          description: 'Cập nhật trạng thái dự án Biệt Thự Q7',
          user: 'Admin',
          timestamp: '2024-12-30T12:00:00',
          metadata: { oldStatus: 'Chưa bắt đầu', newStatus: 'Đang thực hiện' },
        },
        {
          id: '3',
          type: 'file',
          action: 'uploaded',
          description: 'Upload tập tin: Mat_Bang_Nha_Anh_Khuong_Q9.dwg',
          user: 'NHÀ XINH Design',
          timestamp: '2024-12-30T10:45:00',
          metadata: { fileName: 'Mat_Bang_Nha_Khuong_Q9.dwg' },
        },
        {
          id: '4',
          type: 'invoice',
          action: 'created',
          description: 'Tạo hóa đơn INV-000001 - Lê Nguyên Thảo - 305,000,000 VND',
          user: 'Admin',
          timestamp: '2024-12-30T09:20:00',
          metadata: { amount: 305000000 },
        },
        {
          id: '5',
          type: 'milestone',
          action: 'created',
          description: 'Tạo cột mốc: "Hoàn thành thiết kế - Nhà Q9"',
          user: 'NHÀ XINH Design',
          timestamp: '2024-12-29T09:00:00',
          metadata: { milestoneName: 'Hoàn thành thiết kế - Nhà Q9' },
        },
        {
          id: '6',
          type: 'comment',
          action: 'added',
          description: 'Anh Khương đã góp ý về thiết kế phòng khách',
          user: 'Anh Khương Q9',
          timestamp: '2024-12-30T14:15:00',
        },
        {
          id: '7',
          type: 'expense',
          action: 'created',
          description: 'Chi phí khảo sát đất Q9',
          user: 'Admin',
          timestamp: '2024-12-28T08:00:00',
          metadata: { amount: 5000000 },
        },
        {
          id: '8',
          type: 'invoice',
          action: 'sent',
          description: 'Gửi hóa đơn #INV-001 cho khách hàng',
          user: 'Account Manager',
          timestamp: '2025-01-13T15:00:00',
        },
      ]);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const getActivityIcon = (type: string): string => {
    const icons: Record<string, string> = {
      task: 'checkbox-outline',
      comment: 'chatbubble-outline',
      file: 'document-outline',
      milestone: 'flag-outline',
      status: 'swap-horizontal-outline',
      member: 'person-add-outline',
      expense: 'wallet-outline',
      invoice: 'receipt-outline',
    };
    return icons[type] || 'ellipse-outline';
  };

  const getActivityColor = (type: string): string => {
    const colors: Record<string, string> = {
      task: '#3b82f6',
      comment: '#22c55e',
      file: '#8b5cf6',
      milestone: '#f59e0b',
      status: '#06b6d4',
      member: '#ec4899',
      expense: '#ef4444',
      invoice: '#10b981',
    };
    return colors[type] || '#6b7280';
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter((a) => a.type === filter);

  const renderActivity = ({ item, index }: { item: ActivityItem; index: number }) => (
    <View style={styles.activityItem}>
      {/* Timeline Line */}
      <View style={styles.timelineColumn}>
        <View style={[styles.iconCircle, { backgroundColor: getActivityColor(item.type) + '20' }]}>
          <Ionicons
            name={getActivityIcon(item.type) as any}
            size={16}
            color={getActivityColor(item.type)}
          />
        </View>
        {index < filteredActivities.length - 1 && (
          <View style={[styles.timelineLine, { backgroundColor: borderColor }]} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.activityContent, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.activityHeader}>
          <Text style={[styles.activityUser, { color: primaryColor }]}>{item.user}</Text>
          <Text style={[styles.activityTime, { color: textColor }]}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={[styles.activityDescription, { color: textColor }]}>{item.description}</Text>
        
        {/* Metadata */}
        {item.metadata && item.metadata.oldStatus && item.metadata.newStatus && (
          <View style={styles.statusChange}>
            <View style={[styles.statusBadge, { backgroundColor: '#6b728020' }]}>
              <Text style={styles.statusText}>{item.metadata.oldStatus}</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#6b7280" />
            <View style={[styles.statusBadge, { backgroundColor: getActivityColor(item.type) + '20' }]}>
              <Text style={[styles.statusText, { color: getActivityColor(item.type) }]}>
                {item.metadata.newStatus}
              </Text>
            </View>
          </View>
        )}
        
        {item.metadata && item.metadata.amount && (
          <Text style={[styles.amount, { color: '#ef4444' }]}>
            {item.metadata.amount.toLocaleString('vi-VN')} ₫
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Hoạt động</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={[styles.filterBar, { borderBottomColor: borderColor }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ACTIVITY_FILTERS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { borderColor },
                filter === item.id && { backgroundColor: primaryColor, borderColor: primaryColor },
              ]}
              onPress={() => setFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === item.id ? '#fff' : textColor },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Activity List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id}
          renderItem={renderActivity}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="pulse-outline" size={64} color="#6b7280" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Chưa có hoạt động</Text>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Các hoạt động sẽ được ghi lại tại đây
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterBar: {
    borderBottomWidth: 1,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  activityContent: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 8,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityUser: {
    fontSize: 13,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 11,
    opacity: 0.7,
  },
  activityDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
});
