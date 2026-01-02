/**
 * Customer Projects Screen
 * Manager views customer list → clicks → sees their projects
 * Shopee seller-style order management interface
 * 
 * Role-based views:
 * - ADMIN/MANAGER: See all customers and projects
 * - CONTRACTOR/WORKER: Only see assigned projects
 * - CLIENT: Only see own projects
 */

import { useAuth } from '@/context/AuthContext';
import {
    Customer,
    CustomerProject,
    getMindmapPermission,
    MindmapRole,
    PROJECT_TYPE_CONFIG
} from '@/types/project-mindmap';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme colors
const COLORS = {
  primary: '#EE4D2D',
  primaryLight: '#FF6B4D',
  primaryDark: '#D73211',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E0E0E0',
  success: '#14B159',
  warning: '#FF9800',
  error: '#E82A34',
  info: '#2196F3',
};

// Project status config
const PROJECT_STATUS = {
  DRAFT: { label: 'Nháp', color: '#9E9E9E', bgColor: '#F5F5F5' },
  PLANNING: { label: 'Lên kế hoạch', color: '#2196F3', bgColor: '#E3F2FD' },
  IN_PROGRESS: { label: 'Đang thi công', color: '#FF9800', bgColor: '#FFF3E0' },
  PENDING_REVIEW: { label: 'Chờ nghiệm thu', color: '#9C27B0', bgColor: '#F3E5F5' },
  COMPLETED: { label: 'Hoàn thành', color: '#4CAF50', bgColor: '#E8F5E9' },
  ON_HOLD: { label: 'Tạm dừng', color: '#F44336', bgColor: '#FFEBEE' },
  CANCELLED: { label: 'Đã hủy', color: '#757575', bgColor: '#EEEEEE' },
};

type ViewMode = 'customers' | 'projects' | 'my-projects';
type ProjectFilter = 'ALL' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'ON_HOLD';

// Mock data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@email.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    totalProjects: 3,
    activeProjects: 2,
    completedProjects: 1,
    totalValue: 15500000000,
    lastActivityAt: '2024-12-20T10:30:00Z',
    createdAt: '2024-01-10',
    updatedAt: '2024-12-20',
  },
  {
    id: 'cust2',
    name: 'Trần Thị B',
    phone: '0912345678',
    email: 'tranthib@email.com',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    address: '456 Lê Lợi, Q3, TP.HCM',
    companyName: 'Công ty ABC',
    totalProjects: 2,
    activeProjects: 1,
    completedProjects: 1,
    totalValue: 8200000000,
    lastActivityAt: '2024-12-19T14:20:00Z',
    createdAt: '2024-03-15',
    updatedAt: '2024-12-19',
  },
  {
    id: 'cust3',
    name: 'Lê Văn C',
    phone: '0923456789',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    address: '789 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    totalProjects: 1,
    activeProjects: 1,
    completedProjects: 0,
    totalValue: 4500000000,
    lastActivityAt: '2024-12-18T09:15:00Z',
    createdAt: '2024-06-20',
    updatedAt: '2024-12-18',
  },
];

const MOCK_PROJECTS: CustomerProject[] = [
  {
    id: 'proj1',
    customerId: 'cust1',
    customerName: 'Nguyễn Văn A',
    name: 'Biệt thự Vinhomes Grand Park',
    description: 'Xây dựng biệt thự 3 tầng phong cách hiện đại',
    address: 'Vinhomes Grand Park, Quận 9, TP.HCM',
    projectType: 'VILLA',
    status: 'IN_PROGRESS',
    progressPercent: 65,
    estimatedBudget: 5500000000,
    plannedStartDate: '2024-01-15',
    plannedEndDate: '2024-12-31',
    actualStartDate: '2024-01-20',
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    assignedContractors: [],
    totalNodes: 15,
    completedNodes: 8,
    totalTodos: 10,
    completedTodos: 6,
    createdAt: '2024-01-10',
    updatedAt: '2024-12-20',
  },
  {
    id: 'proj2',
    customerId: 'cust1',
    customerName: 'Nguyễn Văn A',
    name: 'Nhà phố Thảo Điền',
    description: 'Xây mới nhà phố 4 tầng',
    address: 'Thảo Điền, Quận 2, TP.HCM',
    projectType: 'HOUSE',
    status: 'IN_PROGRESS',
    progressPercent: 35,
    estimatedBudget: 3800000000,
    plannedStartDate: '2024-06-01',
    plannedEndDate: '2025-03-31',
    actualStartDate: '2024-06-10',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    assignedContractors: [],
    totalNodes: 12,
    completedNodes: 4,
    totalTodos: 8,
    completedTodos: 2,
    createdAt: '2024-05-20',
    updatedAt: '2024-12-19',
  },
  {
    id: 'proj3',
    customerId: 'cust1',
    customerName: 'Nguyễn Văn A',
    name: 'Sửa chữa căn hộ Masteri',
    description: 'Sửa chữa và nâng cấp nội thất',
    address: 'Masteri Thảo Điền, Quận 2, TP.HCM',
    projectType: 'RENOVATION',
    status: 'COMPLETED',
    progressPercent: 100,
    estimatedBudget: 450000000,
    plannedStartDate: '2024-02-01',
    plannedEndDate: '2024-04-30',
    actualStartDate: '2024-02-05',
    actualEndDate: '2024-04-25',
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    assignedContractors: [],
    totalNodes: 8,
    completedNodes: 8,
    totalTodos: 5,
    completedTodos: 5,
    createdAt: '2024-01-25',
    updatedAt: '2024-04-25',
  },
  {
    id: 'proj4',
    customerId: 'cust2',
    customerName: 'Trần Thị B',
    name: 'Văn phòng Công ty ABC',
    description: 'Thiết kế và thi công nội thất văn phòng',
    address: '123 Nguyễn Đình Chiểu, Q3, TP.HCM',
    projectType: 'OFFICE',
    status: 'PENDING_REVIEW',
    progressPercent: 95,
    estimatedBudget: 1200000000,
    plannedStartDate: '2024-08-01',
    plannedEndDate: '2024-11-30',
    actualStartDate: '2024-08-05',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
    assignedContractors: [],
    totalNodes: 10,
    completedNodes: 9,
    totalTodos: 6,
    completedTodos: 5,
    createdAt: '2024-07-15',
    updatedAt: '2024-12-18',
  },
  {
    id: 'proj5',
    customerId: 'cust3',
    customerName: 'Lê Văn C',
    name: 'Nhà ở Bình Thạnh',
    description: 'Xây dựng nhà ở 3 tầng',
    address: 'Điện Biên Phủ, Bình Thạnh, TP.HCM',
    projectType: 'HOUSE',
    status: 'PLANNING',
    progressPercent: 10,
    estimatedBudget: 4500000000,
    plannedStartDate: '2025-01-15',
    plannedEndDate: '2025-10-31',
    coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    assignedContractors: [],
    totalNodes: 5,
    completedNodes: 0,
    totalTodos: 3,
    completedTodos: 0,
    createdAt: '2024-12-01',
    updatedAt: '2024-12-18',
  },
];

export default function CustomerProjectsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<CustomerProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>('ALL');
  
  // User role - determined by actual user data
  const [userRole, setUserRole] = useState<MindmapRole>('MANAGER');
  const permission = useMemo(() => getMindmapPermission(userRole), [userRole]);
  
  // View mode based on role
  const viewMode: ViewMode = useMemo(() => {
    if (permission.canViewAllCustomers) {
      return selectedCustomerId ? 'projects' : 'customers';
    }
    return 'my-projects';
  }, [permission, selectedCustomerId]);
  
  // Load data
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCustomers(MOCK_CUSTOMERS);
      setProjects(MOCK_PROJECTS);
      
      // Determine user role
      // For demo, using MANAGER role
      setUserRole('MANAGER');
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // Filter data
  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      c => c.name.toLowerCase().includes(query) ||
           c.phone.includes(query) ||
           c.email?.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);
  
  const filteredProjects = useMemo(() => {
    let result = selectedCustomerId 
      ? projects.filter(p => p.customerId === selectedCustomerId)
      : projects;
    
    if (projectFilter !== 'ALL') {
      result = result.filter(p => p.status === projectFilter);
    }
    
    if (searchQuery && !selectedCustomerId) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(query) ||
             p.address.toLowerCase().includes(query) ||
             p.customerName.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [projects, selectedCustomerId, projectFilter, searchQuery]);
  
  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );
  
  // Statistics
  const stats = useMemo(() => {
    const ps = selectedCustomerId 
      ? projects.filter(p => p.customerId === selectedCustomerId)
      : projects;
    return {
      total: ps.length,
      inProgress: ps.filter(p => p.status === 'IN_PROGRESS').length,
      pendingReview: ps.filter(p => p.status === 'PENDING_REVIEW').length,
      completed: ps.filter(p => p.status === 'COMPLETED').length,
    };
  }, [projects, selectedCustomerId]);
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} tỷ`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)} triệu`;
    }
    return value.toLocaleString('vi-VN');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };
  
  // Render customer card
  const renderCustomerCard = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => setSelectedCustomerId(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.customerHeader}>
        <Image
          source={{ uri: item.avatar || 'https://via.placeholder.com/50' }}
          style={styles.customerAvatar}
        />
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          {item.companyName && (
            <Text style={styles.customerCompany}>{item.companyName}</Text>
          )}
          <Text style={styles.customerPhone}>
            <Ionicons name="call-outline" size={12} color={COLORS.textSecondary} />
            {' '}{item.phone}
          </Text>
        </View>
        <View style={styles.customerStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{item.activeProjects}</Text>
            <Text style={styles.statLabel}>Đang làm</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.customerMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="briefcase-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{item.totalProjects} dự án</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{formatCurrency(item.totalValue)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.metaText}>{formatDate(item.lastActivityAt)}</Text>
        </View>
      </View>
      
      <View style={styles.customerArrow}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
  
  // Render project card
  const renderProjectCard = ({ item }: { item: CustomerProject }) => {
    const statusConfig = PROJECT_STATUS[item.status as keyof typeof PROJECT_STATUS];
    const typeConfig = PROJECT_TYPE_CONFIG[item.projectType];
    
    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => router.push(`/projects/timeline-mindmap?id=${item.id}`)}
        activeOpacity={0.8}
      >
        {/* Cover image */}
        <Image
          source={{ uri: item.coverImage || 'https://via.placeholder.com/400x200' }}
          style={styles.projectImage}
        />
        
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
        
        {/* Content */}
        <View style={styles.projectContent}>
          <View style={styles.projectTypeRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
              <Ionicons name={typeConfig.icon as any} size={12} color={typeConfig.color} />
              <Text style={[styles.typeText, { color: typeConfig.color }]}>
                {typeConfig.label}
              </Text>
            </View>
            {!selectedCustomerId && (
              <Text style={styles.customerLabel}>{item.customerName}</Text>
            )}
          </View>
          
          <Text style={styles.projectName} numberOfLines={2}>{item.name}</Text>
          
          <Text style={styles.projectAddress} numberOfLines={1}>
            <Ionicons name="location-outline" size={12} color={COLORS.textSecondary} />
            {' '}{item.address}
          </Text>
          
          {/* Progress */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ</Text>
              <Text style={styles.progressValue}>{item.progressPercent}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${item.progressPercent}%`,
                    backgroundColor: item.progressPercent === 100 
                      ? COLORS.success 
                      : item.progressPercent > 50 
                        ? COLORS.warning 
                        : COLORS.primary
                  }
                ]} 
              />
            </View>
          </View>
          
          {/* Stats row */}
          <View style={styles.projectStats}>
            <View style={styles.projectStat}>
              <MaterialCommunityIcons name="file-tree" size={14} color={COLORS.textSecondary} />
              <Text style={styles.projectStatText}>
                {item.completedNodes}/{item.totalNodes} nodes
              </Text>
            </View>
            <View style={styles.projectStat}>
              <Ionicons name="checkbox-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.projectStatText}>
                {item.completedTodos}/{item.totalTodos} todos
              </Text>
            </View>
            <View style={styles.projectStat}>
              <Ionicons name="cash-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.projectStatText}>
                {formatCurrency(item.estimatedBudget)}
              </Text>
            </View>
          </View>
          
          {/* Timeline */}
          <View style={styles.timelineRow}>
            <Text style={styles.timelineText}>
              {formatDate(item.plannedStartDate)} - {formatDate(item.plannedEndDate)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {[
        { key: 'ALL', label: 'Tất cả', count: stats.total },
        { key: 'IN_PROGRESS', label: 'Đang làm', count: stats.inProgress },
        { key: 'PENDING_REVIEW', label: 'Chờ nghiệm thu', count: stats.pendingReview },
        { key: 'COMPLETED', label: 'Hoàn thành', count: stats.completed },
      ].map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterChip,
            projectFilter === filter.key && styles.filterChipActive,
          ]}
          onPress={() => setProjectFilter(filter.key as ProjectFilter)}
        >
          <Text 
            style={[
              styles.filterChipText,
              projectFilter === filter.key && styles.filterChipTextActive,
            ]}
          >
            {filter.label}
          </Text>
          <View 
            style={[
              styles.filterBadge,
              projectFilter === filter.key && styles.filterBadgeActive,
            ]}
          >
            <Text 
              style={[
                styles.filterBadgeText,
                projectFilter === filter.key && styles.filterBadgeTextActive,
              ]}
            >
              {filter.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          {selectedCustomerId ? (
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => setSelectedCustomerId(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.menuBtn}>
              <Ionicons name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <Text style={styles.headerTitle}>
            {viewMode === 'customers' 
              ? 'Quản lý khách hàng'
              : selectedCustomer?.name || 'Dự án của tôi'}
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionBtn}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            {permission.canCreateProject && (
              <TouchableOpacity 
                style={styles.headerActionBtn}
                onPress={() => router.push('/projects/create')}
              >
                <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={viewMode === 'customers' 
              ? 'Tìm khách hàng...' 
              : 'Tìm dự án...'}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Selected customer info */}
        {selectedCustomer && (
          <View style={styles.selectedCustomerInfo}>
            <Image
              source={{ uri: selectedCustomer.avatar || 'https://via.placeholder.com/40' }}
              style={styles.selectedCustomerAvatar}
            />
            <View style={styles.selectedCustomerDetails}>
              <Text style={styles.selectedCustomerName}>{selectedCustomer.name}</Text>
              <Text style={styles.selectedCustomerPhone}>{selectedCustomer.phone}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
      
      {/* Stats cards (for projects view) */}
      {viewMode !== 'customers' && (
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.statCardNumber}>{stats.total}</Text>
            <Text style={styles.statCardLabel}>Tổng dự án</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
            <Text style={styles.statCardNumber}>{stats.inProgress}</Text>
            <Text style={styles.statCardLabel}>Đang làm</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#9C27B0' }]}>
            <Text style={styles.statCardNumber}>{stats.pendingReview}</Text>
            <Text style={styles.statCardLabel}>Chờ duyệt</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
            <Text style={styles.statCardNumber}>{stats.completed}</Text>
            <Text style={styles.statCardLabel}>Hoàn thành</Text>
          </View>
        </View>
      )}
      
      {/* Filter chips (for projects view) */}
      {viewMode !== 'customers' && renderFilterChips()}
      
      {/* Content */}
      {viewMode === 'customers' ? (
        // Customers list
        <FlatList
          data={filteredCustomers}
          keyExtractor={item => item.id}
          renderItem={renderCustomerCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Không tìm thấy khách hàng</Text>
            </View>
          }
        />
      ) : (
        // Projects list
        <FlatList
          data={filteredProjects}
          keyExtractor={item => item.id}
          renderItem={renderProjectCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>Không có dự án nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  menuBtn: {
    padding: 4,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionBtn: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  selectedCustomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  selectedCustomerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedCustomerDetails: {
    flex: 1,
    marginLeft: 10,
  },
  selectedCustomerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedCustomerPhone: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    alignItems: 'center',
  },
  statCardNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statCardLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Filters
  filterContainer: {
    maxHeight: 44,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  
  // List
  listContent: {
    padding: 16,
  },
  
  // Customer card
  customerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  customerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  customerCompany: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 1,
  },
  customerPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  customerStats: {
    alignItems: 'flex-end',
  },
  statBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.warning,
  },
  statLabel: {
    fontSize: 9,
    color: COLORS.warning,
  },
  customerMeta: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  customerArrow: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -10,
  },
  
  // Project card
  projectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  projectImage: {
    width: '100%',
    height: 140,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  projectContent: {
    padding: 14,
  },
  projectTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  customerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  projectAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  progressSection: {
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  projectStatText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  timelineRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  timelineText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
