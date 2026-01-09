/**
 * Staff Management Screen - Perfex CRM Style
 * ===========================================
 * 
 * Quản lý nhân viên:
 * - Staff list với search
 * - Role & permissions
 * - Performance stats
 * - Task assignments
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useStaff } from '@/hooks/usePerfexAPI';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import Staff type from perfex types
import type { Staff as PerfexStaff } from '@/types/perfex';

// Extended Staff interface for UI display
interface Staff extends PerfexStaff {
  // UI display properties (computed from API data)
}

const ROLES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'admin', label: 'Admin' },
  { id: 'manager', label: 'Manager' },
  { id: 'developer', label: 'Developer' },
  { id: 'designer', label: 'Designer' },
  { id: 'support', label: 'Support' },
];

export default function StaffScreen() {
  const { 
    staff, 
    stats, 
    loading, 
    error, 
    refresh, 
    createStaff, 
    updateStaff, 
    deleteStaff 
  } = useStaff();
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Loading state
  if (loading && staff.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Staff</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={{ color: textColor, marginTop: 16 }}>Đang tải dữ liệu...</Text>
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
          <Text style={[styles.headerTitle, { color: textColor }]}>Staff</Text>
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={22} color={primaryColor} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={{ color: '#EF4444', marginTop: 16, fontSize: 16 }}>Lỗi tải dữ liệu</Text>
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

  const getStatusColor = (active: string): string => {
    return active === '1' ? '#22c55e' : '#6b7280';
  };

  const getStatusLabel = (active: string): string => {
    return active === '1' ? 'Đang hoạt động' : 'Ngừng hoạt động';
  };

  const getRoleColor = (role?: string): string => {
    const colors: Record<string, string> = {
      '1': '#ef4444', // admin
      '2': '#8b5cf6', // manager
      '3': '#3b82f6', // developer
      '4': '#ec4899', // designer
      '5': '#06b6d4', // support
    };
    return colors[role || ''] || '#6b7280';
  };

  const getRoleLabel = (role?: string): string => {
    const labels: Record<string, string> = {
      '1': 'Admin',
      '2': 'Manager',
      '3': 'Developer',
      '4': 'Designer',
      '5': 'Support',
    };
    return labels[role || ''] || 'Staff';
  };

  const formatLastActive = (dateStr?: string): string => {
    if (!dateStr) return 'Chưa xác định';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

  const filteredStaff = staff.filter((s: Staff) => {
    const matchesSearch =
      `${s.firstname} ${s.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || s.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Stats - using hook stats
  const activeCount = stats.active;
  const totalStaff = stats.total;

  const renderStaffCard = ({ item }: { item: Staff }) => (
    <TouchableOpacity
      style={[styles.staffCard, { backgroundColor: cardBg, borderColor }]}
      onPress={() => {
        setSelectedStaff(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.staffHeader}>
        {item.profile_image ? (
          <Image source={{ uri: item.profile_image }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.avatarText}>{getInitials(item.firstname, item.lastname)}</Text>
          </View>
        )}
        <View style={styles.staffInfo}>
          <Text style={[styles.staffName, { color: textColor }]}>
            {item.firstname} {item.lastname}
          </Text>
          <View style={styles.roleBadgeRow}>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                {getRoleLabel(item.role)}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.active) }]} />
      </View>

      <View style={styles.staffStats}>
        <View style={styles.statItem}>
          <Ionicons name="mail-outline" size={16} color="#3b82f6" />
          <Text style={[styles.statValue, { color: textColor }]} numberOfLines={1}>{item.email}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="call-outline" size={16} color="#22c55e" />
          <Text style={[styles.statValue, { color: textColor }]}>{item.phonenumber || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.staffFooter}>
        <Ionicons name="time-outline" size={14} color="#6b7280" />
        <Text style={[styles.lastActiveText, { color: textColor }]}>
          {formatLastActive(item.last_activity)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Nhân viên</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: primaryColor }]}>
          <Ionicons name="person-add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <View style={styles.statsItem}>
          <Text style={[styles.statsValue, { color: '#3b82f6' }]}>{staff.length}</Text>
          <Text style={[styles.statsLabel, { color: textColor }]}>Tổng</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={[styles.statsValue, { color: '#22c55e' }]}>{activeCount}</Text>
          <Text style={[styles.statsLabel, { color: textColor }]}>Hoạt động</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={[styles.statsValue, { color: '#f59e0b' }]}>{totalStaff}</Text>
          <Text style={[styles.statsLabel, { color: textColor }]}>Tổng</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { borderBottomColor: borderColor }]}>
        <View style={[styles.searchBar, { backgroundColor: cardBg, borderColor }]}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm kiếm nhân viên..."
            placeholderTextColor="#6b7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role Filter */}
      <View style={[styles.filterBar, { borderBottomColor: borderColor }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ROLES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { borderColor },
                selectedRole === item.id && { backgroundColor: primaryColor, borderColor: primaryColor },
              ]}
              onPress={() => setSelectedRole(item.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedRole === item.id ? '#fff' : textColor },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Staff List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          renderItem={renderStaffCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#6b7280" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Không tìm thấy nhân viên</Text>
              <Text style={[styles.emptyText, { color: textColor }]}>
                {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có nhân viên nào'}
              </Text>
            </View>
          }
        />
      )}

      {/* Staff Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            {selectedStaff && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                    <Ionicons name="close" size={24} color={textColor} />
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: textColor }]}>Chi tiết nhân viên</Text>
                  <TouchableOpacity>
                    <Ionicons name="create-outline" size={24} color={primaryColor} />
                  </TouchableOpacity>
                </View>

                <View style={styles.profileSection}>
                  {selectedStaff.profile_image ? (
                    <Image source={{ uri: selectedStaff.profile_image }} style={styles.profileAvatar} />
                  ) : (
                    <View
                      style={[
                        styles.profileAvatarPlaceholder,
                        { backgroundColor: getRoleColor(selectedStaff.role) },
                      ]}
                    >
                      <Text style={styles.profileAvatarText}>
                        {getInitials(selectedStaff.firstname, selectedStaff.lastname)}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.profileName, { color: textColor }]}>
                    {selectedStaff.firstname} {selectedStaff.lastname}
                  </Text>
                  <View style={styles.profileBadges}>
                    <View
                      style={[styles.roleBadge, { backgroundColor: getRoleColor(selectedStaff.role) + '20' }]}
                    >
                      <Text style={[styles.roleText, { color: getRoleColor(selectedStaff.role) }]}>
                        {getRoleLabel(selectedStaff.role)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(selectedStaff.active) + '20' },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: getStatusColor(selectedStaff.active) }]}>
                        {getStatusLabel(selectedStaff.active)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail" size={18} color="#6b7280" />
                    <Text style={[styles.infoText, { color: textColor }]}>{selectedStaff.email}</Text>
                  </View>
                  {selectedStaff.phonenumber && (
                    <View style={styles.infoRow}>
                      <Ionicons name="call" size={18} color="#6b7280" />
                      <Text style={[styles.infoText, { color: textColor }]}>{selectedStaff.phonenumber}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.statsSection}>
                  <Text style={[styles.statsSectionTitle, { color: textColor }]}>Thông tin</Text>
                  <View style={styles.statsGrid}>
                    <View style={[styles.statsBox, { backgroundColor: '#22c55e15' }]}>
                      <Text style={[styles.statsBoxValue, { color: '#22c55e' }]}>
                        {selectedStaff.hourly_rate || '0'}đ
                      </Text>
                      <Text style={[styles.statsBoxLabel, { color: textColor }]}>Lương/h</Text>
                    </View>
                    <View style={[styles.statsBox, { backgroundColor: '#3b82f615' }]}>
                      <Text style={[styles.statsBoxValue, { color: '#3b82f6' }]}>
                        {formatLastActive(selectedStaff.last_login)}
                      </Text>
                      <Text style={[styles.statsBoxLabel, { color: textColor }]}>Đăng nhập</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}>
                    <Ionicons name="chatbubble" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Nhắn tin</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#22c55e' }]}>
                    <Ionicons name="add-circle" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Giao việc</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterBar: {
    borderBottomWidth: 1,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  staffCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  staffInfo: {
    flex: 1,
    marginLeft: 12,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
  },
  departmentText: {
    fontSize: 12,
    opacity: 0.7,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  staffStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.7,
  },
  staffFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emailText: {
    flex: 1,
    fontSize: 12,
    opacity: 0.7,
  },
  lastActiveText: {
    fontSize: 11,
    opacity: 0.6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileAvatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 8,
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
  infoSection: {
    gap: 12,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
  },
  statsSection: {
    marginBottom: 24,
  },
  statsSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsBox: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  statsBoxValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsBoxLabel: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
