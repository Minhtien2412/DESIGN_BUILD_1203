import { useCriticalPath, useTasks } from '@/hooks/useTimeline';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CriticalPathScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { criticalPath, loading, calculate } = useCriticalPath(projectId!);
  const { tasks } = useTasks(undefined, projectId);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    handleCalculate();
  }, []);

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      await calculate();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tính toán đường găng');
    } finally {
      setCalculating(false);
    }
  };

  const formatDuration = (days: number) => {
    if (days === 1) return '1 ngày';
    return `${days} ngày`;
  };

  const getCriticalTaskIds = () => {
    return new Set(criticalPath?.criticalPath.tasks || []);
  };

  const getNearCriticalTaskIds = () => {
    return new Set(criticalPath?.nearCriticalTasks.map((t) => t.id) || []);
  };

  if (loading || calculating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Đang tính toán đường găng...</Text>
      </View>
    );
  }

  if (!criticalPath) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="git-network-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có dữ liệu đường găng</Text>
        <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
          <Text style={styles.calculateButtonText}>Tính toán đường găng</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const criticalTaskIds = getCriticalTaskIds();
  const nearCriticalTaskIds = getNearCriticalTaskIds();
  const criticalTasks = tasks.filter((t) => criticalTaskIds.has(t.id));

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="git-network" size={24} color="#000000" />
            <Text style={styles.summaryTitle}>Đường găng (Critical Path)</Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {criticalPath.criticalPath.tasks.length}
              </Text>
              <Text style={styles.statLabel}>Công việc găng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#000000' }]}>
                {formatDuration(criticalPath.criticalPath.totalDuration)}
              </Text>
              <Text style={styles.statLabel}>Tổng thời gian</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#0066CC' }]}>
                {formatDuration(criticalPath.criticalPath.slack)}
              </Text>
              <Text style={styles.statLabel}>Độ trễ cho phép</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color="#0066CC" />
            <Text style={styles.infoText}>
              Đường găng là chuỗi công việc dài nhất quyết định thời gian hoàn thành dự án.
              Bất kỳ sự chậm trễ nào trên đường găng sẽ làm trễ toàn bộ dự án.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.recalculateButton}
            onPress={handleCalculate}
          >
            <Ionicons name="refresh" size={18} color="#0066CC" />
            <Text style={styles.recalculateButtonText}>Tính toán lại</Text>
          </TouchableOpacity>
        </View>

        {/* Critical Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={20} color="#000000" />
            <Text style={styles.sectionTitle}>
              Công việc găng ({criticalTasks.length})
            </Text>
          </View>

          {criticalTasks.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>Không có công việc găng</Text>
            </View>
          ) : (
            criticalTasks.map((task, index) => {
              const duration = Math.ceil(
                (new Date(task.endDate).getTime() -
                  new Date(task.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskCard}
                  onPress={() => router.push(`/timeline/task/${task.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskLeft}>
                      <View style={styles.taskNumber}>
                        <Text style={styles.taskNumberText}>{index + 1}</Text>
                      </View>
                      <View style={styles.taskInfo}>
                        <View style={styles.taskNameRow}>
                          <Text style={styles.taskName}>{task.name}</Text>
                          {task.isMilestone && (
                            <Ionicons name="flag" size={14} color="#0066CC" />
                          )}
                        </View>
                        <Text style={styles.taskDates}>
                          {new Date(task.startDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(task.endDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.taskRight}>
                      <View style={styles.durationBadge}>
                        <Ionicons name="time-outline" size={14} color="#000000" />
                        <Text style={styles.durationText}>{duration}d</Text>
                      </View>
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>{task.progress}%</Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${task.progress}%` }]}
                    />
                  </View>

                  {task.assigneeName && (
                    <View style={styles.assigneeRow}>
                      <Ionicons name="person-outline" size={14} color="#666" />
                      <Text style={styles.assigneeText}>{task.assigneeName}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Near Critical Tasks */}
        {criticalPath.nearCriticalTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={20} color="#0066CC" />
              <Text style={styles.sectionTitle}>
                Công việc gần găng ({criticalPath.nearCriticalTasks.length})
              </Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Các công việc này có độ trễ cho phép {'<'} 5 ngày
            </Text>

            {criticalPath.nearCriticalTasks.map((task) => {
              const duration = Math.ceil(
                (new Date(task.endDate).getTime() -
                  new Date(task.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskCard, styles.nearCriticalCard]}
                  onPress={() => router.push(`/timeline/task/${task.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.taskHeader}>
                    <View style={styles.taskLeft}>
                      <Ionicons name="warning-outline" size={20} color="#0066CC" />
                      <View style={[styles.taskInfo, { marginLeft: 8 }]}>
                        <Text style={styles.taskName}>{task.name}</Text>
                        <Text style={styles.taskDates}>
                          {new Date(task.startDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(task.endDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.taskRight}>
                      <View style={[styles.durationBadge, { backgroundColor: '#E8F4FF' }]}>
                        <Ionicons name="time-outline" size={14} color="#0066CC" />
                        <Text style={[styles.durationText, { color: '#0066CC' }]}>
                          {duration}d
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${task.progress}%`, backgroundColor: '#0066CC' },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="bulb" size={20} color="#0066CC" />
            <Text style={styles.sectionTitle}>Khuyến nghị</Text>
          </View>

          <View style={styles.recommendationCard}>
            <Ionicons name="checkmark-circle" size={18} color="#0066CC" />
            <Text style={styles.recommendationText}>
              Ưu tiên theo dõi và hoàn thành đúng hạn các công việc trên đường găng
            </Text>
          </View>

          <View style={styles.recommendationCard}>
            <Ionicons name="people" size={18} color="#0066CC" />
            <Text style={styles.recommendationText}>
              Phân bổ nguồn lực tốt nhất cho các công việc găng và gần găng
            </Text>
          </View>

          <View style={styles.recommendationCard}>
            <Ionicons name="calendar" size={18} color="#0066CC" />
            <Text style={styles.recommendationText}>
              Cân nhắc tăng nguồn lực hoặc làm song song để rút ngắn đường găng
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  calculateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  calculateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  recalculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0066CC',
  },
  recalculateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    marginLeft: 28,
  },
  emptySection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#999',
  },
  taskCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#000000',
  },
  nearCriticalCard: {
    borderLeftColor: '#0066CC',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  taskNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  taskNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  taskInfo: {
    flex: 1,
  },
  taskNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  taskDates: {
    fontSize: 12,
    color: '#666',
  },
  taskRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  progressContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeText: {
    fontSize: 12,
    color: '#666',
  },
  recommendationCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});
