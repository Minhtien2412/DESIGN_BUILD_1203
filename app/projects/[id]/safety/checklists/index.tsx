import { MetricCard, StatusBadge } from '@/components/construction';
import { Loader } from '@/components/ui/loader';
import { SafetyChecklist, SafetyService } from '@/services/api/safety.mock';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const STATUS_COLORS = {
  pending: '#f59e0b',
  completed: '#10b981',
  failed: '#ef4444'
};

const STATUS_LABELS = {
  pending: 'Chờ kiểm tra',
  completed: 'Hoàn thành',
  failed: 'Không đạt'
};

export default function SafetyChecklistsScreen() {
  const { id: projectId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checklists, setChecklists] = useState<SafetyChecklist[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [checklistsData, statsData] = await Promise.all([
        SafetyService.getChecklists({ projectId: projectId as string }),
        SafetyService.getStats(projectId as string)
      ]);

      setChecklists(checklistsData);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu checklist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePerformChecklist = (checklistId: string) => {
    router.push(`/projects/${projectId}/safety/checklists/${checklistId}/perform`);
  };

  const handleCreateChecklist = () => {
    router.push(`/projects/${projectId}/safety/checklists/create`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checklist An toàn</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Stats Cards */}
        {stats && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsContainer}
            contentContainerStyle={styles.statsContent}
          >
            <MetricCard
              label="Hoàn thành"
              value={stats.checklistsCompleted.toString()}
              icon="checkmark-circle"
              gradientColors={['#10b981', '#059669']}
            />
            <MetricCard
              label="Chờ kiểm tra"
              value={stats.checklistsPending.toString()}
              icon="time"
              gradientColors={['#f59e0b', '#d97706']}
            />
            <MetricCard
              label="Tuân thủ PPE"
              value={`${stats.avgPPECompliance}%`}
              icon="shield-checkmark"
              gradientColors={['#3b82f6', '#2563eb']}
            />
            <MetricCard
              label="Họp An toàn"
              value={stats.meetingsHeld.toString()}
              icon="people"
              gradientColors={['#8b5cf6', '#7c3aed']}
            />
          </ScrollView>
        )}

        {/* Quick Action */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateChecklist}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Tạo checklist mới</Text>
          </TouchableOpacity>
        </View>

        {/* Checklists List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách kiểm tra</Text>

          {checklists.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>Chưa có checklist nào</Text>
              <Text style={styles.emptyStateText}>
                Tạo checklist đầu tiên để bắt đầu kiểm tra an toàn
              </Text>
            </View>
          ) : (
            <View style={styles.checklistsList}>
              {checklists.map((checklist) => {
                const passCount = checklist.items.filter(i => i.status === 'pass').length;
                const failCount = checklist.items.filter(i => i.status === 'fail').length;
                const pendingCount = checklist.items.filter(i => i.status === 'pending').length;
                const totalCount = checklist.items.length;
                const passRate = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

                return (
                  <View key={checklist.id} style={styles.checklistCard}>
                    <View style={styles.checklistHeader}>
                      <StatusBadge
                        label={STATUS_LABELS[checklist.status]}
                        variant={checklist.status === 'completed' ? 'success' : checklist.status === 'failed' ? 'error' : 'warning'}
                        size="small"
                      />
                      <Text style={styles.checklistDate}>
                        {new Date(checklist.date).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>

                    <View style={styles.checklistInfo}>
                      <View style={styles.infoRow}>
                        <Ionicons name="person-outline" size={16} color="#6b7280" />
                        <Text style={styles.infoText}>Kiểm tra: {checklist.inspector}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Ionicons name="people-outline" size={16} color="#6b7280" />
                        <Text style={styles.infoText}>Công nhân: {checklist.workersPresent}</Text>
                      </View>
                    </View>

                    {checklist.status === 'completed' && (
                      <>
                        {/* Progress Stats */}
                        <View style={styles.progressContainer}>
                          <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                              <Text style={[styles.statValue, { color: '#10b981' }]}>
                                {passCount}
                              </Text>
                              <Text style={styles.statLabel}>Đạt</Text>
                            </View>

                            <View style={styles.statItem}>
                              <Text style={[styles.statValue, { color: '#ef4444' }]}>
                                {failCount}
                              </Text>
                              <Text style={styles.statLabel}>Không đạt</Text>
                            </View>

                            <View style={styles.statItem}>
                              <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                                {pendingCount}
                              </Text>
                              <Text style={styles.statLabel}>Chờ</Text>
                            </View>

                            <View style={[styles.statItem, styles.statItemLarge]}>
                              <Text style={[styles.statValueLarge, { color: '#3b82f6' }]}>
                                {passRate}%
                              </Text>
                              <Text style={styles.statLabel}>Tỷ lệ đạt</Text>
                            </View>
                          </View>

                          {/* Progress Bar */}
                          <View style={styles.progressBar}>
                            {passCount > 0 && (
                              <View
                                style={[
                                  styles.progressSegment,
                                  {
                                    backgroundColor: '#10b981',
                                    width: `${(passCount / totalCount) * 100}%`
                                  }
                                ]}
                              />
                            )}
                            {failCount > 0 && (
                              <View
                                style={[
                                  styles.progressSegment,
                                  {
                                    backgroundColor: '#ef4444',
                                    width: `${(failCount / totalCount) * 100}%`
                                  }
                                ]}
                              />
                            )}
                            {pendingCount > 0 && (
                              <View
                                style={[
                                  styles.progressSegment,
                                  {
                                    backgroundColor: '#f59e0b',
                                    width: `${(pendingCount / totalCount) * 100}%`
                                  }
                                ]}
                              />
                            )}
                          </View>
                        </View>

                        {/* PPE Compliance */}
                        <View style={styles.ppeContainer}>
                          <Text style={styles.ppeTitle}>Tuân thủ PPE</Text>
                          <View style={styles.ppeGrid}>
                            <View style={styles.ppeItem}>
                              <Ionicons name="person" size={16} color="#3b82f6" />
                              <Text style={styles.ppeLabel}>Mũ: {checklist.ppeCompliance.helmet}%</Text>
                            </View>
                            <View style={styles.ppeItem}>
                              <Ionicons name="shirt" size={16} color="#3b82f6" />
                              <Text style={styles.ppeLabel}>Áo: {checklist.ppeCompliance.safetyVest}%</Text>
                            </View>
                            <View style={styles.ppeItem}>
                              <Ionicons name="footsteps" size={16} color="#3b82f6" />
                              <Text style={styles.ppeLabel}>Giày: {checklist.ppeCompliance.boots}%</Text>
                            </View>
                            <View style={styles.ppeItem}>
                              <Ionicons name="hand-left" size={16} color="#3b82f6" />
                              <Text style={styles.ppeLabel}>Găng: {checklist.ppeCompliance.gloves}%</Text>
                            </View>
                          </View>
                          <View style={styles.ppeOverall}>
                            <Text style={styles.ppeOverallLabel}>Tổng thể:</Text>
                            <Text style={styles.ppeOverallValue}>
                              {checklist.ppeCompliance.overallCompliance}%
                            </Text>
                          </View>
                        </View>
                      </>
                    )}

                    {checklist.notes && (
                      <View style={styles.notesBox}>
                        <Text style={styles.notesTitle}>Ghi chú:</Text>
                        <Text style={styles.notesText}>{checklist.notes}</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handlePerformChecklist(checklist.id)}
                    >
                      <Text style={styles.viewButtonText}>
                        {checklist.status === 'pending' ? 'Thực hiện kiểm tra' : 'Xem chi tiết'}
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937'
  },
  headerSpacer: {
    width: 40
  },
  content: {
    flex: 1
  },
  statsContainer: {
    marginTop: 16
  },
  statsContent: {
    paddingHorizontal: 16,
    gap: 12
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginTop: 16
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16
  },
  checklistsList: {
    gap: 12
  },
  checklistCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  checklistDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  checklistInfo: {
    gap: 8,
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280'
  },
  progressContainer: {
    marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statItemLarge: {
    flex: 1.5
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800'
  },
  statValueLarge: {
    fontSize: 24,
    fontWeight: '800'
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressSegment: {
    height: '100%'
  },
  ppeContainer: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  ppeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8
  },
  ppeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8
  },
  ppeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '48%'
  },
  ppeLabel: {
    fontSize: 12,
    color: '#1e40af'
  },
  ppeOverall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#bfdbfe'
  },
  ppeOverallLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af'
  },
  ppeOverallValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e40af'
  },
  notesBox: {
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4
  },
  notesText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center'
  }
});
