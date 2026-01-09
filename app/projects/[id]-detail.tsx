/**
 * Project Detail Screen (Enhanced)
 * 
 * Features:
 * - Project info card (name, status, dates, budget)
 * - Budget breakdown with progress bars
 * - Team members list (client, engineer)
 * - Image gallery placeholder
 * - Comments/Updates feed
 * - Quick actions (edit, delete, assign)
 * 
 * API: projectApi.getProject(id)
 * Route: /projects/[id]-detail
 * Created: Nov 24, 2025
 */

import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Spacing } from '@/constants/layout';
import { Colors } from '@/constants/theme';
import { getProject, Project } from '@/services/projectApi';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const theme = Colors.light;

// Status configurations
const STATUS_CONFIG = {
  PLANNING: { color: '#0066CC', label: 'Lên kế hoạch', icon: 'calendar-outline' },
  IN_PROGRESS: { color: '#3b82f6', label: 'Đang thực hiện', icon: 'construct-outline' },
  COMPLETED: { color: '#0066CC', label: 'Hoàn thành', icon: 'checkmark-circle-outline' },
  ON_HOLD: { color: '#000000', label: 'Tạm dừng', icon: 'pause-circle-outline' },
  CANCELLED: { color: '#94a3b8', label: 'Đã hủy', icon: 'close-circle-outline' },
};

// ============================================================================
// INFO CARD COMPONENT
// ============================================================================

interface InfoCardProps {
  project: Project;
  onEdit: () => void;
}

function InfoCard({ project, onEdit }: InfoCardProps) {
  const statusConfig = STATUS_CONFIG[project.status];
  
  return (
    <View style={styles.infoCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.projectName}>{project.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Ionicons name="create-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      {project.description && (
        <Text style={styles.description} numberOfLines={3}>
          {project.description}
        </Text>
      )}

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        {/* Location */}
        {project.location && (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={18} color={theme.textMuted} />
            <Text style={styles.infoLabel}>Địa điểm:</Text>
            <Text style={styles.infoValue}>{project.location}</Text>
          </View>
        )}

        {/* Area */}
        {project.area && (
          <View style={styles.infoItem}>
            <Ionicons name="resize-outline" size={18} color={theme.textMuted} />
            <Text style={styles.infoLabel}>Diện tích:</Text>
            <Text style={styles.infoValue}>{project.area} m²</Text>
          </View>
        )}

        {/* Type */}
        {project.type && (
          <View style={styles.infoItem}>
            <Ionicons name="home-outline" size={18} color={theme.textMuted} />
            <Text style={styles.infoLabel}>Loại:</Text>
            <Text style={styles.infoValue}>{project.type}</Text>
          </View>
        )}

        {/* Start Date */}
        {project.startDate && (
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={18} color={theme.textMuted} />
            <Text style={styles.infoLabel}>Bắt đầu:</Text>
            <Text style={styles.infoValue}>
              {new Date(project.startDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}

        {/* End Date */}
        {project.endDate && (
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={18} color={theme.textMuted} />
            <Text style={styles.infoLabel}>Kết thúc:</Text>
            <Text style={styles.infoValue}>
              {new Date(project.endDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        )}

        {/* Progress */}
        {project.progress !== undefined && (
          <View style={styles.infoItem}>
            <Ionicons name="stats-chart-outline" size={18} color={theme.textMuted} />
            <Text style={styles.infoLabel}>Tiến độ:</Text>
            <Text style={styles.infoValue}>{project.progress}%</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      {project.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${project.progress}%`,
                  backgroundColor: statusConfig.color,
                }
              ]} 
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// BUDGET CARD COMPONENT
// ============================================================================

interface BudgetCardProps {
  budget?: number;
}

function BudgetCard({ budget }: BudgetCardProps) {
  if (!budget) return null;

  // Mock breakdown - replace with real API data
  const spent = budget * 0.65;
  const remaining = budget - spent;

  return (
    <View style={styles.budgetCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Ngân sách</Text>
        <Ionicons name="wallet-outline" size={20} color={theme.primary} />
      </View>

      {/* Total Budget */}
      <View style={styles.budgetTotal}>
        <Text style={styles.budgetLabel}>Tổng ngân sách</Text>
        <Text style={styles.budgetAmount}>
          {budget.toLocaleString('vi-VN')} ₫
        </Text>
      </View>

      {/* Breakdown */}
      <View style={styles.budgetBreakdown}>
        <View style={styles.budgetRow}>
          <View style={[styles.budgetDot, { backgroundColor: theme.success }]} />
          <Text style={styles.budgetRowLabel}>Đã chi</Text>
          <Text style={styles.budgetRowAmount}>
            {spent.toLocaleString('vi-VN')} ₫
          </Text>
        </View>
        <View style={styles.budgetRow}>
          <View style={[styles.budgetDot, { backgroundColor: theme.warning }]} />
          <Text style={styles.budgetRowLabel}>Còn lại</Text>
          <Text style={styles.budgetRowAmount}>
            {remaining.toLocaleString('vi-VN')} ₫
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${Math.round(spent / budget * 100)}%` as any,
                backgroundColor: theme.success,
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {(spent / budget * 100).toFixed(0)}% đã sử dụng
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// TEAM CARD COMPONENT
// ============================================================================

interface TeamCardProps {
  project: Project;
}

function TeamCard({ project }: TeamCardProps) {
  return (
    <View style={styles.teamCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Đội ngũ</Text>
        <Ionicons name="people-outline" size={20} color={theme.primary} />
      </View>

      {/* Client */}
      {project.client && (
        <View style={styles.memberRow}>
          <View style={styles.memberAvatar}>
            <Ionicons name="person-outline" size={20} color={theme.primary} />
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{project.client.name}</Text>
            <Text style={styles.memberRole}>Khách hàng</Text>
            <Text style={styles.memberEmail}>{project.client.email}</Text>
          </View>
          <TouchableOpacity style={styles.contactBtn}>
            <Ionicons name="call-outline" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Engineer */}
      {project.engineer && (
        <View style={styles.memberRow}>
          <View style={styles.memberAvatar}>
            <Ionicons name="construct-outline" size={20} color={theme.info} />
          </View>
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>{project.engineer.name}</Text>
            <Text style={styles.memberRole}>Kỹ sư</Text>
            <Text style={styles.memberEmail}>{project.engineer.email}</Text>
          </View>
          <TouchableOpacity style={styles.contactBtn}>
            <Ionicons name="call-outline" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* No team members */}
      {!project.client && !project.engineer && (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={40} color={theme.textMuted} />
          <Text style={styles.emptyText}>Chưa có thành viên</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addBtnText}>Thêm thành viên</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async (isRefresh = false) => {
    if (!id) {
      setError('Project ID không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);
      console.log('📂 Fetching project:', id);

      const data = await getProject(id);
      console.log('✅ Project loaded:', data.name);
      setProject(data);
    } catch (err: any) {
      console.error('❌ Failed to load project:', err);
      setError(err.message || 'Không thể tải dự án');
      Alert.alert('Lỗi', 'Không thể tải thông tin dự án');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEdit = () => {
    Alert.alert(
      'Chỉnh sửa dự án',
      'Tính năng đang phát triển',
      [{ text: 'OK' }]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa dự án',
      `Bạn có chắc muốn xóa "${project?.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete
            router.back();
          }
        },
      ]
    );
  };

  const onRefresh = () => {
    fetchProject(true);
  };

  // Loading state
  if (loading && !project) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Chi tiết dự án', headerShown: true }} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Đang tải dự án...</Text>
      </View>
    );
  }

  // Error state
  if (error && !project) {
    return (
      <View style={styles.centerContainer}>
        <Stack.Screen options={{ title: 'Lỗi', headerShown: true }} />
        <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => fetchProject()}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!project) return null;

  return (
    <Container>
      <Stack.Screen 
        options={{ 
          title: project.name,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color={theme.error} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Project Info */}
        <Section>
          <InfoCard project={project} onEdit={handleEdit} />
        </Section>

        {/* Budget */}
        {project.budget && (
          <Section>
            <BudgetCard budget={project.budget} />
          </Section>
        )}

        {/* Team */}
        <Section>
          <TeamCard project={project} />
        </Section>

        {/* Images Placeholder */}
        <Section>
          <View style={styles.imagesCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Hình ảnh</Text>
              <Ionicons name="images-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.emptyState}>
              <Ionicons name="image-outline" size={40} color={theme.textMuted} />
              <Text style={styles.emptyText}>Chưa có hình ảnh</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addBtnText}>Thêm hình ảnh</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        {/* Comments Placeholder */}
        <Section>
          <View style={styles.commentsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Cập nhật & Bình luận</Text>
              <Ionicons name="chatbubbles-outline" size={20} color={theme.primary} />
            </View>
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={40} color={theme.textMuted} />
              <Text style={styles.emptyText}>Chưa có cập nhật</Text>
              <TouchableOpacity style={styles.addBtn}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.addBtnText}>Thêm cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Section>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </Container>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textMuted,
  },
  errorText: {
    fontSize: 16,
    color: theme.error,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: theme.primary,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  projectName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text,
    marginBottom: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editBtn: {
    padding: Spacing.xs,
  },
  description: {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 22,
  },
  infoGrid: {
    gap: Spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  progressContainer: {
    gap: Spacing.xs,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.textMuted,
    textAlign: 'right',
  },

  // Budget Card
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  budgetTotal: {
    gap: 4,
  },
  budgetLabel: {
    fontSize: 14,
    color: theme.textMuted,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.primary,
  },
  budgetBreakdown: {
    gap: Spacing.sm,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  budgetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  budgetRowLabel: {
    flex: 1,
    fontSize: 14,
    color: theme.textMuted,
  },
  budgetRowAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },

  // Team Card
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  memberRole: {
    fontSize: 12,
    color: theme.primary,
  },
  memberEmail: {
    fontSize: 12,
    color: theme.textMuted,
  },
  contactBtn: {
    padding: Spacing.xs,
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: theme.textMuted,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: theme.primary,
    borderRadius: 8,
    marginTop: Spacing.xs,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Other cards
  imagesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: Spacing.md,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
