/**
 * Commissioning Plans List Screen
 * Lists commissioning plans with filtering and stats
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useCommissioningPlans } from '@/hooks/useCommissioning';
import type { CommissioningStatus } from '@/types/commissioning';
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
  { label: 'Approved', value: 'APPROVED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
];

export default function CommissioningListScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');

  const [selectedStatus, setSelectedStatus] = useState<CommissioningStatus | null>(null);

  const { plans, loading } = useCommissioningPlans({
    status: selectedStatus || undefined,
  });

  // Calculate overall stats
  const totalSystems = plans.reduce((sum, plan) => sum + (plan.totalSystems || 0), 0);
  const completedSystems = plans.reduce((sum, plan) => sum + (plan.completedSystems || 0), 0);
  const totalTests = plans.reduce((sum, plan) => sum + (plan.totalTests || 0), 0);
  const passedTests = plans.reduce((sum, plan) => sum + (plan.passedTests || 0), 0);

  const getStatusColor = (status: CommissioningStatus) => {
    switch (status) {
      case 'PLANNED' as CommissioningStatus:
        return '#9CA3AF';
      case 'IN_PROGRESS' as CommissioningStatus:
        return '#0080FF';
      case 'TESTING' as CommissioningStatus:
        return '#0080FF';
      case 'COMPLETED' as CommissioningStatus:
        return '#0066CC';
      default:
        return '#6B7280';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#0066CC';
    if (progress >= 50) return '#0080FF';
    return '#0080FF';
  };

  const renderStats = () => (
    <View style={[styles.statsContainer, { backgroundColor: surfaceColor }]}>
      <View style={styles.statItem}>
        <Ionicons name="list-outline" size={24} color="#0080FF" />
        <Text style={[styles.statValue, { color: textColor }]}>{plans.length}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Plans</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="cube-outline" size={24} color="#0080FF" />
        <Text style={[styles.statValue, { color: textColor }]}>{totalSystems}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Systems</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#0066CC" />
        <Text style={[styles.statValue, { color: textColor }]}>
          {totalSystems > 0 ? Math.round((completedSystems / totalSystems) * 100) : 0}%
        </Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Complete</Text>
      </View>
      <View style={styles.statItem}>
        <Ionicons name="flask-outline" size={24} color="#0066CC" />
        <Text style={[styles.statValue, { color: textColor }]}>{totalTests}</Text>
        <Text style={[styles.statLabel, { color: textMutedColor }]}>Tests</Text>
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
            onPress={() => setSelectedStatus(filter.value as CommissioningStatus | null)}
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

  const renderPlanCard = (plan: any) => {
    const statusColor = getStatusColor(plan.status);
    const progressColor = getProgressColor(plan.overallProgress || 0);

    return (
      <TouchableOpacity
        key={plan.id}
        style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
        onPress={() => router.push(`/commissioning/${plan.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={[styles.planNumber, { color: textMutedColor }]}>
              {plan.planNumber}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{plan.status}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.planTitle, { color: textColor }]}>{plan.title}</Text>

        {plan.projectName && (
          <View style={styles.projectRow}>
            <Ionicons name="folder-outline" size={14} color={textMutedColor} />
            <Text style={[styles.projectName, { color: textMutedColor }]}>
              {plan.projectName}
            </Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxValue, { color: textColor }]}>
              {plan.totalSystems || 0}
            </Text>
            <Text style={[styles.statBoxLabel, { color: textMutedColor }]}>Systems</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxValue, { color: '#0080FF' }]}>
              {plan.totalTests || 0}
            </Text>
            <Text style={[styles.statBoxLabel, { color: textMutedColor }]}>Tests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxValue, { color: '#0066CC' }]}>
              {plan.passedTests || 0}
            </Text>
            <Text style={[styles.statBoxLabel, { color: textMutedColor }]}>Passed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxValue, { color: '#000000' }]}>
              {plan.failedTests || 0}
            </Text>
            <Text style={[styles.statBoxLabel, { color: textMutedColor }]}>Failed</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: textMutedColor }]}>
              Overall Progress
            </Text>
            <Text style={[styles.progressValue, { color: progressColor }]}>
              {plan.overallProgress || 0}%
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: borderColor }]}>
            <View
              style={[
                styles.progressBar,
                { width: `${plan.overallProgress || 0}%`, backgroundColor: progressColor },
              ]}
            />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterItem}>
            <Ionicons name="calendar-outline" size={14} color={textMutedColor} />
            <Text style={[styles.cardFooterText, { color: textMutedColor }]}>
              {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'Not started'}
            </Text>
          </View>
          {plan.openDeficiencies > 0 && (
            <View style={styles.deficiencyBadge}>
              <Ionicons name="warning-outline" size={14} color="#0080FF" />
              <Text style={[styles.deficiencyText, { color: '#0080FF' }]}>
                {plan.openDeficiencies} deficiencies
              </Text>
            </View>
          )}
          {plan.criticalDeficiencies > 0 && (
            <View style={styles.criticalBadge}>
              <Ionicons name="alert-circle-outline" size={14} color="#000000" />
              <Text style={[styles.criticalText, { color: '#000000' }]}>
                {plan.criticalDeficiencies} critical
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
          {plans.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color={textMutedColor} />
              <Text style={[styles.emptyStateText, { color: textMutedColor }]}>
                No commissioning plans found
              </Text>
            </View>
          ) : (
            plans.map(renderPlanCard)
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
  planNumber: {
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
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  projectName: {
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
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
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
  deficiencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deficiencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  criticalText: {
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
