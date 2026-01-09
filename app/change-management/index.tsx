/**
 * Change Management - Main Screen
 */

import { useChangeRequests } from '@/hooks/useChangeManagement';
import type { ChangePriority, ChangeRequestStatus } from '@/types/change-management';
import { Ionicons } from '@expo/vector-icons';
import { Href, router } from 'expo-router';
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

export default function ChangeManagementScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChangeRequestStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<ChangePriority | 'ALL'>('ALL');

  const { requests: changeRequests, loading, error, refresh } = useChangeRequests();

  // Filter change requests
  const filteredRequests = changeRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.changeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || request.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate stats
  const stats = {
    total: changeRequests.length,
    pending: changeRequests.filter((r) => r.status === 'SUBMITTED').length,
    approved: changeRequests.filter((r) => r.status === 'APPROVED').length,
    inProgress: changeRequests.filter((r) => r.status === 'IMPLEMENTED').length,
  };

  const getStatusColor = (status: ChangeRequestStatus): string => {
    const colors: Record<ChangeRequestStatus, string> = {
      DRAFT: '#999999',
      SUBMITTED: '#0066CC',
      UNDER_REVIEW: '#0066CC',
      APPROVED: '#0066CC',
      REJECTED: '#1A1A1A',
      ON_HOLD: '#0066CC',
      IMPLEMENTED: '#0066CC',
      CANCELLED: '#4A4A4A',
    };
    return colors[status] || '#999999';
  };

  const getStatusLabel = (status: ChangeRequestStatus): string => {
    const labels: Record<ChangeRequestStatus, string> = {
      DRAFT: 'Nháp',
      SUBMITTED: 'Chờ duyệt',
      UNDER_REVIEW: 'Đang xem xét',
      APPROVED: 'Đã phê duyệt',
      REJECTED: 'Từ chối',
      ON_HOLD: 'Tạm giữ',
      IMPLEMENTED: 'Đã thực hiện',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: ChangePriority): string => {
    const colors: Record<ChangePriority, string> = {
      LOW: '#0066CC',
      MEDIUM: '#0066CC',
      HIGH: '#1A1A1A',
      URGENT: '#D32F2F',
      CRITICAL: '#B71C1C',
    };
    return colors[priority] || '#999999';
  };

  const getPriorityLabel = (priority: ChangePriority): string => {
    const labels: Record<ChangePriority, string> = {
      LOW: 'Thấp',
      MEDIUM: 'Trung bình',
      HIGH: 'Cao',
      URGENT: 'Gấp',
      CRITICAL: 'Khẩn cấp',
    };
    return labels[priority] || priority;
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
        <Text style={styles.loadingText}>Đang tải yêu cầu thay đổi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Thay Đổi</Text>
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
          <Text style={styles.statLabel}>Tổng yêu cầu</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F4FF' }]}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Chờ duyệt</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statValue}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Đã duyệt</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
          <Text style={styles.statValue}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Đang thực hiện</Text>
        </View>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo mã yêu cầu, tiêu đề, dự án..."
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
          style={[
            styles.filterChip,
            statusFilter === 'SUBMITTED' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('SUBMITTED' as ChangeRequestStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#0066CC' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'SUBMITTED' && styles.filterChipTextActive,
            ]}
          >
            Chờ duyệt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === 'APPROVED' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('APPROVED' as ChangeRequestStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#0066CC' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'APPROVED' && styles.filterChipTextActive,
            ]}
          >
            Đã duyệt
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === 'IMPLEMENTED' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('IMPLEMENTED' as ChangeRequestStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#0066CC' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'IMPLEMENTED' && styles.filterChipTextActive,
            ]}
          >
            Đã thực hiện
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Requests List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="git-compare-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Không tìm thấy yêu cầu thay đổi</Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              style={styles.requestCard}
              onPress={() => router.push(`/change-management/${request.id}` as Href)}
            >
              <View style={styles.requestHeader}>
                <View style={styles.requestHeaderLeft}>
                  <Text style={styles.requestNumber}>{request.changeNumber}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(request.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {getPriorityLabel(request.priority)}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(request.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(request.status) },
                    ]}
                  >
                    {getStatusLabel(request.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.requestTitle}>{request.title}</Text>

              <View style={styles.requestInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="folder-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{request.projectName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{request.originatedByName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{formatDate(request.originatedDate)}</Text>
                </View>
              </View>

              <View style={styles.requestFooter}>
                <View style={styles.impactContainer}>
                  <Ionicons name="trending-up-outline" size={16} color="#666" />
                  <Text style={styles.impactText}>
                    {request.scheduleImpact && request.scheduleImpact.delayDays > 0
                      ? `+${request.scheduleImpact.delayDays} ngày`
                      : 'Không ảnh hưởng'}
                  </Text>
                </View>
                {request.costEstimate && request.costEstimate.total > 0 && (
                  <Text style={styles.costText}>
                    {formatCurrency(request.costEstimate.total, request.costEstimate.currency)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/change-management/create' as Href)}
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
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
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
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  requestInfo: {
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
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
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
