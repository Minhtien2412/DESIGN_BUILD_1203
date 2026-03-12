/**
 * Construction Project Detail Screen
 * Shows project details with Shopee-style timeline, task progress, role-based actions
 */

import { useAuth } from '@/context/AuthContext';
import { ConstructionProgressService, MOCK_PROJECT as FALLBACK_PROJECT, MOCK_TASKS as FALLBACK_TASKS } from '@/services/constructionProgressService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    ConstructionProject,
    ConstructionTask,
    generateTaskTimeline,
    hasPermission,
    ProgressRole,
    PROJECT_STATUS_CONFIG,
    ROLE_PERMISSIONS,
    TASK_STATUS_CONFIG
} from '@/types/construction-progress';

const { width } = Dimensions.get('window');

// Theme colors
const COLORS = {
  primary: '#0D9488',
  primaryDark: '#004499',
  primaryLight: '#FFF0ED',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E8E8E8',
  success: '#00C853',
  successLight: '#E8F5E9',
  warning: '#0D9488',
  warningLight: '#F0FDFA',
  error: '#000000',
  errorLight: '#F5F5F5',
  info: '#0D9488',
  infoLight: '#F0FDFA',
};

// Fallback data from service
const MOCK_PROJECT = FALLBACK_PROJECT;
const MOCK_TASKS = FALLBACK_TASKS;

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  // State
  const [project, setProject] = useState<ConstructionProject | null>(null);
  const [tasks, setTasks] = useState<ConstructionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'api' | 'mock'>('mock');
  const [selectedTask, setSelectedTask] = useState<ConstructionTask | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmNote, setConfirmNote] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'timeline'>('overview');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  
  // User role - for demo use different roles
  const userRole: ProgressRole = (user?.role as ProgressRole) || 'CLIENT';
  const permissions = ROLE_PERMISSIONS[userRole];
  
  // Get user's role in this project
  const projectMember = project?.members.find(m => m.userId === user?.id);
  const myProjectRole: ProgressRole = projectMember?.role || userRole;

  // Load project data
  const loadProject = useCallback(async (isRefresh = false) => {
    if (!id) return;
    
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      // Call API via service
      const response = await ConstructionProgressService.getProject(id);
      setProject(response.project);
      setTasks(response.tasks);
      setDataSource(response.dataSource);
      
    } catch (error) {
      console.error('Failed to load project:', error);
      // Use fallback data
      setProject(MOCK_PROJECT);
      setTasks(MOCK_TASKS);
      setDataSource('mock');
      Alert.alert('Lỗi', 'Không thể tải thông tin dự án');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const onRefresh = useCallback(() => {
    loadProject(true);
  }, [loadProject]);

  useEffect(() => {
    loadProject();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Handle task confirmation
  const handleConfirmTask = (task: ConstructionTask) => {
    setSelectedTask(task);
    setConfirmNote('');
    setShowConfirmModal(true);
  };

  const submitConfirmation = async () => {
    if (!selectedTask) return;
    
    try {
      // In production, call API
      // await progressApi.confirmTask(selectedTask.id, { note: confirmNote });
      
      Alert.alert('Thành công', 'Đã xác nhận công việc');
      setShowConfirmModal(false);
      loadProject();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xác nhận công việc');
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Get role display name
  const getRoleDisplayName = (role: ProgressRole) => {
    const names: Record<ProgressRole, string> = {
      MANAGER: 'Quản lý',
      ENGINEER: 'Kỹ sư',
      CONTRACTOR: 'Nhà thầu',
      CLIENT: 'Khách hàng',
      VIEWER: 'Người xem',
    };
    return names[role];
  };

  // Check if user can confirm this task
  const canConfirmTask = (task: ConstructionTask) => {
    if (!hasPermission(myProjectRole, 'canConfirm')) return false;
    
    const hasConfirmed = task.confirmations.some(c => c.userRole === myProjectRole);
    if (hasConfirmed) return false;
    
    // Check confirmation order
    if (myProjectRole === 'CONTRACTOR') {
      return task.status === 'COMPLETED' || task.progressPercent === 100;
    }
    if (myProjectRole === 'ENGINEER') {
      return task.confirmations.some(c => c.userRole === 'CONTRACTOR' && c.status === 'CONFIRMED');
    }
    if (myProjectRole === 'CLIENT') {
      return task.confirmations.some(c => c.userRole === 'ENGINEER' && c.status === 'CONFIRMED');
    }
    
    return false;
  };

  // Render task item
  const renderTaskItem = (task: ConstructionTask, index: number) => {
    // Defensive check for status config
    const statusConfig = TASK_STATUS_CONFIG[task.status] || {
      label: task.status || 'Unknown',
      color: '#999999',
      bgColor: '#F5F5F5',
      icon: 'ellipse-outline',
      step: 0,
    };
    const canConfirm = canConfirmTask(task);
    const timeline = generateTaskTimeline(task);
    
    return (
      <View key={task.id} style={styles.taskItem}>
        {/* Timeline connector */}
        {index < tasks.length - 1 && <View style={styles.timelineConnector} />}
        
        {/* Timeline dot */}
        <View style={[styles.timelineDot, { backgroundColor: statusConfig.color }]}>
          <Ionicons name={statusConfig.icon as any} size={14} color="#FFF" />
        </View>
        
        {/* Task content */}
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskName}>{task.name}</Text>
            <View style={[styles.taskStatus, { backgroundColor: `${statusConfig.color}15` }]}>
              <Text style={[styles.taskStatusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
          
          <Text style={styles.taskDescription} numberOfLines={2}>{task.description}</Text>
          
          {/* Progress bar */}
          <View style={styles.taskProgressSection}>
            <View style={styles.taskProgressHeader}>
              <Text style={styles.taskProgressLabel}>Tiến độ</Text>
              <Text style={styles.taskProgressPercent}>{task.progressPercent}%</Text>
            </View>
            <View style={styles.taskProgressBar}>
              <View 
                style={[
                  styles.taskProgressFill, 
                  { 
                    width: `${task.progressPercent}%`,
                    backgroundColor: statusConfig.color
                  }
                ]} 
              />
            </View>
          </View>
          
          {/* Date range */}
          <View style={styles.taskDates}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.taskDateText}>
              {formatDate(task.plannedStartDate)} - {formatDate(task.plannedEndDate)}
            </Text>
          </View>
          
          {/* Confirmations - Shopee style tracking */}
          {task.confirmations.length > 0 && (
            <View style={styles.confirmationsSection}>
              <Text style={styles.confirmationsTitle}>Xác nhận:</Text>
              {task.confirmations.map((conf, i) => (
                <View key={conf.id} style={styles.confirmationItem}>
                  <View style={[
                    styles.confirmIcon,
                    { backgroundColor: conf.status === 'CONFIRMED' ? COLORS.success : COLORS.warning }
                  ]}>
                    <Ionicons 
                      name={conf.status === 'CONFIRMED' ? 'checkmark' : 'time'} 
                      size={12} 
                      color="#FFF" 
                    />
                  </View>
                  <View style={styles.confirmInfo}>
                    <Text style={styles.confirmRole}>{getRoleDisplayName(conf.userRole)}</Text>
                    <Text style={styles.confirmName}>{conf.userName}</Text>
                    <Text style={styles.confirmDate}>{conf.confirmedAt ? formatDate(conf.confirmedAt) : ''}</Text>
                    {conf.note && <Text style={styles.confirmNote}>"{conf.note}"</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {/* Action buttons */}
          <View style={styles.taskActions}>
            {canConfirm && (
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => handleConfirmTask(task)}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                <Text style={styles.confirmButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            )}
            
            {hasPermission(myProjectRole, 'canEdit') && task.status === 'IN_PROGRESS' && (
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={() => router.push(`/construction-progress/task/${task.id}` as any)}
              >
                <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                <Text style={styles.updateButtonText}>Cập nhật</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={() => router.push(`/construction-progress/task/${task.id}` as any)}
            >
              <Ionicons name="eye-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.detailButtonText}>Chi tiết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải dự án...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Không tìm thấy dự án</Text>
          <TouchableOpacity style={styles.backToListButton} onPress={() => router.back()}>
            <Text style={styles.backToListText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = PROJECT_STATUS_CONFIG[project.status] || {
    label: project.status || 'Unknown',
    color: '#999999',
    bgColor: '#F5F5F5',
    icon: 'ellipse-outline',
    order: 0,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with cover image */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: project.coverImage }} style={styles.coverImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.coverGradient}
        />
        
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        {/* Menu button */}
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
        
        {/* Project title on cover */}
        <View style={styles.coverContent}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color="#FFF" />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
          <Text style={styles.projectTitle}>{project.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#FFF" />
            <Text style={styles.locationText}>{project.address}</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['overview', 'tasks', 'timeline'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'overview' ? 'Tổng quan' : tab === 'tasks' ? 'Công việc' : 'Timeline'}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Data Source Indicator */}
        {dataSource === 'mock' && (
          <View style={styles.mockBanner}>
            <Ionicons name="information-circle" size={16} color="#92400E" />
            <Text style={styles.mockBannerText}>📋 Dữ liệu mẫu</Text>
          </View>
        )}

        {activeTab === 'overview' && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Progress Overview Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tiến độ tổng thể</Text>
              
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressCirclePercent}>{project.progressPercent}%</Text>
                  <Text style={styles.progressCircleLabel}>Hoàn thành</Text>
                </View>
              </View>
              
              <View style={styles.progressStats}>
                <View style={styles.progressStatItem}>
                  <Ionicons name="checkbox-outline" size={20} color={COLORS.success} />
                  <Text style={styles.progressStatValue}>{project.completedTasks}</Text>
                  <Text style={styles.progressStatLabel}>Đã xong</Text>
                </View>
                <View style={styles.progressStatDivider} />
                <View style={styles.progressStatItem}>
                  <Ionicons name="time-outline" size={20} color={COLORS.warning} />
                  <Text style={styles.progressStatValue}>{project.totalTasks - project.completedTasks}</Text>
                  <Text style={styles.progressStatLabel}>Đang làm</Text>
                </View>
                <View style={styles.progressStatDivider} />
                <View style={styles.progressStatItem}>
                  <Ionicons name="list-outline" size={20} color={COLORS.info} />
                  <Text style={styles.progressStatValue}>{project.totalTasks}</Text>
                  <Text style={styles.progressStatLabel}>Tổng CV</Text>
                </View>
              </View>
            </View>

            {/* Project Info Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông tin dự án</Text>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="business-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Loại công trình</Text>
                  <Text style={styles.infoValue}>{project.projectType}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="resize-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Diện tích</Text>
                  <Text style={styles.infoValue}>{project.totalArea}m²</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="layers-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Số tầng</Text>
                  <Text style={styles.infoValue}>{project.totalFloors || 'N/A'}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Ngân sách</Text>
                  <Text style={styles.infoValue}>{formatCurrency(project.estimatedBudget || 0)}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.success} />
                  <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
                  <Text style={styles.infoValue}>{formatDate(project.actualStartDate || project.plannedStartDate)}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="flag-outline" size={18} color={COLORS.error} />
                  <Text style={styles.infoLabel}>Dự kiến hoàn thành</Text>
                  <Text style={styles.infoValue}>{formatDate(project.plannedEndDate)}</Text>
                </View>
              </View>
            </View>

            {/* Team Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Đội ngũ dự án</Text>
              
              {project.members.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>
                      {member.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.userName}</Text>
                    <Text style={styles.memberRole}>{getRoleDisplayName(member.role)}</Text>
                  </View>
                  {member.userId === user?.id && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youBadgeText}>Bạn</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {activeTab === 'tasks' && (
          <View style={styles.tasksContainer}>
            {tasks.map((task, index) => renderTaskItem(task, index))}
          </View>
        )}

        {activeTab === 'timeline' && (
          <View style={styles.timelineContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Dòng thời gian dự án</Text>
              
              {/* Shopee-style order tracking timeline */}
              {tasks.map((task, index) => {
                const statusConfig = TASK_STATUS_CONFIG[task.status] || {
                  label: task.status || 'Unknown',
                  color: '#999999',
                  bgColor: '#F5F5F5',
                  icon: 'ellipse-outline',
                  step: 0,
                };
                const isCompleted = task.status === 'APPROVED' || task.status === 'COMPLETED';
                const isActive = task.status === 'IN_PROGRESS' || task.status === 'PENDING_CHECK';
                
                return (
                  <View key={task.id} style={styles.timelineItem}>
                    {/* Line connector */}
                    {index < tasks.length - 1 && (
                      <View style={[
                        styles.timelineLine,
                        isCompleted && styles.timelineLineCompleted
                      ]} />
                    )}
                    
                    {/* Circle */}
                    <View style={[
                      styles.timelineCircle,
                      isCompleted && styles.timelineCircleCompleted,
                      isActive && styles.timelineCircleActive,
                    ]}>
                      {isCompleted && (
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                      )}
                    </View>
                    
                    {/* Content */}
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Text style={[
                          styles.timelineTitle,
                          isCompleted && styles.timelineTitleCompleted,
                          isActive && styles.timelineTitleActive,
                        ]}>
                          {task.name}
                        </Text>
                        <View style={[
                          styles.timelineStatus,
                          { backgroundColor: `${statusConfig.color}15` }
                        ]}>
                          <Text style={[styles.timelineStatusText, { color: statusConfig.color }]}>
                            {task.progressPercent}%
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.timelineDate}>
                        {formatDate(task.actualEndDate || task.plannedEndDate)}
                      </Text>
                      
                      {/* Confirmation steps for this task */}
                      {task.confirmations.length > 0 && (
                        <View style={styles.subSteps}>
                          {task.confirmations.map((conf) => (
                            <View key={conf.id} style={styles.subStep}>
                              <View style={styles.subStepDot} />
                              <Text style={styles.subStepText}>
                                {getRoleDisplayName(conf.userRole)} đã xác nhận
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác nhận công việc</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            {selectedTask && (
              <>
                <View style={styles.modalTaskInfo}>
                  <Text style={styles.modalTaskName}>{selectedTask.name}</Text>
                  <Text style={styles.modalTaskDesc}>{selectedTask.description}</Text>
                </View>
                
                <Text style={styles.modalLabel}>Ghi chú (tuỳ chọn):</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập ghi chú xác nhận..."
                  value={confirmNote}
                  onChangeText={setConfirmNote}
                  multiline
                  numberOfLines={3}
                />
                
                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalCancelButton}
                    onPress={() => setShowConfirmModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Huỷ</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.modalConfirmButton}
                    onPress={submitConfirmation}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.modalConfirmText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {hasPermission(myProjectRole, 'canReview') && project.status === 'PENDING_REVIEW' && (
          <TouchableOpacity 
            style={styles.bottomReviewButton}
            onPress={() => router.push(`/construction-progress/review/${project.id}` as any)}
          >
            <Ionicons name="star-outline" size={20} color="#FFF" />
            <Text style={styles.bottomReviewText}>Đánh giá dự án</Text>
          </TouchableOpacity>
        )}
        
        {hasPermission(myProjectRole, 'canEdit') && (
          <TouchableOpacity 
            style={styles.bottomEditButton}
            onPress={() => router.push(`/construction-progress/edit/${project.id}` as any)}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.bottomEditText}>Chỉnh sửa</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Loading & Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  backToListButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backToListText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Header
  headerContainer: {
    height: 220,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {},
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
    left: '25%',
    width: '50%',
    height: 3,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  mockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  mockBannerText: { fontSize: 12, color: '#92400E' },
  
  // Card
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  
  // Progress circle
  progressCircleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 8,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCirclePercent: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressCircleLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Progress stats
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  progressStatItem: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  
  // Info
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  
  // Members
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  memberRole: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  youBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Tasks
  tasksContainer: {
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 17,
    top: 36,
    bottom: -16,
    width: 2,
    backgroundColor: COLORS.border,
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  taskName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  taskStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  taskProgressSection: {
    marginBottom: 10,
  },
  taskProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskProgressLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  taskProgressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  taskProgressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskDates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  taskDateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Confirmations
  confirmationsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmationsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  confirmationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  confirmIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  confirmInfo: {
    flex: 1,
  },
  confirmRole: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmName: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  confirmDate: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  confirmNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Task actions
  taskActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  updateButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  
  // Timeline tab
  timelineContainer: {
    padding: 16,
    paddingTop: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingLeft: 12,
    marginBottom: 4,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 24,
    bottom: -20,
    width: 2,
    backgroundColor: COLORS.border,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineCircleCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  timelineCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    flex: 1,
  },
  timelineTitleCompleted: {
    color: COLORS.text,
    fontWeight: '600',
  },
  timelineTitleActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  timelineStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timelineStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  subSteps: {
    marginTop: 8,
    marginLeft: 4,
  },
  subStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  subStepText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalTaskInfo: {
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalTaskName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalTaskDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalConfirmButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  
  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  bottomReviewButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bottomReviewText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomEditButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  bottomEditText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
