import { MetricCard, StatusBadge } from '@/components/construction';
import FloatingActionButton from '@/components/ui/floating-action-button';
import { Loader } from '@/components/ui/loader';
import { useSettings } from '@/context/settings-context';
import { IncidentSeverity, SafetyIncident, SafetyService } from '@/services/api/safety.mock';
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
  'near-miss': '#0D9488',
  'minor': '#0D9488',
  'major': '#000000',
  'fatal': '#7f1d1d'
};

const SEVERITY_LABELS = {
  'near-miss': 'Suýt xảy ra',
  'minor': 'Nhẹ',
  'major': 'Nghiêm trọng',
  'fatal': 'Tử vong'
};

const STATUS_COLORS = {
  'reported': '#0D9488',
  'investigating': '#0D9488',
  'closed': '#0D9488'
};

const STATUS_LABELS = {
  'reported': 'Đã báo cáo',
  'investigating': 'Đang điều tra',
  'closed': 'Đã đóng'
};

export default function SafetyIncidentsScreen() {
  const { id: projectId } = useLocalSearchParams();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');

  useEffect(() => {
    loadData();
  }, [projectId, severityFilter]);

  const loadData = async () => {
    try {
      const [incidentsData, statsData] = await Promise.all([
        SafetyService.getIncidents({
          projectId: projectId as string,
          severity: severityFilter !== 'all' ? severityFilter : undefined
        }),
        SafetyService.getStats(projectId as string)
      ]);

      setIncidents(incidentsData);
      setStats(statsData);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu sự cố an toàn');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleViewIncident = (incidentId: string) => {
    router.push(`/projects/${projectId}/safety/incidents/${incidentId}/detail`);
  };

  const handleCreateIncident = () => {
    router.push(`/projects/${projectId}/safety/incidents/create`);
  };

  if (loading) {
    return <Loader />;
  }

  const filteredIncidents = incidents;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sự cố An toàn</Text>
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
              label="Tổng số sự cố"
              value={stats.totalIncidents.toString()}
              icon="alert-circle"
              gradientColors={['#0D9488', '#0D9488']}
            />
            <MetricCard
              label="Suýt xảy ra"
              value={stats.nearMisses.toString()}
              icon="alert"
              gradientColors={['#0D9488', '#0F766E']}
            />
            <MetricCard
              label="Sự cố nhẹ"
              value={stats.minorIncidents.toString()}
              icon="warning"
              gradientColors={['#0D9488', '#d97706']}
            />
            <MetricCard
              label="Nghiêm trọng"
              value={stats.majorIncidents.toString()}
              icon="close-circle"
              gradientColors={['#000000', '#000000']}
            />
            <MetricCard
              label="Ngày không sự cố"
              value={stats.daysWithoutIncident.toString()}
              icon="checkmark-circle"
              gradientColors={['#0D9488', '#0D9488']}
            />
          </ScrollView>
        )}

        {/* Quick Action */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateIncident}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Báo cáo sự cố</Text>
          </TouchableOpacity>
        </View>

        {/* Severity Filter */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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

            {(['near-miss', 'minor', 'major', 'fatal'] as IncidentSeverity[]).map(severity => (
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
        </View>

        {/* Incidents Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách sự cố</Text>

          {filteredIncidents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#0D9488" />
              <Text style={styles.emptyStateTitle}>Không có sự cố nào</Text>
              <Text style={styles.emptyStateText}>
                Tuyệt vời! Công trình đang vận hành an toàn
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {filteredIncidents.map((incident) => (
                <View key={incident.id} style={styles.incidentCard}>
                  <View style={styles.incidentHeader}>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: SEVERITY_COLORS[incident.severity] + '20' }
                        ]}
                      >
                        <View
                          style={[
                            styles.severityDot,
                            { backgroundColor: SEVERITY_COLORS[incident.severity] }
                          ]}
                        />
                        <Text
                          style={[
                            styles.severityText,
                            { color: SEVERITY_COLORS[incident.severity] }
                          ]}
                        >
                          {SEVERITY_LABELS[incident.severity]}
                        </Text>
                      </View>
                      <StatusBadge
                        label={STATUS_LABELS[incident.status]}
                        variant={incident.status === 'closed' ? 'success' : incident.status === 'investigating' ? 'info' : 'warning'}
                        size="small"
                      />
                    </View>
                  </View>

                  <Text style={styles.incidentTitle}>{incident.title}</Text>
                  <Text style={styles.incidentDescription} numberOfLines={2}>
                    {incident.description}
                  </Text>

                  <View style={styles.incidentInfo}>
                    <View style={styles.infoRow}>
                      <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                      <Text style={styles.infoText}>
                        {new Date(incident.date).toLocaleDateString('vi-VN')} - {incident.time}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={14} color="#6b7280" />
                      <Text style={styles.infoText}>{incident.location}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons name="person-outline" size={14} color="#6b7280" />
                      <Text style={styles.infoText}>Báo cáo: {incident.reportedBy}</Text>
                    </View>

                    {incident.involvedPersons.length > 0 && (
                      <View style={styles.infoRow}>
                        <Ionicons name="people-outline" size={14} color="#6b7280" />
                        <Text style={styles.infoText}>
                          Liên quan: {incident.involvedPersons.join(', ')}
                        </Text>
                      </View>
                    )}

                    {incident.injuryType !== 'none' && (
                      <View style={styles.warningBox}>
                        <Ionicons name="medical" size={14} color="#000000" />
                        <Text style={styles.warningText}>
                          Có thương tích: {incident.injuryType}
                        </Text>
                      </View>
                    )}
                  </View>

                  {incident.status === 'closed' && incident.correctiveActions && (
                    <View style={styles.actionsBox}>
                      <Text style={styles.actionsTitle}>Biện pháp khắc phục:</Text>
                      {incident.correctiveActions.map((action, idx) => (
                        <Text key={idx} style={styles.actionItem}>
                          • {action}
                        </Text>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewIncident(incident.id)}
                  >
                    <Text style={styles.viewButtonText}>Xem chi tiết</Text>
                    <Ionicons name="chevron-forward" size={16} color="#0D9488" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        projectId={projectId as string}
        position={settings.fabPosition}
        size={settings.fabSize}
        enabled={settings.fabEnabled}
      />
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
    backgroundColor: '#000000',
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
  filterContainer: {
    marginTop: 16,
    marginBottom: 8
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
    backgroundColor: '#0D9488',
    borderColor: '#0D9488'
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16
  },
  timeline: {
    gap: 12
  },
  incidentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  incidentHeader: {
    marginBottom: 12
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  incidentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8
  },
  incidentDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12
  },
  incidentInfo: {
    gap: 8
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 4
  },
  warningText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600'
  },
  actionsBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginTop: 12
  },
  actionsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
    marginBottom: 6
  },
  actionItem: {
    fontSize: 12,
    color: '#047857',
    lineHeight: 18
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 4
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488'
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
