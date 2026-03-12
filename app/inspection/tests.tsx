/**
 * Material Testing Screen
 */

import { useInspectionAnalytics, useTests } from '@/hooks/useInspection';
import { TestStatus, TestType } from '@/types/inspection';
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

const TEST_TYPES: { value: TestType | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All', icon: 'list-outline' },
  { value: TestType.CONCRETE_STRENGTH, label: 'Concrete', icon: 'cube-outline' },
  { value: TestType.SOIL_COMPACTION, label: 'Soil', icon: 'earth-outline' },
  { value: TestType.STEEL_TENSILE, label: 'Steel', icon: 'bar-chart-outline' },
  { value: TestType.WELD_QUALITY, label: 'Weld', icon: 'git-merge-outline' },
  { value: TestType.WATER_TIGHTNESS, label: 'Waterproof', icon: 'water-outline' },
  { value: TestType.PRESSURE_TEST, label: 'Pressure', icon: 'speedometer-outline' },
  { value: TestType.LOAD_TEST, label: 'Load', icon: 'barbell-outline' },
];

const STATUS_FILTERS: { value: TestStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: TestStatus.PENDING, label: 'Pending' },
  { value: TestStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TestStatus.COMPLETED, label: 'Completed' },
  { value: TestStatus.PASSED, label: 'Passed' },
  { value: TestStatus.FAILED, label: 'Failed' },
];

const STATUS_COLORS: Record<TestStatus, string> = {
  PENDING: '#6B7280',
  IN_PROGRESS: '#0D9488',
  COMPLETED: '#0D9488',
  PASSED: '#0D9488',
  FAILED: '#000000',
  RETEST_REQUIRED: '#0D9488',
  CANCELLED: '#9CA3AF',
};

export default function TestsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TestType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<TestStatus | 'ALL'>('ALL');

  const {
    tests,
    loading,
    error,
    refresh,
    startTest,
    approveTest,
    requestRetest,
  } = useTests({
    type: selectedType !== 'ALL' ? selectedType : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  });

  const { analytics } = useInspectionAnalytics();

  const filteredTests = tests.filter(
    test =>
      test.testNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.sampleLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStart = async (id: string) => {
    try {
      await startTest(id);
    } catch (err) {
      console.error('Failed to start test:', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveTest(id);
    } catch (err) {
      console.error('Failed to approve test:', err);
    }
  };

  if (loading && !tests.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }

  const pendingCount = tests.filter(t => t.status === TestStatus.PENDING).length;
  const inProgressCount = tests.filter(t => t.status === TestStatus.IN_PROGRESS).length;
  const passedCount = tests.filter(t => t.status === TestStatus.PASSED).length;
  const failedCount = tests.filter(t => t.status === TestStatus.FAILED).length;

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#F0FDFA' }]}>
          <Text style={styles.statValue}>{tests.length}</Text>
          <Text style={styles.statLabel}>Total Tests</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}>
          <Text style={[styles.statValue, { color: '#6B7280' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#0D9488' }]}>{passedCount}</Text>
          <Text style={styles.statLabel}>Passed</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statValue, { color: '#000000' }]}>{failedCount}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>

        {analytics && (
          <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.statValue, { color: '#0D9488' }]}>
              {analytics.summary.testPassRate.toFixed(1)}%
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
          placeholder="Search by test number, title, sample..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Type Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {TEST_TYPES.map(type => (
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

      {/* Tests List */}
      <ScrollView style={styles.listContainer}>
        {filteredTests.map(test => {
          const statusColor = STATUS_COLORS[test.status];
          const hasResults = test.result !== undefined;

          return (
            <View key={test.id} style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View
                  style={[styles.iconContainer, { backgroundColor: `${statusColor}26` }]}
                >
                  <Ionicons
                    name={
                      test.status === TestStatus.PASSED
                        ? 'checkmark-circle'
                        : test.status === TestStatus.FAILED
                        ? 'close-circle'
                        : test.status === TestStatus.IN_PROGRESS
                        ? 'flask'
                        : 'flask-outline'
                    }
                    size={28}
                    color={statusColor}
                  />
                </View>

                <View style={styles.cardHeaderText}>
                  <View style={styles.headerRow}>
                    <Text style={styles.testNumber}>{test.testNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Text style={styles.statusBadgeText}>
                        {test.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.title} numberOfLines={1}>
                    {test.title}
                  </Text>

                  <View style={styles.typeBadge}>
                    <Ionicons
                      name={
                        TEST_TYPES.find(t => t.value === test.type)?.icon as any || 'flask-outline'
                      }
                      size={12}
                      color="#0D9488"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.typeBadgeText}>{test.type.replace(/_/g, ' ')}</Text>
                  </View>
                </View>
              </View>

              {/* Sample Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="cube-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>Sample ID: {test.sampleId}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>{test.sampleLocation}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.infoText}>
                    Sampled: {new Date(test.sampleDate).toLocaleDateString()}
                  </Text>
                </View>

                {test.laboratory && (
                  <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={14} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Lab: {test.laboratory.name}
                      {test.laboratory.accreditation && ` (${test.laboratory.accreditation})`}
                    </Text>
                  </View>
                )}
              </View>

              {/* Test Parameters */}
              {hasResults && test.result && (
                <View style={styles.parametersSection}>
                  <View style={styles.parametersHeader}>
                    <Text style={styles.parametersTitle}>
                      Test Parameters ({test.parameters.length})
                    </Text>
                    <View style={styles.passRateBox}>
                      <Text
                        style={[
                          styles.passRateText,
                          { color: test.result.passRate >= 80 ? '#0D9488' : '#000000' },
                        ]}
                      >
                        {test.result.passRate.toFixed(0)}% Pass
                      </Text>
                    </View>
                  </View>

                  {test.parameters.slice(0, 4).map((param, index) => {
                    const resultColor =
                      param.result === 'PASS' ? '#0D9488' : param.result === 'FAIL' ? '#000000' : '#6B7280';

                    return (
                      <View key={index} style={styles.parameterItem}>
                        <View style={styles.parameterHeader}>
                          <Text style={styles.parameterName}>{param.parameter}</Text>
                          <Ionicons
                            name={
                              param.result === 'PASS'
                                ? 'checkmark-circle'
                                : param.result === 'FAIL'
                                ? 'close-circle'
                                : 'time-outline'
                            }
                            size={16}
                            color={resultColor}
                          />
                        </View>

                        <View style={styles.parameterValues}>
                          <Text style={styles.parameterValue}>
                            Expected: {param.expectedValue} {param.unit}
                          </Text>
                          <Text
                            style={[
                              styles.parameterValue,
                              { color: resultColor, fontWeight: '600' },
                            ]}
                          >
                            Measured: {param.measuredValue} {param.unit}
                          </Text>
                        </View>

                        {param.remarks && (
                          <Text style={styles.parameterRemarks}>{param.remarks}</Text>
                        )}
                      </View>
                    );
                  })}

                  {test.parameters.length > 4 && (
                    <Text style={styles.moreParameters}>
                      +{test.parameters.length - 4} more parameters
                    </Text>
                  )}
                </View>
              )}

              {/* Test Result Summary */}
              {hasResults && test.result && (
                <View style={styles.resultSummarySection}>
                  <Text style={styles.resultSummaryTitle}>Result Summary</Text>
                  <Text style={styles.resultSummaryText}>{test.result.summary}</Text>

                  {test.result.recommendations && (
                    <View style={styles.recommendationsBox}>
                      <Ionicons name="bulb-outline" size={14} color="#0D9488" />
                      <Text style={styles.recommendationsText}>
                        {test.result.recommendations}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Certification Info */}
              {test.result?.certifiedBy && (
                <View style={styles.certificationSection}>
                  <View style={styles.certificationRow}>
                    <Ionicons name="ribbon-outline" size={14} color="#0D9488" />
                    <Text style={styles.certificationText}>
                      Certificate #{test.result.certificateNumber}
                    </Text>
                  </View>

                  <View style={styles.certificationRow}>
                    <Ionicons name="person-outline" size={14} color="#6B7280" />
                    <Text style={styles.certificationText}>
                      Certified by: {test.result.certifiedBy} on{' '}
                      {test.result.certifiedDate ? new Date(test.result.certifiedDate).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Retest Warning */}
              {test.result?.retestRequired && test.result.retestParameters && (
                <View style={styles.retestWarning}>
                  <Ionicons name="alert-circle" size={16} color="#0D9488" />
                  <Text style={styles.retestWarningText}>
                    Retest required for {test.result.retestParameters.length} parameter(s)
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#0D9488" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {test.status === TestStatus.PENDING && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleStart(test.id)}
                  >
                    <Ionicons name="play-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Start</Text>
                  </TouchableOpacity>
                )}

                {test.status === TestStatus.IN_PROGRESS && (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonSuccess]}>
                    <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Submit</Text>
                  </TouchableOpacity>
                )}

                {test.status === TestStatus.PASSED && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSuccess]}
                    onPress={() => handleApprove(test.id)}
                  >
                    <Ionicons name="checkmark-done-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Approve</Text>
                  </TouchableOpacity>
                )}

                {(test.status === TestStatus.FAILED || test.result?.retestRequired) && (
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonWarning]}>
                    <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Retest</Text>
                  </TouchableOpacity>
                )}

                {test.certificateUrl && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="document-text-outline" size={18} color="#0D9488" />
                    <Text style={[styles.actionButtonText, { color: '#0D9488' }]}>
                      Certificate
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="cloud-download-outline" size={18} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Export</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredTests.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="flask-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No tests found</Text>
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
  testNumber: {
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
  parametersSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  parametersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  parametersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  passRateBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  passRateText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  parameterItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  parameterName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  parameterValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parameterValue: {
    fontSize: 11,
    color: '#6B7280',
  },
  parameterRemarks: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  moreParameters: {
    fontSize: 11,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  resultSummarySection: {
    marginBottom: 12,
  },
  resultSummaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  resultSummaryText: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 16,
  },
  recommendationsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  recommendationsText: {
    fontSize: 11,
    color: '#92400E',
    marginLeft: 6,
    flex: 1,
  },
  certificationSection: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  certificationText: {
    fontSize: 11,
    color: '#047857',
    marginLeft: 6,
  },
  retestWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  retestWarningText: {
    fontSize: 11,
    color: '#92400E',
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
    backgroundColor: '#0D9488',
  },
  actionButtonSuccess: {
    backgroundColor: '#0D9488',
  },
  actionButtonWarning: {
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
