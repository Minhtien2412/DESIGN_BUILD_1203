import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'contractor' | 'admin';
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  profileImage?: string;
  location?: string;
  specialties?: string[];
  rating?: number;
  projectsCount?: number;
  isVerified: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalContractors: number;
  totalProjects: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    contractors: number;
    projects: number;
    revenue: number;
  };
  recentActivities: AdminActivity[];
}

export interface AdminActivity {
  id: string;
  type: 'user_registered' | 'project_completed' | 'contractor_verified' | 'payment_processed' | 'report_submitted';
  title: string;
  description: string;
  timestamp: Date;
  userId?: string;
  severity: 'info' | 'warning' | 'success' | 'error';
}

interface AdminDashboardProps {
  stats: AdminStats;
  users: User[];
  onUpdateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  onVerifyContractor: (userId: string) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onRefreshData: () => Promise<void>;
  onExportData: (type: 'users' | 'contractors' | 'activities') => Promise<void>;
}

const USER_FILTERS = [
  { key: 'all', label: 'Tất cả', icon: 'people-outline' },
  { key: 'users', label: 'Khách hàng', icon: 'person-outline' },
  { key: 'contractors', label: 'Nhà thầu', icon: 'construct-outline' },
  { key: 'pending', label: 'Chờ duyệt', icon: 'time-outline' },
  { key: 'inactive', label: 'Không hoạt động', icon: 'ban-outline' },
];

const ACTIVITY_ICONS = {
  user_registered: 'person-add-outline',
  project_completed: 'checkmark-circle-outline',
  contractor_verified: 'shield-checkmark-outline',
  payment_processed: 'card-outline',
  report_submitted: 'flag-outline',
};

const ACTIVITY_COLORS = {
  info: '#3B82F6',
  warning: '#0066CC',
  success: '#0066CC',
  error: '#000000',
};

export function AdminDashboard({
  stats,
  users,
  onUpdateUserStatus,
  onVerifyContractor,
  onDeleteUser,
  onRefreshData,
  onExportData,
}: AdminDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activities'>('overview');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedFilter) {
      case 'users':
        return user.role === 'user' && matchesSearch;
      case 'contractors':
        return user.role === 'contractor' && matchesSearch;
      case 'pending':
        return !user.isVerified && user.role === 'contractor' && matchesSearch;
      case 'inactive':
        return !user.isActive && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleUserAction = async (action: 'activate' | 'deactivate' | 'verify' | 'delete', user: User) => {
    try {
      switch (action) {
        case 'activate':
          await onUpdateUserStatus(user.id, true);
          break;
        case 'deactivate':
          await onUpdateUserStatus(user.id, false);
          break;
        case 'verify':
          await onVerifyContractor(user.id);
          break;
        case 'delete':
          Alert.alert(
            'Xóa người dùng',
            `Bạn có chắc chắn muốn xóa ${user.name}? Hành động này không thể hoàn tác.`,
            [
              { text: 'Hủy', style: 'cancel' },
              { text: 'Xóa', style: 'destructive', onPress: () => onDeleteUser(user.id) },
            ]
          );
          break;
      }
      setShowUserModal(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thực hiện thao tác');
    }
  };

  const renderStatsCard = (title: string, value: string, growth: number, icon: string, color: string) => (
    <View style={[styles.statsCard, { backgroundColor }]}>
      <View style={styles.statsHeader}>
        <View style={[styles.statsIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={24} color="white" />
        </View>
        <View style={[styles.growthBadge, { 
          backgroundColor: growth >= 0 ? '#DCFCE7' : '#FEE2E2' 
        }]}>
          <Ionicons 
            name={growth >= 0 ? 'trending-up' : 'trending-down'} 
            size={12} 
            color={growth >= 0 ? '#16A34A' : '#000000'} 
          />
          <Text style={[styles.growthText, { 
            color: growth >= 0 ? '#16A34A' : '#000000' 
          }]}>
            {Math.abs(growth)}%
          </Text>
        </View>
      </View>
      <Text style={[styles.statsValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statsTitle, { color: textColor }]}>{title}</Text>
    </View>
  );

  const renderUserCard = ({ item: user }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userCard, { backgroundColor }]}
      onPress={() => {
        setSelectedUser(user);
        setShowUserModal(true);
      }}
    >
      <View style={styles.userHeader}>
        <View style={[styles.userAvatar, { backgroundColor: primaryColor }]}>
          <Text style={styles.userAvatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: textColor }]} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={[styles.userEmail, { color: textColor }]} numberOfLines={1}>
            {user.email}
          </Text>
          <Text style={[styles.userRole, { 
            color: user.role === 'contractor' ? '#0066CC' : '#6B7280' 
          }]}>
            {user.role === 'contractor' ? 'Nhà thầu' : 'Khách hàng'}
          </Text>
        </View>
        <View style={styles.userStatus}>
          <View style={[styles.statusDot, { 
            backgroundColor: user.isActive ? '#0066CC' : '#000000' 
          }]} />
          {user.role === 'contractor' && !user.isVerified && (
            <View style={[styles.verificationBadge, { backgroundColor: '#0066CC' }]}>
              <Text style={styles.verificationText}>Chờ duyệt</Text>
            </View>
          )}
        </View>
      </View>
      
      {user.role === 'contractor' && (
        <View style={styles.contractorStats}>
          <View style={styles.contractorStat}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={[styles.contractorStatText, { color: textColor }]}>
              {user.rating?.toFixed(1) || 'N/A'}
            </Text>
          </View>
          <View style={styles.contractorStat}>
            <Ionicons name="construct" size={12} color={primaryColor} />
            <Text style={[styles.contractorStatText, { color: textColor }]}>
              {user.projectsCount || 0} dự án
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderActivityItem = ({ item: activity }: { item: AdminActivity }) => (
    <View style={[styles.activityCard, { backgroundColor }]}>
      <View style={[styles.activityIcon, { 
        backgroundColor: ACTIVITY_COLORS[activity.severity] 
      }]}>
        <Ionicons 
          name={ACTIVITY_ICONS[activity.type] as any} 
          size={16} 
          color="white" 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: textColor }]}>
          {activity.title}
        </Text>
        <Text style={[styles.activityDescription, { color: textColor }]}>
          {activity.description}
        </Text>
        <Text style={[styles.activityTime, { color: textColor }]}>
          {activity.timestamp.toLocaleString('vi-VN')}
        </Text>
      </View>
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatsCard(
          'Tổng người dùng', 
          stats.totalUsers.toLocaleString(), 
          stats.monthlyGrowth.users, 
          'people-outline',
          '#3B82F6'
        )}
        {renderStatsCard(
          'Nhà thầu', 
          stats.totalContractors.toLocaleString(), 
          stats.monthlyGrowth.contractors, 
          'construct-outline',
          '#0066CC'
        )}
        {renderStatsCard(
          'Dự án', 
          stats.totalProjects.toLocaleString(), 
          stats.monthlyGrowth.projects, 
          'folder-outline',
          '#0066CC'
        )}
        {renderStatsCard(
          'Doanh thu', 
          `${stats.totalRevenue.toLocaleString()}đ`, 
          stats.monthlyGrowth.revenue, 
          'cash-outline',
          '#666666'
        )}
      </View>

      {/* Recent Activities */}
      <View style={styles.recentActivities}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Hoạt động gần đây
          </Text>
          <TouchableOpacity
            style={[styles.viewAllButton, { backgroundColor: primaryColor }]}
            onPress={() => setShowActivitiesModal(true)}
          >
            <Text style={styles.viewAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        {stats.recentActivities.slice(0, 5).map(activity => (
          <View key={activity.id}>
            {renderActivityItem({ item: activity })}
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          Thao tác nhanh
        </Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={() => onExportData('users')}
          >
            <Ionicons name="download-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Xuất dữ liệu người dùng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#0066CC' }]}
            onPress={() => onExportData('contractors')}
          >
            <Ionicons name="construct-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Xuất dữ liệu nhà thầu</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#0066CC' }]}
            onPress={() => onExportData('activities')}
          >
            <Ionicons name="analytics-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Xuất báo cáo hoạt động</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderUsersTab = () => (
    <View style={{ flex: 1 }}>
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Tìm kiếm người dùng..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        {USER_FILTERS.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              selectedFilter === filter.key && { backgroundColor: primaryColor }
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Ionicons 
              name={filter.icon as any} 
              size={16} 
              color={selectedFilter === filter.key ? 'white' : textColor} 
            />
            <Text style={[
              styles.filterTabText,
              { color: selectedFilter === filter.key ? 'white' : textColor }
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.usersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#9CA3AF" />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              Không tìm thấy người dùng
            </Text>
            <Text style={[styles.emptyDescription, { color: textColor }]}>
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
            </Text>
          </View>
        }
      />
    </View>
  );

  const renderUserModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      onRequestClose={() => setShowUserModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowUserModal(false)}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Chi tiết người dùng
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedUser && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.userDetails}>
              <View style={[styles.largeUserAvatar, { backgroundColor: primaryColor }]}>
                <Text style={styles.largeUserAvatarText}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <Text style={[styles.userDetailName, { color: textColor }]}>
                {selectedUser.name}
              </Text>
              <Text style={[styles.userDetailRole, { color: textColor }]}>
                {selectedUser.role === 'contractor' ? 'Nhà thầu' : 'Khách hàng'}
              </Text>

              <View style={styles.userDetailInfo}>
                <Text style={[styles.userDetailLabel, { color: textColor }]}>Email:</Text>
                <Text style={[styles.userDetailValue, { color: textColor }]}>
                  {selectedUser.email}
                </Text>
              </View>

              <View style={styles.userDetailInfo}>
                <Text style={[styles.userDetailLabel, { color: textColor }]}>Điện thoại:</Text>
                <Text style={[styles.userDetailValue, { color: textColor }]}>
                  {selectedUser.phone}
                </Text>
              </View>

              {selectedUser.location && (
                <View style={styles.userDetailInfo}>
                  <Text style={[styles.userDetailLabel, { color: textColor }]}>Địa chỉ:</Text>
                  <Text style={[styles.userDetailValue, { color: textColor }]}>
                    {selectedUser.location}
                  </Text>
                </View>
              )}

              <View style={styles.userDetailInfo}>
                <Text style={[styles.userDetailLabel, { color: textColor }]}>Trạng thái:</Text>
                <Text style={[styles.userDetailValue, { 
                  color: selectedUser.isActive ? '#0066CC' : '#000000' 
                }]}>
                  {selectedUser.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </Text>
              </View>

              <View style={styles.userDetailInfo}>
                <Text style={[styles.userDetailLabel, { color: textColor }]}>Đăng ký:</Text>
                <Text style={[styles.userDetailValue, { color: textColor }]}>
                  {selectedUser.createdAt.toLocaleDateString('vi-VN')}
                </Text>
              </View>

              {selectedUser.lastLoginAt && (
                <View style={styles.userDetailInfo}>
                  <Text style={[styles.userDetailLabel, { color: textColor }]}>Đăng nhập cuối:</Text>
                  <Text style={[styles.userDetailValue, { color: textColor }]}>
                    {selectedUser.lastLoginAt.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              )}

              {selectedUser.role === 'contractor' && (
                <>
                  <View style={styles.userDetailInfo}>
                    <Text style={[styles.userDetailLabel, { color: textColor }]}>Đánh giá:</Text>
                    <Text style={[styles.userDetailValue, { color: textColor }]}>
                      {selectedUser.rating?.toFixed(1) || 'Chưa có'} ⭐
                    </Text>
                  </View>

                  <View style={styles.userDetailInfo}>
                    <Text style={[styles.userDetailLabel, { color: textColor }]}>Số dự án:</Text>
                    <Text style={[styles.userDetailValue, { color: textColor }]}>
                      {selectedUser.projectsCount || 0}
                    </Text>
                  </View>

                  <View style={styles.userDetailInfo}>
                    <Text style={[styles.userDetailLabel, { color: textColor }]}>Xác minh:</Text>
                    <Text style={[styles.userDetailValue, { 
                      color: selectedUser.isVerified ? '#0066CC' : '#0066CC' 
                    }]}>
                      {selectedUser.isVerified ? 'Đã xác minh' : 'Chờ xác minh'}
                    </Text>
                  </View>

                  {selectedUser.specialties && selectedUser.specialties.length > 0 && (
                    <View style={styles.userDetailInfo}>
                      <Text style={[styles.userDetailLabel, { color: textColor }]}>Chuyên môn:</Text>
                      <View style={styles.specialtiesList}>
                        {selectedUser.specialties.map((specialty, index) => (
                          <View key={index} style={[styles.specialtyTag, { borderColor: primaryColor }]}>
                            <Text style={[styles.specialtyText, { color: primaryColor }]}>
                              {specialty}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.userActionButton, { 
                  backgroundColor: selectedUser.isActive ? '#000000' : '#0066CC' 
                }]}
                onPress={() => handleUserAction(
                  selectedUser.isActive ? 'deactivate' : 'activate',
                  selectedUser
                )}
              >
                <Text style={styles.userActionText}>
                  {selectedUser.isActive ? 'Tạm khóa' : 'Kích hoạt'}
                </Text>
              </TouchableOpacity>

              {selectedUser.role === 'contractor' && !selectedUser.isVerified && (
                <TouchableOpacity
                  style={[styles.userActionButton, { backgroundColor: '#0066CC' }]}
                  onPress={() => handleUserAction('verify', selectedUser)}
                >
                  <Text style={styles.userActionText}>Xác minh</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.userActionButton, { backgroundColor: '#000000' }]}
                onPress={() => handleUserAction('delete', selectedUser)}
              >
                <Text style={styles.userActionText}>Xóa tài khoản</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  const renderActivitiesModal = () => (
    <Modal
      visible={showActivitiesModal}
      animationType="slide"
      onRequestClose={() => setShowActivitiesModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowActivitiesModal(false)}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: textColor }]}>
            Tất cả hoạt động
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={stats.recentActivities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.activitiesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && { backgroundColor: primaryColor }]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons 
            name="analytics-outline" 
            size={20} 
            color={activeTab === 'overview' ? 'white' : textColor} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'overview' ? 'white' : textColor }
          ]}>
            Tổng quan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && { backgroundColor: primaryColor }]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons 
            name="people-outline" 
            size={20} 
            color={activeTab === 'users' ? 'white' : textColor} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'users' ? 'white' : textColor }
          ]}>
            Người dùng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'users' && renderUsersTab()}
      </View>

      {/* Modals */}
      {renderUserModal()}
      {renderActivitiesModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statsCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  recentActivities: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  quickActions: {
    padding: 16,
  },
  actionsGrid: {
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterTabs: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  usersList: {
    padding: 16,
  },
  userCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  verificationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  contractorStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  contractorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contractorStatText: {
    fontSize: 11,
    opacity: 0.8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 11,
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  userDetails: {
    alignItems: 'center',
    marginBottom: 30,
  },
  largeUserAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeUserAvatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '600',
  },
  userDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userDetailRole: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 20,
  },
  userDetailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  userDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 120,
  },
  userDetailValue: {
    fontSize: 14,
    flex: 1,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    gap: 6,
  },
  specialtyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userActions: {
    gap: 12,
  },
  userActionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  userActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activitiesList: {
    padding: 20,
  },
});
