/**
 * Account Management & User Permissions
 * Quản lý tài khoản và phân quyền người dùng
 * 
 * Features:
 * - View all users (Admin only)
 * - Edit user roles
 * - Manage user permissions
 * - View user activity
 */

import { Container } from '@/components/ui/container';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { User, UserRole } from '@/services/api/types';
import userService from '@/services/api/user.service';
import { isAdmin } from '@/utils/permissions';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserWithActions extends User {
  loading?: boolean;
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap; description: string }> = {
  ADMIN: {
    label: 'Quản trị viên',
    color: '#EF4444',
    icon: 'shield-checkmark',
    description: 'Toàn quyền quản lý hệ thống',
  },
  ENGINEER: {
    label: 'Kỹ sư',
    color: '#3B82F6',
    icon: 'construct',
    description: 'Quản lý dự án và kỹ thuật',
  },
  CONTRACTOR: {
    label: 'Nhà thầu',
    color: '#F59E0B',
    icon: 'hammer',
    description: 'Thực hiện thi công dự án',
  },
  CLIENT: {
    label: 'Khách hàng',
    color: '#10B981',
    icon: 'person',
    description: 'Người dùng thông thường',
  },
};

export default function AccountManagementScreen() {
  const { user: currentUser } = useAuth();
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'surface');

  const [users, setUsers] = useState<UserWithActions[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithActions[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithActions | null>(null);

  // Check if current user is admin
  const isAdminUser = currentUser && isAdmin(currentUser);

  useEffect(() => {
    if (!isAdminUser) {
      Alert.alert(
        'Không có quyền',
        'Bạn cần quyền quản trị viên để truy cập trang này',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.list({ limit: 100 });
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('[AccountManagement] Error fetching users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(u => u.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    try {
      // Update UI optimistically
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, loading: true } : u)
      );

      await userService.update(userId, { role: newRole });

      // Update local state
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, role: newRole, loading: false } : u)
      );

      setShowRoleModal(false);
      setSelectedUser(null);

      Alert.alert('Thành công', 'Đã cập nhật vai trò người dùng');
    } catch (error: any) {
      console.error('[AccountManagement] Error updating role:', error);
      Alert.alert('Lỗi', error?.message || 'Không thể cập nhật vai trò');
      
      // Revert optimistic update
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, loading: false } : u)
      );
    }
  };

  const handleDeleteUser = (user: UserWithActions) => {
    if (user.id === Number(currentUser?.id)) {
      Alert.alert('Lỗi', 'Bạn không thể xóa tài khoản của chính mình');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa tài khoản "${user.name}"?\n\nHành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.delete(user.id);
              setUsers(prev => prev.filter(u => u.id !== user.id));
              Alert.alert('Thành công', 'Đã xóa tài khoản');
            } catch (error: any) {
              console.error('[AccountManagement] Error deleting user:', error);
              Alert.alert('Lỗi', error?.message || 'Không thể xóa tài khoản');
            }
          },
        },
      ]
    );
  };

  const renderUserCard = ({ item: user }: { item: UserWithActions }) => {
    const roleConfig = ROLE_CONFIG[user.role];
    const isCurrentUser = user.id === Number(currentUser?.id);

    return (
      <View style={[styles.userCard, { backgroundColor: cardBg, borderColor: border }]}>
        {/* Avatar & Info */}
        <View style={styles.userHeader}>
          <View style={[styles.avatar, { backgroundColor: `${roleConfig.color}20` }]}>
            {user.avatar ? (
              <Text style={{ fontSize: 24 }}>👤</Text>
            ) : (
              <Ionicons name="person" size={24} color={roleConfig.color} />
            )}
          </View>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={[styles.userName, { color: text }]} numberOfLines={1}>
                {user.name}
              </Text>
              {isCurrentUser && (
                <View style={[styles.currentUserBadge, { backgroundColor: primary }]}>
                  <Text style={styles.currentUserText}>Bạn</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: textMuted }]} numberOfLines={1}>
              {user.email}
            </Text>
            {user.phone && (
              <Text style={[styles.userPhone, { color: textMuted }]}>
                📱 {user.phone}
              </Text>
            )}
          </View>
        </View>

        {/* Role Badge */}
        <View style={styles.roleRow}>
          <View style={[styles.roleBadge, { backgroundColor: `${roleConfig.color}15` }]}>
            <Ionicons name={roleConfig.icon} size={16} color={roleConfig.color} />
            <Text style={[styles.roleText, { color: roleConfig.color }]}>
              {roleConfig.label}
            </Text>
          </View>
          <Text style={[styles.roleDescription, { color: textMuted }]}>
            {roleConfig.description}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: primary }]}
            onPress={() => {
              setSelectedUser(user);
              setShowRoleModal(true);
            }}
            disabled={user.loading || isCurrentUser}
          >
            {user.loading ? (
              <ActivityIndicator size="small" color={primary} />
            ) : (
              <>
                <Ionicons name="key-outline" size={18} color={primary} />
                <Text style={[styles.actionButtonText, { color: primary }]}>
                  Đổi vai trò
                </Text>
              </>
            )}
          </TouchableOpacity>

          {!isCurrentUser && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteUser(user)}
              disabled={user.loading}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!isAdminUser) {
    return null; // Already showed alert
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quản lý tài khoản',
          headerBackTitle: 'Quay lại',
        }}
      />

      <Container>
        <View style={[styles.container, { backgroundColor: background }]}>
          {/* Header Stats */}
          <View style={[styles.statsContainer, { backgroundColor: cardBg }]}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: primary }]}>
                {users.length}
              </Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>
                Tổng số
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: ROLE_CONFIG.ADMIN.color }]}>
                {users.filter(u => u.role === 'ADMIN').length}
              </Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Admin</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: ROLE_CONFIG.ENGINEER.color }]}>
                {users.filter(u => u.role === 'ENGINEER').length}
              </Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Kỹ sư</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: ROLE_CONFIG.CLIENT.color }]}>
                {users.filter(u => u.role === 'CLIENT').length}
              </Text>
              <Text style={[styles.statLabel, { color: textMuted }]}>Khách</Text>
            </View>
          </View>

          {/* Search & Filter */}
          <View style={styles.filterContainer}>
            <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: border }]}>
              <Ionicons name="search-outline" size={20} color={textMuted} />
              <TextInput
                style={[styles.searchInput, { color: text }]}
                placeholder="Tìm kiếm theo tên, email..."
                placeholderTextColor={textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleFilters}>
              <TouchableOpacity
                style={[
                  styles.roleFilter,
                  selectedRole === 'ALL' && { backgroundColor: primary },
                  { borderColor: border },
                ]}
                onPress={() => setSelectedRole('ALL')}
              >
                <Text
                  style={[
                    styles.roleFilterText,
                    { color: selectedRole === 'ALL' ? '#fff' : textMuted },
                  ]}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>

              {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleFilter,
                    selectedRole === role && { backgroundColor: ROLE_CONFIG[role].color },
                    { borderColor: border },
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Ionicons
                    name={ROLE_CONFIG[role].icon}
                    size={16}
                    color={selectedRole === role ? '#fff' : ROLE_CONFIG[role].color}
                  />
                  <Text
                    style={[
                      styles.roleFilterText,
                      { color: selectedRole === role ? '#fff' : textMuted },
                    ]}
                  >
                    {ROLE_CONFIG[role].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Users List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={primary} />
              <Text style={[styles.loadingText, { color: textMuted }]}>
                Đang tải danh sách...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              renderItem={renderUserCard}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={primary}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={64} color={textMuted} />
                  <Text style={[styles.emptyText, { color: textMuted }]}>
                    {searchQuery || selectedRole !== 'ALL'
                      ? 'Không tìm thấy người dùng'
                      : 'Chưa có người dùng nào'}
                  </Text>
                </View>
              }
            />
          )}

          {/* Role Change Modal */}
          <Modal
            visible={showRoleModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowRoleModal(false)}
          >
            <Pressable
              style={styles.modalOverlay}
              onPress={() => setShowRoleModal(false)}
            >
              <Pressable style={[styles.modalContent, { backgroundColor: cardBg }]}>
                <Text style={[styles.modalTitle, { color: text }]}>
                  Thay đổi vai trò
                </Text>
                <Text style={[styles.modalSubtitle, { color: textMuted }]}>
                  {selectedUser?.name}
                </Text>

                <View style={styles.roleOptions}>
                  {(Object.keys(ROLE_CONFIG) as UserRole[]).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        { borderColor: border },
                        selectedUser?.role === role && {
                          borderColor: ROLE_CONFIG[role].color,
                          backgroundColor: `${ROLE_CONFIG[role].color}10`,
                        },
                      ]}
                      onPress={() => {
                        if (selectedUser) {
                          handleChangeRole(selectedUser.id, role);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.roleOptionIcon,
                          { backgroundColor: `${ROLE_CONFIG[role].color}20` },
                        ]}
                      >
                        <Ionicons
                          name={ROLE_CONFIG[role].icon}
                          size={24}
                          color={ROLE_CONFIG[role].color}
                        />
                      </View>
                      <View style={styles.roleOptionInfo}>
                        <Text style={[styles.roleOptionLabel, { color: text }]}>
                          {ROLE_CONFIG[role].label}
                        </Text>
                        <Text style={[styles.roleOptionDesc, { color: textMuted }]}>
                          {ROLE_CONFIG[role].description}
                        </Text>
                      </View>
                      {selectedUser?.role === role && (
                        <Ionicons name="checkmark-circle" size={24} color={ROLE_CONFIG[role].color} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.modalCloseButton, { borderColor: border }]}
                  onPress={() => setShowRoleModal(false)}
                >
                  <Text style={[styles.modalCloseText, { color: text }]}>Hủy</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  filterContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  roleFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  roleFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
  roleFilterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    gap: 12,
    paddingBottom: 20,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  userHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  currentUserBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  currentUserText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
  },
  userPhone: {
    fontSize: 13,
  },
  roleRow: {
    gap: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  deleteButton: {
    borderColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  roleOptions: {
    gap: 12,
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  roleOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleOptionInfo: {
    flex: 1,
  },
  roleOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  roleOptionDesc: {
    fontSize: 12,
  },
  modalCloseButton: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
