/**
 * Quality Assurance & Testing Detail Screen
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useQualityInspection, useQualityTest } from '@/hooks/useQualityAssurance';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function QualityAssuranceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedTab, setSelectedTab] = useState<'info' | 'checklist' | 'findings'>('info');

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  // Try fetching both test and inspection
  const { test, loading: testLoading } = useQualityTest(id);
  const { inspection, loading: inspectionLoading } = useQualityInspection(id);

  const loading = testLoading || inspectionLoading;
  const item = test || inspection;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Container>
          <ThemedText type="default" style={{ color: textMutedColor }}>Loading...</ThemedText>
        </Container>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Container>
          <ThemedText type="default" style={{ color: textMutedColor }}>
            Quality item not found
          </ThemedText>
        </Container>
      </View>
    );
  }

  const isTest = 'testNumber' in item;
  const isInspection = 'inspectionNumber' in item;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return '#22c55e';
      case 'FAILED': return '#ef4444';
      case 'CONDITIONAL_PASS': return '#f97316';
      case 'COMPLETED': 
      case 'IN_PROGRESS': return '#3b82f6';
      case 'SCHEDULED': return '#a855f7';
      case 'PENDING_RETEST': 
      case 'RESCHEDULED': return '#eab308';
      case 'CANCELLED': return '#6b7280';
      default: return textMutedColor;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'MAJOR': return '#ea580c';
      case 'MINOR': return '#f59e0b';
      case 'COSMETIC': return '#3b82f6';
      default: return textMutedColor;
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header */}
        <Section>
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <ThemedText type="default" style={[styles.itemNumber, { color: textMutedColor }]}>
                {isTest && test ? test.testNumber : inspection?.inspectionNumber || ''}
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <ThemedText type="default" style={styles.statusText}>
                  {item.status}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="title" style={styles.title}>
              {isTest && test ? test.testName : inspection ? `${inspection.inspectionType} Inspection` : ''}
            </ThemedText>
            {'description' in item && item.description && (
              <ThemedText type="default" style={[styles.description, { color: textMutedColor }]}>
                {item.description}
              </ThemedText>
            )}
          </View>
        </Section>

        {/* Tabs */}
        <Section>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { borderColor, backgroundColor: selectedTab === 'info' ? tintColor : surfaceColor }
              ]}
              onPress={() => setSelectedTab('info')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'info' ? '#fff' : textColor }]}
              >
                Information
              </ThemedText>
            </TouchableOpacity>
            {isInspection && (
              <>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    { borderColor, backgroundColor: selectedTab === 'checklist' ? tintColor : surfaceColor }
                  ]}
                  onPress={() => setSelectedTab('checklist')}
                >
                  <ThemedText
                    type="default"
                    style={[styles.tabText, { color: selectedTab === 'checklist' ? '#fff' : textColor }]}
                  >
                    Checklist
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    { borderColor, backgroundColor: selectedTab === 'findings' ? tintColor : surfaceColor }
                  ]}
                  onPress={() => setSelectedTab('findings')}
                >
                  <ThemedText
                    type="default"
                    style={[styles.tabText, { color: selectedTab === 'findings' ? '#fff' : textColor }]}
                  >
                    Findings
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Section>

        {/* Info Tab */}
        {selectedTab === 'info' && (
          <>
            {/* Basic Information */}
            <Section title="Basic Information">
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.infoGrid}>
                  {isTest && test && (
                    <>
                      <View style={styles.infoItem}>
                        <ThemedText type="default" style={{ color: textMutedColor }}>Category</ThemedText>
                        <ThemedText type="default">{test.category}</ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText type="default" style={{ color: textMutedColor }}>Standard</ThemedText>
                        <ThemedText type="default">{test.testStandard || 'N/A'}</ThemedText>
                      </View>
                    </>
                  )}
                  {isInspection && inspection && (
                    <>
                      <View style={styles.infoItem}>
                        <ThemedText type="default" style={{ color: textMutedColor }}>Type</ThemedText>
                        <ThemedText type="default">{inspection.inspectionType}</ThemedText>
                      </View>
                      <View style={styles.infoItem}>
                        <ThemedText type="default" style={{ color: textMutedColor }}>Location</ThemedText>
                        <ThemedText type="default">{inspection.location}</ThemedText>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </Section>

            {/* Schedule */}
            <Section title="Schedule">
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Scheduled</ThemedText>
                    <ThemedText type="default">
                      {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : 'TBD'}
                    </ThemedText>
                  </View>
                  {isTest && test && test.actualStartDate && (
                    <View style={styles.infoItem}>
                      <ThemedText type="default" style={{ color: textMutedColor }}>Started</ThemedText>
                      <ThemedText type="default">
                        {new Date(test.actualStartDate).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  )}
                  {isTest && test && test.actualEndDate && (
                    <View style={styles.infoItem}>
                      <ThemedText type="default" style={{ color: textMutedColor }}>Completed</ThemedText>
                      <ThemedText type="default">
                        {new Date(test.actualEndDate).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            </Section>

            {/* Test Results */}
            {isTest && test && test.result && (
              <Section title="Test Results">
                <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <View style={[styles.resultBadge, { backgroundColor: getStatusColor(test.result) }]}>
                    <ThemedText type="title" style={{ color: '#fff' }}>
                      {test.result}
                    </ThemedText>
                  </View>
                  {test.actualResults && (
                    <ThemedText type="default" style={[styles.resultText, { color: textColor }]}>
                      {test.actualResults}
                    </ThemedText>
                  )}
                  
                  {test.measurements && test.measurements.length > 0 && (
                    <View style={styles.measurementsContainer}>
                      <ThemedText type="title" style={styles.sectionSubtitle}>Measurements</ThemedText>
                      {test.measurements.map((measurement, index) => (
                        <View key={index} style={[styles.measurementCard, { backgroundColor, borderColor }]}>
                          <View style={styles.measurementHeader}>
                            <ThemedText type="default" style={{ fontWeight: '600' }}>
                              {measurement.parameter}
                            </ThemedText>
                            <View style={[
                              styles.measurementResult,
                              { backgroundColor: measurement.result === 'PASS' ? '#22c55e20' : '#ef444420' }
                            ]}>
                              <ThemedText 
                                type="default" 
                                style={{ 
                                  color: measurement.result === 'PASS' ? '#22c55e' : '#ef4444',
                                  fontWeight: '600'
                                }}
                              >
                                {measurement.result}
                              </ThemedText>
                            </View>
                          </View>
                          <View style={styles.measurementDetails}>
                            <View style={styles.measurementItem}>
                              <ThemedText type="default" style={{ color: textMutedColor }}>Expected</ThemedText>
                              <ThemedText type="default">{measurement.expectedValue} {measurement.unit}</ThemedText>
                            </View>
                            <View style={styles.measurementItem}>
                              <ThemedText type="default" style={{ color: textMutedColor }}>Actual</ThemedText>
                              <ThemedText type="default">{measurement.actualValue} {measurement.unit}</ThemedText>
                            </View>
                            {measurement.tolerance && (
                              <View style={styles.measurementItem}>
                                <ThemedText type="default" style={{ color: textMutedColor }}>Tolerance</ThemedText>
                                <ThemedText type="default">±{measurement.tolerance}</ThemedText>
                              </View>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </Section>
            )}

            {/* Inspection Results */}
            {isInspection && inspection && inspection.overallResult && (
              <Section title="Inspection Results">
                <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <View style={[styles.resultBadge, { backgroundColor: getStatusColor(inspection.overallResult) }]}>
                    <ThemedText type="title" style={{ color: '#fff' }}>
                      {inspection.overallResult}
                    </ThemedText>
                  </View>
                  <View style={styles.inspectionStats}>
                    <View style={styles.statItem}>
                      <ThemedText type="title" style={{ color: '#22c55e' }}>
                        {inspection.passedItems || 0}
                      </ThemedText>
                      <ThemedText type="default" style={{ color: textMutedColor }}>Passed</ThemedText>
                    </View>
                    <View style={styles.statItem}>
                      <ThemedText type="title" style={{ color: '#ef4444' }}>
                        {inspection.failedItems || 0}
                      </ThemedText>
                      <ThemedText type="default" style={{ color: textMutedColor }}>Failed</ThemedText>
                    </View>
                    <View style={styles.statItem}>
                      <ThemedText type="title" style={{ color: textMutedColor }}>
                        {inspection.naItems || 0}
                      </ThemedText>
                      <ThemedText type="default" style={{ color: textMutedColor }}>N/A</ThemedText>
                    </View>
                  </View>
                </View>
              </Section>
            )}

            {/* Personnel */}
            <Section title="Personnel">
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                {isTest && test && test.testPerformedBy && (
                  <View style={styles.personCard}>
                    <Ionicons name="person-circle-outline" size={24} color={tintColor} />
                    <View style={styles.personInfo}>
                      <ThemedText type="default" style={{ color: textMutedColor }}>Performed By</ThemedText>
                      <ThemedText type="default" style={{ fontWeight: '600' }}>
                        {test.testPerformedBy.name}
                      </ThemedText>
                      {test.testPerformedBy.certification && (
                        <ThemedText type="default" style={{ color: textMutedColor }}>
                          {test.testPerformedBy.certification}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                )}
                {isInspection && inspection && inspection.inspector && (
                  <View style={styles.personCard}>
                    <Ionicons name="person-circle-outline" size={24} color={tintColor} />
                    <View style={styles.personInfo}>
                      <ThemedText type="default" style={{ color: textMutedColor }}>Inspector</ThemedText>
                      <ThemedText type="default" style={{ fontWeight: '600' }}>
                        {inspection.inspector.name}
                      </ThemedText>
                      {inspection.inspector.certification && (
                        <ThemedText type="default" style={{ color: textMutedColor }}>
                          {inspection.inspector.certification}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </Section>
          </>
        )}

        {/* Checklist Tab (Inspections only) */}
        {selectedTab === 'checklist' && isInspection && inspection && (
          <Section title="Checklist Items">
            {inspection.checklistItems && inspection.checklistItems.length > 0 ? (
              inspection.checklistItems.map((item, index) => (
                <View key={index} style={[styles.checklistCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <View style={styles.checklistHeader}>
                    <ThemedText type="default" style={[styles.checklistNumber, { color: textMutedColor }]}>
                      {item.itemNumber}
                    </ThemedText>
                    <View style={[
                      styles.checklistStatusBadge,
                      { 
                        backgroundColor: item.status === 'PASS' ? '#22c55e20' : 
                                       item.status === 'FAIL' ? '#ef444420' :
                                       item.status === 'NA' ? '#6b728020' : '#f59e0b20'
                      }
                    ]}>
                      <ThemedText 
                        type="default" 
                        style={{ 
                          color: item.status === 'PASS' ? '#22c55e' : 
                                item.status === 'FAIL' ? '#ef4444' :
                                item.status === 'NA' ? '#6b7280' : '#f59e0b',
                          fontWeight: '600'
                        }}
                      >
                        {item.status}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText type="default" style={styles.checklistDescription}>
                    {item.description}
                  </ThemedText>
                  {item.requirement && (
                    <ThemedText type="default" style={[styles.checklistRequirement, { color: textMutedColor }]}>
                      Requirement: {item.requirement}
                    </ThemedText>
                  )}
                  {item.comments && (
                    <View style={[styles.commentsBox, { backgroundColor, borderColor }]}>
                      <ThemedText type="default" style={{ color: textMutedColor }}>
                        {item.comments}
                      </ThemedText>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="list-outline" size={48} color={textMutedColor} />
                <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                  No checklist items
                </ThemedText>
              </View>
            )}
          </Section>
        )}

        {/* Findings Tab (Inspections only) */}
        {selectedTab === 'findings' && isInspection && inspection && (
          <Section title="Findings">
            {inspection.findings && inspection.findings.length > 0 ? (
              inspection.findings.map((finding, index) => (
                <View key={index} style={[styles.findingCard, { backgroundColor: surfaceColor, borderColor }]}>
                  <View style={styles.findingHeader}>
                    <ThemedText type="default" style={[styles.findingNumber, { color: textMutedColor }]}>
                      Finding {finding.findingNumber}
                    </ThemedText>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(finding.severity) }]}>
                      <ThemedText type="default" style={{ color: '#fff', fontWeight: '600' }}>
                        {finding.severity}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: tintColor + '20', borderColor: tintColor }]}>
                    <ThemedText type="default" style={{ color: tintColor, fontWeight: '600' }}>
                      {finding.category}
                    </ThemedText>
                  </View>
                  <ThemedText type="default" style={styles.findingDescription}>
                    {finding.description}
                  </ThemedText>
                  {finding.location && (
                    <View style={styles.findingLocation}>
                      <Ionicons name="location-outline" size={14} color={textMutedColor} />
                      <ThemedText type="default" style={{ color: textMutedColor, marginLeft: 4 }}>
                        {finding.location}
                      </ThemedText>
                    </View>
                  )}
                  {finding.correctiveAction && (
                    <View style={[styles.actionBox, { backgroundColor, borderColor }]}>
                      <ThemedText type="default" style={{ color: textMutedColor, fontWeight: '600', marginBottom: 4 }}>
                        Corrective Action:
                      </ThemedText>
                      <ThemedText type="default" style={{ color: textColor }}>
                        {finding.correctiveAction}
                      </ThemedText>
                      {finding.dueDate && (
                        <ThemedText type="default" style={{ color: textMutedColor, marginTop: 4 }}>
                          Due: {new Date(finding.dueDate).toLocaleDateString()}
                        </ThemedText>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: surfaceColor, borderColor }]}>
                <Ionicons name="search-outline" size={48} color={textMutedColor} />
                <ThemedText type="default" style={{ color: textMutedColor, marginTop: 12 }}>
                  No findings recorded
                </ThemedText>
              </View>
            )}
          </Section>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  resultBadge: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultText: {
    lineHeight: 22,
  },
  measurementsContainer: {
    marginTop: 16,
  },
  sectionSubtitle: {
    marginBottom: 12,
  },
  measurementCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  measurementResult: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  measurementDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  measurementItem: {
    flex: 1,
  },
  inspectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personInfo: {
    flex: 1,
    gap: 2,
  },
  checklistCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checklistNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  checklistStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  checklistDescription: {
    marginBottom: 4,
    lineHeight: 20,
  },
  checklistRequirement: {
    fontStyle: 'italic',
    marginTop: 4,
  },
  commentsBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  findingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  findingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  findingNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  findingDescription: {
    marginBottom: 8,
    lineHeight: 20,
  },
  findingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
