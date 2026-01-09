/**
 * Meeting Minutes List Screen
 * Display all meetings with filtering and stats
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useMeetingMinutes, useMeetingSummary } from '@/hooks/useMeetingMinutes';
import type { MeetingStatus, MeetingType, MinutesStatus } from '@/types/meeting-minutes';
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

export default function MeetingMinutesScreen() {
  const [selectedProject] = useState<string>('project-1');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState<MeetingType | 'all'>('all');
  const [meetingStatusFilter, setMeetingStatusFilter] = useState<MeetingStatus | 'all'>('all');
  const [minutesStatusFilter, setMinutesStatusFilter] = useState<MinutesStatus | 'all'>('all');

  const { meetings, loading, error, refresh } = useMeetingMinutes({
    projectId: selectedProject,
    meetingType: meetingTypeFilter === 'all' ? undefined : meetingTypeFilter,
    meetingStatus: meetingStatusFilter === 'all' ? undefined : meetingStatusFilter,
    minutesStatus: minutesStatusFilter === 'all' ? undefined : minutesStatusFilter,
  });

  const { summary } = useMeetingSummary(selectedProject);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'textMuted');

  // Meeting type badge colors
  const getTypeColor = (type: MeetingType): string => {
    const colors: Record<MeetingType, string> = {
      KICKOFF: '#666666',
      PROGRESS_REVIEW: '#3B82F6',
      COORDINATION: '#0066CC',
      SAFETY: '#000000',
      DESIGN_REVIEW: '#0066CC',
      TECHNICAL: '#666666',
      CLIENT: '#666666',
      CONTRACTOR: '#14B8A6',
      SUBCONTRACTOR: '#84CC16',
      WEEKLY: '#06B6D4',
      MONTHLY: '#666666',
      EMERGENCY: '#000000',
      CLOSEOUT: '#0066CC',
      OTHER: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  // Meeting status badge colors
  const getStatusColor = (status: MeetingStatus): { bg: string; text: string } => {
    const colors: Record<MeetingStatus, { bg: string; text: string }> = {
      SCHEDULED: { bg: '#E8F4FF', text: '#1E40AF' },
      IN_PROGRESS: { bg: '#FEF3C7', text: '#92400E' },
      COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
      CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
      POSTPONED: { bg: '#E0E7FF', text: '#3730A3' },
    };
    return colors[status];
  };

  // Minutes status badge colors
  const getMinutesStatusColor = (status: MinutesStatus): { bg: string; text: string } => {
    const colors: Record<MinutesStatus, { bg: string; text: string }> = {
      DRAFT: { bg: '#F3F4F6', text: '#374151' },
      UNDER_REVIEW: { bg: '#FEF3C7', text: '#92400E' },
      APPROVED: { bg: '#D1FAE5', text: '#065F46' },
      DISTRIBUTED: { bg: '#E8F4FF', text: '#1E40AF' },
    };
    return colors[status];
  };

  // Format meeting type
  const formatMeetingType = (type: MeetingType): string => {
    return type.replace(/_/g, ' ');
  };

  // Format date
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (time: string): string => {
    return new Date(time).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !meetings.length) {
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
              Meeting Minutes
            </ThemedText>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
                <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                <ThemedText style={styles.statValue}>{summary.totalMeetings}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                  Total Meetings
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#0066CC" />
                <ThemedText style={styles.statValue}>{summary.actionItemCompletionRate}%</ThemedText>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                  Action Completion
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
                <Ionicons name="list-outline" size={24} color="#0066CC" />
                <ThemedText style={styles.statValue}>{summary.overdueActionItems}</ThemedText>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                  Overdue Actions
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}>
                <Ionicons name="people-outline" size={24} color="#666666" />
                <ThemedText style={styles.statValue}>{summary.averageAttendanceRate}%</ThemedText>
                <ThemedText style={[styles.statLabel, { color: secondaryText }]}>
                  Avg Attendance
                </ThemedText>
              </View>
            </View>
          </Section>
        )}

        {/* Filters */}
        <Section>
          <ThemedText style={{ marginBottom: 8, fontWeight: '600' }}>Filter by Type</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                meetingTypeFilter === 'all' && { backgroundColor: primaryColor },
              ]}
              onPress={() => setMeetingTypeFilter('all')}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  meetingTypeFilter === 'all' && { color: '#FFFFFF' },
                ]}
              >
                All
              </ThemedText>
            </TouchableOpacity>
            {['WEEKLY', 'MONTHLY', 'SAFETY', 'PROGRESS_REVIEW', 'COORDINATION'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterButton,
                  meetingTypeFilter === type && { backgroundColor: primaryColor },
                ]}
                onPress={() => setMeetingTypeFilter(type as MeetingType)}
              >
                <ThemedText
                  style={[
                    styles.filterText,
                    meetingTypeFilter === type && { color: '#FFFFFF' },
                  ]}
                >
                  {formatMeetingType(type as MeetingType)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ThemedText style={{ marginBottom: 8, fontWeight: '600' }}>Filter by Status</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                minutesStatusFilter === 'all' && { backgroundColor: primaryColor },
              ]}
              onPress={() => setMinutesStatusFilter('all')}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  minutesStatusFilter === 'all' && { color: '#FFFFFF' },
                ]}
              >
                All
              </ThemedText>
            </TouchableOpacity>
            {['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'DISTRIBUTED'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  minutesStatusFilter === status && { backgroundColor: primaryColor },
                ]}
                onPress={() => setMinutesStatusFilter(status as MinutesStatus)}
              >
                <ThemedText
                  style={[
                    styles.filterText,
                    minutesStatusFilter === status && { color: '#FFFFFF' },
                  ]}
                >
                  {status.replace(/_/g, ' ')}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Section>

        {/* Meetings List */}
        <Section>
          {meetings.length === 0 ? (
            <ThemedView style={{ padding: 20, alignItems: 'center' }}>
              <Ionicons name="document-text-outline" size={48} color={secondaryText} />
              <ThemedText style={{ marginTop: 8, color: secondaryText }}>
                No meetings found
              </ThemedText>
            </ThemedView>
          ) : (
            meetings.map(meeting => (
              <TouchableOpacity
                key={meeting.id}
                style={[styles.meetingCard, { backgroundColor: cardBackground, borderColor }]}
                onPress={() => router.push(`/meeting-minutes/${meeting.id}`)}
              >
                {/* Header */}
                <View style={styles.meetingHeader}>
                  <View style={styles.meetingHeaderLeft}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: `${getTypeColor(meeting.meetingType)}20` },
                      ]}
                    >
                      <ThemedText
                        style={[styles.typeBadgeText, { color: getTypeColor(meeting.meetingType) }]}
                      >
                        {formatMeetingType(meeting.meetingType)}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.minutesNumber, { color: secondaryText }]}>
                      #{meeting.minutesNumber}
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getMinutesStatusColor(meeting.minutesStatus).bg },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusBadgeText,
                        { color: getMinutesStatusColor(meeting.minutesStatus).text },
                      ]}
                    >
                      {meeting.minutesStatus.replace(/_/g, ' ')}
                    </ThemedText>
                  </View>
                </View>

                {/* Title */}
                <ThemedText style={styles.meetingTitle}>{meeting.title}</ThemedText>

                {/* Date & Time */}
                <View style={styles.meetingInfo}>
                  <Ionicons name="calendar-outline" size={16} color={secondaryText} />
                  <ThemedText style={[styles.infoText, { color: secondaryText }]}>
                    {formatDate(meeting.scheduledDate)} at {formatTime(meeting.scheduledTime)}
                  </ThemedText>
                </View>

                {/* Location */}
                <View style={styles.meetingInfo}>
                  <Ionicons
                    name={meeting.isVirtual ? 'videocam-outline' : 'location-outline'}
                    size={16}
                    color={secondaryText}
                  />
                  <ThemedText style={[styles.infoText, { color: secondaryText }]}>
                    {meeting.isVirtual ? 'Virtual Meeting' : meeting.location}
                  </ThemedText>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={16} color="#3B82F6" />
                    <ThemedText style={[styles.statItemText, { color: secondaryText }]}>
                      {meeting.totalPresent || 0}/{meeting.totalInvited || 0}
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="list-outline" size={16} color="#0066CC" />
                    <ThemedText style={[styles.statItemText, { color: secondaryText }]}>
                      {meeting.actionItems?.length || 0} actions
                    </ThemedText>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#0066CC" />
                    <ThemedText style={[styles.statItemText, { color: secondaryText }]}>
                      {meeting.decisions?.length || 0} decisions
                    </ThemedText>
                  </View>
                </View>

                {/* Chairperson */}
                <View style={styles.meetingInfo}>
                  <Ionicons name="person-outline" size={16} color={secondaryText} />
                  <ThemedText style={[styles.infoText, { color: secondaryText }]}>
                    Chair: {meeting.chairperson?.name || 'N/A'}
                  </ThemedText>
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
  meetingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  meetingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  minutesNumber: {
    fontSize: 12,
    fontWeight: '600',
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
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 12,
  },
});
