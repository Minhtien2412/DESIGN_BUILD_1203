/**
 * Change Management - Change Orders Screen
 */

import { useChangeOrders } from '@/hooks/useChangeManagement';
import type { ChangeOrder } from '@/types/change-management';
import { Ionicons } from '@expo/vector-icons';
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

type ChangeOrderStatus = ChangeOrder['status'];

export default function ChangeOrdersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChangeOrderStatus | 'ALL'>('ALL');

  const { orders, loading, error, refresh } = useChangeOrders();

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    issued: orders.filter(o => o.status === 'ISSUED').length,
    accepted: orders.filter(o => o.status === 'ACCEPTED').length,
    executed: orders.filter(o => o.status === 'EXECUTED').length,
    totalValue: orders.reduce((sum, o) => sum + o.changeValue, 0),
  };

  const getStatusColor = (status: ChangeOrderStatus): string => {
    switch (status) {
      case 'DRAFT':
        return '#999999';
      case 'ISSUED':
        return '#0D9488';
      case 'ACCEPTED':
        return '#0D9488';
      case 'REJECTED':
        return '#1A1A1A';
      case 'EXECUTED':
        return '#0D9488';
      case 'CLOSED':
        return '#4A4A4A';
      default:
        return '#999999';
    }
  };

  const getStatusLabel = (status: ChangeOrderStatus): string => {
    switch (status) {
      case 'DRAFT':
        return 'Nháp';
      case 'ISSUED':
        return 'Đã phát hành';
      case 'ACCEPTED':
        return 'Đã chấp nhận';
      case 'REJECTED':
        return 'Từ chối';
      case 'EXECUTED':
        return 'Đã thực hiện';
      case 'CLOSED':
        return 'Đã đóng';
      default:
        return status;
    }
  };

  const getExecutionStatusColor = (status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): string => {
    switch (status) {
      case 'NOT_STARTED':
        return '#999999';
      case 'IN_PROGRESS':
        return '#0D9488';
      case 'COMPLETED':
        return '#0D9488';
      default:
        return '#999999';
    }
  };

  const getExecutionStatusLabel = (status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'): string => {
    switch (status) {
      case 'NOT_STARTED':
        return 'Chưa bắt đầu';
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'COMPLETED':
        return 'Hoàn thành';
      default:
        return 'N/A';
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#1A1A1A" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng lệnh</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{stats.issued}</Text>
          <Text style={styles.statLabel}>Đã phát hành</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#C8E6C9' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{stats.accepted}</Text>
          <Text style={styles.statLabel}>Đã chấp nhận</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#B2EBF2' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{stats.executed}</Text>
          <Text style={styles.statLabel}>Đã thực hiện</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA', minWidth: 150 }]}>
          <Text style={[styles.statValue, { fontSize: 18, color: '#0D9488' }]}>
            {formatCurrency(stats.totalValue)}
          </Text>
          <Text style={styles.statLabel}>Tổng giá trị</Text>
        </View>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo số lệnh, tiêu đề, dự án..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setStatusFilter('ALL')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'ALL' && styles.filterChipTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'ISSUED' && styles.filterChipActive]}
          onPress={() => setStatusFilter('ISSUED')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'ISSUED' && styles.filterChipTextActive]}>
            Đã phát hành
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'ACCEPTED' && styles.filterChipActive]}
          onPress={() => setStatusFilter('ACCEPTED')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'ACCEPTED' && styles.filterChipTextActive]}>
            Đã chấp nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'EXECUTED' && styles.filterChipActive]}
          onPress={() => setStatusFilter('EXECUTED')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'EXECUTED' && styles.filterChipTextActive]}>
            Đã thực hiện
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === 'CLOSED' && styles.filterChipActive]}
          onPress={() => setStatusFilter('CLOSED')}
        >
          <Text style={[styles.filterChipText, statusFilter === 'CLOSED' && styles.filterChipTextActive]}>
            Đã đóng
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>Không có lệnh thay đổi nào</Text>
          </View>
        ) : (
          filteredOrders.map(order => (
            <View key={order.id} style={styles.orderCard}>
              {/* Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <View
                    style={[
                      styles.orderIcon,
                      { backgroundColor: `${getStatusColor(order.status)}20` },
                    ]}
                  >
                    <Ionicons
                      name="document-text"
                      size={24}
                      color={getStatusColor(order.status)}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <View
                      style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                    >
                      <Text style={styles.statusBadgeText}>{getStatusLabel(order.status)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Title */}
              <Text style={styles.orderTitle} numberOfLines={2}>
                {order.title}
              </Text>

              {/* Project & CR Reference */}
              <View style={styles.orderSection}>
                <View style={styles.orderRow}>
                  <Ionicons name="folder" size={16} color="#757575" />
                  <Text style={styles.orderLabel}>Dự án:</Text>
                  <Text style={styles.orderValue} numberOfLines={1}>
                    {order.projectName}
                  </Text>
                </View>
                <View style={styles.orderRow}>
                  <Ionicons name="git-branch" size={16} color="#757575" />
                  <Text style={styles.orderLabel}>Yêu cầu:</Text>
                  <Text style={styles.orderValue}>{order.changeRequestNumber}</Text>
                </View>
                {order.issuedDate && (
                  <View style={styles.orderRow}>
                    <Ionicons name="calendar" size={16} color="#757575" />
                    <Text style={styles.orderLabel}>Phát hành:</Text>
                    <Text style={styles.orderValue}>{formatDate(order.issuedDate)}</Text>
                  </View>
                )}
              </View>

              {/* Financial Impact */}
              <View style={styles.financialSection}>
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Giá trị hợp đồng:</Text>
                  <Text style={styles.financialValue}>
                    {formatCurrency(order.contractValue, order.currency)}
                  </Text>
                </View>
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Thay đổi:</Text>
                  <Text style={[styles.financialValue, { color: '#0D9488', fontWeight: 'bold' }]}>
                    +{formatCurrency(order.changeValue, order.currency)}
                  </Text>
                </View>
                <View style={[styles.financialRow, { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E0E0E0' }]}>
                  <Text style={[styles.financialLabel, { fontWeight: 'bold' }]}>
                    Giá trị mới:
                  </Text>
                  <Text style={[styles.financialValue, { color: '#1976D2', fontWeight: 'bold', fontSize: 16 }]}>
                    {formatCurrency(order.newContractValue, order.currency)}
                  </Text>
                </View>
              </View>

              {/* Schedule Impact */}
              {order.scheduleExtension > 0 && (
                <View style={styles.scheduleSection}>
                  <Ionicons name="time-outline" size={18} color="#1976D2" />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.scheduleLabel}>Gia hạn tiến độ</Text>
                    <View style={styles.scheduleRow}>
                      <Text style={styles.scheduleValue}>+{order.scheduleExtension} ngày</Text>
                      <Text style={styles.scheduleDivider}>•</Text>
                      <Text style={styles.scheduleDate}>
                        {formatDate(order.originalCompletionDate)} → {formatDate(order.newCompletionDate)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Execution Progress */}
              {order.executionStatus && order.executionStatus !== 'NOT_STARTED' && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Tiến độ thực hiện</Text>
                    <View
                      style={[
                        styles.executionBadge,
                        { backgroundColor: getExecutionStatusColor(order.executionStatus) },
                      ]}
                    >
                      <Text style={styles.executionBadgeText}>
                        {getExecutionStatusLabel(order.executionStatus)}
                      </Text>
                    </View>
                  </View>
                  {order.executionProgress !== undefined && (
                    <>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${order.executionProgress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>{order.executionProgress}%</Text>
                    </>
                  )}
                </View>
              )}

              {/* Actions */}
              <View style={styles.orderActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#0D9488" />
                  <Text style={styles.actionButtonText}>Xem</Text>
                </TouchableOpacity>
                {order.status === 'ISSUED' && (
                  <>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#0D9488" />
                      <Text style={[styles.actionButtonText, { color: '#0D9488' }]}>Chấp nhận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="close-circle-outline" size={18} color="#1A1A1A" />
                      <Text style={[styles.actionButtonText, { color: '#1A1A1A' }]}>Từ chối</Text>
                    </TouchableOpacity>
                  </>
                )}
                {order.status === 'ACCEPTED' && order.executionStatus === 'NOT_STARTED' && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="play-circle-outline" size={18} color="#0D9488" />
                    <Text style={[styles.actionButtonText, { color: '#0D9488' }]}>Bắt đầu</Text>
                  </TouchableOpacity>
                )}
                {order.executionStatus === 'IN_PROGRESS' && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="checkmark-done-outline" size={18} color="#0D9488" />
                    <Text style={[styles.actionButtonText, { color: '#0D9488' }]}>Hoàn thành</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={18} color="#4A4A4A" />
                  <Text style={[styles.actionButtonText, { color: '#4A4A4A' }]}>Xuất</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0D9488',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  statCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    backgroundColor: '#FFF',
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#757575',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999999',
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderNumber: {
    fontSize: 12,
    color: '#757575',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  orderSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderLabel: {
    fontSize: 13,
    color: '#757575',
    marginLeft: 8,
    marginRight: 4,
  },
  orderValue: {
    fontSize: 13,
    color: '#212121',
    fontWeight: '500',
    flex: 1,
  },
  financialSection: {
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  financialLabel: {
    fontSize: 13,
    color: '#757575',
  },
  financialValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
  },
  scheduleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  scheduleDivider: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#757575',
  },
  scheduleDate: {
    fontSize: 12,
    color: '#757575',
  },
  progressSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
  },
  executionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  executionBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#0D9488',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
