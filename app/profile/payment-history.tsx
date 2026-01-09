import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentHistory {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  methodIcon: string;
  methodColor: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
  items: number;
}

const PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: '1',
    orderId: '#DH123456',
    amount: 2280000,
    method: 'MoMo',
    methodIcon: 'wallet',
    methodColor: '#A50064',
    status: 'success',
    date: '2025-02-08 14:30',
    items: 3,
  },
  {
    id: '2',
    orderId: '#DH123455',
    amount: 1580000,
    method: 'ZaloPay',
    methodIcon: 'logo-z',
    methodColor: '#008FE5',
    status: 'success',
    date: '2025-02-05 10:15',
    items: 2,
  },
  {
    id: '3',
    orderId: '#DH123454',
    amount: 890000,
    method: 'COD',
    methodIcon: 'cash',
    methodColor: '#0066CC',
    status: 'pending',
    date: '2025-02-03 16:45',
    items: 1,
  },
  {
    id: '4',
    orderId: '#DH123453',
    amount: 3200000,
    method: 'VNPAY',
    methodIcon: 'card',
    methodColor: '#0066B2',
    status: 'failed',
    date: '2025-02-01 09:20',
    items: 4,
  },
];

const STATUS_CONFIG = {
  success: {
    label: 'Thành công',
    color: '#0066CC',
    bg: '#0066CC20',
    icon: 'checkmark-circle',
  },
  pending: {
    label: 'Đang xử lý',
    color: '#FFB800',
    bg: '#FFB80020',
    icon: 'time',
  },
  failed: {
    label: 'Thất bại',
    color: '#000000',
    bg: '#00000020',
    icon: 'close-circle',
  },
};

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  const filteredHistory = filter === 'all'
    ? PAYMENT_HISTORY
    : PAYMENT_HISTORY.filter(p => p.status === filter);

  const renderPaymentItem = ({ item }: { item: PaymentHistory }) => {
    const statusConfig = STATUS_CONFIG[item.status];
    
    return (
      <TouchableOpacity style={styles.paymentCard} activeOpacity={0.7}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentHeaderLeft}>
            <View
              style={[
                styles.methodIcon,
                { backgroundColor: item.methodColor + '20' },
              ]}
            >
              <Ionicons
                name={item.methodIcon as any}
                size={20}
                color={item.methodColor}
              />
            </View>
            <View>
              <Text style={styles.orderId}>{item.orderId}</Text>
              <Text style={styles.paymentDate}>{item.date}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Ionicons
              name={statusConfig.icon as any}
              size={14}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.paymentBody}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Phương thức</Text>
            <Text style={styles.paymentValue}>{item.method}</Text>
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentLabel}>Số lượng</Text>
            <Text style={styles.paymentValue}>{item.items} sản phẩm</Text>
          </View>
        </View>

        <View style={styles.paymentFooter}>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalAmount}>
            {item.amount.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>Chưa có giao dịch</Text>
      <Text style={styles.emptyDesc}>
        Lịch sử thanh toán của bạn sẽ hiển thị tại đây
      </Text>
    </View>
  );

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'success' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('success')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'success' && styles.filterTextActive,
              ]}
            >
              Thành công
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'pending' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('pending')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'pending' && styles.filterTextActive,
              ]}
            >
              Đang xử lý
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'failed' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('failed')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'failed' && styles.filterTextActive,
              ]}
            >
              Thất bại
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Payment List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderPaymentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0066CC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterTabActive: {
    backgroundColor: '#0066CC',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
    color: '#999',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 13,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
