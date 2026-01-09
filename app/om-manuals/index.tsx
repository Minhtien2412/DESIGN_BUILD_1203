/**
 * O&M Manual Packages List Screen
 * Lists O&M manual packages with filtering and stats
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useOMManualPackages } from '@/hooks/useOMManuals';
import type { ManualStatus } from '@/types/om-manuals';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'In Review', value: 'IN_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function OMManualListScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');

  const [selectedStatus, setSelectedStatus] = useState<ManualStatus | null>(null);

  const { packages, loading } = useOMManualPackages({
    status: selectedStatus || undefined,
  });

  // Calculate overall stats
  const totalEquipment = packages.reduce((sum, pkg) => sum + (pkg.totalEquipment || 0), 0);
  const totalDocuments = packages.reduce((sum, pkg) => sum + (pkg.totalDocuments || 0), 0);
  const completedPackages = packages.filter(p => p.status === 'COMPLETED').length;

  const getStatusColor = (status: ManualStatus) => {
    switch (status) {
      case 'DRAFT':
        return '#9CA3AF';
      case 'IN_REVIEW':
        return '#0080FF';
      case 'APPROVED':
        return '#0066CC';
      case 'SUBMITTED':
        return '#0080FF';
      case 'REJECTED':
        return '#000000';
      case 'COMPLETED':
        return '#0066CC';
      default:
        return '#6B7280';
    }
  };

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: surfaceColor }]}>
      <View style={styles.statItem}>
        <Ionicons name="folder-outline" size={24} color="#0080FF" />
        <Text style={[styles.statValue, { color: textColor }]}>{packages.length}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Packages</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="cube-outline" size={24} color="#0080FF" />
        <Text style={[styles.statValue, { color: textColor }]}>{totalEquipment}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Equipment</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="document-text-outline" size={24} color="#0066CC" />
        <Text style={[styles.statValue, { color: textColor }]}>{totalDocuments}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Documents</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#0066CC" />
        <Text style={[styles.statValue, { color: textColor }]}>{completedPackages}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Completed</Text>
      </View>
    </View>
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
      contentContainerStyle={styles.filtersContent}
    >
      {STATUS_FILTERS.map(filter => {
        const isSelected = filter.value === selectedStatus;
        return (
          <TouchableOpacity
            key={filter.label}
            style={[
              styles.filterButton,
              { borderColor },
              isSelected && { backgroundColor: tintColor, borderColor: tintColor },
            ]}
            onPress={() => setSelectedStatus(filter.value as ManualStatus | null)}
          >
            <Text
              style={[
                styles.filterButtonText,
                { color: textColor },
                isSelected && { color: '#fff' },
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderPackageCard = (pkg: any) => {
    const statusColor = getStatusColor(pkg.status);
    const completionRate = pkg.totalEquipment > 0
      ? Math.round((pkg.totalDocuments / (pkg.totalEquipment * 5)) * 100)
      : 0;

    return (
      <TouchableOpacity
        key={pkg.id}
        style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
        onPress={() => router.push(`/om-manuals/${pkg.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.packageNumber, { color: textMutedColor }]}>
              {pkg.packageNumber}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{pkg.status}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.packageTitle, { color: textColor }]}>{pkg.title}</Text>

        {pkg.projectName && (
          <View style={styles.projectRow}>
            <Ionicons name="briefcase-outline" size={14} color={textMutedColor} />
            <Text style={[styles.projectName, { color: textMutedColor }]}>
              {pkg.projectName}
            </Text>
          </View>
        )}

        {pkg.contractorName && (
          <View style={styles.contractorRow}>
            <Ionicons name="people-outline" size={14} color={textMutedColor} />
            <Text style={[styles.contractorName, { color: textMutedColor }]}>
              {pkg.contractorName}
            </Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxValue, { color: '#0080FF' }]}>
              {pkg.totalEquipment || 0}
            </Text>
            <Text style={[styles.statBoxLabel, { color: textMutedColor }]}>Equipment</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxValue, { color: '#0066CC' }]}>
              {pkg.totalDocuments || 0}
            </Text>
            <Text style={[styles.statBoxLabel, { color: textMutedColor }]}>Documents</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxValue, { color: '#0066CC' }]}>
              {completionRate}%
            </Text>
            <Text style={[styles.statBoxLabel, { color: textMutedColor }]}>Complete</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterItem}>
            <Ionicons name="calendar-outline" size={14} color={textMutedColor} />
            <Text style={[styles.cardFooterText, { color: textMutedColor }]}>
              {pkg.submissionDate
                ? new Date(pkg.submissionDate).toLocaleDateString()
                : pkg.targetSubmissionDate
                ? `Due ${new Date(pkg.targetSubmissionDate).toLocaleDateString()}`
                : 'No date set'}
            </Text>
          </View>
          {pkg.trainingRequired && (
            <View style={styles.trainingBadge}>
              <Ionicons name="school-outline" size={14} color="#0066CC" />
              <Text style={[styles.trainingText, { color: '#0066CC' }]}>
                Training Required
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        {renderStats()}
        {renderFilters()}

        <View style={styles.listContainer}>
          {packages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={textMutedColor} />
              <Text style={[styles.emptyStateText, { color: textMutedColor }]}>
                No O&M manual packages found
              </Text>
            </View>
          ) : (
            packages.map(renderPackageCard)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  filtersContainer: {
    marginTop: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  packageNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  projectName: {
    fontSize: 13,
  },
  contractorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  contractorName: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statBoxLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardFooterText: {
    fontSize: 12,
  },
  trainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trainingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
});
