/**
 * Construction Progress Dashboard Screen
 * Main screen showing all projects with progress, status, role-based actions
 * UI inspired by Shopee order management
 * 🔥 UPDATED: Now uses real data from Perfex CRM
 */

import { useAuth } from '@/context/AuthContext';
import {
    PerfexProject,
    PerfexProjectsService,
} from '@/services/perfexCRM';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    ConstructionProject,
    ProgressRole,
    PROJECT_STATUS_CONFIG,
    ProjectStatus,
    ROLE_PERMISSIONS
} from '@/types/construction-progress';

const { width } = Dimensions.get('window');

// Theme colors
const COLORS = {
  primary: '#0066CC',
  primaryDark: '#004499',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E8E8E8',
  success: '#00C853',
  warning: '#0066CC',
  error: '#000000',
  info: '#0066CC',
};

// Status tabs
const STATUS_TABS: { key: ProjectStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'IN_PROGRESS', label: 'Đang thi công' },
  { key: 'PENDING_REVIEW', label: 'Chờ nghiệm thu' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'ON_HOLD', label: 'Tạm dừng' },
];

// Map Perfex status to UI status
function mapPerfexStatus(status: number): ProjectStatus {
  switch (status) {
    case 1: return 'PLANNING';
    case 2: return 'IN_PROGRESS';
    case 3: return 'ON_HOLD';
    case 4: return 'PLANNING'; // Cancelled mapped to Planning
    case 5: return 'COMPLETED';
    default: return 'PLANNING';
  }
}

// Convert Perfex Project to ConstructionProject
function mapPerfexToConstruction(p: PerfexProject): ConstructionProject {
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    address: '', // Not in Perfex by default
    projectType: 'Dự án',
    totalArea: 0,
    estimatedBudget: parseFloat(p.project_cost || '0'),
    status: mapPerfexStatus(p.status),
    progressPercent: p.progress_from_tasks || p.progress || 0,
    plannedStartDate: p.start_date,
    plannedEndDate: p.deadline || '',
    actualStartDate: p.start_date,
    actualEndDate: p.date_finished || undefined,
    members: [],
    ownerId: p.clientid,
    tasks: [],
    totalTasks: 0,
    completedTasks: 0,
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    media: [],
    createdAt: p.project_created,
    updatedAt: p.project_created,
    createdBy: String(p.addedfrom),
  };
}

export default function ProgressDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState<ConstructionProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ProjectStatus | 'ALL'>('ALL');
  const [dataSource, setDataSource] = useState<'crm' | 'mock'>('mock');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pendingActions: 0,
  });
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // User role (for demo, use MANAGER)
  const userRole: ProgressRole = (user?.role as ProgressRole) || 'MANAGER';
  const permissions = ROLE_PERMISSIONS[userRole];

  // Load projects from CRM
  const loadProjects = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      // 🔥 Fetch từ Perfex CRM
      const response = await PerfexProjectsService.getAll({ limit: 100 });
      
      if (response.data && response.data.length > 0) {
        const mappedProjects = response.data.map(mapPerfexToConstruction);
        setProjects(mappedProjects);
        setDataSource('crm');
        
        // Calculate stats từ real data
        setStats({
          total: mappedProjects.length,
          active: mappedProjects.filter(p => p.status === 'IN_PROGRESS').length,
          completed: mappedProjects.filter(p => p.status === 'COMPLETED').length,
          pendingActions: mappedProjects.filter(p => p.status === 'PENDING_REVIEW' || p.status === 'ON_HOLD').length,
        });
        
        console.log(`✅ Loaded ${mappedProjects.length} projects from CRM`);
      } else {
        throw new Error('No data from CRM');
      }
      
    } catch (error) {
      console.warn('⚠️ CRM failed, using fallback mock data:', error);
      // Fallback mock data nếu CRM fail
      const FALLBACK_PROJECTS: ConstructionProject[] = [
        {
          id: '1',
          name: 'Biệt thự Vinhomes Grand Park',
          description: 'Xây dựng biệt thự 3 tầng phong cách hiện đại',
          address: 'Quận 9, TP.HCM',
          projectType: 'Biệt thự',
          totalArea: 450,
          totalFloors: 3,
          estimatedBudget: 5500000000,
          status: 'IN_PROGRESS',
          progressPercent: 65,
          plannedStartDate: '2024-01-15',
          plannedEndDate: '2024-12-31',
          actualStartDate: '2024-01-20',
          members: [],
          ownerId: 'client1',
          tasks: [],
          totalTasks: 24,
          completedTasks: 15,
          coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          media: [],
          createdAt: '2024-01-10',
          updatedAt: '2024-12-20',
          createdBy: 'manager1',
        },
      ];
      setProjects(FALLBACK_PROJECTS);
      setDataSource('mock');
      setStats({
        total: FALLBACK_PROJECTS.length,
        active: FALLBACK_PROJECTS.filter(p => p.status === 'IN_PROGRESS').length,
        completed: FALLBACK_PROJECTS.filter(p => p.status === 'COMPLETED').length,
        pendingActions: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter projects by tab
  const filteredProjects = selectedTab === 'ALL' 
    ? projects 
    : projects.filter(p => p.status === selectedTab);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    }
    return `${(amount / 1000000).toFixed(0)} triệu`;
  };

  // Render stat card
  const renderStatCard = (
    icon: string, 
    label: string, 
    value: number, 
    color: string,
    delay: number
  ) => (
    <Animated.View 
      style={[
        styles.statCard,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(delay / 100)) }]
        }
      ]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );

  // Render project card
  const renderProjectCard = ({ item, index }: { item: ConstructionProject; index: number }) => {
    const statusConfig = PROJECT_STATUS_CONFIG[item.status] || {
      label: item.status || 'Unknown',
      color: '#999999',
      bgColor: '#F5F5F5',
      icon: 'ellipse-outline',
      order: 0,
    };
    const isOverdue = new Date(item.plannedEndDate) < new Date() && item.status !== 'COMPLETED';
    
    return (
      <Animated.View
        style={[
          styles.projectCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideAnim, new Animated.Value(1 + index * 0.2)) }]
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/construction-progress/${item.id}` as any)}
        >
          {/* Cover Image */}
          <View style={styles.cardImageContainer}>
            {item.coverImage ? (
              <Image source={{ uri: item.coverImage }} style={styles.cardImage} />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                <MaterialCommunityIcons name="home-city" size={40} color={COLORS.textMuted} />
              </View>
            )}
            
            {/* Status badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
              <Ionicons name={statusConfig.icon as any} size={12} color="#FFF" />
              <Text style={styles.statusBadgeText}>{statusConfig.label}</Text>
            </View>
            
            {/* Overdue warning */}
            {isOverdue && (
              <View style={styles.overdueBadge}>
                <Ionicons name="warning" size={12} color="#FFF" />
                <Text style={styles.overdueBadgeText}>Quá hạn</Text>
              </View>
            )}
          </View>

          {/* Card content */}
          <View style={styles.cardContent}>
            {/* Project info */}
            <View style={styles.cardHeader}>
              <Text style={styles.projectName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.projectTypeTag}>
                <Text style={styles.projectTypeText}>{item.projectType}</Text>
              </View>
            </View>
            
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
            </View>

            {/* Progress bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Tiến độ</Text>
                <Text style={styles.progressPercent}>{item.progressPercent}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${item.progressPercent}%`,
                      backgroundColor: item.progressPercent === 100 
                        ? COLORS.success 
                        : item.progressPercent >= 70 
                          ? COLORS.info 
                          : COLORS.warning
                    }
                  ]} 
                />
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="checkbox-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statItemText}>
                  {item.completedTasks}/{item.totalTasks} công việc
                </Text>
              </View>
              
              {item.totalArea && (
                <View style={styles.statItem}>
                  <Ionicons name="resize-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.statItemText}>{item.totalArea}m²</Text>
                </View>
              )}
              
              {item.estimatedBudget && (
                <View style={styles.statItem}>
                  <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.statItemText}>{formatCurrency(item.estimatedBudget)}</Text>
                </View>
              )}
            </View>

            {/* Team avatars */}
            {item.members.length > 0 && (
              <View style={styles.teamSection}>
                <View style={styles.avatarStack}>
                  {item.members.slice(0, 4).map((member, i) => (
                    <View 
                      key={member.id} 
                      style={[styles.avatar, { marginLeft: i > 0 ? -10 : 0, zIndex: 4 - i }]}
                    >
                      <Text style={styles.avatarText}>
                        {member.userName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  ))}
                  {item.members.length > 4 && (
                    <View style={[styles.avatar, styles.avatarMore, { marginLeft: -10 }]}>
                      <Text style={styles.avatarMoreText}>+{item.members.length - 4}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.teamText}>{item.members.length} thành viên</Text>
              </View>
            )}

            {/* Rating (for completed projects) */}
            {item.status === 'COMPLETED' && item.averageRating && (
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#0066CC" />
                <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
                <Text style={styles.ratingLabel}>Đánh giá</Text>
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.mindmapButton}
              onPress={(e) => {
                e.stopPropagation();
                router.push(`/construction-progress/mindmap?id=${item.id}` as any);
              }}
            >
              <Ionicons name="git-network-outline" size={18} color={COLORS.primary} />
              <Text style={styles.mindmapButtonText}>Mindmap</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Chi tiết</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Tiến độ Thi công</Text>
            <Text style={styles.headerSubtitle}>
              {userRole === 'MANAGER' ? 'Quản lý dự án' : 
               userRole === 'ENGINEER' ? 'Kỹ sư giám sát' :
               userRole === 'CONTRACTOR' ? 'Nhà thầu' : 'Khách hàng'}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
            {stats.pendingActions > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{stats.pendingActions}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.headerStats}>
          {renderStatCard('folder-open', 'Tổng dự án', stats.total, '#FFF', 0)}
          {renderStatCard('hammer', 'Đang làm', stats.active, '#FFF', 50)}
          {renderStatCard('checkmark-circle', 'Hoàn thành', stats.completed, '#FFF', 100)}
          {renderStatCard('alert-circle', 'Chờ xử lý', stats.pendingActions, '#0066CC', 150)}
        </View>
      </LinearGradient>

      {/* Status tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.tabActive
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
              {selectedTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Project list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dự án...</Text>
        </View>
      ) : filteredProjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="folder-open-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Chưa có dự án nào</Text>
          <Text style={styles.emptySubtitle}>
            {selectedTab === 'ALL' 
              ? 'Tạo dự án mới để bắt đầu' 
              : `Không có dự án ${STATUS_TABS.find(t => t.key === selectedTab)?.label.toLowerCase()}`
            }
          </Text>
          {permissions.canCreate && (
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/construction-progress/create' as any)}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.createButtonText}>Tạo dự án mới</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProjects(true)}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      {/* FAB - Create new project */}
      {permissions.canCreate && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push('/construction-progress/create' as any)}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#0066CC',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  
  // Header stats
  headerStats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  
  // Tabs
  tabsContainer: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  tabActive: {
    backgroundColor: `${COLORS.primary}15`,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 20,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginLeft: -10,
  },
  
  // List
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Project card
  projectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageContainer: {
    height: 160,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  overdueBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    gap: 4,
  },
  overdueBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  projectName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: 8,
  },
  projectTypeTag: {
    backgroundColor: `${COLORS.info}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  projectTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.info,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  
  // Progress
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  // Stats row
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  
  // Team
  teamSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  avatarMore: {
    backgroundColor: COLORS.background,
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  teamText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  
  // Rating
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  ratingLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  
  // Card footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  mindmapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 8,
  },
  mindmapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flex: 1,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
