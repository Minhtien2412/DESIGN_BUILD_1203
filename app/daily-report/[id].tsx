/**
 * Daily Report Details Screen
 */

import { useDailyReport, useDailyReports } from '@/hooks/useDailyReport';
import type { WeatherCondition } from '@/types/daily-report';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6B7280',
  SUBMITTED: '#3B82F6',
  UNDER_REVIEW: '#0066CC',
  APPROVED: '#0066CC',
  REJECTED: '#000000',
  REVISED: '#666666',
};

const WEATHER_ICONS: Record<WeatherCondition, string> = {
  CLEAR: 'sunny',
  PARTLY_CLOUDY: 'partly-sunny',
  CLOUDY: 'cloudy',
  LIGHT_RAIN: 'rainy',
  HEAVY_RAIN: 'rainy',
  STORM: 'thunderstorm',
  FOG: 'cloud',
  SNOW: 'snow',
  EXTREME_HEAT: 'thermometer',
};

export default function DailyReportDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { dailyReport, loading } = useDailyReport(id as string);
  const { submitDailyReport, approveDailyReport, rejectDailyReport } = useDailyReports({});

  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');

  if (loading || !dailyReport) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statusColor = STATUS_COLORS[dailyReport.status];
  const weatherIcon = WEATHER_ICONS[dailyReport.weather.condition];

  const handleSubmit = async () => {
    try {
      await submitDailyReport(dailyReport.id);
      Alert.alert('Success', 'Daily report submitted');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit daily report');
    }
  };

  const handleApprove = async () => {
    try {
      await approveDailyReport(dailyReport.id, approvalComments);
      setShowApprovalModal(false);
      Alert.alert('Success', 'Daily report approved');
    } catch (err) {
      Alert.alert('Error', 'Failed to approve daily report');
    }
  };

  const handleReject = async () => {
    if (!approvalComments.trim()) {
      Alert.alert('Error', 'Please provide rejection reason');
      return;
    }
    try {
      await rejectDailyReport(dailyReport.id, approvalComments);
      setShowApprovalModal(false);
      Alert.alert('Success', 'Daily report rejected');
    } catch (err) {
      Alert.alert('Error', 'Failed to reject daily report');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: `${statusColor}15` }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{dailyReport.status.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          <Text style={styles.reportNumber}>{dailyReport.reportNumber}</Text>
          <Text style={styles.projectName}>{dailyReport.projectName}</Text>

          <View style={styles.dateRow}>
            <Ionicons name="calendar" size={16} color="#1F2937" />
            <Text style={styles.dateText}>
              {new Date(dailyReport.reportDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Weather Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Conditions</Text>
          <View style={styles.weatherCard}>
            <View style={styles.weatherHeader}>
              <Ionicons name={weatherIcon as any} size={48} color="#0066CC" />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherCondition}>
                  {dailyReport.weather.condition.replace(/_/g, ' ')}
                </Text>
                <View style={styles.tempRow}>
                  <View style={styles.tempItem}>
                    <Text style={styles.tempLabel}>Morning</Text>
                    <Text style={styles.tempValue}>{dailyReport.weather.temperature.morning}°C</Text>
                  </View>
                  <View style={styles.tempItem}>
                    <Text style={styles.tempLabel}>Afternoon</Text>
                    <Text style={styles.tempValue}>
                      {dailyReport.weather.temperature.afternoon}°C
                    </Text>
                  </View>
                  <View style={styles.tempItem}>
                    <Text style={styles.tempLabel}>Evening</Text>
                    <Text style={styles.tempValue}>{dailyReport.weather.temperature.evening}°C</Text>
                  </View>
                </View>
              </View>
            </View>

            {dailyReport.weather.weatherImpact && (
              <View style={styles.weatherImpact}>
                <Ionicons name="warning" size={20} color="#0066CC" />
                <View style={styles.impactInfo}>
                  <Text style={styles.impactText}>
                    {dailyReport.weather.weatherImpactDescription}
                  </Text>
                  {dailyReport.weather.workStoppageHours && (
                    <Text style={styles.stoppageText}>
                      Work stoppage: {dailyReport.weather.workStoppageHours} hours
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Work Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Summary</Text>
          <Text style={styles.summaryText}>{dailyReport.workSummary}</Text>
        </View>

        {/* Working Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Working Hours</Text>
          <View style={styles.hoursGrid}>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursLabel}>Start</Text>
              <Text style={styles.hoursValue}>{dailyReport.workingHours.start}</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursLabel}>End</Text>
              <Text style={styles.hoursValue}>{dailyReport.workingHours.end}</Text>
            </View>
            <View style={styles.hoursItem}>
              <Text style={styles.hoursLabel}>Total Hours</Text>
              <Text style={styles.hoursValue}>{dailyReport.workingHours.totalHours}h</Text>
            </View>
            {dailyReport.workingHours.overtimeHours && (
              <View style={styles.hoursItem}>
                <Text style={styles.hoursLabel}>Overtime</Text>
                <Text style={[styles.hoursValue, { color: '#0066CC' }]}>
                  {dailyReport.workingHours.overtimeHours}h
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Work Activities */}
        {dailyReport.workPerformed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Activities ({dailyReport.workPerformed.length})</Text>
            {dailyReport.workPerformed.map((activity, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityType}>
                    <Text style={styles.activityTypeText}>
                      {activity.type.replace(/_/g, ' ')}
                    </Text>
                  </View>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressText}>{activity.percentComplete}%</Text>
                  </View>
                </View>
                <Text style={styles.activityDesc}>{activity.description}</Text>
                <View style={styles.activityDetails}>
                  <View style={styles.activityDetail}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.activityDetailText}>{activity.location}</Text>
                  </View>
                  <View style={styles.activityDetail}>
                    <Ionicons name="business-outline" size={14} color="#6B7280" />
                    <Text style={styles.activityDetailText}>{activity.contractor}</Text>
                  </View>
                  <View style={styles.activityDetail}>
                    <Ionicons name="people-outline" size={14} color="#6B7280" />
                    <Text style={styles.activityDetailText}>{activity.crewSize} workers</Text>
                  </View>
                  <View style={styles.activityDetail}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text style={styles.activityDetailText}>{activity.hoursWorked} hours</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Manpower */}
        {dailyReport.manpower.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Manpower</Text>
              <Text style={styles.totalBadge}>Total: {dailyReport.totalManpower}</Text>
            </View>
            {dailyReport.manpower.map((mp, index) => (
              <View key={index} style={styles.manpowerCard}>
                <Text style={styles.contractorName}>{mp.contractor}</Text>
                <Text style={styles.tradeName}>{mp.trade}</Text>
                <View style={styles.manpowerGrid}>
                  <View style={styles.manpowerItem}>
                    <Text style={styles.manpowerLabel}>Workers</Text>
                    <Text style={styles.manpowerValue}>{mp.workers}</Text>
                  </View>
                  <View style={styles.manpowerItem}>
                    <Text style={styles.manpowerLabel}>Supervisors</Text>
                    <Text style={styles.manpowerValue}>{mp.supervisors}</Text>
                  </View>
                  <View style={styles.manpowerItem}>
                    <Text style={styles.manpowerLabel}>Engineers</Text>
                    <Text style={styles.manpowerValue}>{mp.engineers}</Text>
                  </View>
                  <View style={styles.manpowerItem}>
                    <Text style={styles.manpowerLabel}>Hours</Text>
                    <Text style={styles.manpowerValue}>{mp.hoursWorked}h</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Equipment */}
        {dailyReport.equipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment ({dailyReport.equipment.length})</Text>
            {dailyReport.equipment.map((eq, index) => (
              <View key={index} style={styles.equipmentCard}>
                <View style={styles.equipmentHeader}>
                  <Text style={styles.equipmentType}>{eq.equipmentType}</Text>
                  <View
                    style={[
                      styles.equipmentStatus,
                      {
                        backgroundColor:
                          eq.status === 'OPERATIONAL'
                            ? '#D1FAE5'
                            : eq.status === 'BREAKDOWN'
                            ? '#FEE2E2'
                            : '#FEF3C7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.equipmentStatusText,
                        {
                          color:
                            eq.status === 'OPERATIONAL'
                              ? '#0066CC'
                              : eq.status === 'BREAKDOWN'
                              ? '#000000'
                              : '#0066CC',
                        },
                      ]}
                    >
                      {eq.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.equipmentId}>ID: {eq.equipmentId}</Text>
                <View style={styles.equipmentDetails}>
                  <Text style={styles.equipmentDetail}>Location: {eq.location}</Text>
                  <Text style={styles.equipmentDetail}>Hours: {eq.hoursOperated}</Text>
                  {eq.operator && <Text style={styles.equipmentDetail}>Operator: {eq.operator}</Text>}
                </View>
                {eq.breakdownDescription && (
                  <Text style={styles.breakdownText}>⚠️ {eq.breakdownDescription}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Materials */}
        {dailyReport.materials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Material Deliveries ({dailyReport.materials.length})</Text>
            {dailyReport.materials.map((mat, index) => (
              <View key={index} style={styles.materialCard}>
                <Text style={styles.materialName}>{mat.materialName}</Text>
                <Text style={styles.materialQuantity}>
                  {mat.quantity} {mat.unit}
                </Text>
                <View style={styles.materialDetails}>
                  <Text style={styles.materialDetail}>Supplier: {mat.supplier}</Text>
                  <Text style={styles.materialDetail}>Time: {mat.deliveryTime}</Text>
                  <Text style={styles.materialDetail}>Received by: {mat.receivedBy}</Text>
                  <View style={styles.qualityBadge}>
                    <Ionicons
                      name={mat.qualityAccepted ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={mat.qualityAccepted ? '#0066CC' : '#000000'}
                    />
                    <Text
                      style={[
                        styles.qualityText,
                        { color: mat.qualityAccepted ? '#0066CC' : '#000000' },
                      ]}
                    >
                      {mat.qualityAccepted ? 'Accepted' : 'Rejected'}
                    </Text>
                  </View>
                </View>
                {!mat.qualityAccepted && mat.rejectionReason && (
                  <Text style={styles.rejectionText}>Reason: {mat.rejectionReason}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Progress */}
        {dailyReport.progress.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Progress Updates</Text>
              <Text style={styles.totalBadge}>{dailyReport.overallProgressPercent}%</Text>
            </View>
            {dailyReport.progress.map((prog, index) => (
              <View key={index} style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressActivity}>{prog.activity}</Text>
                  <Text
                    style={[
                      styles.progressVariance,
                      { color: prog.variance >= 0 ? '#0066CC' : '#000000' },
                    ]}
                  >
                    {prog.variance >= 0 ? '+' : ''}
                    {prog.variance}%
                  </Text>
                </View>
                <Text style={styles.progressLocation}>{prog.location}</Text>
                <View style={styles.progressBars}>
                  <View style={styles.progressBarRow}>
                    <Text style={styles.progressBarLabel}>Planned</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressBarFill, { width: `${prog.plannedProgress}%`, backgroundColor: '#D1D5DB' }]}
                      />
                    </View>
                    <Text style={styles.progressBarValue}>{prog.plannedProgress}%</Text>
                  </View>
                  <View style={styles.progressBarRow}>
                    <Text style={styles.progressBarLabel}>Actual</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${prog.actualProgress}%`,
                            backgroundColor: prog.variance >= 0 ? '#0066CC' : '#000000',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressBarValue}>{prog.actualProgress}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Safety */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Report</Text>
          <View style={styles.safetyCard}>
            <View style={styles.safetyGrid}>
              <View style={styles.safetyItem}>
                <Ionicons name="shield-checkmark" size={24} color="#0066CC" />
                <Text style={styles.safetyValue}>{dailyReport.safety.daysWithoutIncident}</Text>
                <Text style={styles.safetyLabel}>Days w/o Incident</Text>
              </View>
              <View style={styles.safetyItem}>
                <Ionicons
                  name="alert-circle"
                  size={24}
                  color={dailyReport.safety.incidentCount > 0 ? '#000000' : '#0066CC'}
                />
                <Text
                  style={[
                    styles.safetyValue,
                    { color: dailyReport.safety.incidentCount > 0 ? '#000000' : '#0066CC' },
                  ]}
                >
                  {dailyReport.safety.incidentCount}
                </Text>
                <Text style={styles.safetyLabel}>Incidents</Text>
              </View>
              <View style={styles.safetyItem}>
                <Ionicons name="warning" size={24} color="#0066CC" />
                <Text style={styles.safetyValue}>{dailyReport.safety.nearMissCount}</Text>
                <Text style={styles.safetyLabel}>Near Misses</Text>
              </View>
              <View style={styles.safetyItem}>
                <Ionicons name="construct" size={24} color="#3B82F6" />
                <Text style={styles.safetyValue}>{dailyReport.safety.ppeComplianceRate}%</Text>
                <Text style={styles.safetyLabel}>PPE Compliance</Text>
              </View>
            </View>

            {dailyReport.safety.safetyMeetingHeld && (
              <View style={styles.safetyMeeting}>
                <Ionicons name="people" size={20} color="#3B82F6" />
                <Text style={styles.safetyMeetingText}>
                  Safety meeting held ({dailyReport.safety.safetyMeetingAttendees} attendees)
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Issues */}
        {dailyReport.issues.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Issues ({dailyReport.issues.length})</Text>
            {dailyReport.issues.map((issue, index) => (
              <View key={index} style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <View
                    style={[
                      styles.severityBadge,
                      {
                        backgroundColor:
                          issue.severity === 'CRITICAL'
                            ? '#FEE2E2'
                            : issue.severity === 'HIGH'
                            ? '#FED7AA'
                            : '#FEF3C7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        {
                          color:
                            issue.severity === 'CRITICAL'
                              ? '#000000'
                              : issue.severity === 'HIGH'
                              ? '#EA580C'
                              : '#0066CC',
                        },
                      ]}
                    >
                      {issue.severity}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadgeSmall,
                      {
                        backgroundColor:
                          issue.status === 'RESOLVED'
                            ? '#D1FAE5'
                            : issue.status === 'IN_PROGRESS'
                            ? '#E8F4FF'
                            : '#F3F4F6',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTextSmall,
                        {
                          color:
                            issue.status === 'RESOLVED'
                              ? '#0066CC'
                              : issue.status === 'IN_PROGRESS'
                              ? '#3B82F6'
                              : '#6B7280',
                        },
                      ]}
                    >
                      {issue.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.issueCategory}>{issue.category}</Text>
                <Text style={styles.issueDesc}>{issue.description}</Text>
                <Text style={styles.issueLocation}>📍 {issue.location}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Delays */}
        {dailyReport.delays.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delays ({dailyReport.delays.length})</Text>
            {dailyReport.delays.map((delay, index) => (
              <View key={index} style={styles.delayCard}>
                <View style={styles.delayHeader}>
                  <Text style={styles.delayReason}>{delay.reason}</Text>
                  <Text style={styles.delayDuration}>{delay.durationHours}h</Text>
                </View>
                <Text style={styles.delayCategory}>{delay.category}</Text>
                {delay.affectedActivities.length > 0 && (
                  <View style={styles.affectedActivities}>
                    <Text style={styles.affectedLabel}>Affected:</Text>
                    {delay.affectedActivities.map((activity, i) => (
                      <Text key={i} style={styles.affectedActivity}>
                        • {activity}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Photos */}
        {dailyReport.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({dailyReport.photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dailyReport.photos.map((photo, index) => (
                <View key={index} style={styles.photoCard}>
                  <Image
                    source={{ uri: photo.thumbnailUrl || photo.url }}
                    style={styles.photoImage}
                  />
                  <Text style={styles.photoCaption} numberOfLines={2}>
                    {photo.caption}
                  </Text>
                  <Text style={styles.photoCategory}>{photo.category}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Site Conditions */}
        {dailyReport.siteConditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Site Conditions</Text>
            <Text style={styles.conditionsText}>{dailyReport.siteConditions}</Text>
          </View>
        )}

        {/* Tomorrow's Plan */}
        {dailyReport.tomorrowPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tomorrow&apos;s Plan</Text>
            <Text style={styles.conditionsText}>{dailyReport.tomorrowPlan}</Text>
          </View>
        )}

        {/* Submitted By */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Submitted by:</Text>
              <Text style={styles.infoValue}>
                {dailyReport.submittedBy.name} ({dailyReport.submittedBy.role})
              </Text>
            </View>
            {dailyReport.submittedDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Submitted:</Text>
                <Text style={styles.infoValue}>
                  {new Date(dailyReport.submittedDate).toLocaleString()}
                </Text>
              </View>
            )}
            {dailyReport.approvedBy && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Approved by:</Text>
                <Text style={styles.infoValue}>
                  {dailyReport.approvedBy.name} ({dailyReport.approvedBy.role})
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        {dailyReport.status === 'DRAFT' && (
          <TouchableOpacity style={[styles.actionBtn, styles.submitBtn]} onPress={handleSubmit}>
            <Ionicons name="send" size={20} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Submit</Text>
          </TouchableOpacity>
        )}

        {(dailyReport.status === 'SUBMITTED' || dailyReport.status === 'UNDER_REVIEW') && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => setShowApprovalModal(true)}
            >
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => setShowApprovalModal(true)}
            >
              <Ionicons name="close" size={20} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={[styles.actionBtn, styles.exportBtn]}>
          <Ionicons name="download" size={20} color="#6B7280" />
          <Text style={[styles.actionBtnText, { color: '#6B7280' }]}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Approval Modal */}
      <Modal visible={showApprovalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Daily Report</Text>
              <TouchableOpacity onPress={() => setShowApprovalModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Comments..."
              value={approvalComments}
              onChangeText={setApprovalComments}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.rejectBtn]}
                onPress={handleReject}
              >
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.approveBtn]}
                onPress={handleApprove}
              >
                <Text style={styles.actionBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 48,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  reportNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  totalBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  weatherCard: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherInfo: {
    marginLeft: 12,
    flex: 1,
  },
  weatherCondition: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  tempRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tempItem: {},
  tempLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  tempValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  weatherImpact: {
    flexDirection: 'row',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  impactInfo: {
    marginLeft: 8,
    flex: 1,
  },
  impactText: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  stoppageText: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hoursItem: {
    flex: 1,
    minWidth: '45%',
  },
  hoursLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  hoursValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityType: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activityTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'capitalize',
  },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  activityDesc: {
    fontSize: 13,
    color: '#1F2937',
    marginBottom: 8,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityDetailText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  manpowerCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  contractorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  tradeName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  manpowerGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  manpowerItem: {
    flex: 1,
  },
  manpowerLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  manpowerValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  equipmentCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  equipmentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  equipmentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  equipmentStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  equipmentId: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  equipmentDetails: {
    gap: 4,
  },
  equipmentDetail: {
    fontSize: 12,
    color: '#4B5563',
  },
  breakdownText: {
    fontSize: 12,
    color: '#000000',
    marginTop: 6,
    fontStyle: 'italic',
  },
  materialCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  materialName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  materialQuantity: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 6,
  },
  materialDetails: {
    gap: 4,
  },
  materialDetail: {
    fontSize: 11,
    color: '#6B7280',
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  rejectionText: {
    fontSize: 11,
    color: '#000000',
    marginTop: 6,
    fontStyle: 'italic',
  },
  progressCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressActivity: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  progressVariance: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressLocation: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBars: {
    gap: 8,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarLabel: {
    fontSize: 11,
    color: '#6B7280',
    width: 50,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressBarValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    width: 40,
    textAlign: 'right',
  },
  safetyCard: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
  },
  safetyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  safetyItem: {
    alignItems: 'center',
  },
  safetyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  safetyLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  safetyMeeting: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    padding: 10,
    borderRadius: 8,
  },
  safetyMeetingText: {
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 8,
  },
  issueCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTextSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  issueCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  issueDesc: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 4,
  },
  issueLocation: {
    fontSize: 11,
    color: '#A16207',
  },
  delayCard: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  delayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  delayReason: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },
  delayDuration: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  delayCategory: {
    fontSize: 11,
    color: '#A16207',
    marginBottom: 6,
  },
  affectedActivities: {
    marginTop: 6,
  },
  affectedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 2,
  },
  affectedActivity: {
    fontSize: 11,
    color: '#92400E',
  },
  photoCard: {
    width: 150,
    marginRight: 12,
  },
  photoImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
  },
  photoCaption: {
    fontSize: 11,
    color: '#4B5563',
    marginBottom: 2,
  },
  photoCategory: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  conditionsText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    width: 100,
  },
  infoValue: {
    fontSize: 12,
    color: '#1F2937',
    flex: 1,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
  },
  approveBtn: {
    backgroundColor: '#0066CC',
  },
  rejectBtn: {
    backgroundColor: '#000000',
  },
  exportBtn: {
    backgroundColor: '#F3F4F6',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});
