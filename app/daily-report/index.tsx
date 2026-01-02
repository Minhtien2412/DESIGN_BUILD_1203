/**
 * Daily Reports List Screen
 */

import { useDailyReports, useDailyReportSummary } from '@/hooks/useDailyReport';
import type { DailyReportStatus, WeatherCondition } from '@/types/daily-report';
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

const STATUS_FILTERS: { value: DailyReportStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'DRAFT' as DailyReportStatus, label: 'Draft' },
  { value: 'SUBMITTED' as DailyReportStatus, label: 'Submitted' },
  { value: 'APPROVED' as DailyReportStatus, label: 'Approved' },
  { value: 'REJECTED' as DailyReportStatus, label: 'Rejected' },
];

const STATUS_COLORS: Record<DailyReportStatus, string> = {
  DRAFT: '#6B7280',
  SUBMITTED: '#3B82F6',
  UNDER_REVIEW: '#F59E0B',
  APPROVED: '#10B981',
  REJECTED: '#EF4444',
  REVISED: '#8B5CF6',
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

const WEATHER_COLORS: Record<WeatherCondition, string> = {
  CLEAR: '#F59E0B',
  PARTLY_CLOUDY: '#3B82F6',
  CLOUDY: '#6B7280',
  LIGHT_RAIN: '#3B82F6',
  HEAVY_RAIN: '#1E40AF',
  STORM: '#7C3AED',
  FOG: '#9CA3AF',
  SNOW: '#60A5FA',
  EXTREME_HEAT: '#DC2626',
};

export default function DailyReportsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DailyReportStatus | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const {
    dailyReports,
    loading,
    error,
    refresh,
    submitDailyReport,
    approveDailyReport,
  } = useDailyReports({
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const { summary } = useDailyReportSummary('', dateRange.start, dateRange.end);

  const filteredReports = dailyReports.filter(
    report =>
      report.reportNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.workSummary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (id: string) => {
    try {
      await submitDailyReport(id);
    } catch (err) {
      console.error('Failed to submit:', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveDailyReport(id);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  if (loading && !dailyReports.length) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const draftCount = dailyReports.filter(r => r.status === 'DRAFT').length;
  const submittedCount = dailyReports.filter(r => r.status === 'SUBMITTED').length;
  const approvedCount = dailyReports.filter(r => r.status === 'APPROVED').length;

  return (
    <View style={styles.container}>
      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
          <Text style={styles.statValue}>{dailyReports.length}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}>
          <Text style={[styles.statValue, { color: '#6B7280' }]}>{draftCount}</Text>
          <Text style={styles.statLabel}>Draft</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statValue, { color: '#3B82F6' }]}>{submittedCount}</Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{approvedCount}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>

        {summary && (
          <>
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7', minWidth: 120 }]}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {summary.totalManpower.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Manpower</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FEE2E2', minWidth: 120 }]}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>
                {summary.safetyMetrics.totalIncidents}
              </Text>
              <Text style={styles.statLabel}>Incidents</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by report number, project..."
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

      {/* Reports List */}
      <ScrollView style={styles.listContainer}>
        {filteredReports.map(report => {
          const statusColor = STATUS_COLORS[report.status];
          const weatherIcon = WEATHER_ICONS[report.weather.condition];
          const weatherColor = WEATHER_COLORS[report.weather.condition];

          return (
            <View key={report.id} style={styles.card}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${statusColor}26` }]}>
                  <Ionicons name="document-text" size={28} color={statusColor} />
                </View>

                <View style={styles.cardHeaderText}>
                  <View style={styles.headerRow}>
                    <Text style={styles.reportNumber}>{report.reportNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                      <Text style={styles.statusBadgeText}>
                        {report.status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.projectName} numberOfLines={1}>
                    {report.projectName}
                  </Text>

                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.dateText}>
                      {new Date(report.reportDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Weather & Info */}
              <View style={styles.infoSection}>
                <View style={styles.weatherRow}>
                  <View style={[styles.weatherIcon, { backgroundColor: `${weatherColor}20` }]}>
                    <Ionicons name={weatherIcon as any} size={20} color={weatherColor} />
                  </View>
                  <View>
                    <Text style={styles.weatherText}>
                      {report.weather.condition.replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.tempText}>
                      {report.weather.temperature.morning}°C - {report.weather.temperature.afternoon}
                      °C
                    </Text>
                  </View>
                  {report.weather.weatherImpact && (
                    <View style={styles.impactBadge}>
                      <Ionicons name="warning" size={14} color="#F59E0B" />
                      <Text style={styles.impactText}>Weather Impact</Text>
                    </View>
                  )}
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={16} color="#3B82F6" />
                    <Text style={styles.statItemValue}>{report.totalManpower}</Text>
                    <Text style={styles.statItemLabel}>Workers</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Ionicons name="construct-outline" size={16} color="#8B5CF6" />
                    <Text style={styles.statItemValue}>{report.equipment.length}</Text>
                    <Text style={styles.statItemLabel}>Equipment</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
                    <Text style={styles.statItemValue}>
                      {report.safety.incidentCount === 0 ? '✓' : report.safety.incidentCount}
                    </Text>
                    <Text style={styles.statItemLabel}>Safety</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <Ionicons name="trending-up-outline" size={16} color="#F59E0B" />
                    <Text style={styles.statItemValue}>{report.overallProgressPercent}%</Text>
                    <Text style={styles.statItemLabel}>Progress</Text>
                  </View>
                </View>
              </View>

              {/* Work Summary */}
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>Work Summary:</Text>
                <Text style={styles.summaryText} numberOfLines={2}>
                  {report.workSummary}
                </Text>
              </View>

              {/* Work Activities Preview */}
              {report.workPerformed.length > 0 && (
                <View style={styles.activitiesSection}>
                  <Text style={styles.activitiesTitle}>
                    Activities ({report.workPerformed.length})
                  </Text>
                  {report.workPerformed.slice(0, 2).map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View style={styles.activityDot} />
                      <Text style={styles.activityText} numberOfLines={1}>
                        {activity.type.replace(/_/g, ' ')}: {activity.description}
                      </Text>
                      <Text style={styles.activityProgress}>{activity.percentComplete}%</Text>
                    </View>
                  ))}
                  {report.workPerformed.length > 2 && (
                    <Text style={styles.moreActivities}>
                      +{report.workPerformed.length - 2} more
                    </Text>
                  )}
                </View>
              )}

              {/* Issues & Delays */}
              {(report.issues.length > 0 || report.delays.length > 0) && (
                <View style={styles.alertsSection}>
                  {report.issues.length > 0 && (
                    <View style={styles.alertItem}>
                      <Ionicons name="alert-circle" size={16} color="#EF4444" />
                      <Text style={styles.alertText}>{report.issues.length} Issue(s)</Text>
                    </View>
                  )}
                  {report.delays.length > 0 && (
                    <View style={styles.alertItem}>
                      <Ionicons name="time-outline" size={16} color="#F59E0B" />
                      <Text style={styles.alertText}>{report.delays.length} Delay(s)</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Submitted By */}
              <View style={styles.submittedSection}>
                <Ionicons name="person-outline" size={14} color="#6B7280" />
                <Text style={styles.submittedText}>
                  {report.submittedBy.name} • {report.submittedBy.role}
                </Text>
                {report.submittedDate && (
                  <Text style={styles.submittedDate}>
                    • {new Date(report.submittedDate).toLocaleDateString()}
                  </Text>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="eye-outline" size={18} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                {report.status === 'DRAFT' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleSubmit(report.id)}
                  >
                    <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Submit</Text>
                  </TouchableOpacity>
                )}

                {(report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSuccess]}
                    onPress={() => handleApprove(report.id)}
                  >
                    <Ionicons name="checkmark-outline" size={18} color="#FFFFFF" />
                    <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Approve</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="download-outline" size={18} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Export</Text>
                </TouchableOpacity>

                {report.photos.length > 0 && (
                  <View style={styles.photosBadge}>
                    <Ionicons name="images-outline" size={14} color="#8B5CF6" />
                    <Text style={styles.photosBadgeText}>{report.photos.length}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {filteredReports.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No daily reports found</Text>
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
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
  reportNumber: {
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
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  infoSection: {
    marginBottom: 12,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  weatherIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  weatherText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  tempText: {
    fontSize: 11,
    color: '#6B7280',
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  impactText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  statItemLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  summarySection: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  activitiesSection: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  activitiesTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 6,
  },
  activityText: {
    flex: 1,
    fontSize: 11,
    color: '#4B5563',
  },
  activityProgress: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 6,
  },
  moreActivities: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  alertsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  submittedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  submittedText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  submittedDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
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
    backgroundColor: '#3B82F6',
  },
  actionButtonSuccess: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },
  photosBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  photosBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
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
