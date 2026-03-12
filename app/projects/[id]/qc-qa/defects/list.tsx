import { useDefects } from '@/hooks/useQC';
import { Defect, DefectSeverity, DefectStatus } from '@/types/qc-qa';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type FilterType = 'all' | DefectStatus;
type SeverityFilter = 'all' | DefectSeverity;

export default function DefectsListScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { defects, loading, loadDefects } = useDefects();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadDefects({ projectId });
    }
  }, [projectId, loadDefects]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (projectId) {
      await loadDefects({ projectId });
    }
    setRefreshing(false);
  };

  const filteredDefects = defects.filter((defect) => {
    const matchesSearch =
      searchQuery === '' ||
      defect.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      defect.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || defect.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || defect.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusColor = (status: DefectStatus) => {
    switch (status) {
      case 'OPEN':
        return '#000000';
      case 'IN_PROGRESS':
        return '#0D9488';
      case 'RESOLVED':
        return '#0D9488';
      case 'VERIFIED':
        return '#0D9488';
      case 'CLOSED':
        return '#999999';
      default:
        return '#757575';
    }
  };

  const getSeverityColor = (severity: DefectSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return '#D32F2F';
      case 'MAJOR':
        return '#0D9488';
      case 'MINOR':
        return '#FBC02D';
      case 'COSMETIC':
        return '#689F38';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: DefectStatus) => {
    const labels: Record<DefectStatus, string> = {
      OPEN: 'Mới',
      IN_PROGRESS: 'Đang xử lý',
      RESOLVED: 'Đã sửa',
      VERIFIED: 'Đã kiểm tra',
      CLOSED: 'Đã đóng',
    };
    return labels[status];
  };

  const getSeverityLabel = (severity: DefectSeverity) => {
    const labels: Record<DefectSeverity, string> = {
      CRITICAL: 'Nghiêm trọng',
      MAJOR: 'Quan trọng',
      HIGH: 'Cao',
      MINOR: 'Nhỏ',
      MEDIUM: 'Trung bình',
      LOW: 'Thấp',
      COSMETIC: 'Thẩm mỹ',
    };
    return labels[severity];
  };

  const renderDefectCard = ({ item }: { item: Defect }) => (
    <TouchableOpacity
      style={styles.defectCard}
      onPress={() => router.push(`/projects/${projectId}/qc-qa/defects/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
            <Text style={styles.severityText}>{getSeverityLabel(item.severity)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        <Text style={styles.defectId}>#{item.id.slice(0, 8)}</Text>
      </View>

      <Text style={styles.defectTitle}>{item.title}</Text>
      <Text style={styles.defectDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location" size={14} color="#757575" />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
        {item.photos.length > 0 && (
          <View style={styles.metaItem}>
            <Ionicons name="images" size={14} color="#757575" />
            <Text style={styles.metaText}>{item.photos.length} ảnh</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.reportedBy}>Báo cáo: {item.reportedByName || item.reportedBy}</Text>
        <Text style={styles.reportedDate}>
          {new Date(item.reportedAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const statusFilters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: DefectStatus.OPEN, label: 'Mới' },
    { value: DefectStatus.IN_PROGRESS, label: 'Đang xử lý' },
    { value: DefectStatus.RESOLVED, label: 'Đã sửa' },
    { value: DefectStatus.VERIFIED, label: 'Đã kiểm tra' },
    { value: DefectStatus.CLOSED, label: 'Đã đóng' },
  ];

  const severityFilters: { value: SeverityFilter; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: DefectSeverity.CRITICAL, label: 'Nghiêm trọng' },
    { value: DefectSeverity.MAJOR, label: 'Quan trọng' },
    { value: DefectSeverity.MINOR, label: 'Nhỏ' },
    { value: DefectSeverity.COSMETIC, label: 'Thẩm mỹ' },
  ];

  const stats = {
    total: defects.length,
    open: defects.filter((d) => d.status === 'OPEN').length,
    inProgress: defects.filter((d) => d.status === 'IN_PROGRESS').length,
    critical: defects.filter((d) => d.severity === 'CRITICAL').length,
  };

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng số lỗi</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F5F5F5' }]}>
          <Text style={[styles.statNumber, { color: '#000000' }]}>{stats.open}</Text>
          <Text style={styles.statLabel}>Chưa xử lý</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={[styles.statNumber, { color: '#0D9488' }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Đang xử lý</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FCE4EC' }]}>
          <Text style={[styles.statNumber, { color: '#D32F2F' }]}>{stats.critical}</Text>
          <Text style={styles.statLabel}>Nghiêm trọng</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#757575" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm lỗi..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Trạng thái:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item.value}
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

      {/* Severity Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Mức độ:</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={severityFilters}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                severityFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSeverityFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  severityFilter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Defects List */}
      <FlatList
        data={filteredDefects}
        keyExtractor={(item) => item.id}
        renderItem={renderDefectCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all' || severityFilter !== 'all'
                ? 'Không tìm thấy lỗi nào'
                : 'Chưa có lỗi nào được báo cáo'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/projects/${projectId}/qc-qa/defects/create`)}
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
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 15,
  },
  filtersContainer: {
    marginBottom: 12,
    paddingLeft: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  defectCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  defectId: {
    fontSize: 12,
    color: '#999999',
    fontFamily: 'monospace',
  },
  defectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  defectDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#757575',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  reportedBy: {
    fontSize: 13,
    color: '#666',
  },
  reportedDate: {
    fontSize: 12,
    color: '#999999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
