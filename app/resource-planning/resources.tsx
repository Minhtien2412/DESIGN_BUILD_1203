/**
 * Resources Management Screen
 */

import { useResourceAnalytics, useResources } from '@/hooks/useResourcePlanning';
import { ResourceAvailability, ResourceType } from '@/types/resource-planning';
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

const TYPE_FILTERS: { value: ResourceType | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All', icon: 'list-outline' },
  { value: ResourceType.LABOR, label: 'Labor', icon: 'people-outline' },
  { value: ResourceType.EQUIPMENT, label: 'Equipment', icon: 'construct-outline' },
  { value: ResourceType.MATERIAL, label: 'Material', icon: 'cube-outline' },
  { value: ResourceType.SUBCONTRACTOR, label: 'Subcontractor', icon: 'business-outline' },
  { value: ResourceType.VEHICLE, label: 'Vehicle', icon: 'car-outline' },
  { value: ResourceType.TOOL, label: 'Tool', icon: 'hammer-outline' },
];

const AVAILABILITY_FILTERS: { value: ResourceAvailability | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: ResourceAvailability.AVAILABLE, label: 'Available' },
  { value: ResourceAvailability.PARTIALLY_AVAILABLE, label: 'Partial' },
  { value: ResourceAvailability.ALLOCATED, label: 'Allocated' },
  { value: ResourceAvailability.OVERALLOCATED, label: 'Over' },
];

const AVAILABILITY_COLORS: Record<ResourceAvailability, string> = {
  AVAILABLE: '#0D9488',
  PARTIALLY_AVAILABLE: '#0D9488',
  ALLOCATED: '#0D9488',
  OVERALLOCATED: '#000000',
  UNAVAILABLE: '#6B7280',
  MAINTENANCE: '#666666',
  RESERVED: '#0D9488',
};

const UTILIZATION_COLORS: Record<string, string> = {
  UNDERUTILIZED: '#0D9488',
  OPTIMAL: '#0D9488',
  HIGH: '#0D9488',
  OVERUTILIZED: '#000000',
};

const getUtilizationLevel = (rate: number): string => {
  if (rate < 60) return 'UNDERUTILIZED';
  if (rate < 85) return 'OPTIMAL';
  if (rate < 95) return 'HIGH';
  return 'OVERUTILIZED';
};

export default function ResourcesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'ALL'>('ALL');
  const [selectedAvailability, setSelectedAvailability] = useState<ResourceAvailability | 'ALL'>(
    'ALL'
  );

  const {
    resources,
    loading,
    error,
    refresh,
  } = useResources({
    type: selectedType !== 'ALL' ? selectedType : undefined,
    availability: selectedAvailability !== 'ALL' ? selectedAvailability : undefined,
  });

  const { analytics } = useResourceAnalytics();

  const filteredResources = resources.filter(
    resource =>
      resource.resourceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !resources.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const availableCount = resources.filter(r => r.availability === 'AVAILABLE').length;
  const allocatedCount = resources.filter(r => r.availability === 'ALLOCATED').length;
  const overallocatedCount = resources.filter(r => r.availability === 'OVERALLOCATED').length;

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={styles.statValue}>{resources.length}</Text>
          <Text style={styles.statLabel}>Total Resources</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{availableCount}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{allocatedCount}</Text>
          <Text style={styles.statLabel}>Allocated</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statValue, { color: '#000000' }]}>{overallocatedCount}</Text>
          <Text style={styles.statLabel}>Overallocated</Text>
        </View>

        {analytics && (
          <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.statValue, { color: '#0D9488' }]}>
              {analytics.summary.utilizationRate.toFixed(0)}%
            </Text>
            <Text style={styles.statLabel}>Avg Utilization</Text>
          </View>
        )}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by number, name, location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

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

      {/* Availability Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {AVAILABILITY_FILTERS.map(avail => (
          <TouchableOpacity
            key={avail.value}
            style={[
              styles.filterChip,
              selectedAvailability === avail.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedAvailability(avail.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedAvailability === avail.value && styles.filterChipTextActive,
              ]}
            >
              {avail.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Resources List */}
      <ScrollView style={styles.listContainer}>
        {filteredResources.map(resource => {
          const availColor = AVAILABILITY_COLORS[resource.availability];
          const utilizationLevel = getUtilizationLevel(resource.utilizationRate);
          const utilizationColor = UTILIZATION_COLORS[utilizationLevel];

          return (
            <View key={resource.id} style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${availColor}26` }]}>
                  <Ionicons
                    name={
                      resource.type === 'LABOR'
                        ? 'people'
                        : resource.type === 'EQUIPMENT'
                        ? 'construct'
                        : resource.type === 'MATERIAL'
                        ? 'cube'
                        : resource.type === 'VEHICLE'
                        ? 'car'
                        : resource.type === 'TOOL'
                        ? 'hammer'
                        : 'briefcase'
                    }
                    size={28}
                    color={availColor}
                  />
                </View>

                <View style={styles.cardHeaderText}>
                  <View style={styles.headerRow}>
                    <Text style={styles.resourceNumber}>{resource.resourceNumber}</Text>
                    <View style={[styles.availabilityBadge, { backgroundColor: availColor }]}>
                      <Text style={styles.availabilityBadgeText}>
                        {resource.availability.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.resourceName} numberOfLines={1}>
                    {resource.name}
                  </Text>

                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={TYPE_FILTERS.find(t => t.value === resource.type)?.icon as any}
                      size={12}
                      color="#0D9488"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.typeBadgeText}>
                      {resource.type}
                      {resource.category && ` • ${resource.category}`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{resource.location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="speedometer-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Capacity: {resource.capacity} {resource.unit}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="cash-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {resource.costPerUnit} {resource.currency}/{resource.unit}
                  </Text>
                </View>

                {resource.currentProjectId && (
                  <View style={styles.infoRow}>
                    <Ionicons name="folder-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>Currently assigned to project</Text>
                  </View>
                )}
              </View>

              {/* Utilization Bar */}
              <View style={styles.utilizationSection}>
                <View style={styles.utilizationHeader}>
                  <Text style={styles.utilizationLabel}>Utilization</Text>
                  <Text
                    style={[
                      styles.utilizationValue,
                      { color: utilizationColor },
                    ]}
                  >
                    {resource.utilizationRate.toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.utilizationBar}>
                  <View
                    style={[
                      styles.utilizationFill,
                      {
                        width: `${Math.min(resource.utilizationRate, 100)}%`,
                        backgroundColor: utilizationColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.utilizationLevelText}>{utilizationLevel}</Text>
              </View>

              {/* Skills & Certifications (for Labor) */}
              {resource.type === 'LABOR' && resource.skills && resource.skills.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={styles.skillsTitle}>Skills & Certifications</Text>
                  <View style={styles.skillsContainer}>
                    {resource.skills.slice(0, 3).map((skill, index) => (
                      <View key={index} style={styles.skillChip}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                    {resource.skills.length > 3 && (
                      <Text style={styles.moreSkills}>+{resource.skills.length - 3} more</Text>
                    )}
                  </View>
                </View>
              )}

              {/* Equipment Details */}
              {(resource.type === 'EQUIPMENT' || resource.type === 'VEHICLE') && (
                <View style={styles.equipmentSection}>
                  {resource.model && (
                    <View style={styles.equipmentRow}>
                      <Text style={styles.equipmentLabel}>Model:</Text>
                      <Text style={styles.equipmentValue}>{resource.model}</Text>
                    </View>
                  )}
                  {resource.serialNumber && (
                    <View style={styles.equipmentRow}>
                      <Text style={styles.equipmentLabel}>Serial:</Text>
                      <Text style={styles.equipmentValue}>{resource.serialNumber}</Text>
                    </View>
                  )}
                  {resource.nextMaintenanceDate && (
                    <View style={styles.equipmentRow}>
                      <Ionicons name="construct-outline" size={12} color="#0D9488" />
                      <Text style={[styles.equipmentValue, { color: '#0D9488', marginLeft: 4 }]}>
                        Maintenance due:{' '}
                        {new Date(resource.nextMaintenanceDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Performance Metrics */}
              <View style={styles.metricsSection}>
                {resource.productivity > 0 && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Productivity</Text>
                    <Text style={styles.metricValue}>
                      {resource.productivity.toFixed(1)} units/hr
                    </Text>
                  </View>
                )}

                {resource.qualityRating && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Quality</Text>
                    <View style={styles.ratingContainer}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name={i < resource.qualityRating! ? 'star' : 'star-outline'}
                          size={12}
                          color="#0D9488"
                        />
                      ))}
                    </View>
                  </View>
                )}

                {resource.reliability && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Reliability</Text>
                    <Text style={styles.metricValue}>{resource.reliability.toFixed(0)}%</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#0D9488" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {resource.availability === 'AVAILABLE' && (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonPrimary]}>
                    <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Allocate</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Calendar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="stats-chart-outline" size={18} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Analytics</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredResources.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No resources found</Text>
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
    minWidth: 110,
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
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
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
  resourceNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
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
    backgroundColor: '#F0FDFA',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0F766E',
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
  utilizationSection: {
    marginBottom: 12,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  utilizationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  utilizationValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  utilizationBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  utilizationFill: {
    height: '100%',
    borderRadius: 4,
  },
  utilizationLevelText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  skillsSection: {
    marginBottom: 12,
  },
  skillsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 11,
    color: '#0F766E',
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  equipmentSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  equipmentLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    width: 60,
  },
  equipmentValue: {
    fontSize: 11,
    color: '#1F2937',
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
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
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
    backgroundColor: '#0D9488',
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
