/**
 * Admin Utilities Management
 * CRUD for app utilities/features
 */
import { Pagination } from '@/components/ui/Pagination';
import { SkeletonList } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { utilitiesApi, Utility, UtilityType } from '@/services/utilities-api';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const UTILITY_TYPES = [
  { id: 'CALCULATOR', name: 'Công cụ tính', icon: 'calculator', color: '#3B82F6' },
  { id: 'AI', name: 'Trí tuệ nhân tạo', icon: 'sparkles', color: '#666666' },
  { id: 'MEDIA', name: 'Đa phương tiện', icon: 'film', color: '#000000' },
  { id: 'DOCUMENT', name: 'Tài liệu', icon: 'document-text', color: '#0066CC' },
  { id: 'OTHER', name: 'Khác', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

export default function AdminUtilities() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<UtilityType | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUtilities();
  }, [page, searchQuery, selectedType]);

  const loadUtilities = async () => {
    try {
      setLoading(true);
      const response = await utilitiesApi.getAll({
        page,
        limit: 20,
        search: searchQuery || undefined,
        type: selectedType || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setUtilities(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể tải tiện ích');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUtilities();
    setRefreshing(false);
  };

  const toggleUtility = async (id: number) => {
    try {
      await utilitiesApi.toggleEnabled(id);
      await loadUtilities();
      Alert.alert('Thành công', 'Đã cập nhật trạng thái');
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể cập nhật');
    }
  };

  const deleteUtility = (id: number) => {
    Alert.alert(
      'Xóa tiện ích',
      'Bạn có chắc muốn xóa tiện ích này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await utilitiesApi.delete(id);
              await loadUtilities();
              Alert.alert('Thành công', 'Đã xóa tiện ích');
            } catch (error: any) {
              Alert.alert('Lỗi', error?.message || 'Không thể xóa');
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
          title: 'Quản lý Tiện ích',
          headerRight: () => (
            <Link href="/admin/utilities/create" asChild>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="add-circle" size={28} color={colors.tint} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Tổng: <Text style={styles.statsNumber}>{total}</Text> tiện ích
        </Text>
        {totalPages > 1 && (
          <Text style={styles.statsText}>
            Trang {page}/{totalPages}
          </Text>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tìm kiếm tiện ích..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter */}
      <FlatList
        horizontal
        data={UTILITY_TYPES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.typeChip,
              {
                backgroundColor:
                  selectedType === item.id ? item.color : colors.surface,
              },
            ]}
            onPress={() => setSelectedType(selectedType === item.id ? null : item.id as UtilityType)}
          >
            <Ionicons
              name={item.icon as any}
              size={18}
              color={selectedType === item.id ? '#fff' : item.color}
            />
            <Text
              style={[
                styles.typeText,
                { color: selectedType === item.id ? '#fff' : colors.text },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Loading State */}
      {loading && utilities.length === 0 ? (
        <View style={styles.listContainer}>
          <SkeletonList count={5} type="utility" />
        </View>
      ) : utilities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="apps-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyText}>Chưa có tiện ích nào</Text>
          <Link href="/admin/utilities/create" asChild>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Tạo tiện ích đầu tiên</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <>
          {/* Utilities List */}
          <FlatList
            data={utilities}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <UtilityCard
                utility={item}
                colors={colors}
                onToggle={toggleUtility}
                onDelete={deleteUtility}
              />
            )}
          />

          {/* Pagination */}
          {totalPages > 1 && (
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
        </>
      )}
    </View>
  );
}

function UtilityCard({
  utility,
  colors,
  onToggle,
  onDelete,
}: {
  utility: Utility;
  colors: any;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const type = UTILITY_TYPES.find((t) => t.id === utility.type);

  return (
    <View style={[styles.utilityCard, { backgroundColor: colors.surface }]}>
      <View style={styles.utilityHeader}>
        <View style={[styles.utilityIcon, { backgroundColor: utility.color + '20' }]}>
          <Ionicons name={utility.icon as any} size={28} color={utility.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.utilityTop}>
            <View style={[styles.typeBadge, { backgroundColor: type?.color + '20' }]}>
              <Ionicons name={type?.icon as any} size={12} color={type?.color} />
              <Text style={[styles.typeName, { color: type?.color }]}>
                {type?.name}
              </Text>
            </View>
          </View>
          <Text style={[styles.utilityName, { color: colors.text }]}>
            {utility.name}
          </Text>
          {utility.description && (
            <Text style={styles.utilityDescription} numberOfLines={2}>
              {utility.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.utilityFooter}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Kích hoạt</Text>
          <Switch
            value={utility.enabled}
            onValueChange={() => onToggle(utility.id)}
            trackColor={{ false: '#D1D5DB', true: utility.color + '80' }}
            thumbColor={utility.enabled ? utility.color : '#f4f3f4'}
          />
        </View>
        <View style={styles.actions}>
          <Link href={`/admin/utilities/edit/${utility.id}` as any} asChild>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E8F4FF' }]}>
              <Ionicons name="settings-outline" size={18} color="#3B82F6" />
            </TouchableOpacity>
          </Link>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
            onPress={() => onDelete(utility.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#000000" />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  typesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  utilityCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  utilityHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  utilityIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  utilityTop: {
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  typeName: {
    fontSize: 11,
    fontWeight: '600',
  },
  utilityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  utilityDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  utilityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  statsText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statsNumber: {
    fontWeight: '600',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  createButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#666666',
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paginationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#666666',
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  paginationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationTextDisabled: {
    color: '#9CA3AF',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
