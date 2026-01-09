import { useContracts, useContractStats } from '@/hooks/useContracts';
import type { ContractStatus, ContractType } from '@/types/contracts';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CONTRACT_TYPES: { value: ContractType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'CONSTRUCTION', label: 'Thi công' },
  { value: 'DESIGN', label: 'Thiết kế' },
  { value: 'CONSULTING', label: 'Tư vấn' },
  { value: 'SUPPLY', label: 'Cung cấp' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
];

const CONTRACT_STATUSES: { value: ContractStatus | 'ALL'; label: string; color: string }[] = [
  { value: 'ALL', label: 'Tất cả', color: '#666' },
  { value: 'DRAFT', label: 'Nháp', color: '#999999' },
  { value: 'PENDING_SIGNATURE', label: 'Chờ ký', color: '#0066CC' },
  { value: 'ACTIVE', label: 'Đang thực hiện', color: '#0066CC' },
  { value: 'COMPLETED', label: 'Hoàn thành', color: '#0066CC' },
  { value: 'TERMINATED', label: 'Chấm dứt', color: '#000000' },
  { value: 'EXPIRED', label: 'Hết hạn', color: '#757575' },
];

export default function ContractsListScreen() {
  const { contracts, loading, error, refetch } = useContracts();
  const { stats } = useContractStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContractType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || contract.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || contract.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusConfig = (status: ContractStatus) => {
    return CONTRACT_STATUSES.find((s) => s.value === status) || CONTRACT_STATUSES[0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const renderContract = ({ item }: { item: typeof contracts[0] }) => {
    const statusConfig = getStatusConfig(item.status);
    const signedCount = item.signatures.filter((s) => s.status === 'SIGNED').length;
    const totalSignatures = item.signatures.length;

    return (
      <TouchableOpacity
        style={styles.contractCard}
        onPress={() => router.push(`/contracts/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.contractHeader}>
          <View style={styles.contractTitleRow}>
            <Text style={styles.contractNumber}>{item.contractNumber}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}
            >
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          <Text style={styles.contractTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>

        <View style={styles.contractBody}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{formatCurrency(item.totalValue)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.parties.length} bên tham gia</Text>
          </View>
        </View>

        <View style={styles.contractFooter}>
          <View style={styles.progressInfo}>
            <Ionicons name="create-outline" size={16} color="#0066CC" />
            <Text style={styles.progressText}>
              Chữ ký: {signedCount}/{totalSignatures}
            </Text>
          </View>
          <View style={styles.milestoneInfo}>
            <Ionicons name="flag-outline" size={16} color="#0066CC" />
            <Text style={styles.progressText}>{item.milestones.length} cột mốc</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Tổng hợp đồng</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#0066CC' }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>Đang thực hiện</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#0066CC' }]}>
              {stats.pendingSignature}
            </Text>
            <Text style={styles.statLabel}>Chờ ký</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo số HĐ hoặc tên..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Loại hợp đồng:</Text>
        <FlatList
          horizontal
          data={CONTRACT_TYPES}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                typeFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setTypeFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  typeFilter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Status Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Trạng thái:</Text>
        <FlatList
          horizontal
          data={CONTRACT_STATUSES}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Contracts List */}
      <FlatList
        data={filteredContracts}
        keyExtractor={(item) => item.id}
        renderItem={renderContract}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có hợp đồng nào</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                ? 'Không tìm thấy hợp đồng phù hợp'
                : 'Nhấn + để tạo hợp đồng mới'}
            </Text>
          </View>
        }
      />

      {/* Create Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/contracts/create')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 12,
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
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  filterSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  contractCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractHeader: {
    marginBottom: 12,
  },
  contractTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contractNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contractBody: {
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
