/**
 * Safety Incidents Screen - Migrated to Universal Components
 * Using ModuleLayout + UniversalList pattern with severity indicators
 */

import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { Loader } from '@/components/ui/loader';
import { UniversalList } from '@/components/universal/UniversalList';
import { useIncidents } from '@/hooks/useSafety';
import {
    IncidentSeverity,
    IncidentStatus,
    type SafetyIncident,
} from '@/types/safety';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SafetyIncidentsScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [filter, setFilter] = useState<IncidentStatus | 'all'>('all');

  const { incidents, loading, error, refetch } = useIncidents({
    projectId: projectId || '',
  });

  if (loading && incidents.length === 0) {
    return <Loader />;
  }

  const openIncidents = incidents.filter((i) => i.status === IncidentStatus.REPORTED || i.status === IncidentStatus.INVESTIGATING);
  const criticalIncidents = incidents.filter((i) => i.severity === IncidentSeverity.CRITICAL || i.severity === IncidentSeverity.FATAL);

  const filteredIncidents = filter === 'all' ? incidents : incidents.filter((i) => i.status === filter);

  return (
    <>
      <Stack.Screen options={{ title: 'Sự cố An toàn', headerShown: false }} />

      <ModuleLayout
        title="Sự cố An toàn"
        subtitle={`${incidents.length} sự cố • ${openIncidents.length} đang mở • ${criticalIncidents.length} nghiêm trọng`}
        showBackButton
        headerRight={
          <TouchableOpacity onPress={() => router.push('/safety/incidents/create')}>
            <Ionicons name="add-circle" size={28} color="#1A1A1A" />
          </TouchableOpacity>
        }
        scrollable={false}
        padding={false}
      >
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === IncidentStatus.REPORTED && styles.filterTabActive]}
            onPress={() => setFilter(IncidentStatus.REPORTED)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === IncidentStatus.REPORTED && styles.filterTabTextActive,
              ]}
            >
              Báo cáo
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === IncidentStatus.INVESTIGATING && styles.filterTabActive,
            ]}
            onPress={() => setFilter(IncidentStatus.INVESTIGATING)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === IncidentStatus.INVESTIGATING && styles.filterTabTextActive,
              ]}
            >
              Điều tra
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === IncidentStatus.UNDER_REVIEW && styles.filterTabActive,
            ]}
            onPress={() => setFilter(IncidentStatus.UNDER_REVIEW)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === IncidentStatus.UNDER_REVIEW && styles.filterTabTextActive,
              ]}
            >
              Xem xét
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === IncidentStatus.RESOLVED && styles.filterTabActive]}
            onPress={() => setFilter(IncidentStatus.RESOLVED)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === IncidentStatus.RESOLVED && styles.filterTabTextActive,
              ]}
            >
              Giải quyết
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === IncidentStatus.CLOSED && styles.filterTabActive]}
            onPress={() => setFilter(IncidentStatus.CLOSED)}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === IncidentStatus.CLOSED && styles.filterTabTextActive,
              ]}
            >
              Đóng
            </Text>
          </TouchableOpacity>
        </View>

        {/* Universal List with custom incident cards */}
        <UniversalList<SafetyIncident>
          config={{
            data: filteredIncidents,
            keyExtractor: (item) => item.id,
            renderItem: (item) => <IncidentCard incident={item} />,
            onRefresh: refetch,
            emptyIcon: 'alert-circle',
            emptyMessage: 'Chưa có sự cố an toàn nào',
            emptyAction: {
              label: 'Báo cáo sự cố',
              onPress: () => router.push('/safety/incidents/create'),
            },
          }}
        />
      </ModuleLayout>
    </>
  );
}

// Custom card for safety incidents with severity indicators
interface IncidentCardProps {
  incident: SafetyIncident;
}

function IncidentCard({ incident }: IncidentCardProps) {
  const severityColor = getSeverityColor(incident.severity);
  const statusColor = getStatusColor(incident.status);
  const hasInjuries = !!incident.injuredPerson;

  return (
    <TouchableOpacity
      style={[styles.incidentCard, { borderLeftColor: severityColor, borderLeftWidth: 4 }]}
      onPress={() => router.push(`/safety/incidents/${incident.id}`)}
    >
      {/* Header with severity and status */}
      <View style={styles.incidentHeader}>
        <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
          <Ionicons name={getSeverityIcon(incident.severity) as any} size={14} color="#FFF" />
          <Text style={styles.severityText}>{getSeverityLabel(incident.severity)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(incident.status)}
          </Text>
        </View>
      </View>

      {/* Incident number and title */}
      <View style={styles.incidentTitleRow}>
        <Text style={styles.incidentNumber}>#{incident.incidentNumber || incident.id}</Text>
        <Text style={styles.incidentTitle}>{incident.title}</Text>
      </View>

      {/* Injury banner */}
      {hasInjuries && (
        <View style={styles.injuryBanner}>
          <Ionicons name="medical" size={16} color="#FFF" />
          <Text style={styles.injuryText}>{incident.injuredPerson?.name || 'Có người bị thương'}</Text>
          {incident.medicalTreatment && (
            <View style={styles.medicalBadge}>
              <Ionicons name="pulse" size={12} color="#D32F2F" />
              <Text style={styles.medicalText}>Y tế</Text>
            </View>
          )}
        </View>
      )}

      {/* Info grid */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Mức độ</Text>
          <Text style={[styles.infoValue, { color: severityColor }]}>
            {getSeverityLabel(incident.severity)}
          </Text>
        </View>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Xảy ra</Text>
          <Text style={styles.infoValue}>{formatDate(incident.occurredAt.toString())}</Text>
        </View>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Địa điểm</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {incident.location}
          </Text>
        </View>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>Phụ trách</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {incident.responsiblePerson || 'Chưa phân công'}
          </Text>
        </View>
      </View>

      {/* Description preview */}
      {incident.description && (
        <Text style={styles.descriptionPreview} numberOfLines={2}>
          {incident.description}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.incidentFooter}>
        <View style={styles.reporterInfo}>
          <Ionicons name="person-circle" size={14} color="#666" />
          <Text style={styles.reporterText}>
            {incident.reportedBy} • {formatTimestamp(incident.reportedAt.toString())}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#999" />
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
      return '#1A1A1A';
    case IncidentSeverity.MODERATE:
      return '#FF9800';
    case IncidentSeverity.MINOR:
      return '#FDD835';
    default:
      return '#9E9E9E';
  }
}

function getSeverityIcon(severity: IncidentSeverity): string {
  switch (severity) {
    case IncidentSeverity.FATAL:
      return 'skull';
    case IncidentSeverity.CRITICAL:
      return 'alert-circle';
    case IncidentSeverity.SERIOUS:
      return 'warning';
    case IncidentSeverity.MODERATE:
      return 'alert';
    case IncidentSeverity.MINOR:
      return 'information-circle';
    default:
      return 'help-circle';
  }
}

function getSeverityLabel(severity: IncidentSeverity): string {
  switch (severity) {
    case IncidentSeverity.FATAL:
      return 'Tử vong';
    case IncidentSeverity.CRITICAL:
      return 'Nguy kịch';
    case IncidentSeverity.SERIOUS:
      return 'Nghiêm trọng';
    case IncidentSeverity.MODERATE:
      return 'Trung bình';
    case IncidentSeverity.MINOR:
      return 'Nhẹ';
    default:
      return severity;
  }
}

function getStatusColor(status: IncidentStatus): string {
  switch (status) {
    case IncidentStatus.REPORTED:
      return '#1A1A1A';
    case IncidentStatus.INVESTIGATING:
      return '#FF9800';
    case IncidentStatus.UNDER_REVIEW:
      return '#1A1A1A';
    case IncidentStatus.RESOLVED:
      return '#4CAF50';
    case IncidentStatus.CLOSED:
      return '#9E9E9E';
    default:
      return '#999';
  }
}

function getStatusLabel(status: IncidentStatus): string {
  switch (status) {
    case IncidentStatus.REPORTED:
      return 'Đã báo cáo';
    case IncidentStatus.INVESTIGATING:
      return 'Đang điều tra';
    case IncidentStatus.UNDER_REVIEW:
      return 'Đang xem xét';
    case IncidentStatus.RESOLVED:
      return 'Đã giải quyết';
    case IncidentStatus.CLOSED:
      return 'Đã đóng';
    default:
      return status;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) {
    return formatDate(dateString);
  }
  if (diffDays > 0) {
    return `${diffDays} ngày trước`;
  }
  if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  }
  return 'Vừa xong';
}

const styles = StyleSheet.create({
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#1A1A1A',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  // Custom incident card styles
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
    marginBottom: 12,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  severityText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  incidentTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  incidentNumber: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  injuryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  injuryText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
    flex: 1,
  },
  medicalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  medicalText: {
    fontSize: 10,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  infoCell: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  descriptionPreview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reporterText: {
    fontSize: 12,
    color: '#666',
  },
});
