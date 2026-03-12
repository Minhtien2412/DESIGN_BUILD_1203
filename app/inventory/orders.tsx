import { useMaterialOrders } from '@/hooks/useInventory';
import { OrderStatus } from '@/types/inventory';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'Nháp',
  [OrderStatus.PENDING]: 'Chờ duyệt',
  [OrderStatus.APPROVED]: 'Đã duyệt',
  [OrderStatus.ORDERED]: 'Đã đặt',
  [OrderStatus.PARTIALLY_RECEIVED]: 'Nhận một phần',
  [OrderStatus.RECEIVED]: 'Đã nhận',
  [OrderStatus.CANCELLED]: 'Đã hủy',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: '#999999',
  [OrderStatus.PENDING]: '#0D9488',
  [OrderStatus.APPROVED]: '#0D9488',
  [OrderStatus.ORDERED]: '#666666',
  [OrderStatus.PARTIALLY_RECEIVED]: '#0D9488',
  [OrderStatus.RECEIVED]: '#0D9488',
  [OrderStatus.CANCELLED]: '#000000',
};

export default function OrdersScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { orders, loading, approveOrder, cancelOrder } = useMaterialOrders(projectId);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');

  const handleApprove = async (orderId: string, orderNo: string) => {
    Alert.alert(
      'Duyệt đơn hàng',
      `Xác nhận duyệt đơn hàng "${orderNo}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Duyệt',
          onPress: async () => {
            try {
              await approveOrder(orderId);
              Alert.alert('Thành công', 'Đã duyệt đơn hàng');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể duyệt đơn hàng');
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (orderId: string, orderNo: string) => {
    Alert.alert(
      'Hủy đơn hàng',
      `Bạn có chắc muốn hủy đơn hàng "${orderNo}"?`,
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(orderId);
              Alert.alert('Thành công', 'Đã hủy đơn hàng');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy đơn hàng');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredOrders =
    filter === 'ALL'
      ? orders
      : orders.filter((order) => order.status === filter);

  const statusCounts = {
    ALL: orders.length,
    ...Object.values(OrderStatus).reduce(
      (acc, status) => {
        acc[status] = orders.filter((o) => o.status === status).length;
        return acc;
      },
      {} as Record<OrderStatus, number>
    ),
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <ScrollView horizontal style={styles.filterBar} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
            Tất cả ({statusCounts.ALL})
          </Text>
        </TouchableOpacity>

        {Object.values(OrderStatus).map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, filter === status && styles.filterChipActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterChipText, filter === status && styles.filterChipTextActive]}>
              {STATUS_LABELS[status]} ({statusCounts[status]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {filter === 'ALL' ? 'Chưa có đơn hàng nào' : 'Không có đơn hàng nào'}
            </Text>
            {filter === 'ALL' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() =>
                  router.push(`/inventory/create-order?projectId=${projectId}`)
                }
              >
                <Text style={styles.emptyButtonText}>Tạo đơn hàng đầu tiên</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Text style={styles.orderNo}>ĐH-{order.orderNo}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: STATUS_COLORS[order.status] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: STATUS_COLORS[order.status] },
                      ]}
                    >
                      {STATUS_LABELS[order.status]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
              </View>

              {/* Supplier */}
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={16} color="#666" />
                <Text style={styles.infoText}>{order.supplier?.name || 'N/A'}</Text>
              </View>

              {/* Items Preview */}
              <View style={styles.itemsPreview}>
                <Text style={styles.itemsLabel}>Vật tư ({order.items?.length || 0}):</Text>
                {order.items?.slice(0, 2).map((item, idx) => (
                  <Text key={idx} style={styles.itemText} numberOfLines={1}>
                    • {item.material?.name || 'N/A'} - {item.quantity} {item.material?.unit || ''}
                  </Text>
                ))}
                {order.items && order.items.length > 2 && (
                  <Text style={styles.itemText}>
                    ... và {order.items.length - 2} vật tư khác
                  </Text>
                )}
              </View>

              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {order.status === OrderStatus.PENDING && (
                  <>
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApprove(order.id, order.orderNo)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#0D9488" />
                      <Text style={styles.approveButtonText}>Duyệt</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancel(order.id, order.orderNo)}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#000000" />
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                  </>
                )}

                {order.status === OrderStatus.APPROVED && (
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() =>
                      router.push(`/inventory/order-detail?orderId=${order.id}&projectId=${projectId}` as Href)
                    }
                  >
                    <Ionicons name="eye-outline" size={16} color="#0D9488" />
                    <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                )}

                {(order.status === OrderStatus.ORDERED ||
                  order.status === OrderStatus.PARTIALLY_RECEIVED) && (
                  <TouchableOpacity
                    style={styles.receiveButton}
                    onPress={() =>
                      router.push(`/inventory/order-detail?orderId=${order.id}&projectId=${projectId}` as Href)
                    }
                  >
                    <Ionicons name="download-outline" size={16} color="#0D9488" />
                    <Text style={styles.receiveButtonText}>Nhận hàng</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={() =>
                    router.push(`/inventory/order-detail?orderId=${order.id}&projectId=${projectId}` as Href)
                  }
                >
                  <Ionicons name="arrow-forward" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {filteredOrders.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push(`/inventory/create-order?projectId=${projectId}` as Href)
          }
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0D9488',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderNo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  itemsPreview: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    gap: 4,
  },
  itemsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 12,
    color: '#666',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D9488',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 6,
  },
  approveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#0D9488',
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D9488',
  },
  receiveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#0D9488',
    borderRadius: 6,
  },
  receiveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  detailButton: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
