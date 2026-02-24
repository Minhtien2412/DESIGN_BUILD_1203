/**
 * Commissioning Plan Detail Screen
 * Shows plan details with systems and tests
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import {
    useCommissioningPlan,
    useCommissioningSystems,
    useCommissioningTests,
} from '@/hooks/useCommissioning';
import * as commissioningService from '@/services/commissioning';
import type { SystemCategory } from '@/types/commissioning';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CommissioningDetailScreen() {
  const { id } = useLocalSearchParams();
  const planId = Array.isArray(id) ? id[0] : id;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const textMutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');

  const { plan, loading: planLoading } = useCommissioningPlan(planId);
  const { systems, loading: systemsLoading } = useCommissioningSystems(planId);

  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);

  const { tests } = useCommissioningTests(selectedSystem || '', {
    status: undefined,
  });

  const getCategoryIcon = (category: SystemCategory) => {
    switch (category) {
      case 'MECHANICAL':
        return 'cog-outline';
      case 'ELECTRICAL':
        return 'flash-outline';
      case 'PLUMBING':
        return 'water-outline';
      case 'HVAC':
        return 'thermometer-outline';
      case 'FIRE_PROTECTION':
        return 'flame-outline';
      case 'LIFE_SAFETY':
        return 'shield-checkmark-outline';
      case 'SECURITY':
        return 'lock-closed-outline';
      case 'BUILDING_AUTOMATION':
        return 'analytics-outline';
      case 'COMMUNICATIONS':
        return 'wifi-outline';
      case 'ENERGY_MANAGEMENT':
        return 'battery-charging-outline';
      case 'ELEVATOR':
        return 'arrow-up-outline';
      default:
        return 'cube-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return '#9CA3AF';
      case 'IN_PROGRESS':
        return '#0D9488';
      case 'TESTING':
        return '#666666';
      case 'COMPLETED':
        return '#0D9488';
      case 'ON_HOLD':
        return '#6B7280';
      case 'FAILED':
        return '#000000';
      case 'PASSED':
        return '#0D9488';
      case 'NOT_STARTED':
        return '#9CA3AF';
      case 'CONDITIONAL_PASS':
        return '#0D9488';
      case 'RETEST_REQUIRED':
        return '#000000';
      default:
        return '#6B7280';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#0D9488';
    if (progress >= 50) return '#0D9488';
    return '#0D9488';
  };

  const handleTestPress = (test: any) => {
    setSelectedTest(test);
    setTestModalVisible(true);
  };

  const handleSignOff = async (type: 'CONTRACTOR' | 'ENGINEER' | 'OWNER') => {
    if (!selectedTest || !selectedSystem) return;

    try {
      await commissioningService.signOffTest(selectedSystem, selectedTest.id, type, {
        signedBy: 'Current User',
        signature: '',
        comments: '',
      });
      setTestModalVisible(false);
    } catch (error) {
      console.error('Sign-off failed:', error);
    }
  };

  if (planLoading) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[styles.container, { backgroundColor }, styles.centerContent]}>
        <Text style={[styles.errorText, { color: textMutedColor }]}>Plan not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(plan.status);
  const progressColor = getProgressColor(plan.overallProgress || 0);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.headerTop}>
            <Text style={[styles.planNumber, { color: textMutedColor }]}>
              {plan.planNumber}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{plan.status}</Text>
            </View>
          </View>
          <Text style={[styles.planTitle, { color: textColor }]}>{plan.title}</Text>
        </View>

        {/* Info Grid */}
        <View style={[styles.infoGrid, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: textMutedColor }]}>Project</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {plan.projectName || 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: textMutedColor }]}>Start Date</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {plan.startDate ? new Date(plan.startDate).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: textMutedColor }]}>Manager</Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {plan.commissioningManager?.name || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={[styles.statsGrid, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: textColor }]}>{plan.totalSystems || 0}</Text>
            <Text style={[styles.statLabel, { color: textMutedColor }]}>Total Systems</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#0D9488' }]}>{plan.totalTests || 0}</Text>
            <Text style={[styles.statLabel, { color: textMutedColor }]}>Total Tests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#0D9488' }]}>{plan.passedTests || 0}</Text>
            <Text style={[styles.statLabel, { color: textMutedColor }]}>Passed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#000000' }]}>{plan.failedTests || 0}</Text>
            <Text style={[styles.statLabel, { color: textMutedColor }]}>Failed</Text>
          </View>
        </View>

        {/* Overall Progress */}
        <View style={[styles.progressSection, { backgroundColor: surfaceColor, borderColor }]}>
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

        {/* Systems Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Systems</Text>
          {systemsLoading ? (
            <ActivityIndicator size="small" color={tintColor} />
          ) : systems.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: surfaceColor, borderColor }]}>
              <Text style={[styles.emptyText, { color: textMutedColor }]}>No systems found</Text>
            </View>
          ) : (
            systems.map(system => {
              const systemStatusColor = getStatusColor(system.status);
              const systemProgressColor = getProgressColor(system.commissioningProgress || 0);

              return (
                <TouchableOpacity
                  key={system.id}
                  style={[styles.systemCard, { backgroundColor: surfaceColor, borderColor }]}
                  onPress={() => setSelectedSystem(system.id)}
                >
                  <View style={styles.systemHeader}>
                    <View style={styles.systemHeaderLeft}>
                      <Ionicons
                        name={getCategoryIcon(system.category) as any}
                        size={20}
                        color={tintColor}
                      />
                      <Text style={[styles.systemNumber, { color: textMutedColor }]}>
                        {system.systemNumber}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: systemStatusColor }]}>
                      <Text style={styles.statusBadgeText}>{system.status}</Text>
                    </View>
                  </View>

                  <Text style={[styles.systemName, { color: textColor }]}>{system.systemName}</Text>

                  {system.location && (
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={textMutedColor} />
                      <Text style={[styles.locationText, { color: textMutedColor }]}>
                        {system.location}
                      </Text>
                    </View>
                  )}

                  <View style={styles.systemStats}>
                    <View style={styles.systemStat}>
                      <Text style={[styles.systemStatValue, { color: '#0D9488' }]}>
                        {system.totalTests || 0}
                      </Text>
                      <Text style={[styles.systemStatLabel, { color: textMutedColor }]}>
                        Tests
                      </Text>
                    </View>
                    <View style={styles.systemStat}>
                      <Text style={[styles.systemStatValue, { color: '#0D9488' }]}>
                        {system.passedTests || 0}
                      </Text>
                      <Text style={[styles.systemStatLabel, { color: textMutedColor }]}>
                        Passed
                      </Text>
                    </View>
                    <View style={styles.systemStat}>
                      <Text style={[styles.systemStatValue, { color: '#000000' }]}>
                        {system.failedTests || 0}
                      </Text>
                      <Text style={[styles.systemStatLabel, { color: textMutedColor }]}>
                        Failed
                      </Text>
                    </View>
                  </View>

                  <View style={styles.systemProgress}>
                    <Text style={[styles.systemProgressLabel, { color: textMutedColor }]}>
                      {system.commissioningProgress || 0}%
                    </Text>
                    <View style={[styles.progressBarContainer, { backgroundColor: borderColor }]}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${system.commissioningProgress || 0}%`,
                            backgroundColor: systemProgressColor,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {selectedSystem === system.id && (
                    <View style={styles.testsSection}>
                      <Text style={[styles.testsTitle, { color: textColor }]}>Tests</Text>
                      {tests.map(test => {
                        const testStatusColor = getStatusColor(test.status);

                        return (
                          <TouchableOpacity
                            key={test.id}
                            style={[
                              styles.testCard,
                              { backgroundColor, borderColor: borderColor },
                            ]}
                            onPress={() => handleTestPress(test)}
                          >
                            <View style={styles.testHeader}>
                              <Text style={[styles.testNumber, { color: textMutedColor }]}>
                                {test.testNumber}
                              </Text>
                              <View
                                style={[styles.statusBadge, { backgroundColor: testStatusColor }]}
                              >
                                <Text style={styles.statusBadgeText}>{test.status}</Text>
                              </View>
                            </View>
                            <Text style={[styles.testName, { color: textColor }]}>
                              {test.testName}
                            </Text>
                            <Text
                              style={[styles.testType, { color: textMutedColor }]}
                              numberOfLines={1}
                            >
                              {test.testType}
                            </Text>
                            {test.completedSteps !== undefined && test.totalSteps !== undefined && (
                              <Text style={[styles.testSteps, { color: textMutedColor }]}>
                                {test.completedSteps}/{test.totalSteps} steps
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Test Detail Modal */}
      <Modal
        visible={testModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {selectedTest?.testNumber}
              </Text>
              <TouchableOpacity onPress={() => setTestModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.modalTestName, { color: textColor }]}>
                {selectedTest?.testName}
              </Text>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: textMutedColor }]}>
                  Sign-offs
                </Text>
                <View style={styles.signOffButtons}>
                  <TouchableOpacity
                    style={[styles.signOffButton, { borderColor }]}
                    onPress={() => handleSignOff('CONTRACTOR')}
                  >
                    <Ionicons name="person-outline" size={20} color={tintColor} />
                    <Text style={[styles.signOffButtonText, { color: textColor }]}>
                      Contractor
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.signOffButton, { borderColor }]}
                    onPress={() => handleSignOff('ENGINEER')}
                  >
                    <Ionicons name="construct-outline" size={20} color={tintColor} />
                    <Text style={[styles.signOffButtonText, { color: textColor }]}>
                      Engineer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.signOffButton, { borderColor }]}
                    onPress={() => handleSignOff('OWNER')}
                  >
                    <Ionicons name="briefcase-outline" size={20} color={tintColor} />
                    <Text style={[styles.signOffButtonText, { color: textColor }]}>Owner</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  header: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    fontSize: 18,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  progressSection: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  systemCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  systemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  systemHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  systemNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  systemName: {
    fontSize: 16,
    fontWeight: '700',
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
  systemStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  systemStat: {
    flex: 1,
    alignItems: 'center',
  },
  systemStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  systemStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  systemProgress: {
    gap: 6,
  },
  systemProgressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  testsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  testsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  testCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  testNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  testType: {
    fontSize: 12,
    marginBottom: 4,
  },
  testSteps: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  modalTestName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  signOffButtons: {
    gap: 8,
  },
  signOffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  signOffButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
  },
});
