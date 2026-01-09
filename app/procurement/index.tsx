/**
 * Procurement - Purchase Orders List Screen
 */

import { usePurchaseOrders } from '@/hooks/useProcurement';
import type { PurchaseOrderStatus } from '@/types/procurement';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProcurementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'ALL'>('ALL');

  const { orders, loading, error, refresh } = usePurchaseOrders();

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    sent: orders.filter((o) => o.status === 'SENT').length,
    confirmed: orders.filter((o) => o.status === 'CONFIRMED').length,
    received: orders.filter((o) => o.status === 'RECEIVED').length,
  };

  const getStatusColor = (status: PurchaseOrderStatus): string => {
    switch (status) {
      case 'DRAFT':
        return '#999999';
      case 'SENT':
        return '#0066CC';
      case 'CONFIRMED':
        return '#0066CC';
      case 'PARTIALLY_RECEIVED':
        return '#0066CC';
      case 'RECEIVED':
        return '#0066CC';
      case 'CANCELLED':
        return '#000000';
      case 'CLOSED':
        return '#4A4A4A';
      default:
        return '#999999';
    }
  };

  const getStatusLabel = (status: PurchaseOrderStatus): string => {
    switch (status) {
      case 'DRAFT':
        return 'Nháp';
      case 'SENT':
        return 'Đã gửi';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'PARTIALLY_RECEIVED':
        return 'Nhận một phần';
      case 'RECEIVED':
        return 'Đã nhận';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'CLOSED':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'VND'): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đơn Mua Hàng</Text>
        <TouchableOpacity onPress={refresh}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
      >
        <View style={[styles.statCard, { backgroundColor: '#E8F4FF' }]}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng đơn</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F4FF' }]}>
          <Text style={styles.statValue}>{stats.sent}</Text>
          <Text style={styles.statLabel}>Đã gửi</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
          <Text style={styles.statValue}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>Đã xác nhận</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statValue}>{stats.received}</Text>
          <Text style={styles.statLabel}>Đã nhận</Text>
        </View>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo mã đơn, nhà cung cấp, dự án..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setStatusFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'DRAFT' && styles.filterChipActive]}
          onPress={() => setStatusFilter('DRAFT' as PurchaseOrderStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#999999' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'DRAFT' && styles.filterChipTextActive,
            ]}
          >
            Nháp
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'SENT' && styles.filterChipActive]}
          onPress={() => setStatusFilter('SENT' as PurchaseOrderStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#0066CC' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'SENT' && styles.filterChipTextActive,
            ]}
          >
            Đã gửi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'CONFIRMED' && styles.filterChipActive]}
          onPress={() => setStatusFilter('CONFIRMED' as PurchaseOrderStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#0066CC' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'CONFIRMED' && styles.filterChipTextActive,
            ]}
          >
            Đã xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'RECEIVED' && styles.filterChipActive]}
          onPress={() => setStatusFilter('RECEIVED' as PurchaseOrderStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#0066CC' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'RECEIVED' && styles.filterChipTextActive,
            ]}
          >
            Đã nhận
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/procurement/${order.id}`)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>

              <View style={styles.orderInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="business-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{order.vendorName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="folder-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{order.projectName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{formatDate(order.orderDate)}</Text>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <View style={styles.itemsCount}>
                  <Ionicons name="cube-outline" size={16} color="#666" />
                  <Text style={styles.itemsCountText}>{order.items.length} items</Text>
                </View>
                <Text style={styles.totalAmount}>
                  {formatCurrency(order.total, order.currency)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/procurement/create')}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  itemsCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsCountText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
