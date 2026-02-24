/**
 * Safety Incidents List Screen
 * View and manage safety incidents for construction projects
 */

import { Loader } from '@/components/ui/loader';
import { useIncidents } from '@/hooks/useSafety';
import {
    IncidentSeverity,
    IncidentStatus,
    IncidentType,
    type SafetyIncident,
} from '@/types/safety';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function IncidentsListScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<IncidentStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const { incidents, loading, error, refetch } = useIncidents({
    projectId: projectId || '',
    status: filter === 'ALL' ? undefined : [filter],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && incidents.length === 0) {
    return <Loader />;
  }

  const criticalIncidents = incidents.filter(
    (i) => i.severity === IncidentSeverity.CRITICAL || i.severity === IncidentSeverity.FATAL
  );
  const openIncidents = incidents.filter(
    (i) => i.status !== IncidentStatus.CLOSED && i.status !== IncidentStatus.RESOLVED
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sự cố an toàn',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/safety/incidents/create?projectId=${projectId}`)}
            >
              <Ionicons name="add-circle" size={28} color="#0D9488" style={{ marginRight: 8 }} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Stats Header */}
      <View style={styles.statsHeader}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{incidents.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statValueWarning]}>
            {openIncidents.length}
          </Text>
          <Text style={styles.statLabel}>Đang xử lý</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statValueCritical]}>
            {criticalIncidents.length}
          </Text>
          <Text style={styles.statLabel}>Nghiêm trọng</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['ALL', IncidentStatus.REPORTED, IncidentStatus.INVESTIGATING, IncidentStatus.UNDER_REVIEW, IncidentStatus.RESOLVED, IncidentStatus.CLOSED] as const).map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterTab, filter === status && styles.filterTabActive]}
              onPress={() => setFilter(status as IncidentStatus | 'ALL')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === status && styles.filterTabTextActive,
                ]}
              >
                {getStatusFilterLabel(status as IncidentStatus | 'ALL')}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <FlatList
        data={incidents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IncidentCard incident={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="shield-checkmark" size={64} color="#0D9488" />
            <Text style={styles.emptyText}>Không có sự cố nào</Text>
            <Text style={styles.emptyHint}>Môi trường làm việc an toàn</Text>
          </View>
        }
      />
    </>
  );
}

interface IncidentCardProps {
  incident: SafetyIncident;
}

function IncidentCard({ incident }: IncidentCardProps) {
  const severityColor = getSeverityColor(incident.severity);
  const statusColor = getStatusColor(incident.status);

  return (
    <TouchableOpacity
      style={[styles.incidentCard, { borderLeftColor: severityColor, borderLeftWidth: 4 }]}
      onPress={() => router.push(`/safety/incidents/${incident.id}`)}
    >
      {/* Header */}
      <View style={styles.incidentHeader}>
        <View style={styles.incidentHeaderLeft}>
          <View style={[styles.severityBadge, { backgroundColor: `${severityColor}15` }]}>
            <Ionicons name={getIncidentIcon(incident.type)} size={24} color={severityColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.incidentNumber}>{incident.incidentNumber}</Text>
            <Text style={styles.incidentTitle} numberOfLines={1}>
              {incident.title}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{getStatusLabel(incident.status)}</Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="alert-circle" size={14} color="#666" />
          <Text style={styles.infoLabel}>Mức độ:</Text>
          <Text style={[styles.infoValue, { color: severityColor }]}>
            {getSeverityLabel(incident.severity)}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.infoLabel}>Xảy ra:</Text>
          <Text style={styles.infoValue}>
            {new Date(incident.occurredAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <Ionicons name="location" size={14} color="#666" />
          <Text style={styles.infoLabel}>Vị trí:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {incident.location}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={14} color="#666" />
          <Text style={styles.infoLabel}>Người phụ trách:</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {incident.responsiblePerson}
          </Text>
        </View>
      </View>

      {/* Injury Indicator */}
      {incident.injuredPerson && (
        <View style={styles.injuryBanner}>
          <Ionicons name="medical" size={16} color="#000000" />
          <Text style={styles.injuryText}>
            Có người bị thương: {incident.injuredPerson.name}
          </Text>
          {incident.medicalTreatment && (
            <View style={styles.medicalBadge}>
              <Text style={styles.medicalBadgeText}>Điều trị y tế</Text>
            </View>
          )}
        </View>
      )}

      {/* Description Preview */}
      <Text style={styles.description} numberOfLines={2}>
        {incident.description}
      </Text>

      {/* Footer */}
      <View style={styles.incidentFooter}>
        <Text style={styles.footerText}>
          Báo cáo bởi {incident.reportedBy} -{' '}
          {new Date(incident.reportedAt).toLocaleString('vi-VN')}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </View>
    </TouchableOpacity>
  );
}

// Helper functions
function getSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case IncidentSeverity.FATAL:
      return '#000000';
    case IncidentSeverity.CRITICAL:
      return '#B71C1C';
    case IncidentSeverity.SERIOUS:
      return '#000000';
    case IncidentSeverity.MODERATE:
      return '#0D9488';
    case IncidentSeverity.MINOR:
      return '#0D9488';
    default:
      return '#999999';
  }
}

function getSeverityLabel(severity: IncidentSeverity): string {
  const labels: Record<IncidentSeverity, string> = {
    [IncidentSeverity.FATAL]: 'Tử vong',
    [IncidentSeverity.CRITICAL]: 'Cực kỳ nghiêm trọng',
    [IncidentSeverity.SERIOUS]: 'Nghiêm trọng',
    [IncidentSeverity.MODERATE]: 'Trung bình',
    [IncidentSeverity.MINOR]: 'Nhẹ',
  };
  return labels[severity] || severity;
}

function getStatusColor(status: IncidentStatus): string {
  switch (status) {
    case IncidentStatus.REPORTED:
      return '#000000';
    case IncidentStatus.INVESTIGATING:
      return '#0D9488';
    case IncidentStatus.UNDER_REVIEW:
      return '#0D9488';
    case IncidentStatus.RESOLVED:
      return '#0D9488';
    case IncidentStatus.CLOSED:
      return '#999999';
    default:
      return '#666';
  }
}

function getStatusLabel(status: IncidentStatus): string {
  const labels: Record<IncidentStatus, string> = {
    [IncidentStatus.REPORTED]: 'Đã báo cáo',
    [IncidentStatus.INVESTIGATING]: 'Đang điều tra',
    [IncidentStatus.UNDER_REVIEW]: 'Đang xem xét',
    [IncidentStatus.RESOLVED]: 'Đã giải quyết',
    [IncidentStatus.CLOSED]: 'Đã đóng',
  };
  return labels[status] || status;
}

function getStatusFilterLabel(status: IncidentStatus | 'ALL'): string {
  if (status === 'ALL') return 'Tất cả';
  return getStatusLabel(status);
}

function getIncidentIcon(type: IncidentType): any {
  const icons: Partial<Record<IncidentType, string>> = {
    [IncidentType.FALL]: 'arrow-down',
    [IncidentType.STRUCK_BY]: 'flash',
    [IncidentType.ELECTRICAL]: 'flash',
    [IncidentType.EQUIPMENT_FAILURE]: 'construct',
    [IncidentType.FIRE]: 'flame',
    [IncidentType.CHEMICAL_EXPOSURE]: 'flask',
    [IncidentType.NEAR_MISS]: 'warning',
  };
  return icons[type] || 'alert-circle';
}

const styles = StyleSheet.create({
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statValueWarning: {
    color: '#0D9488',
  },
  statValueCritical: {
    color: '#000000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#0D9488',
  },
  filterTabText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#0D9488',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  incidentCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  incidentHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  severityBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incidentNumber: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  injuryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 6,
    gap: 8,
    marginBottom: 12,
  },
  injuryText: {
    flex: 1,
    fontSize: 13,
    color: '#C62828',
    fontWeight: '500',
  },
  medicalBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  medicalBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerText: {
    fontSize: 11,
    color: '#999',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
