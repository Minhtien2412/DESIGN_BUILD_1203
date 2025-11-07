import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StaffMember, useStaff } from '@/hooks/useAdmin';
import { usePermissions } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Staff Card Component
function StaffCard({ staff, colors, onPress }: { staff: StaffMember; colors: any; onPress: () => void }) {
  const isActive = staff.active === 1;

  return (
    <TouchableOpacity
      style={[styles.staffCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.staffHeader}>
        {staff.profile_image ? (
          <Image source={{ uri: staff.profile_image }} style={styles.staffAvatar} />
        ) : (
          <View style={[styles.staffAvatarPlaceholder, { backgroundColor: colors.accent }]}>
            <Text style={styles.staffAvatarText}>
              {staff.firstname?.[0]}{staff.lastname?.[0]}
            </Text>
          </View>
        )}
        <View style={styles.staffInfo}>
          <Text style={[styles.staffName, { color: colors.text }]}>
            {staff.firstname} {staff.lastname}
          </Text>
          <Text style={[styles.staffEmail, { color: colors.textMuted }]}>{staff.email}</Text>
          {staff.phonenumber && (
            <Text style={[styles.staffPhone, { color: colors.textMuted }]}>📞 {staff.phonenumber}</Text>
          )}
        </View>
        <View style={[styles.staffStatus, { backgroundColor: isActive ? '#22c55e' : '#ef4444' }]}>
          <Text style={styles.staffStatusText}>{isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      <View style={styles.staffDetails}>
        <View style={styles.staffDetailItem}>
          <Ionicons name="briefcase-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.staffDetailText, { color: colors.textMuted }]}>
            {staff.role?.name || 'N/A'}
          </Text>
        </View>
        {staff.departments && staff.departments.length > 0 && (
          <View style={styles.staffDetailItem}>
            <Ionicons name="business-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.staffDetailText, { color: colors.textMuted }]}>
              {staff.departments.map(d => d.name).join(', ')}
            </Text>
          </View>
        )}
        {staff.last_login && (
          <View style={styles.staffDetailItem}>
            <Ionicons name="time-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.staffDetailText, { color: colors.textMuted }]}>
              {new Date(staff.last_login).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// Filter Chip Component
function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? colors.accent : colors.surface,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, { color: active ? '#fff' : colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function StaffListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated } = useAuth();
  const { hasPermission, isAdmin } = usePermissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<1 | 0 | undefined>(undefined);

  const {
    staff,
    pagination,
    loading,
    error,
    refresh,
    fetchMore,
    hasMore,
  } = useStaff({
    filters: {
      search: searchQuery || undefined,
      active: activeFilter,
    },
    limit: 20,
  });

  // Require view permission
  useEffect(() => {
    if (!loading && (!isAuthenticated || !hasPermission('view', 'staff'))) {
      Alert.alert('Không có quyền', 'Bạn không có quyền xem danh sách nhân viên');
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, hasPermission, loading]);

  if (!isAuthenticated || !hasPermission('view', 'staff')) {
    return null;
  }

  const handleStaffPress = (staffid: number) => {
    router.push(`/admin/staff/${staffid}` as any);
  };

  const handleCreateStaff = () => {
    if (!hasPermission('create', 'staff')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền tạo nhân viên mới');
      return;
    }
    router.push('/admin/staff/create' as any);
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          {searchQuery ? 'Không tìm thấy nhân viên' : 'Chưa có nhân viên nào'}
        </Text>
        {!searchQuery && hasPermission('create', 'staff') && (
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: colors.accent }]} onPress={handleCreateStaff}>
            <Text style={styles.emptyButtonText}>Thêm nhân viên đầu tiên</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || loading) return null;

    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={fetchMore}>
        <Text style={[styles.loadMoreText, { color: colors.accent }]}>Tải thêm</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quản lý nhân viên',
          headerStyle: { backgroundColor: colors.accent },
          headerTintColor: '#fff',
          headerRight: () =>
            hasPermission('create', 'staff') ? (
              <TouchableOpacity onPress={handleCreateStaff} style={styles.headerButton}>
                <Ionicons name="add-circle-outline" size={28} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Tìm theo tên, email..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <FilterChip label="Tất cả" active={activeFilter === undefined} onPress={() => setActiveFilter(undefined)} />
          <FilterChip label="Active" active={activeFilter === 1} onPress={() => setActiveFilter(1)} />
          <FilterChip label="Inactive" active={activeFilter === 0} onPress={() => setActiveFilter(0)} />
        </View>

        {/* Error Banner */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="warning-outline" size={20} color="#ef4444" />
            <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
            <TouchableOpacity onPress={() => refresh()}>
              <Text style={[styles.retryText, { color: '#ef4444' }]}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Staff List */}
        <FlatList
          data={staff}
          keyExtractor={(item) => item.staffid.toString()}
          renderItem={({ item }) => <StaffCard staff={item} colors={colors} onPress={() => handleStaffPress(item.staffid)} />}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading && !staff.length} onRefresh={refresh} colors={[colors.accent]} />}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={() => {
            if (hasMore && !loading) {
              fetchMore();
            }
          }}
          onEndReachedThreshold={0.5}
        />

        {/* Loading Overlay */}
        {loading && staff.length === 0 && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Đang tải...</Text>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  staffCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  staffHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  staffAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  staffAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  staffInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  staffEmail: {
    fontSize: 13,
    marginBottom: 2,
  },
  staffPhone: {
    fontSize: 13,
  },
  staffStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
  },
  staffStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  staffDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  staffDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  staffDetailText: {
    fontSize: 12,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
});
