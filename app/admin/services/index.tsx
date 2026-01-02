/**
 * Admin Services Management
 * CRUD for construction services
 */
import { Pagination } from '@/components/ui/Pagination';
import { SkeletonList } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Service, ServiceCategory, servicesApi } from '@/services/services-api';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORIES = [
  { id: 'DESIGN', name: 'Thiết kế', icon: 'color-palette-outline', color: '#8B5CF6' },
  { id: 'CONSTRUCTION', name: 'Thi công', icon: 'construct-outline', color: '#F59E0B' },
  { id: 'CONSULTING', name: 'Tư vấn', icon: 'bulb-outline', color: '#3B82F6' },
  { id: 'MAINTENANCE', name: 'Bảo trì', icon: 'construct', color: '#06B6D4' },
  { id: 'INSPECTION', name: 'Kiểm tra', icon: 'checkmark-circle-outline', color: '#EC4899' },
  { id: 'OTHER', name: 'Khác', icon: 'ellipsis-horizontal-circle-outline', color: '#6B7280' },
];

export default function AdminServices() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Load services from API
  const loadServices = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      
      const response = await servicesApi.getAll({
        page,
        limit: 20,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      
      setServices(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error: any) {
      console.error('Error loading services:', error);
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể tải danh sách dịch vụ. Vui lòng thử lại.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Thử lại', onPress: () => loadServices() },
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load on mount and when filters change
  useEffect(() => {
    loadServices();
  }, [page, searchQuery, selectedCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadServices(false);
  };

  const deleteService = (id: number) => {
    Alert.alert(
      'Xóa dịch vụ',
      'Bạn có chắc muốn xóa dịch vụ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await servicesApi.delete(id);
              Alert.alert('Thành công', 'Đã xóa dịch vụ');
              await loadServices(false);
            } catch (error: any) {
              Alert.alert('Lỗi', error?.message || 'Không thể xóa dịch vụ. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Quản lý Dịch vụ',
          headerRight: () => (
            <Link href="/admin/services/create" asChild>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="add-circle" size={28} color={colors.tint} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />

      {/* Stats */}
      {total > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Tổng: <Text style={styles.statsNumber}>{total}</Text> dịch vụ
          </Text>
          {totalPages > 1 && (
            <Text style={styles.statsText}>
              Trang {page}/{totalPages}
            </Text>
          )}
        </View>
      )}

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tìm kiếm dịch vụ..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === item.id ? item.color : colors.surface,
              },
            ]}
            onPress={() =>
              setSelectedCategory(selectedCategory === item.id ? null : (item.id as ServiceCategory))
            }
          >
            <Ionicons
              name={item.icon as any}
              size={18}
              color={selectedCategory === item.id ? '#fff' : item.color}
            />
            <Text
              style={[
                styles.categoryText,
                {
                  color: selectedCategory === item.id ? '#fff' : colors.text,
                },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Services List */}
      {loading && services.length === 0 ? (
        <View style={styles.listContainer}>
          <SkeletonList count={5} type="service" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <ServiceCard service={item} colors={colors} onDelete={deleteService} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="briefcase-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>
                {searchQuery || selectedCategory
                  ? 'Không tìm thấy dịch vụ phù hợp'
                  : 'Chưa có dịch vụ nào'}
              </Text>
              {!searchQuery && !selectedCategory && (
                <Link href="/admin/services/create" asChild>
                  <TouchableOpacity style={styles.createButton}>
                    <Text style={styles.createButtonText}>Tạo dịch vụ đầu tiên</Text>
                  </TouchableOpacity>
                </Link>
              )}
            </View>
          }
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={20}
          onPageChange={setPage}
          showPageInfo
          showItemRange
        />
      )}
    </View>
  );
}

function ServiceCard({
  service,
  colors,
  onDelete,
}: {
  service: Service;
  colors: any;
  onDelete: (id: number) => void;
}) {
  const category = CATEGORIES.find((c) => c.id === service.category);

  return (
    <View style={[styles.serviceCard, { backgroundColor: colors.surface }]}>
      <View style={styles.serviceHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.serviceTop}>
            <View style={[styles.categoryBadge, { backgroundColor: category?.color + '20' }]}>
              <Ionicons name={category?.icon as any} size={14} color={category?.color} />
              <Text style={[styles.categoryName, { color: category?.color }]}>
                {category?.name}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    service.status === 'ACTIVE' ? '#DCFCE7' : 
                    service.status === 'INACTIVE' ? '#FEE2E2' : '#F3F4F6',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { 
                    color: service.status === 'ACTIVE' ? '#16A34A' : 
                           service.status === 'INACTIVE' ? '#DC2626' : '#6B7280'
                  },
                ]}
              >
                {service.status === 'ACTIVE' ? 'Hoạt động' : 
                 service.status === 'INACTIVE' ? 'Tạm dừng' : 
                 service.status === 'DRAFT' ? 'Nháp' : 'Lưu trữ'}
              </Text>
            </View>
          </View>
          <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
          {service.description && (
            <Text style={styles.serviceDescription} numberOfLines={2}>
              {service.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.serviceFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {service.price.toLocaleString('vi-VN')}đ/{service.unit}
          </Text>
        </View>
        <View style={styles.actions}>
          <Link href={`/admin/services/edit/${service.id}` as any} asChild>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="create-outline" size={18} color="#3B82F6" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
            onPress={() => onDelete(service.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  statsText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statsNumber: {
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  serviceCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  paginationButtonDisabled: {
    opacity: 0.4,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paginationTextDisabled: {
    color: '#D1D5DB',
  },
  paginationInfo: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
});
