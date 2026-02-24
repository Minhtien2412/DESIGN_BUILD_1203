import { useMaterials } from '@/hooks/useInventory';
import { MaterialCategory, MaterialUnit, StockStatus } from '@/types/inventory';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORY_CONFIG: Record<
  MaterialCategory,
  { label: string; icon: string; color: string }
> = {
  CEMENT: { label: 'Xi măng', icon: 'cube', color: '#666666' },
  STEEL: { label: 'Thép', icon: 'git-network', color: '#1A1A1A' },
  SAND: { label: 'Cát', icon: 'water', color: '#0D9488' },
  GRAVEL: { label: 'Đá', icon: 'shapes', color: '#999999' },
  BRICK: { label: 'Gạch', icon: 'grid', color: '#0D9488' },
  TILE: { label: 'Gạch lát', icon: 'apps', color: '#0D9488' },
  PAINT: { label: 'Sơn', icon: 'color-palette', color: '#0D9488' },
  WOOD: { label: 'Gỗ', icon: 'file-tray-stacked', color: '#0D9488' },
  ELECTRICAL: { label: 'Điện', icon: 'flash', color: '#0D9488' },
  PLUMBING: { label: 'Nước', icon: 'water-outline', color: '#0D9488' },
  TOOLS: { label: 'Dụng cụ', icon: 'construct', color: '#0D9488' },
  SAFETY_EQUIPMENT: { label: 'An toàn', icon: 'shield-checkmark', color: '#0D9488' },
  OTHER: { label: 'Khác', icon: 'ellipsis-horizontal', color: '#999999' },
};

const UNIT_LABELS: Record<MaterialUnit, string> = {
  KG: 'kg',
  TON: 'tấn',
  M: 'm',
  M2: 'm²',
  M3: 'm³',
  PIECE: 'cái',
  BOX: 'thùng',
  BAG: 'bao',
  LITER: 'lít',
  SET: 'bộ',
};

export default function MaterialsScreen() {
  const { projectId, filter } = useLocalSearchParams<{ projectId: string; filter?: string }>();
  const { materials, loading, deleteMaterial } = useMaterials(projectId!);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<MaterialCategory | 'ALL'>('ALL');

  const getStockStatus = (material: any): StockStatus => {
    if (material.currentStock === 0) return StockStatus.OUT_OF_STOCK;
    if (material.currentStock <= material.minStock) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  };

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'ALL' || material.category === filterCategory;
    const matchesFilter =
      !filter ||
      (filter === 'low' && getStockStatus(material) === StockStatus.LOW_STOCK) ||
      (filter === 'out' && getStockStatus(material) === StockStatus.OUT_OF_STOCK);

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const categoryCounts = {
    ALL: materials.length,
    ...Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
      acc[cat as MaterialCategory] = materials.filter(
        (m) => m.category === cat
      ).length;
      return acc;
    }, {} as Record<MaterialCategory, number>),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDelete = async (materialId: string, materialName: string) => {
    Alert.alert(
      'Xóa vật liệu',
      `Bạn có chắc muốn xóa "${materialName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMaterial(materialId);
              Alert.alert('Thành công', 'Đã xóa vật liệu');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa vật liệu');
            }
          },
        },
      ]
    );
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
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm vật liệu..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterCategory === 'ALL' && styles.filterChipActive,
          ]}
          onPress={() => setFilterCategory('ALL')}
        >
          <Text
            style={[
              styles.filterText,
              filterCategory === 'ALL' && styles.filterTextActive,
            ]}
          >
            Tất cả ({categoryCounts.ALL})
          </Text>
        </TouchableOpacity>

        {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
          const category = cat as MaterialCategory;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                filterCategory === category && styles.filterChipActive,
              ]}
              onPress={() => setFilterCategory(category)}
            >
              <Ionicons
                name={config.icon as any}
                size={14}
                color={filterCategory === category ? config.color : '#666'}
              />
              <Text
                style={[
                  styles.filterText,
                  filterCategory === category && { color: config.color, fontWeight: '600' },
                ]}
              >
                {config.label} ({categoryCounts[category] || 0})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.scrollView}>
        {filteredMaterials.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Không tìm thấy vật liệu'
                : 'Chưa có vật liệu nào'}
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push(`/inventory/create-material?projectId=${projectId}`)
              }
            >
              <Text style={styles.emptyButtonText}>Thêm vật liệu đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredMaterials.map((material) => {
            const config = CATEGORY_CONFIG[material.category];
            const status = getStockStatus(material);
            const stockPercentage =
              material.minStock > 0
                ? (material.currentStock / material.minStock) * 100
                : 100;

            return (
              <TouchableOpacity
                key={material.id}
                style={styles.materialCard}
                onPress={() =>
                  router.push(`/inventory/material/${material.id}?projectId=${projectId}` as Href)
                }
              >
                {/* Header */}
                <View style={styles.materialHeader}>
                  <View style={styles.materialLeft}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: config.color + '20' },
                      ]}
                    >
                      <Ionicons name={config.icon as any} size={20} color={config.color} />
                    </View>
                    <View style={styles.materialInfo}>
                      <Text style={styles.materialName} numberOfLines={1}>
                        {material.name}
                      </Text>
                      <Text style={styles.categoryLabel}>{config.label}</Text>
                    </View>
                  </View>

                  {status === StockStatus.OUT_OF_STOCK && (
                    <View style={[styles.statusBadge, { backgroundColor: '#F5F5F5' }]}>
                      <Ionicons name="alert-circle" size={12} color="#1A1A1A" />
                      <Text style={[styles.statusText, { color: '#1A1A1A' }]}>Hết</Text>
                    </View>
                  )}
                  {status === StockStatus.LOW_STOCK && (
                    <View style={[styles.statusBadge, { backgroundColor: '#F0FDFA' }]}>
                      <Ionicons name="warning" size={12} color="#0D9488" />
                      <Text style={[styles.statusText, { color: '#0D9488' }]}>Thấp</Text>
                    </View>
                  )}
                  {status === StockStatus.IN_STOCK && (
                    <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                      <Ionicons name="checkmark-circle" size={12} color="#0D9488" />
                      <Text style={[styles.statusText, { color: '#0D9488' }]}>Đủ</Text>
                    </View>
                  )}
                </View>

                {/* Stock Info */}
                <View style={styles.stockSection}>
                  <View style={styles.stockRow}>
                    <View style={styles.stockItem}>
                      <Text style={styles.stockLabel}>Tồn kho</Text>
                      <Text
                        style={[
                          styles.stockValue,
                          {
                            color:
                              material.currentStock === 0
                                ? '#1A1A1A'
                                : material.currentStock <= material.minStock
                                ? '#0D9488'
                                : '#0D9488',
                          },
                        ]}
                      >
                        {material.currentStock} {UNIT_LABELS[material.unit]}
                      </Text>
                    </View>

                    <View style={styles.stockItem}>
                      <Text style={styles.stockLabel}>Tối thiểu</Text>
                      <Text style={styles.stockValue}>
                        {material.minStock} {UNIT_LABELS[material.unit]}
                      </Text>
                    </View>

                    <View style={styles.stockItem}>
                      <Text style={styles.stockLabel}>Đơn giá</Text>
                      <Text style={styles.stockValue}>
                        {formatCurrency(material.unitPrice)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(stockPercentage, 100)}%`,
                          backgroundColor:
                            material.currentStock === 0
                              ? '#1A1A1A'
                              : material.currentStock <= material.minStock
                              ? '#0D9488'
                              : '#0D9488',
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Giá trị tồn kho:</Text>
                    <Text style={styles.totalValue}>
                      {formatCurrency(material.totalValue)}
                    </Text>
                  </View>
                </View>

                {/* Location & Supplier */}
                {(material.warehouseLocation || material.supplier) && (
                  <View style={styles.detailsSection}>
                    {material.warehouseLocation && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.detailText}>
                          {material.warehouseLocation}
                        </Text>
                      </View>
                    )}
                    {material.supplier && (
                      <View style={styles.detailRow}>
                        <Ionicons name="business-outline" size={14} color="#666" />
                        <Text style={styles.detailText}>{material.supplier.name}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() =>
                      router.push(`/inventory/material/${material.id}?projectId=${projectId}` as Href)
                    }
                  >
                    <Ionicons name="eye-outline" size={14} color="#0D9488" />
                    <Text style={[styles.actionButtonText, { color: '#0D9488' }]}>
                      Chi tiết
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(material.id, material.name)}
                  >
                    <Ionicons name="trash-outline" size={14} color="#1A1A1A" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      {materials.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push(`/inventory/create-material?projectId=${projectId}`)
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContent: {
    padding: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#F0FDFA',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
  },
  filterTextActive: {
    color: '#0D9488',
    fontWeight: '600',
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
  materialCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stockSection: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  stockItem: {
    flex: 1,
    gap: 4,
  },
  stockLabel: {
    fontSize: 11,
    color: '#999',
  },
  stockValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsSection: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0D9488',
    flex: 1,
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    paddingHorizontal: 10,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
