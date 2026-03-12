import MetricCard from '@/components/construction/MetricCard';
import StatusBadge from '@/components/construction/StatusBadge';
import { Container } from '@/components/ui/container';
import {
    Equipment,
    EquipmentCategory,
    EquipmentService,
    EquipmentStatus,
} from '@/services/api/equipment.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  heavy: 'Máy nặng',
  power: 'Máy điện',
  lifting: 'Máy nâng',
  concrete: 'Bê tông',
  welding: 'Hàn',
  measuring: 'Đo đạc',
  safety: 'An toàn',
  other: 'Khác',
};

const STATUS_COLORS: Record<EquipmentStatus, string> = {
  available: '#0D9488',
  'in-use': '#0D9488',
  maintenance: '#0D9488',
  broken: '#000000',
  reserved: '#666666',
};

const STATUS_LABELS: Record<EquipmentStatus, string> = {
  available: 'Sẵn sàng',
  'in-use': 'Đang dùng',
  maintenance: 'Bảo trì',
  broken: 'Hỏng',
  reserved: 'Đã đặt',
};

const CONDITION_COLORS = {
  excellent: '#0D9488',
  good: '#0D9488',
  fair: '#0D9488',
  poor: '#000000',
};

export default function EquipmentScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'all' | 'available'>('all');
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    needMaintenance: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchQuery, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [equipmentData, statsData] = await Promise.all([
        EquipmentService.getEquipment(),
        EquipmentService.getStats(),
      ]);
      setEquipment(equipmentData);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'available') {
        filtered = filtered.filter(e => e.status === 'available');
      } else {
        filtered = filtered.filter(e => e.category === selectedCategory);
      }
    }

    // Filter by search
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(search) ||
        e.model?.toLowerCase().includes(search) ||
        e.serialNumber?.toLowerCase().includes(search)
      );
    }

    setFilteredEquipment(filtered);
  };

  const getMaintenanceStatus = (eq: Equipment) => {
    if (!eq.nextMaintenance) return null;
    const daysUntil = (new Date(eq.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntil <= 0) return 'overdue';
    if (daysUntil <= 7) return 'soon';
    return 'ok';
  };

  const getCategoryIcon = (category: EquipmentCategory) => {
    const icons: Record<EquipmentCategory, any> = {
      heavy: 'hardware-chip',
      power: 'flash',
      lifting: 'arrow-up',
      concrete: 'cube',
      welding: 'flame',
      measuring: 'ruler',
      safety: 'shield-checkmark',
      other: 'ellipsis-horizontal',
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const renderEquipmentCard = (eq: Equipment) => {
    const maintenanceStatus = getMaintenanceStatus(eq);

    return (
      <TouchableOpacity
        key={eq.id}
        style={styles.equipmentCard}
        onPress={() => router.push(`/projects/${projectId}/equipment/${eq.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: STATUS_COLORS[eq.status] + '20' }]}>
              <Ionicons name={getCategoryIcon(eq.category)} size={24} color={STATUS_COLORS[eq.status]} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.equipmentName}>{eq.name}</Text>
              <Text style={styles.equipmentCategory}>{CATEGORY_LABELS[eq.category]}</Text>
              {eq.model && <Text style={styles.equipmentModel}>Model: {eq.model}</Text>}
            </View>
          </View>
          <StatusBadge
            variant={eq.status === 'available' ? 'success' : eq.status === 'broken' ? 'error' : 'warning'}
            label={STATUS_LABELS[eq.status]}
            size="small"
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.infoText}>{eq.location || 'Chưa xác định'}</Text>
            </View>
            {eq.assignedTo && (
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={16} color="#6b7280" />
                <Text style={styles.infoText}>{eq.assignedTo}</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Tình trạng</Text>
              <View style={styles.conditionBadge}>
                <View style={[styles.conditionDot, { backgroundColor: CONDITION_COLORS[eq.condition] }]} />
                <Text style={[styles.statValue, { color: CONDITION_COLORS[eq.condition] }]}>
                  {eq.condition === 'excellent' ? 'Xuất sắc' : 
                   eq.condition === 'good' ? 'Tốt' :
                   eq.condition === 'fair' ? 'Khá' : 'Kém'}
                </Text>
              </View>
            </View>
            {eq.totalHours !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Giờ hoạt động</Text>
                <Text style={styles.statValue}>{eq.totalHours.toLocaleString()}h</Text>
              </View>
            )}
          </View>

          {eq.nextMaintenance && (
            <View style={styles.maintenanceInfo}>
              <Ionicons 
                name="construct-outline" 
                size={16} 
                color={maintenanceStatus === 'overdue' ? '#000000' : maintenanceStatus === 'soon' ? '#0D9488' : '#6b7280'} 
              />
              <Text style={[
                styles.maintenanceText,
                maintenanceStatus === 'overdue' && styles.maintenanceOverdue,
                maintenanceStatus === 'soon' && styles.maintenanceSoon,
              ]}>
                {maintenanceStatus === 'overdue' ? 'Quá hạn bảo trì' :
                 maintenanceStatus === 'soon' ? 'Sắp bảo trì' :
                 `Bảo trì: ${new Date(eq.nextMaintenance).toLocaleDateString('vi-VN')}`}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Container fullWidth>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thiết bị</Text>
        <TouchableOpacity 
          onPress={() => router.push(`/projects/${projectId}/equipment/bookings`)}
          style={styles.bookingsButton}
        >
          <Ionicons name="calendar-outline" size={24} color="#0D9488" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm thiết bị..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          <MetricCard
            label="Tổng số"
            value={stats.total.toString()}
            icon="hardware-chip"
            gradientColors={['#0D9488', '#0D9488']}
          />
          <MetricCard
            label="Sẵn sàng"
            value={stats.available.toString()}
            icon="checkmark-circle"
            gradientColors={['#0D9488', '#0D9488']}
          />
          <MetricCard
            label="Đang dùng"
            value={stats.inUse.toString()}
            icon="play-circle"
            gradientColors={['#0D9488', '#d97706']}
          />
          <MetricCard
            label="Cần bảo trì"
            value={stats.needMaintenance.toString()}
            icon="construct"
            gradientColors={['#000000', '#000000']}
          />
        </ScrollView>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'all' && styles.filterChipTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedCategory === 'available' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('available')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'available' && styles.filterChipTextActive]}>
              Sẵn sàng
            </Text>
          </TouchableOpacity>
          {(Object.keys(CATEGORY_LABELS) as EquipmentCategory[]).map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Equipment List */}
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Đang tải...</Text>
            </View>
          ) : filteredEquipment.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="hardware-chip-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>Không tìm thấy thiết bị</Text>
              <Text style={styles.emptySubtext}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Text>
            </View>
          ) : (
            filteredEquipment.map(renderEquipmentCard)
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  bookingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  statsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  statsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  filterContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  equipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  equipmentCategory: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  equipmentModel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conditionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  maintenanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  maintenanceText: {
    fontSize: 13,
    color: '#6b7280',
  },
  maintenanceSoon: {
    color: '#0D9488',
    fontWeight: '600',
  },
  maintenanceOverdue: {
    color: '#000000',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 8,
    textAlign: 'center',
  },
});
