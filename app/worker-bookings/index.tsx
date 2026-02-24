import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const bookings = [
  {
    id: '1',
    projectName: 'Sửa điện nhà ở',
    workerName: 'Nguyễn Văn An',
    workerSpecialty: 'Thợ điện',
    date: '15/01/2026',
    time: '09:00 - 12:00',
    status: 'confirmed',
    price: '600.000đ',
    address: '123 Nguyễn Văn Linh, Q.7',
  },
  {
    id: '2',
    projectName: 'Sơn lại phòng khách',
    workerName: 'Trần Văn Bình',
    workerSpecialty: 'Thợ sơn',
    date: '18/01/2026',
    time: '08:00 - 17:00',
    status: 'pending',
    price: '1.800.000đ',
    address: '456 Lê Văn Việt, Q.9',
  },
  {
    id: '3',
    projectName: 'Sửa ống nước',
    workerName: 'Lê Hoàng Cường',
    workerSpecialty: 'Thợ nước',
    date: '10/01/2026',
    time: '14:00 - 16:00',
    status: 'completed',
    price: '400.000đ',
    address: '789 Võ Văn Ngân, Thủ Đức',
  },
  {
    id: '4',
    projectName: 'Đóng tủ bếp',
    workerName: 'Phạm Minh Đức',
    workerSpecialty: 'Thợ mộc',
    date: '05/01/2026',
    time: '08:00 - 18:00',
    status: 'cancelled',
    price: '5.000.000đ',
    address: '321 Phan Văn Trị, Gò Vấp',
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Đã xác nhận', color: '#4CAF50', bg: '#E8F5E9', icon: 'checkmark-circle' };
    case 'pending':
      return { label: 'Chờ xác nhận', color: '#FF9800', bg: '#FFF3E0', icon: 'time' };
    case 'completed':
      return { label: 'Hoàn thành', color: '#2196F3', bg: '#E3F2FD', icon: 'checkmark-done-circle' };
    case 'cancelled':
      return { label: 'Đã hủy', color: '#F44336', bg: '#FFEBEE', icon: 'close-circle' };
    default:
      return { label: 'Không xác định', color: '#666', bg: '#f0f0f0', icon: 'help-circle' };
  }
};

export default function WorkerBookingsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();

  const renderBooking = ({ item }: { item: typeof bookings[0] }) => {
    const statusConfig = getStatusConfig(item.status);
    
    return (
      <TouchableOpacity style={[styles.bookingCard, { backgroundColor: cardBg }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <Text style={styles.bookingDate}>{item.date}</Text>
        </View>

        <Text style={[styles.projectName, { color: textColor }]}>{item.projectName}</Text>
        
        <View style={styles.workerRow}>
          <View style={styles.workerAvatar}>
            <Ionicons name="person" size={20} color="#666" />
          </View>
          <View>
            <Text style={[styles.workerName, { color: textColor }]}>{item.workerName}</Text>
            <Text style={styles.workerSpecialty}>{item.workerSpecialty}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.price, { color: '#14B8A6' }]}>{item.price}</Text>
          <View style={styles.actionBtns}>
            {item.status === 'pending' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]}>
                <Text style={{ color: '#F44336', fontWeight: '500' }}>Hủy</Text>
              </TouchableOpacity>
            )}
            {item.status === 'confirmed' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#E3F2FD' }]}>
                <Text style={{ color: '#2196F3', fontWeight: '500' }}>Chat</Text>
              </TouchableOpacity>
            )}
            {item.status === 'completed' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FFF3E0' }]}>
                <Text style={{ color: '#FF9800', fontWeight: '500' }}>Đánh giá</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f0f0f0' }]}>
              <Text style={{ color: '#666', fontWeight: '500' }}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Lịch đặt thợ', headerShown: true }} />
      
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TouchableOpacity 
            style={styles.newBookingBtn}
            onPress={() => router.push('/workers' as any)}
          >
            <Ionicons name="add-circle" size={24} color="#14B8A6" />
            <Text style={styles.newBookingText}>Đặt lịch thợ mới</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có lịch đặt thợ</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16 },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#14B8A6',
    borderStyle: 'dashed',
    borderRadius: 12,
    gap: 8,
  },
  newBookingText: { color: '#14B8A6', fontWeight: '600', fontSize: 16 },
  bookingCard: { borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: { fontSize: 12, fontWeight: '500' },
  bookingDate: { color: '#666', fontSize: 13 },
  projectName: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  workerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workerName: { fontSize: 15, fontWeight: '500' },
  workerSpecialty: { color: '#666', fontSize: 13 },
  detailsRow: { gap: 8, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#666', fontSize: 13, flex: 1 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  price: { fontSize: 18, fontWeight: 'bold' },
  actionBtns: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: '#999', marginTop: 12 },
});
