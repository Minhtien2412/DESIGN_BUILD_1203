/**
 * Procurement - Vendors Management Screen
 */

import { useVendors } from '@/hooks/useProcurement';
import type { VendorCategory, VendorStatus } from '@/types/procurement';
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

export default function VendorsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'ALL'>('ALL');

  const { vendors, loading, error, refresh } = useVendors();

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.contactPerson.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || vendor.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || vendor.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === 'ACTIVE').length,
    highRated: vendors.filter((v) => v.rating >= 4).length,
    totalValue: vendors.reduce((sum, v) => sum + (v.totalValue || 0), 0),
  };

  const getCategoryIcon = (category: VendorCategory): string => {
    const icons: Record<VendorCategory, string> = {
      MATERIALS: 'cube',
      EQUIPMENT: 'construct',
      SUBCONTRACTOR: 'people',
      SERVICES: 'briefcase',
      CONSULTING: 'chatbubbles',
      RENTAL: 'car',
      OTHER: 'ellipsis-horizontal',
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const getCategoryLabel = (category: VendorCategory): string => {
    const labels: Record<VendorCategory, string> = {
      MATERIALS: 'Vật liệu',
      EQUIPMENT: 'Thiết bị',
      SUBCONTRACTOR: 'Nhà thầu phụ',
      SERVICES: 'Dịch vụ',
      CONSULTING: 'Tư vấn',
      RENTAL: 'Cho thuê',
      OTHER: 'Khác',
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: VendorStatus): string => {
    const colors: Record<VendorStatus, string> = {
      ACTIVE: '#4CAF50',
      INACTIVE: '#9E9E9E',
      SUSPENDED: '#FF9800',
      BLACKLISTED: '#F44336',
    };
    return colors[status] || '#9E9E9E';
  };

  const getStatusLabel = (status: VendorStatus): string => {
    const labels: Record<VendorStatus, string> = {
      ACTIVE: 'Hoạt động',
      INACTIVE: 'Không hoạt động',
      SUSPENDED: 'Tạm ngưng',
      BLACKLISTED: 'Blacklist',
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải nhà cung cấp...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nhà Cung Cấp</Text>
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
        <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng NCC</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Đang hoạt động</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.statValue}>{stats.highRated}</Text>
          <Text style={styles.statLabel}>Đánh giá cao</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
          <Text style={styles.statValue}>{formatCurrency(stats.totalValue)}</Text>
          <Text style={styles.statLabel}>Tổng giá trị</Text>
        </View>
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, mã NCC, người liên hệ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[styles.filterChip, categoryFilter === 'ALL' && styles.filterChipActive]}
          onPress={() => setCategoryFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              categoryFilter === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            categoryFilter === 'MATERIALS' && styles.filterChipActive,
          ]}
          onPress={() => setCategoryFilter('MATERIALS' as VendorCategory)}
        >
          <Ionicons name="cube" size={16} color="#666" style={{ marginRight: 4 }} />
          <Text
            style={[
              styles.filterChipText,
              categoryFilter === 'MATERIALS' && styles.filterChipTextActive,
            ]}
          >
            Vật liệu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            categoryFilter === 'EQUIPMENT' && styles.filterChipActive,
          ]}
          onPress={() => setCategoryFilter('EQUIPMENT' as VendorCategory)}
        >
          <Ionicons name="construct" size={16} color="#666" style={{ marginRight: 4 }} />
          <Text
            style={[
              styles.filterChipText,
              categoryFilter === 'EQUIPMENT' && styles.filterChipTextActive,
            ]}
          >
            Thiết bị
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            categoryFilter === 'SUBCONTRACTOR' && styles.filterChipActive,
          ]}
          onPress={() => setCategoryFilter('SUBCONTRACTOR' as VendorCategory)}
        >
          <Ionicons name="people" size={16} color="#666" style={{ marginRight: 4 }} />
          <Text
            style={[
              styles.filterChipText,
              categoryFilter === 'SUBCONTRACTOR' && styles.filterChipTextActive,
            ]}
          >
            Nhà thầu phụ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            categoryFilter === 'SERVICES' && styles.filterChipActive,
          ]}
          onPress={() => setCategoryFilter('SERVICES' as VendorCategory)}
        >
          <Ionicons name="briefcase" size={16} color="#666" style={{ marginRight: 4 }} />
          <Text
            style={[
              styles.filterChipText,
              categoryFilter === 'SERVICES' && styles.filterChipTextActive,
            ]}
          >
            Dịch vụ
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFiltersContainer}
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
          style={[styles.filterChip, statusFilter === 'ACTIVE' && styles.filterChipActive]}
          onPress={() => setStatusFilter('ACTIVE' as VendorStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'ACTIVE' && styles.filterChipTextActive,
            ]}
          >
            Hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === 'INACTIVE' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('INACTIVE' as VendorStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#9E9E9E' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'INACTIVE' && styles.filterChipTextActive,
            ]}
          >
            Không hoạt động
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === 'SUSPENDED' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('SUSPENDED' as VendorStatus)}
        >
          <View style={[styles.statusDot, { backgroundColor: '#FF9800' }]} />
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'SUSPENDED' && styles.filterChipTextActive,
            ]}
          >
            Tạm ngưng
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Vendors List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredVendors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Không tìm thấy nhà cung cấp</Text>
          </View>
        ) : (
          filteredVendors.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              style={styles.vendorCard}
              onPress={() => router.push(`/procurement/vendors/${vendor.id}`)}
            >
              <View style={styles.vendorHeader}>
                <View style={styles.vendorHeaderLeft}>
                  <Text style={styles.vendorName}>{vendor.name}</Text>
                  <Text style={styles.vendorCode}>{vendor.vendorCode}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(vendor.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(vendor.status) },
                    ]}
                  >
                    {getStatusLabel(vendor.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.vendorInfo}>
                <View style={styles.infoRow}>
                  <Ionicons
                    name={getCategoryIcon(vendor.category) as any}
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.infoText}>{getCategoryLabel(vendor.category)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{vendor.contactPerson.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.infoText}>{vendor.contactPerson.phone}</Text>
                </View>
              </View>

              <View style={styles.vendorFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFC107" />
                  <Text style={styles.ratingText}>{vendor.rating.toFixed(1)}</Text>
                  <Text style={styles.ratingCount}>({vendor.totalOrders ?? 0} đơn)</Text>
                </View>
                {(vendor.totalValue ?? 0) > 0 && (
                  <Text style={styles.totalValue}>{formatCurrency(vendor.totalValue ?? 0)}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/procurement/vendors/create')}
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
    fontSize: 20,
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
  statusFiltersContainer: {
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
  vendorCard: {
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
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vendorHeaderLeft: {
    flex: 1,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vendorCode: {
    fontSize: 14,
    color: '#999',
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
  vendorInfo: {
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
  vendorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  ratingCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#999',
  },
  totalValue: {
    fontSize: 16,
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
