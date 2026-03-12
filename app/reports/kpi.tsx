/**
 * KPI Dashboard Screen
 * Monitor key performance indicators
 */

import { useKPIs } from '@/hooks/useReporting';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const KPI_CATEGORIES = [
  { value: 'ALL', label: 'Tất cả', icon: 'grid' },
  { value: 'FINANCIAL', label: 'Tài chính', icon: 'cash' },
  { value: 'SCHEDULE', label: 'Tiến độ', icon: 'time' },
  { value: 'QUALITY', label: 'Chất lượng', icon: 'star' },
  { value: 'SAFETY', label: 'An toàn', icon: 'shield-checkmark' },
  { value: 'RESOURCE', label: 'Nguồn lực', icon: 'people' },
  { value: 'RISK', label: 'Rủi ro', icon: 'warning' },
];

export default function KPIDashboardScreen() {
  const [projectId] = useState('project-1');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const { kpis, loading, refresh: fetchKPIs, refreshKPI } = useKPIs(projectId);

  const filteredKPIs =
    selectedCategory === 'ALL'
      ? kpis
      : kpis.filter((kpi) => kpi.category === selectedCategory);

  const stats = {
    total: kpis.length,
    onTrack: kpis.filter((k) => k.status === 'ON_TRACK').length,
    atRisk: kpis.filter((k) => k.status === 'AT_RISK').length,
    offTrack: kpis.filter((k) => k.status === 'OFF_TRACK').length,
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKPIs();
    setRefreshing(false);
  };

  const handleRefreshKPI = async (id: string) => {
    try {
      await refreshKPI(id);
    } catch (err) {
      console.error('Failed to refresh KPI:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return '#0D9488';
      case 'AT_RISK':
        return '#0D9488';
      case 'OFF_TRACK':
        return '#000000';
      default:
        return '#999999';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return 'ĐẠT MỤC TIÊU';
      case 'AT_RISK':
        return 'CÓ RỦI RO';
      case 'OFF_TRACK':
        return 'CHƯA ĐẠT';
      default:
        return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP':
        return 'trending-up';
      case 'DOWN':
        return 'trending-down';
      case 'STABLE':
        return 'remove';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'UP':
        return '#0D9488';
      case 'DOWN':
        return '#000000';
      case 'STABLE':
        return '#999999';
      default:
        return '#999999';
    }
  };

  const calculatePercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((current / target) * 100);
  };

  const calculateChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
  };

  const renderKPICard = ({ item }: { item: any }) => {
    const percentage = calculatePercentage(item.current, item.target);
    const change = calculateChange(item.current, item.previousPeriod);

    return (
      <View style={styles.kpiCard}>
        {/* Header */}
        <View style={styles.kpiHeader}>
          <View style={styles.kpiTitleRow}>
            <Text style={styles.kpiName}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleRefreshKPI(item.id)}>
              <Ionicons name="refresh" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {item.description && (
            <Text style={styles.kpiDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>

        {/* Main value */}
        <View style={styles.valueSection}>
          <View style={styles.valueRow}>
            <Text style={styles.currentValue}>
              {item.current.toLocaleString('vi-VN')}
            </Text>
            <Text style={styles.unit}>{item.unit}</Text>
          </View>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Mục tiêu:</Text>
            <Text style={styles.targetValue}>
              {item.target.toLocaleString('vi-VN')} {item.unit}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getStatusColor(item.status),
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: getStatusColor(item.status) }]}>
            {percentage}%
          </Text>
        </View>

        {/* Status & Trend */}
        <View style={styles.metaRow}>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>

          <View style={styles.trendRow}>
            <Ionicons
              name={getTrendIcon(item.trend) as any}
              size={16}
              color={getTrendColor(item.trend)}
            />
            {change !== null && (
              <Text style={[styles.changeText, { color: getTrendColor(item.trend) }]}>
                {change > 0 ? '+' : ''}
                {change}%
              </Text>
            )}
          </View>
        </View>

        {/* Owner & Last updated */}
        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="person" size={14} color="#666" />
            <Text style={styles.footerText}>{item.ownerName}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.footerText}>
              {new Date(item.lastUpdated).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading && kpis.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Đang tải KPIs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats header */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng KPI</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{stats.onTrack}</Text>
          <Text style={styles.statLabel}>Đạt mục tiêu</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{stats.atRisk}</Text>
          <Text style={styles.statLabel}>Có rủi ro</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F5F5F5' }]}>
          <Text style={[styles.statValue, { color: '#000000' }]}>{stats.offTrack}</Text>
          <Text style={styles.statLabel}>Chưa đạt</Text>
        </View>
      </View>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {KPI_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.filterChip, selectedCategory === cat.value && styles.filterChipActive]}
            onPress={() => setSelectedCategory(cat.value)}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.value ? '#0D9488' : '#666'}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === cat.value && styles.filterChipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* KPIs list */}
      <FlatList
        data={filteredKPIs}
        keyExtractor={(item) => item.id}
        renderItem={renderKPICard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0D9488']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có KPI nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  filterScroll: {
    maxHeight: 50,
    marginBottom: 12,
    paddingLeft: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: '#F0FDFA',
    borderBottomWidth: 2,
    borderBottomColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  kpiCard: {
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
  kpiHeader: {
    marginBottom: 16,
  },
  kpiTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  kpiDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  valueSection: {
    marginBottom: 16,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currentValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  unit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetLabel: {
    fontSize: 13,
    color: '#666',
  },
  targetValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    minWidth: 45,
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
  },
});
