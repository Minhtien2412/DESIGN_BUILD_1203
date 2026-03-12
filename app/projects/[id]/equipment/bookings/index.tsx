import TimelineItem from '@/components/construction/TimelineItem';
import { Container } from '@/components/ui/container';
import {
    BookingStatus,
    EquipmentBooking,
    EquipmentService,
} from '@/services/api/equipment.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  active: 'Đang dùng',
  completed: 'Hoàn thành',
  cancelled: 'Hủy',
};

export default function EquipmentBookingsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  const [bookings, setBookings] = useState<EquipmentBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<EquipmentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await EquipmentService.getBookings();
      setBookings(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách đặt thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleApprove = async (booking: EquipmentBooking) => {
    try {
      await EquipmentService.updateBooking(booking.id, {
        status: 'approved',
        approvedBy: 'Current User',
        approvedAt: new Date().toISOString(),
      });
      Alert.alert('Thành công', 'Đã duyệt yêu cầu đặt thiết bị');
      loadBookings();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể duyệt yêu cầu');
    }
  };

  const handleCancel = async (booking: EquipmentBooking) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy yêu cầu này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy yêu cầu',
          style: 'destructive',
          onPress: async () => {
            try {
              await EquipmentService.updateBooking(booking.id, {
                status: 'cancelled',
              });
              Alert.alert('Đã hủy', 'Yêu cầu đã được hủy');
              loadBookings();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy yêu cầu');
            }
          },
        },
      ]
    );
  };

  const getStatusConfig = (status: BookingStatus) => {
    const configs: Record<BookingStatus, { type: 'current' | 'completed' | 'failed' | 'pending'; icon: any }> = {
      pending: { type: 'current', icon: 'time' },
      approved: { type: 'completed', icon: 'checkmark-circle' },
      active: { type: 'current', icon: 'play-circle' },
      completed: { type: 'completed', icon: 'checkmark-done' },
      cancelled: { type: 'failed', icon: 'close-circle' },
    };
    return configs[status];
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')} (${days} ngày)`;
  };

  const renderBooking = (booking: EquipmentBooking) => {
    const statusConfig = getStatusConfig(booking.status);

    return (
      <View>
        <TimelineItem
          key={booking.id}
          title={booking.equipmentName}
          description={`${booking.purpose || 'Không có mô tả'} • ${booking.bookedBy} • ${booking.projectName}${booking.approvedBy ? ' • Duyệt bởi ' + booking.approvedBy : ''}`}
          date={formatDateRange(booking.startDate, booking.endDate)}
          status={statusConfig.type}
          icon={statusConfig.icon}
        />

        {booking.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Ghi chú:</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}

        {booking.status === 'pending' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(booking)}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Duyệt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(booking)}
            >
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Container fullWidth>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt thiết bị</Text>
        <TouchableOpacity 
          onPress={() => router.push(`/projects/${projectId}/equipment/bookings/create`)}
          style={styles.createButton}
        >
          <Ionicons name="add" size={24} color="#0D9488" />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'all' && styles.filterChipActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'all' && styles.filterChipTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {(Object.keys(STATUS_LABELS) as BookingStatus[]).map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
              {STATUS_LABELS[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.timeline}>
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Đang tải...</Text>
            </View>
          ) : filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Chưa có lịch đặt thiết bị</Text>
              <TouchableOpacity
                style={styles.createCTA}
                onPress={() => router.push(`/projects/${projectId}/equipment/bookings/create`)}
              >
                <Ionicons name="add-circle" size={20} color="#0D9488" />
                <Text style={styles.createCTAText}>Tạo yêu cầu mới</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredBookings.map(renderBooking)
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  timeline: {
    padding: 16,
  },
  bookingContent: {
    gap: 12,
  },
  bookingInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  approvalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
  },
  approvalText: {
    fontSize: 12,
    color: '#065f46',
  },
  notesBox: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#0D9488',
  },
  cancelButton: {
    backgroundColor: '#000000',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  createCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F0FDFA',
    borderRadius: 24,
  },
  createCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
  },
});
