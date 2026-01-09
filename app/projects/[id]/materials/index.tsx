/**
 * Materials Management - Inventory List
 * Danh sách vật liệu với stock tracking
 */

import { MetricCard, ProgressCard, StatusBadge } from '@/components/construction';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Material, MaterialCategory, MaterialsService } from '@/services/api/materials.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORY_ICONS: Record<MaterialCategory, keyof typeof Ionicons.glyphMap> = {
  concrete: 'cube',
  steel: 'git-network',
  brick: 'grid',
  wood: 'file-tray-stacked',
  electrical: 'flash',
  plumbing: 'water',
  finishing: 'color-palette',
  other: 'ellipse',
};

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  concrete: 'Bê tông',
  steel: 'Thép',
  brick: 'Gạch',
  wood: 'Gỗ',
  electrical: 'Điện',
  plumbing: 'Nước',
  finishing: 'Hoàn thiện',
  other: 'Khác',
};

export default function MaterialsListScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<MaterialCategory | 'all' | 'low'>('all');

  useEffect(() => {
    loadData();
  }, [filter, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [materialsData, statsData] = await Promise.all([
        MaterialsService.getMaterials({
          category: filter !== 'all' && filter !== 'low' ? filter : undefined,
          lowStock: filter === 'low',
          search: search.trim() || undefined,
        }),
        MaterialsService.getStats(),
      ]);

      setMaterials(materialsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStockStatus = (material: Material): 'low' | 'medium' | 'good' => {
    const ratio = material.currentStock / material.maxStock;
    if (material.currentStock <= material.minStock) return 'low';
    if (ratio < 0.5) return 'medium';
    return 'good';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  if (loading && !refreshing) {
    return (
      <Container fullWidth>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Đang tải vật liệu...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container fullWidth>
      <StatusBar style="dark" />

      {/* Header */}
      <Section>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Vật liệu</Text>
            <Text style={styles.subtitle}>{materials.length} loại</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push(`/projects/${projectId}/materials/requests`)}
          >
            <Ionicons name="clipboard-outline" size={24} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm vật liệu..."
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </Section>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Stats Cards */}
        {stats && (
          <Section>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow}>
              <MetricCard
                icon="cash"
                label="Tổng giá trị"
                value={`${formatCurrency(stats.totalValue / 1000000)}M`}
                subtitle="VNĐ"
                gradientColors={['#3b82f6', '#0066CC']}
                style={styles.statCard}
              />
              <MetricCard
                icon="alert-circle"
                label="Sắp hết"
                value={stats.lowStockCount}
                subtitle="loại vật liệu"
                trend={stats.lowStockCount > 0 ? 'down' : 'neutral'}
                gradientColors={['#000000', '#000000']}
                style={styles.statCard}
              />
              <MetricCard
                icon="document-text"
                label="Yêu cầu chờ"
                value={stats.pendingRequests}
                subtitle="đơn hàng"
                gradientColors={['#0066CC', '#d97706']}
                style={styles.statCard}
              />
              <MetricCard
                icon="swap-horizontal"
                label="Giao dịch"
                value={stats.recentTransactions}
                subtitle="7 ngày qua"
                gradientColors={['#0066CC', '#0066CC']}
                style={styles.statCard}
              />
            </ScrollView>
          </Section>
        )}

        {/* Category Filter */}
        <Section>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterChip, filter === 'low' && styles.filterChipActive]}
              onPress={() => setFilter('low')}
            >
              <Ionicons 
                name="alert-circle" 
                size={16} 
                color={filter === 'low' ? '#fff' : '#6b7280'} 
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.filterText, filter === 'low' && styles.filterTextActive]}>
                Sắp hết
              </Text>
            </TouchableOpacity>

            {(Object.keys(CATEGORY_LABELS) as MaterialCategory[]).map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, filter === cat && styles.filterChipActive]}
                onPress={() => setFilter(cat)}
              >
                <Ionicons 
                  name={CATEGORY_ICONS[cat]} 
                  size={16} 
                  color={filter === cat ? '#fff' : '#6b7280'} 
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        {/* Materials List */}
        <Section>
          {materials.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Không tìm thấy vật liệu</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {materials.map(material => {
                const status = getStockStatus(material);
                const stockRatio = (material.currentStock / material.maxStock) * 100;

                return (
                  <TouchableOpacity
                    key={material.id}
                    style={styles.materialCard}
                    onPress={() => router.push(`/projects/${projectId}/materials/${material.id}`)}
                  >
                    <View style={styles.materialHeader}>
                      <View style={[styles.materialIcon, { backgroundColor: status === 'low' ? '#fee2e2' : '#E8F4FF' }]}>
                        <Ionicons 
                          name={CATEGORY_ICONS[material.category]} 
                          size={24} 
                          color={status === 'low' ? '#000000' : '#3b82f6'} 
                        />
                      </View>

                      <View style={styles.materialInfo}>
                        <Text style={styles.materialName}>{material.name}</Text>
                        <View style={styles.materialMeta}>
                          <Text style={styles.materialCategory}>
                            {CATEGORY_LABELS[material.category]}
                          </Text>
                          {material.supplier && (
                            <>
                              <Text style={styles.metaSeparator}>•</Text>
                              <Text style={styles.materialSupplier}>{material.supplier}</Text>
                            </>
                          )}
                        </View>
                      </View>

                      <StatusBadge
                        label={status === 'low' ? 'Thấp' : status === 'medium' ? 'TB' : 'Tốt'}
                        variant={status === 'low' ? 'error' : status === 'medium' ? 'warning' : 'success'}
                        size="small"
                      />
                    </View>

                    <View style={styles.materialStock}>
                      <View style={styles.stockInfo}>
                        <Text style={styles.stockLabel}>Tồn kho</Text>
                        <Text style={styles.stockValue}>
                          {formatCurrency(material.currentStock)} {material.unit}
                        </Text>
                      </View>
                      <View style={styles.stockInfo}>
                        <Text style={styles.stockLabel}>Giá trị</Text>
                        <Text style={styles.stockValue}>
                          {formatCurrency((material.currentStock * material.unitPrice) / 1000000)}M
                        </Text>
                      </View>
                    </View>

                    <ProgressCard
                      title=""
                      progress={stockRatio}
                      showPercentage={false}
                      gradientColors={
                        status === 'low' 
                          ? ['#000000', '#000000'] 
                          : status === 'medium' 
                          ? ['#0066CC', '#d97706'] 
                          : ['#0066CC', '#0066CC']
                      }
                      style={styles.stockProgress}
                    />

                    <View style={styles.stockLimits}>
                      <Text style={styles.limitText}>
                        Min: {formatCurrency(material.minStock)} {material.unit}
                      </Text>
                      <Text style={styles.limitText}>
                        Max: {formatCurrency(material.maxStock)} {material.unit}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Section>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  addButton: {
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111827',
  },
  statsRow: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  statCard: {
    width: 160,
    marginRight: 12,
  },
  filterRow: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    gap: 12,
  },
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  materialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  materialIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  materialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 6,
  },
  materialSupplier: {
    fontSize: 12,
    color: '#6b7280',
  },
  materialStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  stockProgress: {
    marginBottom: 8,
  },
  stockLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limitText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
  },
});
