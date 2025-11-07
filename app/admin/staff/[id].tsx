import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStaffDetail } from '@/hooks/useAdmin';
import { getCapabilityLabel, getFeatureLabel, usePermissions } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function StaffDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();

  const { staff, loading, error, refresh } = useStaffDetail(id);

  // Require view permission
  useEffect(() => {
    if (!loading && (!isAuthenticated || !hasPermission('view', 'staff'))) {
      Alert.alert('Không có quyền', 'Bạn không có quyền xem thông tin nhân viên');
      router.back();
    }
  }, [isAuthenticated, hasPermission, loading]);

  if (!isAuthenticated || !hasPermission('view', 'staff')) {
    return null;
  }

  if (loading && !staff) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Chi tiết nhân viên',
            headerStyle: { backgroundColor: colors.accent },
            headerTintColor: '#fff',
          }}
        />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !staff) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            title: 'Chi tiết nhân viên',
            headerStyle: { backgroundColor: colors.accent },
            headerTintColor: '#fff',
          }}
        />
        <Ionicons name="warning-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          {error || 'Không tìm thấy nhân viên'}
        </Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.accent }]} onPress={refresh}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = staff.active === 1;

  const handleEdit = () => {
    if (!hasPermission('edit', 'staff')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền chỉnh sửa nhân viên');
      return;
    }
    router.push(`/admin/staff/${id}/edit` as any);
  };

  const handleDelete = () => {
    if (!hasPermission('delete', 'staff')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền xóa nhân viên');
      return;
    }
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa nhân viên này? Dữ liệu sẽ được chuyển sang nhân viên khác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            // Navigate to transfer data screen
            router.push(`/admin/staff/${id}/delete` as any);
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${staff.firstname} ${staff.lastname}`,
          headerStyle: { backgroundColor: colors.accent },
          headerTintColor: '#fff',
          headerRight: () =>
            hasPermission('edit', 'staff') ? (
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Ionicons name="create-outline" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      />

      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          {staff.profile_image ? (
            <Image source={{ uri: staff.profile_image }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.accent }]}>
              <Text style={styles.profileImageText}>
                {staff.firstname?.[0]}{staff.lastname?.[0]}
              </Text>
            </View>
          )}
          <Text style={[styles.profileName, { color: colors.text }]}>
            {staff.firstname} {staff.lastname}
          </Text>
          <Text style={[styles.profileRole, { color: colors.textMuted }]}>
            {staff.role?.name || 'N/A'}
          </Text>
          <View style={[styles.profileStatus, { backgroundColor: isActive ? '#22c55e' : '#ef4444' }]}>
            <Text style={styles.profileStatusText}>{isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thông tin liên hệ</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <Ionicons name="mail-outline" size={20} color={colors.accent} />
              <Text style={[styles.infoLabelText, { color: colors.textMuted }]}>Email</Text>
            </View>
            <Text style={[styles.infoValue, { color: colors.text }]}>{staff.email}</Text>
          </View>

          {staff.phonenumber && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="call-outline" size={20} color={colors.accent} />
                <Text style={[styles.infoLabelText, { color: colors.textMuted }]}>Số điện thoại</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>{staff.phonenumber}</Text>
            </View>
          )}
        </View>

        {/* Departments */}
        {staff.departments && staff.departments.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Phòng ban</Text>
            <View style={styles.tagsContainer}>
              {staff.departments.map((dept) => (
                <View key={dept.departmentid} style={[styles.tag, { backgroundColor: colors.accent + '20', borderColor: colors.accent }]}>
                  <Ionicons name="business-outline" size={14} color={colors.accent} />
                  <Text style={[styles.tagText, { color: colors.accent }]}>{dept.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Permissions */}
        {staff.permissions && staff.permissions.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quyền hạn</Text>
            {staff.permissions.map((perm, index) => (
              <View key={index} style={styles.permissionItem}>
                <Text style={[styles.permissionFeature, { color: colors.text }]}>
                  {getFeatureLabel(perm.feature as any)}
                </Text>
                <View style={styles.permissionCaps}>
                  {perm.capabilities.map((cap, capIndex) => (
                    <View key={capIndex} style={[styles.permissionCap, { backgroundColor: colors.background }]}>
                      <Text style={[styles.permissionCapText, { color: colors.textMuted }]}>
                        {getCapabilityLabel(cap as any)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Statistics */}
        {staff.statistics && (
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Thống kê</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{staff.statistics.total_projects}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dự án</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{staff.statistics.active_tasks}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Công việc</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{staff.statistics.completed_tasks}</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Hoàn thành</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{staff.statistics.total_hours_logged}h</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Giờ làm</Text>
              </View>
            </View>
          </View>
        )}

        {/* Activity Info */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hoạt động</Text>
          {staff.last_login && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="time-outline" size={20} color={colors.accent} />
                <Text style={[styles.infoLabelText, { color: colors.textMuted }]}>Đăng nhập cuối</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(staff.last_login).toLocaleString('vi-VN')}
              </Text>
            </View>
          )}
          {staff.created_at && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                <Text style={[styles.infoLabelText, { color: colors.textMuted }]}>Ngày tạo</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(staff.created_at).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>

        {/* Delete Button */}
        {hasPermission('delete', 'staff') && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteButtonText}>Xóa nhân viên</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contentContainer: {
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  headerButton: {
    marginRight: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    marginBottom: 12,
  },
  profileStatus: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  profileStatusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  infoLabelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    marginLeft: 28,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  permissionItem: {
    marginBottom: 16,
  },
  permissionFeature: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  permissionCaps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  permissionCap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionCapText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});
