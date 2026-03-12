/**
 * Quality Assurance & Testing List Screen
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useQASummary, useQualityInspections, useQualityTests } from '@/hooks/useQualityAssurance';
import type { InspectionStatus, InspectionType, TestCategory, TestStatus } from '@/types/quality-assurance';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const TEST_CATEGORY_ICONS: Record<TestCategory, keyof typeof Ionicons.glyphMap> = {
  MATERIAL: 'cube-outline',
  STRUCTURAL: 'home-outline',
  MECHANICAL: 'settings-outline',
  ELECTRICAL: 'flash-outline',
  PLUMBING: 'water-outline',
  HVAC: 'thermometer-outline',
  FIRE_SAFETY: 'flame-outline',
  ENVIRONMENTAL: 'leaf-outline',
  PERFORMANCE: 'speedometer-outline',
  FUNCTIONAL: 'checkmark-circle-outline',
  LOAD: 'barbell-outline',
  PRESSURE: 'fitness-outline',
  LEAK: 'water',
  OTHER: 'ellipsis-horizontal-circle-outline',
};

const INSPECTION_TYPE_ICONS: Record<InspectionType, keyof typeof Ionicons.glyphMap> = {
  PRELIMINARY: 'eye-outline',
  PROGRESS: 'construct-outline',
  FINAL: 'checkmark-done-outline',
  ACCEPTANCE: 'shield-checkmark-outline',
  THIRD_PARTY: 'people-outline',
  REGULATORY: 'document-text-outline',
  COMPLIANCE: 'clipboard-outline',
  QUALITY_CONTROL: 'shield-outline',
};

export default function QualityAssuranceScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const [selectedTab, setSelectedTab] = useState<'tests' | 'inspections'>('tests');
  const [testStatusFilter, setTestStatusFilter] = useState<TestStatus | 'ALL'>('ALL');
  const [inspectionStatusFilter, setInspectionStatusFilter] = useState<InspectionStatus | 'ALL'>('ALL');

  // Mock project ID - replace with actual context
  const projectId = 'project-1';

  const { summary } = useQASummary(projectId);
  const { tests, loading: testsLoading } = useQualityTests({ projectId });
  const { inspections, loading: inspectionsLoading } = useQualityInspections({ projectId });

  const getTestStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'PASSED': return '#0D9488';
      case 'FAILED': return '#000000';
      case 'CONDITIONAL_PASS': return '#0D9488';
      case 'IN_PROGRESS': return '#0D9488';
      case 'SCHEDULED': return '#a855f7';
      case 'PENDING_RETEST': return '#eab308';
      case 'CANCELLED': return '#6b7280';
      default: return textMutedColor;
    }
  };

  const getInspectionStatusColor = (status: InspectionStatus) => {
    switch (status) {
      case 'PASSED': return '#0D9488';
      case 'FAILED': return '#000000';
      case 'CONDITIONAL_PASS': return '#0D9488';
      case 'COMPLETED': return '#0D9488';
      case 'IN_PROGRESS': return '#666666';
      case 'SCHEDULED': return '#a855f7';
      case 'RESCHEDULED': return '#eab308';
      case 'CANCELLED': return '#6b7280';
      default: return textMutedColor;
    }
  };

  const filteredTests = tests.filter(test => 
    testStatusFilter === 'ALL' || test.status === testStatusFilter
  );

  const filteredInspections = inspections.filter(inspection =>
    inspectionStatusFilter === 'ALL' || inspection.status === inspectionStatusFilter
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header Stats */}
        <Section>
          <ThemedText type="title" style={styles.title}>Quality Assurance</ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="default" style={styles.statLabel}>Total Tests</ThemedText>
              <ThemedText type="title" style={styles.statValue}>{summary?.totalTests || 0}</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="default" style={styles.statLabel}>Inspections</ThemedText>
              <ThemedText type="title" style={styles.statValue}>{summary?.totalInspections || 0}</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="default" style={styles.statLabel}>Pass Rate</ThemedText>
              <ThemedText type="title" style={[styles.statValue, { color: '#0D9488' }]}>
                {summary?.qualityMetrics?.firstTimePassRate?.toFixed(0) || 0}%
              </ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="default" style={styles.statLabel}>Open Defects</ThemedText>
              <ThemedText type="title" style={[styles.statValue, { color: '#000000' }]}>
                {summary?.defectsByStatus?.OPEN || 0}
              </ThemedText>
            </View>
          </View>
        </Section>

        {/* Tab Selector */}
        <Section>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor, backgroundColor: selectedTab === 'tests' ? tintColor : surfaceColor }
              ]}
              onPress={() => setSelectedTab('tests')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'tests' ? '#fff' : textColor }]}
              >
                Tests ({tests.length})
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor, backgroundColor: selectedTab === 'inspections' ? tintColor : surfaceColor }
              ]}
              onPress={() => setSelectedTab('inspections')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'inspections' ? '#fff' : textColor }]}
              >
                Inspections ({inspections.length})
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Tests Tab */}
        {selectedTab === 'tests' && (
          <>
            {/* Test Status Filters */}
            <Section>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL_PASS'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: testStatusFilter === status ? tintColor : surfaceColor,
                        borderColor 
                      }
                    ]}
                    onPress={() => setTestStatusFilter(status as TestStatus | 'ALL')}
                  >
                    <ThemedText
                      type="default"
                      style={[
                        styles.filterText,
                        { color: testStatusFilter === status ? '#fff' : textColor }
                      ]}
                    >
                      {status.replace('_', ' ')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Section>

            {/* Test List */}
            <Section>
              {testsLoading ? (
                <ThemedText type="default" style={{ color: textMutedColor }}>Loading tests...</ThemedText>
              ) : filteredTests.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons name="flask-outline" size={48} color={textMutedColor} />
                  <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                    No tests found
                  </ThemedText>
                </View>
              ) : (
                filteredTests.map(test => (
                  <TouchableOpacity
                    key={test.id}
                    style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
                    onPress={() => router.push(`/quality-assurance/${test.id}`)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Ionicons
                          name={TEST_CATEGORY_ICONS[test.category]}
                          size={20}
                          color={tintColor}
                        />
                        <ThemedText type="default" style={[styles.testNumber, { color: textMutedColor }]}>
                          {test.testNumber}
                        </ThemedText>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getTestStatusColor(test.status) }]}>
                        <ThemedText type="default" style={styles.statusText}>
                          {test.status}
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText type="title" style={styles.cardTitle}>{test.testName}</ThemedText>
                    
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <ThemedText type="default" style={{ color: textMutedColor }}>Category</ThemedText>
                        <ThemedText type="default">{test.category}</ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText type="default" style={{ color: textMutedColor }}>Scheduled</ThemedText>
                        <ThemedText type="default">
                          {test.scheduledDate ? new Date(test.scheduledDate).toLocaleDateString() : 'TBD'}
                        </ThemedText>
                      </View>
                    </View>

                    {test.projectName && (
                      <View style={styles.cardFooter}>
                        <Ionicons name="briefcase-outline" size={14} color={textMutedColor} />
                        <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 6 }}>
                          {test.projectName}
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </Section>
          </>
        )}

        {/* Inspections Tab */}
        {selectedTab === 'inspections' && (
          <>
            {/* Inspection Status Filters */}
            <Section>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PASSED', 'FAILED'] as const).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: inspectionStatusFilter === status ? tintColor : surfaceColor,
                        borderColor 
                      }
                    ]}
                    onPress={() => setInspectionStatusFilter(status as InspectionStatus | 'ALL')}
                  >
                    <ThemedText
                      type="default"
                      style={[
                        styles.filterText,
                        { color: inspectionStatusFilter === status ? '#fff' : textColor }
                      ]}
                    >
                      {status.replace('_', ' ')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Section>

            {/* Inspection List */}
            <Section>
              {inspectionsLoading ? (
                <ThemedText type="default" style={{ color: textMutedColor }}>Loading inspections...</ThemedText>
              ) : filteredInspections.length === 0 ? (
                <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                  <Ionicons name="clipboard-outline" size={48} color={textMutedColor} />
                  <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                    No inspections found
                  </ThemedText>
                </View>
              ) : (
                filteredInspections.map(inspection => (
                  <TouchableOpacity
                    key={inspection.id}
                    style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
                    onPress={() => router.push(`/quality-assurance/${inspection.id}`)}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <Ionicons
                          name={INSPECTION_TYPE_ICONS[inspection.inspectionType]}
                          size={20}
                          color={tintColor}
                        />
                        <ThemedText type="default" style={[styles.testNumber, { color: textMutedColor }]}>
                          {inspection.inspectionNumber}
                        </ThemedText>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getInspectionStatusColor(inspection.status) }]}>
                        <ThemedText type="default" style={styles.statusText}>
                          {inspection.status}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={[styles.typeBadge, { backgroundColor: tintColor + '20', borderColor: tintColor }]}>
                      <ThemedText type="default" style={{ color: tintColor, fontWeight: '600' }}>
                        {inspection.inspectionType}
                      </ThemedText>
                    </View>
                    
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <ThemedText type="default" style={{ color: textMutedColor }}>Location</ThemedText>
                        <ThemedText type="default">{inspection.location}</ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText type="default" style={{ color: textMutedColor }}>Date</ThemedText>
                        <ThemedText type="default">
                          {inspection.scheduledDate ? new Date(inspection.scheduledDate).toLocaleDateString() : 'TBD'}
                        </ThemedText>
                      </View>
                    </View>

                    {inspection.completionRate !== undefined && (
                      <View style={styles.progressContainer}>
                        <ThemedText type="default" style={{ color: textMutedColor, marginBottom: 4 }}>
                          Completion: {inspection.completionRate}%
                        </ThemedText>
                        <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { width: `${inspection.completionRate}%`, backgroundColor: tintColor }
                            ]} 
                          />
                        </View>
                      </View>
                    )}

                    {inspection.projectName && (
                      <View style={styles.cardFooter}>
                        <Ionicons name="briefcase-outline" size={14} color={textMutedColor} />
                        <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 6 }}>
                          {inspection.projectName}
                        </ThemedText>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </Section>
          </>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
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
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '600',
  },
  filterContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontWeight: '500',
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
  testNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardTitle: {
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  infoItem: {
    flex: 1,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
