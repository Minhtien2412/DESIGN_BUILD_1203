/**
 * Inspection & Testing List Screen
 */

import { useInspectionAnalytics, useInspections } from '@/hooks/useInspection';
import { InspectionStatus, InspectionType } from '@/types/inspection';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const INSPECTION_TYPES: { value: InspectionType | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All', icon: 'list-outline' },
  { value: InspectionType.FOUNDATION, label: 'Foundation', icon: 'hammer-outline' },
  { value: InspectionType.STRUCTURAL, label: 'Structural', icon: 'business-outline' },
  { value: InspectionType.ELECTRICAL, label: 'Electrical', icon: 'flash-outline' },
  { value: InspectionType.PLUMBING, label: 'Plumbing', icon: 'water-outline' },
  { value: InspectionType.HVAC, label: 'HVAC', icon: 'thermometer-outline' },
  { value: InspectionType.FINISHING, label: 'Finishing', icon: 'color-palette-outline' },
  { value: InspectionType.SAFETY, label: 'Safety', icon: 'shield-checkmark-outline' },
  { value: InspectionType.FINAL, label: 'Final', icon: 'checkmark-done-outline' },
];

const STATUS_FILTERS: { value: InspectionStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: InspectionStatus.SCHEDULED, label: 'Scheduled' },
  { value: InspectionStatus.IN_PROGRESS, label: 'In Progress' },
  { value: InspectionStatus.PASSED, label: 'Passed' },
  { value: InspectionStatus.FAILED, label: 'Failed' },
  { value: InspectionStatus.CONDITIONAL_PASS, label: 'Conditional' },
];

const STATUS_COLORS: Record<InspectionStatus, string> = {
  SCHEDULED: '#3B82F6',
  IN_PROGRESS: '#0066CC',
  PASSED: '#0066CC',
  FAILED: '#000000',
  CONDITIONAL_PASS: '#0066CC',
  CANCELLED: '#6B7280',
  RESCHEDULED: '#666666',
  PENDING: '#9CA3AF',
  PASS: '#0066CC',
  FAIL: '#000000',
  NA: '#6B7280',
  COMPLETED: '#3B82F6',
  APPROVED: '#0066CC',
  REJECTED: '#000000',
};

const SEVERITY_COLORS = {
  MINOR: '#0066CC',
  MODERATE: '#0066CC',
  MAJOR: '#0066CC',
  CRITICAL: '#000000',
};

export default function InspectionsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<InspectionType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<InspectionStatus | 'ALL'>('ALL');

  const {
    inspections,
    loading,
    error,
    refresh,
    startInspection,
    approveInspection,
    rescheduleInspection,
  } = useInspections({
    type: selectedType !== 'ALL' ? selectedType : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  });

  const { analytics } = useInspectionAnalytics();

  const filteredInspections = inspections.filter(
    inspection =>
      inspection.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStart = async (id: string) => {
    try {
      await startInspection(id);
    } catch (err) {
      console.error('Failed to start inspection:', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveInspection(id);
    } catch (err) {
      console.error('Failed to approve inspection:', err);
    }
  };

  if (loading && !inspections.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const scheduledCount = inspections.filter(i => i.status === InspectionStatus.SCHEDULED).length;
  const inProgressCount = inspections.filter(i => i.status === InspectionStatus.IN_PROGRESS).length;
  const passedCount = inspections.filter(i => i.status === InspectionStatus.PASSED).length;

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E8F4FF' }]}>
          <Text style={styles.statValue}>{inspections.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#E8F4FF' }]}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>{scheduledCount}</Text>
          <Text style={styles.statLabel}>Scheduled</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#0066CC' }]}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#0066CC' }]}>{passedCount}</Text>
          <Text style={styles.statLabel}>Passed</Text>
        </View>

        {analytics && (
          <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.statValue, { color: '#0066CC' }]}>
              {analytics.summary.passRate.toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>Pass Rate</Text>
          </View>
        )}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by number, title, location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Type Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {INSPECTION_TYPES.map(type => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.filterChip,
              selectedType === type.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(type.value)}
          >
            <Ionicons
              name={type.icon as any}
              size={16}
              color={selectedType === type.value ? '#FFFFFF' : '#6B7280'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.filterChipText,
                selectedType === type.value && styles.filterChipTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {STATUS_FILTERS.map(status => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.filterChip,
              selectedStatus === status.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(status.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedStatus === status.value && styles.filterChipTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inspections List */}
      <ScrollView style={styles.listContainer}>
        {filteredInspections.map(inspection => {
          const statusColor = STATUS_COLORS[inspection.status];
          const hasCriticalFindings =
            inspection.result && inspection.result.criticalFindings > 0;

          return (
            <View key={inspection.id} style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View
                  style={[styles.iconContainer, { backgroundColor: `${statusColor}26` }]}
                >
                  <Ionicons
                    name={
                      inspection.status === InspectionStatus.PASSED
                        ? 'checkmark-circle'
                        : inspection.status === InspectionStatus.FAILED
                        ? 'close-circle'
                        : inspection.status === InspectionStatus.IN_PROGRESS
                        ? 'time'
                        : 'calendar-outline'
                    }
                    size={28}
                    color={statusColor}
                  />
                </View>

                <View style={styles.cardHeaderText}>
                  <View style={styles.headerRow}>
                    <Text style={styles.inspectionNumber}>{inspection.inspectionNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Text style={styles.statusBadgeText}>
                        {inspection.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.title} numberOfLines={1}>
                    {inspection.title}
                  </Text>

                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={
                        INSPECTION_TYPES.find(t => t.value === inspection.type)?.icon as any ||
                        'list-outline'
                      }
                      size={12}
                      color="#0066CC"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.typeBadgeText}>{inspection.type}</Text>
                  </View>
                </View>
              </View>

              {/* Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{inspection.location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Scheduled: {new Date(inspection.scheduledDate).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Inspector: {inspection.inspector.name} ({inspection.inspector.company})
                  </Text>
                </View>
              </View>

              {/* Checklist Results */}
              {inspection.result && (
                <View style={styles.resultsSection}>
                  <View style={styles.resultsRow}>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultValue}>{inspection.result.passedItems}</Text>
                      <Text style={styles.resultLabel}>Passed</Text>
                    </View>

                    <View style={styles.resultItem}>
                      <Text style={[styles.resultValue, { color: '#000000' }]}>
                        {inspection.result.failedItems}
                      </Text>
                      <Text style={styles.resultLabel}>Failed</Text>
                    </View>

                    <View style={styles.resultItem}>
                      <Text style={[styles.resultValue, { color: '#6B7280' }]}>
                        {inspection.result.naItems}
                      </Text>
                      <Text style={styles.resultLabel}>N/A</Text>
                    </View>

                    <View style={styles.resultItem}>
                      <Text style={[styles.resultValue, { color: '#0066CC' }]}>
                        {inspection.result.passRate.toFixed(0)}%
                      </Text>
                      <Text style={styles.resultLabel}>Pass Rate</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Findings Summary */}
              {inspection.findings && inspection.findings.length > 0 && (
                <View style={styles.findingsSection}>
                  <Text style={styles.findingsTitle}>
                    Findings ({inspection.findings.length})
                  </Text>

                  {inspection.findings.slice(0, 3).map((finding, index) => (
                    <View key={index} style={styles.findingItem}>
                      <View
                        style={[
                          styles.severityDot,
                          { backgroundColor: SEVERITY_COLORS[finding.severity] },
                        ]}
                      />
                      <Text style={styles.findingText} numberOfLines={1}>
                        {finding.description}
                      </Text>
                      <Text
                        style={[
                          styles.severityBadge,
                          { color: SEVERITY_COLORS[finding.severity] },
                        ]}
                      >
                        {finding.severity}
                      </Text>
                    </View>
                  ))}

                  {inspection.findings.length > 3 && (
                    <Text style={styles.moreFindings}>
                      +{inspection.findings.length - 3} more findings
                    </Text>
                  )}
                </View>
              )}

              {/* Critical Warning */}
              {hasCriticalFindings && (
                <View style={styles.criticalWarning}>
                  <Ionicons name="warning" size={16} color="#000000" />
                  <Text style={styles.criticalWarningText}>
                    {inspection.result!.criticalFindings} critical finding
                    {inspection.result!.criticalFindings > 1 ? 's' : ''} require immediate attention
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {inspection.status === InspectionStatus.SCHEDULED && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleStart(inspection.id)}
                  >
                    <Ionicons name="play-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Start</Text>
                  </TouchableOpacity>
                )}

                {inspection.status === InspectionStatus.IN_PROGRESS && (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonSuccess]}>
                    <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Submit</Text>
                  </TouchableOpacity>
                )}

                {(inspection.status === InspectionStatus.PASSED || inspection.status === InspectionStatus.CONDITIONAL_PASS) && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSuccess]}
                    onPress={() => handleApprove(inspection.id)}
                  >
                    <Ionicons name="checkmark-done-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Approve</Text>
                  </TouchableOpacity>
                )}

                {inspection.status === InspectionStatus.FAILED && (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonWarning]}>
                    <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                      Re-inspect
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="document-text-outline" size={18} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Export</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredInspections.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No inspections found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  inspectionNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0066CC',
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  resultsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultItem: {
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 2,
  },
  resultLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  findingsSection: {
    marginBottom: 12,
  },
  findingsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  findingText: {
    flex: 1,
    fontSize: 11,
    color: '#4B5563',
  },
  severityBadge: {
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  moreFindings: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  criticalWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  criticalWarningText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  actionButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  actionButtonSuccess: {
    backgroundColor: '#0066CC',
  },
  actionButtonWarning: {
    backgroundColor: '#0066CC',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
