/**
 * Resource Allocations Screen
 */

import { useAllocations, useResourceAnalytics } from '@/hooks/useResourcePlanning';
import { AllocationStatus, ResourcePriority, ResourceType } from '@/types/resource-planning';
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

const STATUS_FILTERS: { value: AllocationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: AllocationStatus.PLANNED, label: 'Planned' },
  { value: AllocationStatus.APPROVED, label: 'Approved' },
  { value: AllocationStatus.ALLOCATED, label: 'Allocated' },
  { value: AllocationStatus.IN_USE, label: 'In Use' },
  { value: AllocationStatus.COMPLETED, label: 'Completed' },
];

const TYPE_FILTERS: { value: ResourceType | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All', icon: 'list-outline' },
  { value: ResourceType.LABOR, label: 'Labor', icon: 'people-outline' },
  { value: ResourceType.EQUIPMENT, label: 'Equipment', icon: 'construct-outline' },
  { value: ResourceType.MATERIAL, label: 'Material', icon: 'cube-outline' },
  { value: ResourceType.SUBCONTRACTOR, label: 'Subcontractor', icon: 'business-outline' },
  { value: ResourceType.VEHICLE, label: 'Vehicle', icon: 'car-outline' },
];

const STATUS_COLORS: Record<AllocationStatus, string> = {
  PLANNED: '#6B7280',
  REQUESTED: '#0080FF',
  APPROVED: '#0066CC',
  ALLOCATED: '#0080FF',
  IN_USE: '#0066CC',
  COMPLETED: '#0066CC',
  CANCELLED: '#000000',
  RELEASED: '#9CA3AF',
};

const PRIORITY_COLORS: Record<ResourcePriority, string> = {
  LOW: '#0066CC',
  MEDIUM: '#0080FF',
  HIGH: '#0080FF',
  URGENT: '#0066CC',
  CRITICAL: '#000000',
};

export default function AllocationsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AllocationStatus | 'ALL'>('ALL');
  const [selectedType, setSelectedType] = useState<ResourceType | 'ALL'>('ALL');

  const {
    allocations,
    loading,
    error,
    refresh,
    approveAllocation,
    startAllocation,
    completeAllocation,
  } = useAllocations({
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    type: selectedType !== 'ALL' ? selectedType : undefined,
  });

  const { analytics } = useResourceAnalytics();

  const filteredAllocations = allocations.filter(
    allocation =>
      allocation.allocationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allocation.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprove = async (id: string) => {
    try {
      await approveAllocation(id);
    } catch (err) {
      console.error('Failed to approve allocation:', err);
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startAllocation(id, new Date().toISOString());
    } catch (err) {
      console.error('Failed to start allocation:', err);
    }
  };

  if (loading && !allocations.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0080FF" />
      </View>
    );
  }

  const approvedCount = allocations.filter(a => a.status === 'APPROVED').length;
  const allocatedCount = allocations.filter(a => a.status === 'ALLOCATED').length;
  const inUseCount = allocations.filter(a => a.status === 'IN_USE').length;
  const completedCount = allocations.filter(a => a.status === 'COMPLETED').length;

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#E8F4FF' }]}>
          <Text style={styles.statValue}>{allocations.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={[styles.statValue, { color: '#0066CC' }]}>{approvedCount}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#0080FF' }]}>{allocatedCount}</Text>
          <Text style={styles.statLabel}>Allocated</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#0066CC' }]}>{inUseCount}</Text>
          <Text style={styles.statLabel}>In Use</Text>
        </View>

        {analytics && (
          <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.statValue, { color: '#0066CC' }]}>
              {analytics.summary.utilizationRate.toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>Utilization</Text>
          </View>
        )}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by number, resource, project..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

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

      {/* Type Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {TYPE_FILTERS.map(type => (
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

      {/* Allocations List */}
      <ScrollView style={styles.listContainer}>
        {filteredAllocations.map(allocation => {
          const statusColor = STATUS_COLORS[allocation.status];
          const priorityColor = PRIORITY_COLORS[allocation.priority];
          const hasConflict = allocation.hasConflict;

          return (
            <View key={allocation.id} style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${statusColor}26` }]}>
                  <Ionicons
                    name={
                      allocation.resourceType === 'LABOR'
                        ? 'people'
                        : allocation.resourceType === 'EQUIPMENT'
                        ? 'construct'
                        : allocation.resourceType === 'MATERIAL'
                        ? 'cube'
                        : allocation.resourceType === 'VEHICLE'
                        ? 'car'
                        : 'briefcase'
                    }
                    size={28}
                    color={statusColor}
                  />
                </View>

                <View style={styles.cardHeaderText}>
                  <View style={styles.headerRow}>
                    <Text style={styles.allocationNumber}>{allocation.allocationNumber}</Text>
                    <View style={styles.badges}>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusBadgeText}>
                          {allocation.status.replace(/_/g, ' ')}
                        </Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                        <Text style={styles.priorityBadgeText}>{allocation.priority}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.resourceName} numberOfLines={1}>
                    {allocation.resourceName}
                  </Text>

                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={
                        TYPE_FILTERS.find(t => t.value === allocation.resourceType)?.icon as any
                      }
                      size={12}
                      color="#0080FF"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.typeBadgeText}>{allocation.resourceType}</Text>
                  </View>
                </View>
              </View>

              {/* Project & Activity Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="folder-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {allocation.projectName}
                    {allocation.activityName && ` • ${allocation.activityName}`}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {new Date(allocation.startDate).toLocaleDateString()} →{' '}
                    {new Date(allocation.endDate).toLocaleDateString()} ({allocation.duration}{' '}
                    days)
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="speedometer-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Quantity: {allocation.quantity} {allocation.unit}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Requested by: {allocation.requestedBy.name} ({allocation.requestedBy.department})
                  </Text>
                </View>
              </View>

              {/* Cost & Utilization */}
              <View style={styles.metricsSection}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Estimated Cost</Text>
                  <Text style={styles.metricValue}>
                    {allocation.estimatedCost.toLocaleString()} {allocation.currency}
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Utilization</Text>
                  <Text style={styles.metricValue}>
                    {allocation.plannedUtilization.toFixed(0)}%
                  </Text>
                </View>

                {allocation.actualCost && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Actual Cost</Text>
                    <Text
                      style={[
                        styles.metricValue,
                        {
                          color:
                            allocation.actualCost > allocation.estimatedCost
                              ? '#000000'
                              : '#0066CC',
                        },
                      ]}
                    >
                      {allocation.actualCost.toLocaleString()} {allocation.currency}
                    </Text>
                  </View>
                )}
              </View>

              {/* Conflict Warning */}
              {hasConflict && (
                <View style={styles.conflictWarning}>
                  <Ionicons name="warning" size={16} color="#000000" />
                  <Text style={styles.conflictWarningText}>
                    Scheduling conflict detected with {allocation.conflicts?.length} other
                    allocation(s)
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#0080FF" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {allocation.status === 'REQUESTED' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSuccess]}
                    onPress={() => handleApprove(allocation.id)}
                  >
                    <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Approve</Text>
                  </TouchableOpacity>
                )}

                {allocation.status === 'ALLOCATED' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleStart(allocation.id)}
                  >
                    <Ionicons name="play-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Start</Text>
                  </TouchableOpacity>
                )}

                {allocation.status === 'IN_USE' && (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonSuccess]}>
                    <Ionicons name="checkmark-done-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Complete</Text>
                  </TouchableOpacity>
                )}

                {hasConflict && (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonWarning]}>
                    <Ionicons name="git-branch-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                      Resolve Conflict
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Calendar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredAllocations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No allocations found</Text>
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
    backgroundColor: '#0080FF',
    borderColor: '#0080FF',
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
  allocationNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
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
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resourceName: {
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
    backgroundColor: '#E8F4FF',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1D4ED8',
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
    flex: 1,
  },
  metricsSection: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  conflictWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  conflictWarningText: {
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
    backgroundColor: '#0080FF',
  },
  actionButtonSuccess: {
    backgroundColor: '#0066CC',
  },
  actionButtonWarning: {
    backgroundColor: '#0080FF',
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
