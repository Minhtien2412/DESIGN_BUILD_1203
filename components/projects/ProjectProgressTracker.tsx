import { Colors } from '@/constants/theme';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ProjectProgress {
  project: {
    id: number;
    name: string;
    status: string;
    completion_percentage: number;
    start_date: string;
    deadline: string;
    health_status: 'on-track' | 'at-risk' | 'delayed' | 'overdue';
    days_until_deadline: number | null;
  };
  statistics: {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    pending_tasks: number;
    blocked_tasks: number;
    completion_rate: number;
  };
  milestones: Array<{
    id: number;
    name: string;
    status: string;
    completion_percentage: number;
    due_date: string;
  }>;
}

interface Props {
  projectId: number;
  onUpdatePress?: () => void;
}

export default function ProjectProgressTracker({ projectId, onUpdatePress }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, [projectId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`/api/projects/${projectId}/progress`);
      setProgress(response.data);
    } catch (err: any) {
      console.error('Failed to fetch progress:', err);
      setError(err.message || 'Không thể tải tiến độ dự án');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return '#4CAF50';
      case 'at-risk':
        return '#FFC107';
      case 'delayed':
        return '#FF9800';
      case 'overdue':
        return '#F44336';
      default:
        return colors.textSecondary;
    }
  };

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'Đúng tiến độ';
      case 'at-risk':
        return 'Có rủi ro';
      case 'delayed':
        return 'Chậm tiến độ';
      case 'overdue':
        return 'Quá hạn';
      default:
        return 'Không xác định';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'checkmark-circle';
      case 'at-risk':
        return 'warning';
      case 'delayed':
        return 'time';
      case 'overdue':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 30) return '#F44336';
    if (percentage < 60) return '#FF9800';
    if (percentage < 90) return '#FFC107';
    return '#4CAF50';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Đang tải tiến độ...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.card }]}>
        <Ionicons name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={fetchProgress}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!progress) return null;

  const { project, statistics, milestones } = progress;
  const progressColor = getProgressColor(project.completion_percentage);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Card with Progress Circle */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.headerCard, { backgroundColor: colors.card }]}
      >
        <LinearGradient
          colors={[getHealthStatusColor(project.health_status) + '20', 'transparent']}
          style={styles.headerGradient}
        >
          {/* Circular Progress */}
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircle}>
              <Text style={[styles.progressPercentage, { color: progressColor }]}>
                {project.completion_percentage}%
              </Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                Hoàn thành
              </Text>
            </View>
          </View>

          {/* Health Status Badge */}
          <View style={[styles.healthBadge, { backgroundColor: getHealthStatusColor(project.health_status) }]}>
            <Ionicons
              name={getHealthStatusIcon(project.health_status) as any}
              size={16}
              color="#fff"
            />
            <Text style={styles.healthBadgeText}>
              {getHealthStatusLabel(project.health_status)}
            </Text>
          </View>

          {/* Deadline Info */}
          {project.days_until_deadline !== null && (
            <View style={styles.deadlineContainer}>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                {project.days_until_deadline > 0
                  ? `Còn ${project.days_until_deadline} ngày`
                  : project.days_until_deadline === 0
                  ? 'Đến hạn hôm nay'
                  : `Quá hạn ${Math.abs(project.days_until_deadline)} ngày`}
              </Text>
            </View>
          )}

          {/* Update Button */}
          {onUpdatePress && (
            <TouchableOpacity
              style={[styles.updateButton, { backgroundColor: colors.accent }]}
              onPress={onUpdatePress}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.updateButtonText}>Cập nhật tiến độ</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Task Statistics */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        style={[styles.statsCard, { backgroundColor: colors.card }]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Thống kê công việc</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#4CAF50' + '20' }]}>
              <Ionicons name="checkmark-done" size={24} color="#4CAF50" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statistics.completed_tasks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Hoàn thành
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#2196F3' + '20' }]}>
              <Ionicons name="play-circle" size={24} color="#2196F3" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statistics.in_progress_tasks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Đang làm
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '20' }]}>
              <Ionicons name="time" size={24} color="#FF9800" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statistics.pending_tasks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Chờ xử lý
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#F44336' + '20' }]}>
              <Ionicons name="ban" size={24} color="#F44336" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {statistics.blocked_tasks}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Bị chặn
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarHeader}>
            <Text style={[styles.progressBarLabel, { color: colors.textSecondary }]}>
              Tổng tiến độ
            </Text>
            <Text style={[styles.progressBarValue, { color: progressColor }]}>
              {statistics.completed_tasks}/{statistics.total_tasks} công việc
            </Text>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                { backgroundColor: progressColor, width: `${statistics.completion_rate}%` },
              ]}
            />
          </View>
        </View>
      </Animated.View>

      {/* Milestones */}
      {milestones.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={[styles.milestonesCard, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Các mốc dự án ({milestones.length})
          </Text>

          {milestones.map((milestone, index) => (
            <View key={milestone.id} style={styles.milestoneItem}>
              <View style={styles.milestoneLeft}>
                <View
                  style={[
                    styles.milestoneIcon,
                    {
                      backgroundColor:
                        milestone.status === 'completed'
                          ? '#4CAF50'
                          : milestone.status === 'in_progress'
                          ? '#2196F3'
                          : colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      milestone.status === 'completed'
                        ? 'checkmark'
                        : milestone.status === 'in_progress'
                        ? 'play'
                        : 'ellipse-outline'
                    }
                    size={16}
                    color="#fff"
                  />
                </View>
                {index < milestones.length - 1 && (
                  <View style={[styles.milestoneLine, { backgroundColor: colors.border }]} />
                )}
              </View>

              <View style={styles.milestoneContent}>
                <Text style={[styles.milestoneName, { color: colors.text }]}>
                  {milestone.name}
                </Text>
                <Text style={[styles.milestoneDate, { color: colors.textSecondary }]}>
                  Hạn: {formatDate(milestone.due_date)}
                </Text>
                
                {/* Milestone Progress Bar */}
                <View style={styles.milestoneProgressContainer}>
                  <View style={[styles.milestoneProgressTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.milestoneProgressFill,
                        {
                          backgroundColor: getProgressColor(milestone.completion_percentage),
                          width: `${milestone.completion_percentage}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.milestoneProgressText, { color: colors.textSecondary }]}>
                    {milestone.completion_percentage}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Project Dates */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(300)}
        style={[styles.datesCard, { backgroundColor: colors.card }]}
      >
        <View style={styles.dateItem}>
          <Ionicons name="play-circle-outline" size={20} color={colors.accent} />
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Ngày bắt đầu</Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>
            {formatDate(project.start_date)}
          </Text>
        </View>

        <View style={[styles.dateDivider, { backgroundColor: colors.border }]} />

        <View style={styles.dateItem}>
          <Ionicons name="flag-outline" size={20} color={colors.error} />
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>Deadline</Text>
          <Text style={[styles.dateValue, { color: colors.text }]}>
            {formatDate(project.deadline)}
          </Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    margin: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  headerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  progressCircleContainer: {
    marginBottom: 20,
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  healthBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  deadlineText: {
    fontSize: 14,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  statsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBarLabel: {
    fontSize: 13,
  },
  progressBarValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  milestonesCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  milestoneLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    marginTop: 8,
  },
  milestoneContent: {
    flex: 1,
    paddingTop: 4,
  },
  milestoneName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  milestoneDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  milestoneProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  milestoneProgressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  milestoneProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  milestoneProgressText: {
    fontSize: 11,
    minWidth: 35,
  },
  datesCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateItem: {
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 12,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateDivider: {
    width: 1,
    marginVertical: 8,
  },
});
