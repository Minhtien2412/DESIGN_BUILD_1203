/**
 * Project Contracts Screen - Perfex CRM Style
 * =============================================
 * 
 * Quản lý hợp đồng dự án:
 * - Danh sách contracts
 * - Trạng thái: Draft, Pending, Active, Expired
 * - Giá trị hợp đồng
 * - Thời hạn
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useContracts } from '@/hooks/usePerfexAPI';
import type { Contract } from '@/types/perfex';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ContractsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { 
    contracts, 
    stats, 
    loading, 
    error, 
    refresh, 
    createContract, 
    updateContract, 
    deleteContract 
  } = useContracts();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Loading state
  if (loading && contracts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Contracts</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.centered, { flex: 1 }]}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.emptyText, { color: textColor, marginTop: 16 }]}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Contracts</Text>
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={22} color={primaryColor} />
          </TouchableOpacity>
        </View>
        <View style={[styles.centered, { flex: 1 }]}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.emptyText, { color: '#EF4444', marginTop: 16 }]}>Lỗi tải dữ liệu</Text>
          <TouchableOpacity onPress={refresh} style={{ marginTop: 12 }}>
            <Text style={{ color: primaryColor, fontWeight: '600' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: '#6b7280',
      pending: '#f59e0b',
      active: '#22c55e',
      expired: '#ef4444',
      trash: '#9ca3af',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      draft: 'Bản nháp',
      pending: 'Chờ ký',
      active: 'Đang hiệu lực',
      expired: 'Hết hạn',
      trash: 'Đã xóa',
    };
    return labels[status] || status;
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredContracts = filter === 'all'
    ? contracts
    : contracts.filter((c: Contract) => {
        if (filter === 'active') return c.trash === '0' && (!c.dateend || new Date(c.dateend) > new Date());
        if (filter === 'expired') return c.dateend && new Date(c.dateend) <= new Date();
        return true;
      });

  // Stats
  const activeContracts = contracts.filter((c: Contract) => c.trash === '0').length;
  const totalValue = contracts.reduce((sum: number, c: Contract) => sum + parseFloat(c.contract_value || '0'), 0);
  const pendingContracts = contracts.filter((c: Contract) => !c.datestart).length;

  const renderContract = ({ item }: { item: Contract }) => {
    const daysRemaining = item.dateend ? getDaysRemaining(item.dateend) : 0;
    const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 30;
    const status = item.dateend && new Date(item.dateend) <= new Date() ? 'expired' : 'active';

    return (
      <TouchableOpacity style={[styles.contractCard, { backgroundColor: cardBg, borderColor }]}>
        <View style={styles.contractHeader}>
          <View style={styles.contractTitleRow}>
            <Ionicons name="document-text-outline" size={20} color={primaryColor} />
            <Text style={[styles.contractSubject, { color: textColor }]} numberOfLines={1}>
              {item.subject}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {getStatusLabel(status)}
            </Text>
          </View>
        </View>

        <View style={styles.contractInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={14} color="#6b7280" />
            <Text style={[styles.infoText, { color: textColor }]}>Khách hàng #{item.client}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
            <Text style={[styles.infoText, { color: textColor }]}>Hợp đồng</Text>
          </View>
        </View>

        <View style={styles.contractDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: textColor }]}>Giá trị</Text>
            <Text style={[styles.detailValue, { color: primaryColor }]}>
              {formatCurrency(parseFloat(item.contract_value || '0'))}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: textColor }]}>Thời hạn</Text>
            <Text style={[styles.detailValue, { color: textColor }]}>
              {formatDate(item.datestart)} - {item.dateend ? formatDate(item.dateend) : 'Không xác định'}
            </Text>
          </View>
        </View>

        {isExpiringSoon && (
          <View style={[styles.warningBadge, { backgroundColor: '#f59e0b20' }]}>
            <Ionicons name="warning-outline" size={14} color="#f59e0b" />
            <Text style={styles.warningText}>Còn {daysRemaining} ngày</Text>
          </View>
        )}

        {status === 'expired' && (
          <View style={[styles.warningBadge, { backgroundColor: '#ef444420' }]}>
            <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
            <Text style={[styles.warningText, { color: '#ef4444' }]}>Đã hết hạn</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Hợp đồng</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: primaryColor }]}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsBar, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[styles.statItem, filter === 'all' && styles.statItemActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.statValue, { color: primaryColor }]}>{contracts.length}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Tổng cộng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statItem, filter === 'active' && styles.statItemActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.statValue, { color: '#22c55e' }]}>{activeContracts}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Hiệu lực</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statItem, filter === 'pending' && styles.statItemActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{pendingContracts}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Chờ ký</Text>
        </TouchableOpacity>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: primaryColor }]} numberOfLines={1}>
            {formatCurrency(totalValue).replace(' ₫', '')}
          </Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Tổng giá trị</Text>
        </View>
      </View>

      {/* Contract List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContracts}
          keyExtractor={(item) => item.id}
          renderItem={renderContract}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#6b7280" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Chưa có hợp đồng</Text>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Tạo hợp đồng đầu tiên cho dự án này
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  statItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0D9488',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  contractCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  contractTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  contractSubject: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  contractInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    opacity: 0.8,
  },
  contractDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 12,
    gap: 6,
    alignSelf: 'flex-start',
  },
  warningText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#f59e0b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
});
