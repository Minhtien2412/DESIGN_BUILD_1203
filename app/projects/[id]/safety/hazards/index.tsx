import { MetricCard, StatusBadge } from '@/components/construction';
import { Loader } from '@/components/ui/loader';
import { Hazard, HazardSeverity, HazardStatus, SafetyService } from '@/services/api/safety.mock';
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

const SEVERITY_COLORS = {
  low: '#3b82f6',
  medium: '#0066CC',
  high: '#000000',
  critical: '#7f1d1d'
};

const SEVERITY_LABELS = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Nghiêm trọng'
};

const STATUS_COLORS = {
  identified: '#0066CC',
  mitigating: '#3b82f6',
  resolved: '#0066CC'
};

const STATUS_LABELS = {
  identified: 'Đã xác định',
  mitigating: 'Đang xử lý',
  resolved: 'Đã giải quyết'
};

export default function SafetyHazardsScreen() {
  const { id: projectId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState<HazardSeverity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<HazardStatus | 'all'>('all');

  useEffect(() => {
    loadData();
  }, [projectId, severityFilter, statusFilter]);

  const loadData = async () => {
    try {
      const [hazardsData, statsData] = await Promise.all([
        SafetyService.getHazards({
          projectId: projectId as string,
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }),
        SafetyService.getStats(projectId as string)
      ]);

      setHazards(hazardsData);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu nguy cơ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleResolveHazard = (hazardId: string) => {
    Alert.prompt(
      'Giải quyết nguy cơ',
      'Nhập mô tả cách giải quyết:',
      async (resolution) => {
        if (resolution) {
          try {
            await SafetyService.updateHazard(hazardId, {
              status: 'resolved',
              resolvedDate: new Date().toISOString()
            });
            loadData();
            Alert.alert('Thành công', 'Đã đánh dấu nguy cơ là đã giải quyết');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật nguy cơ');
          }
        }
      }
    );
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
        <Text style={styles.headerTitle}>Nguy cơ An toàn</Text>
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
              label="Tổng nguy cơ"
              value={stats.totalHazards.toString()}
              icon="warning"
              gradientColors={['#0066CC', '#d97706']}
            />
            <MetricCard
              label="Nghiêm trọng"
              value={stats.criticalHazards.toString()}
              icon="alert-circle"
              gradientColors={['#000000', '#000000']}
            />
            <MetricCard
              label="Đã giải quyết"
              value={stats.resolvedHazards.toString()}
              icon="checkmark-circle"
              gradientColors={['#0066CC', '#0066CC']}
            />
          </ScrollView>
        )}

        {/* Dual Filters */}
        <View style={styles.filtersSection}>
          {/* Severity Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                severityFilter === 'all' && styles.filterChipActive
              ]}
              onPress={() => setSeverityFilter('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  severityFilter === 'all' && styles.filterChipTextActive
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {(['low', 'medium', 'high', 'critical'] as HazardSeverity[]).map(severity => (
              <TouchableOpacity
                key={severity}
                style={[
                  styles.filterChip,
                  severityFilter === severity && styles.filterChipActive
                ]}
                onPress={() => setSeverityFilter(severity)}
              >
                <View
                  style={[
                    styles.severityDot,
                    { backgroundColor: SEVERITY_COLORS[severity] }
                  ]}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    severityFilter === severity && styles.filterChipTextActive
                  ]}
                >
                  {SEVERITY_LABELS[severity]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Status Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                statusFilter === 'all' && styles.filterChipActive
              ]}
              onPress={() => setStatusFilter('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === 'all' && styles.filterChipTextActive
                ]}
              >
                Tất cả
              </Text>
            </TouchableOpacity>

            {(['identified', 'mitigating', 'resolved'] as HazardStatus[]).map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  statusFilter === status && styles.filterChipActive
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    statusFilter === status && styles.filterChipTextActive
                  ]}
                >
                  {STATUS_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hazards List */}
        <View style={styles.section}>
          {hazards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark-outline" size={64} color="#0066CC" />
              <Text style={styles.emptyStateTitle}>Không có nguy cơ nào</Text>
              <Text style={styles.emptyStateText}>
                Tuyệt vời! Không phát hiện nguy cơ an toàn nào
              </Text>
            </View>
          ) : (
            <View style={styles.hazardsList}>
              {hazards.map((hazard) => (
                <View key={hazard.id} style={styles.hazardCard}>
                  <View style={styles.hazardHeader}>
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: SEVERITY_COLORS[hazard.severity] + '20' }
                      ]}
                    >
                      <View
                        style={[
                          styles.severityDot,
                          { backgroundColor: SEVERITY_COLORS[hazard.severity] }
                        ]}
                      />
                      <Text
                        style={[
                          styles.severityText,
                          { color: SEVERITY_COLORS[hazard.severity] }
                        ]}
                      >
                        {SEVERITY_LABELS[hazard.severity]}
                      </Text>
                    </View>
                    <StatusBadge
                      label={STATUS_LABELS[hazard.status]}
                      variant={hazard.status === 'resolved' ? 'success' : hazard.status === 'mitigating' ? 'info' : 'warning'}
                      size="small"
                    />
                  </View>

                  <Text style={styles.hazardTitle}>{hazard.title}</Text>
                  <Text style={styles.hazardDescription} numberOfLines={2}>
                    {hazard.description}
                  </Text>

                  {/* Risk Matrix */}
                  <View style={styles.riskMatrix}>
                    <View style={styles.riskItem}>
                      <Text style={styles.riskLabel}>Khả năng xảy ra:</Text>
                      <Text style={styles.riskValue}>{hazard.likelihood}</Text>
                    </View>
                    <View style={styles.riskItem}>
                      <Text style={styles.riskLabel}>Mức độ ảnh hưởng:</Text>
                      <Text style={styles.riskValue}>{hazard.impact}</Text>
                    </View>
                    <View style={[styles.riskItem, styles.riskRating]}>
                      <Text style={styles.riskLabel}>Risk Rating:</Text>
                      <Text
                        style={[
                          styles.riskRatingValue,
                          {
                            color:
                              hazard.riskRating >= 15
                                ? '#000000'
                                : hazard.riskRating >= 10
                                ? '#0066CC'
                                : '#3b82f6'
                          }
                        ]}
                      >
                        {hazard.riskRating}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.hazardInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={14} color="#6b7280" />
                      <Text style={styles.infoText}>{hazard.location}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="pricetag-outline" size={14} color="#6b7280" />
                      <Text style={styles.infoText}>{hazard.category}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={14} color="#6b7280" />
                      <Text style={styles.infoText}>Xác định: {hazard.identifiedBy}</Text>
                    </View>

                    {hazard.assignedTo && (
                      <View style={styles.infoRow}>
                        <Ionicons name="person-circle-outline" size={14} color="#6b7280" />
                        <Text style={styles.infoText}>Phụ trách: {hazard.assignedTo}</Text>
                      </View>
                    )}

                    {hazard.targetDate && (
                      <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                        <Text style={styles.infoText}>
                          Deadline: {new Date(hazard.targetDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {hazard.mitigationPlan && (
                    <View style={styles.mitigationBox}>
                      <Text style={styles.mitigationTitle}>Kế hoạch xử lý:</Text>
                      <Text style={styles.mitigationText}>{hazard.mitigationPlan}</Text>
                      {hazard.mitigationActions && (
                        <View style={styles.actionsList}>
                          {hazard.mitigationActions.map((action, idx) => (
                            <Text key={idx} style={styles.actionItem}>
                              • {action}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {hazard.status !== 'resolved' && (
                    <TouchableOpacity
                      style={styles.resolveButton}
                      onPress={() => handleResolveHazard(hazard.id)}
                    >
                      <Text style={styles.resolveButtonText}>Đánh dấu đã giải quyết</Text>
                    </TouchableOpacity>
                  )}

                  {hazard.status === 'resolved' && hazard.resolvedDate && (
                    <View style={styles.resolvedBox}>
                      <Ionicons name="checkmark-circle" size={16} color="#0066CC" />
                      <Text style={styles.resolvedText}>
                        Đã giải quyết - {new Date(hazard.resolvedDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
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
  filtersSection: {
    marginTop: 16,
    gap: 12
  },
  filterContainer: {
    flexGrow: 0
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6'
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  filterChipTextActive: {
    color: '#fff'
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  hazardsList: {
    gap: 12
  },
  hazardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  hazardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700'
  },
  hazardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8
  },
  hazardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12
  },
  riskMatrix: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12
  },
  riskItem: {
    flex: 1
  },
  riskLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4
  },
  riskValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937'
  },
  riskRating: {
    alignItems: 'center'
  },
  riskRatingValue: {
    fontSize: 20,
    fontWeight: '800'
  },
  hazardInfo: {
    gap: 8,
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280'
  },
  mitigationBox: {
    backgroundColor: '#E8F4FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  mitigationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 6
  },
  mitigationText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 18,
    marginBottom: 8
  },
  actionsList: {
    gap: 4
  },
  actionItem: {
    fontSize: 12,
    color: '#1e3a8a',
    lineHeight: 18
  },
  resolveButton: {
    borderWidth: 1,
    borderColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  resolveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC'
  },
  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 8,
    gap: 8
  },
  resolvedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC'
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
