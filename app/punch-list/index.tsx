/**
 * Punch List Screen
 * Display all punch lists with filtering and stats
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePunchLists, usePunchListSummary } from '@/hooks/usePunchList';
import type { PunchListStatus } from '@/types/punch-list';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PunchListScreen() {
  const [selectedProject] = useState<string>('project-1');
  const [statusFilter, setStatusFilter] = useState<PunchListStatus | 'all'>('all');

  const { punchLists, loading, error, refresh } = usePunchLists({
    projectId: selectedProject,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { summary } = usePunchListSummary(selectedProject);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'textMuted');

  // Status badge colors
  const getStatusColor = (status: PunchListStatus): { bg: string; text: string } => {
    const colors: Record<PunchListStatus, { bg: string; text: string }> = {
      DRAFT: { bg: '#F3F4F6', text: '#374151' },
      SUBMITTED: { bg: '#F0FDFA', text: '#0F766E' },
      IN_PROGRESS: { bg: '#FEF3C7', text: '#92400E' },
      COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
      CLOSED: { bg: '#E5E7EB', text: '#6B7280' },
    };
    return colors[status];
  };

  // Format date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading && !punchLists.length) {
    return (
      <Container>
        <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 40 }} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Section>
          <ThemedText style={{ color: '#000000', textAlign: 'center' }}>
            Error: {error.message}
          </ThemedText>
        </Section>
      </Container>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
    >
      <Container>
        {/* Header Stats */}
        {summary && (
          <Section>
            <ThemedText type="title" style={{ marginBottom: 16 }}>
              Punch Lists
            </ThemedText>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
                <Ionicons name="document-text-outline" size={24} color="#0D9488" />
                <ThemedText style={styles.statValue}>{summary.totalLists}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                  Total Lists
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
                <Ionicons name="list-outline" size={24} color="#0D9488" />
                <ThemedText style={styles.statValue}>{summary.totalItems}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                  Total Items
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#0D9488" />
                <ThemedText style={styles.statValue}>{summary.completionRate}%</ThemedText>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                  Completion Rate
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
                <Ionicons name="alert-circle-outline" size={24} color="#000000" />
                <ThemedText style={styles.statValue}>{summary.overdueItems}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                  Overdue Items
                </ThemedText>
              </View>
            </View>
          </Section>
        )}

        {/* Filters */}
        <Section>
          <ThemedText style={{ marginBottom: 8, fontWeight: '600' }}>Filter by Status</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                statusFilter === 'all' && { backgroundColor: primaryColor },
              ]}
              onPress={() => setStatusFilter('all')}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  statusFilter === 'all' && { color: '#FFFFFF' },
                ]}
              >
                All
              </ThemedText>
            </TouchableOpacity>
            {['DRAFT', 'SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && { backgroundColor: primaryColor },
                ]}
                onPress={() => setStatusFilter(status as PunchListStatus)}
              >
                <ThemedText
                  style={[
                    styles.filterText,
                    statusFilter === status && { color: '#FFFFFF' },
                  ]}
                >
                  {status.replace(/_/g, ' ')}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        {/* Punch Lists */}
        <Section>
          {punchLists.length === 0 ? (
            <ThemedView style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={48} color={secondaryText} />
              <ThemedText style={{ marginTop: 8, color: secondaryText }}>
                No punch lists found
              </ThemedText>
            </ThemedView>
          ) : (
            punchLists.map(list => (
              <TouchableOpacity
                key={list.id}
                style={[styles.listCard, { backgroundColor: cardBackground, borderColor }]}
                onPress={() => router.push(`/punch-list/${list.id}`)}
              >
                {/* Header */}
                <View style={styles.listHeader}>
                  <View style={styles.listHeaderLeft}>
                    <ThemedText style={styles.listNumber}>#{list.listNumber}</ThemedText>
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor:
                            list.listType === 'FINAL'
                              ? '#FEE2E2'
                              : list.listType === 'SUBSTANTIAL_COMPLETION'
                                ? '#F0FDFA'
                                : '#FEF3C7',
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.typeBadgeText,
                          {
                            color:
                              list.listType === 'FINAL'
                                ? '#991B1B'
                                : list.listType === 'SUBSTANTIAL_COMPLETION'
                                  ? '#0F766E'
                                  : '#92400E',
                          },
                        ]}
                      >
                        {list.listType.replace(/_/g, ' ')}
                      </ThemedText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(list.status).bg },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusBadgeText,
                        { color: getStatusColor(list.status).text },
                      ]}
                    >
                      {list.status}
                    </ThemedText>
                  </View>
                </View>

                {/* Title */}
                <ThemedText style={styles.listTitle}>{list.title}</ThemedText>

                {/* Area/Building */}
                {(list.area || list.building) && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color={secondaryText} />
                    <ThemedText style={[styles.locationText, { color: secondaryText }]}>
                      {list.area || list.building}
                    </ThemedText>
                  </View>
                )}

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statItemLabel}>Total:</ThemedText>
                    <ThemedText style={styles.statItemValue}>{list.totalItems}</ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statItemLabel}>Open:</ThemedText>
                    <ThemedText style={[styles.statItemValue, { color: '#0D9488' }]}>
                      {list.openItems}
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statItemLabel}>In Progress:</ThemedText>
                    <ThemedText style={[styles.statItemValue, { color: '#0D9488' }]}>
                      {list.inProgressItems}
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <ThemedText style={styles.statItemLabel}>Completed:</ThemedText>
                    <ThemedText style={[styles.statItemValue, { color: '#0D9488' }]}>
                      {list.completedItems}
                    </ThemedText>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${list.completionRate}%`,
                        backgroundColor:
                          list.completionRate === 100
                            ? '#0D9488'
                            : list.completionRate >= 50
                              ? '#0D9488'
                              : '#0D9488',
                      },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.progressText, { color: secondaryText }]}>
                  {list.completionRate}% Complete
                </ThemedText>

                {/* Footer */}
                <View style={styles.listFooter}>
                  <View style={styles.footerItem}>
                    <Ionicons name="calendar-outline" size={14} color={secondaryText} />
                    <ThemedText style={[styles.footerText, { color: secondaryText }]}>
                      {formatDate(list.createdDate)}
                    </ThemedText>
                  </View>
                  {list.overdueItems > 0 && (
                    <View style={styles.footerItem}>
                      <Ionicons name="alert-circle" size={14} color="#000000" />
                      <ThemedText style={[styles.footerText, { color: '#000000' }]}>
                        {list.overdueItems} overdue
                      </ThemedText>
                    </View>
                  )}
                  {list.criticalItems > 0 && (
                    <View style={styles.footerItem}>
                      <Ionicons name="warning" size={14} color="#0D9488" />
                      <ThemedText style={[styles.footerText, { color: '#0D9488' }]}>
                        {list.criticalItems} critical
                      </ThemedText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </Section>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statItemValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    marginBottom: 12,
  },
  listFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
  },
});
