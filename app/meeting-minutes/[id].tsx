/**
 * Meeting Minutes Details Screen
 * Complete meeting minutes view with all sections
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useMeetingMinute, useMeetingMinutes } from '@/hooks/useMeetingMinutes';
import type {
    ActionItemStatus,
    DecisionType,
    MeetingStatus,
    MeetingType,
    MinutesStatus
} from '@/types/meeting-minutes';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MeetingMinuteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meeting, loading, error } = useMeetingMinute(id);
  const {
    startMeeting,
    endMeeting,
    submitForReview,
    approveMinutes,
    distributeMinutes,
    updateActionItemProgress,
    completeActionItem,
  } = useMeetingMinutes({});

  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedActionItem, setSelectedActionItem] = useState<any>(null);
  const [actionProgress, setActionProgress] = useState('0');
  const [actionComments, setActionComments] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'textMuted');

  // Meeting type color
  const getTypeColor = (type: MeetingType): string => {
    const colors: Record<MeetingType, string> = {
      KICKOFF: '#8B5CF6',
      PROGRESS_REVIEW: '#3B82F6',
      COORDINATION: '#10B981',
      SAFETY: '#EF4444',
      DESIGN_REVIEW: '#F59E0B',
      TECHNICAL: '#6366F1',
      CLIENT: '#EC4899',
      CONTRACTOR: '#14B8A6',
      SUBCONTRACTOR: '#84CC16',
      WEEKLY: '#06B6D4',
      MONTHLY: '#8B5CF6',
      EMERGENCY: '#DC2626',
      CLOSEOUT: '#059669',
      OTHER: '#6B7280',
    };
    return colors[type] || '#6B7280';
  };

  // Status colors
  const getStatusColor = (status: MeetingStatus): { bg: string; text: string } => {
    const colors: Record<MeetingStatus, { bg: string; text: string }> = {
      SCHEDULED: { bg: '#DBEAFE', text: '#1E40AF' },
      IN_PROGRESS: { bg: '#FEF3C7', text: '#92400E' },
      COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
      CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
      POSTPONED: { bg: '#E0E7FF', text: '#3730A3' },
    };
    return colors[status];
  };

  const getMinutesStatusColor = (status: MinutesStatus): { bg: string; text: string } => {
    const colors: Record<MinutesStatus, { bg: string; text: string }> = {
      DRAFT: { bg: '#F3F4F6', text: '#374151' },
      UNDER_REVIEW: { bg: '#FEF3C7', text: '#92400E' },
      APPROVED: { bg: '#D1FAE5', text: '#065F46' },
      DISTRIBUTED: { bg: '#DBEAFE', text: '#1E40AF' },
    };
    return colors[status];
  };

  const getActionStatusColor = (status: ActionItemStatus): { bg: string; text: string } => {
    const colors: Record<ActionItemStatus, { bg: string; text: string }> = {
      OPEN: { bg: '#DBEAFE', text: '#1E40AF' },
      IN_PROGRESS: { bg: '#FEF3C7', text: '#92400E' },
      COMPLETED: { bg: '#D1FAE5', text: '#065F46' },
      OVERDUE: { bg: '#FEE2E2', text: '#991B1B' },
      CANCELLED: { bg: '#F3F4F6', text: '#6B7280' },
    };
    return colors[status];
  };

  const getDecisionTypeColor = (type: DecisionType): { bg: string; text: string } => {
    const colors: Record<DecisionType, { bg: string; text: string }> = {
      APPROVED: { bg: '#D1FAE5', text: '#065F46' },
      REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
      DEFERRED: { bg: '#FEF3C7', text: '#92400E' },
      CONDITIONAL: { bg: '#E0E7FF', text: '#3730A3' },
      FOR_INFORMATION: { bg: '#F3F4F6', text: '#6B7280' },
    };
    return colors[type];
  };

  // Format functions
  const formatMeetingType = (type: MeetingType): string => {
    return type.replace(/_/g, ' ');
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time: string): string => {
    return new Date(time).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (datetime: string): string => {
    return new Date(datetime).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle action item update
  const handleUpdateActionItem = async () => {
    if (!meeting || !selectedActionItem) return;

    try {
      await updateActionItemProgress(
        meeting.id,
        selectedActionItem.id,
        parseInt(actionProgress, 10),
        selectedActionItem.status,
        actionComments
      );
      setShowActionModal(false);
      setSelectedActionItem(null);
      setActionProgress('0');
      setActionComments('');
    } catch (err) {
      console.error('Failed to update action item:', err);
    }
  };

  if (loading || !meeting) {
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
          <ThemedText style={{ color: '#EF4444', textAlign: 'center' }}>
            Error: {error.message}
          </ThemedText>
        </Section>
      </Container>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header */}
        <Section>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
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
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(meeting.meetingStatus).bg },
                ]}
              >
                <ThemedText
                  style={[styles.statusBadgeText, { color: getStatusColor(meeting.meetingStatus).text }]}
                >
                  {meeting.meetingStatus}
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
          </View>

          <ThemedText type="title" style={{ marginTop: 12, marginBottom: 16 }}>
            {meeting.title}
          </ThemedText>

          {/* Meeting Info Grid */}
          <View style={[styles.infoCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={primaryColor} />
              <ThemedText style={styles.infoLabel}>Date & Time:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDate(meeting.scheduledDate)} at {formatTime(meeting.scheduledTime)}
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name={meeting.isVirtual ? 'videocam-outline' : 'location-outline'}
                size={18}
                color={primaryColor}
              />
              <ThemedText style={styles.infoLabel}>Location:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {meeting.isVirtual ? 'Virtual Meeting' : meeting.location}
              </ThemedText>
            </View>
            {meeting.duration && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={primaryColor} />
                <ThemedText style={styles.infoLabel}>Duration:</ThemedText>
                <ThemedText style={styles.infoValue}>{meeting.duration} minutes</ThemedText>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={primaryColor} />
              <ThemedText style={styles.infoLabel}>Chairperson:</ThemedText>
              <ThemedText style={styles.infoValue}>{meeting.chairperson?.name || 'N/A'}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={18} color={primaryColor} />
              <ThemedText style={styles.infoLabel}>Secretary:</ThemedText>
              <ThemedText style={styles.infoValue}>{meeting.secretary?.name || 'N/A'}</ThemedText>
            </View>
          </View>
        </Section>

        {/* Attendance */}
        {meeting.attendees && meeting.attendees.length > 0 && (
          <Section>
            <View style={styles.sectionHeader}>
              <Ionicons name="people-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle">
                Attendance ({meeting.totalPresent || 0}/{meeting.totalInvited || 0})
              </ThemedText>
            </View>
            {meeting.attendees.slice(0, 5).map((attendee, index) => (
              <View
                key={index}
                style={[styles.attendeeCard, { backgroundColor: cardBackground, borderColor }]}
              >
                <View style={styles.attendeeLeft}>
                  <ThemedText style={styles.attendeeName}>{attendee.participant.name}</ThemedText>
                  <ThemedText style={[styles.attendeeRole, { color: secondaryText }]}>
                    {attendee.participant.company} • {attendee.role}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.attendanceStatusBadge,
                    {
                      backgroundColor:
                        attendee.attendanceStatus === 'PRESENT'
                          ? '#D1FAE5'
                          : attendee.attendanceStatus === 'LATE'
                            ? '#FEF3C7'
                            : '#FEE2E2',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.attendanceStatusText,
                      {
                        color:
                          attendee.attendanceStatus === 'PRESENT'
                            ? '#065F46'
                            : attendee.attendanceStatus === 'LATE'
                              ? '#92400E'
                              : '#991B1B',
                      },
                    ]}
                  >
                    {attendee.attendanceStatus}
                  </ThemedText>
                </View>
              </View>
            ))}
          </Section>
        )}

        {/* Agenda Items */}
        {meeting.agenda && meeting.agenda.length > 0 && (
          <Section>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle">Agenda ({meeting.agenda.length})</ThemedText>
            </View>
            {meeting.agenda.map((item, index) => (
              <View
                key={item.id}
                style={[styles.agendaCard, { backgroundColor: cardBackground, borderColor }]}
              >
                <View style={styles.agendaHeader}>
                  <ThemedText style={styles.agendaNumber}>
                    {item.itemNumber || index + 1}.
                  </ThemedText>
                  <ThemedText style={styles.agendaTitle}>{item.title}</ThemedText>
                </View>
                {item.description && (
                  <ThemedText style={[styles.agendaDescription, { color: secondaryText }]}>
                    {item.description}
                  </ThemedText>
                )}
                <View style={styles.agendaFooter}>
                  {item.presenter && (
                    <View style={styles.agendaInfo}>
                      <Ionicons name="person-outline" size={14} color={secondaryText} />
                      <ThemedText style={[styles.agendaInfoText, { color: secondaryText }]}>
                        {item.presenter}
                      </ThemedText>
                    </View>
                  )}
                  {item.allocatedTime && (
                    <View style={styles.agendaInfo}>
                      <Ionicons name="time-outline" size={14} color={secondaryText} />
                      <ThemedText style={[styles.agendaInfoText, { color: secondaryText }]}>
                        {item.allocatedTime}min
                      </ThemedText>
                    </View>
                  )}
                  {item.status && (
                    <View
                      style={[
                        styles.agendaStatusBadge,
                        {
                          backgroundColor:
                            item.status === 'COMPLETED'
                              ? '#D1FAE5'
                              : item.status === 'DISCUSSED'
                                ? '#DBEAFE'
                                : '#F3F4F6',
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.agendaStatusText,
                          {
                            color:
                              item.status === 'COMPLETED'
                                ? '#065F46'
                                : item.status === 'DISCUSSED'
                                  ? '#1E40AF'
                                  : '#6B7280',
                          },
                        ]}
                      >
                        {item.status}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </Section>
        )}

        {/* Discussions */}
        {meeting.discussions && meeting.discussions.length > 0 && (
          <Section>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubbles-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle">Discussions ({meeting.discussions.length})</ThemedText>
            </View>
            {meeting.discussions.map((discussion, index) => (
              <View
                key={discussion.id}
                style={[styles.discussionCard, { backgroundColor: cardBackground, borderColor }]}
              >
                <ThemedText style={styles.discussionTopic}>{discussion.topic}</ThemedText>
                {discussion.summary && (
                  <ThemedText style={[styles.discussionSummary, { color: secondaryText }]}>
                    {discussion.summary}
                  </ThemedText>
                )}
                {discussion.keyPoints && discussion.keyPoints.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <ThemedText style={{ fontWeight: '600', marginBottom: 4 }}>
                      Key Points:
                    </ThemedText>
                    {discussion.keyPoints.map((point, idx) => (
                      <View key={idx} style={styles.keyPointRow}>
                        <ThemedText style={{ color: secondaryText }}>•</ThemedText>
                        <ThemedText style={[styles.keyPointText, { color: secondaryText }]}>
                          {point}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </Section>
        )}

        {/* Decisions */}
        {meeting.decisions && meeting.decisions.length > 0 && (
          <Section>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle">Decisions ({meeting.decisions.length})</ThemedText>
            </View>
            {meeting.decisions.map(decision => (
              <View
                key={decision.id}
                style={[styles.decisionCard, { backgroundColor: cardBackground, borderColor }]}
              >
                <View style={styles.decisionHeader}>
                  <ThemedText style={styles.decisionNumber}>
                    #{decision.decisionNumber}
                  </ThemedText>
                  <View
                    style={[
                      styles.decisionTypeBadge,
                      { backgroundColor: getDecisionTypeColor(decision.type).bg },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.decisionTypeText,
                        { color: getDecisionTypeColor(decision.type).text },
                      ]}
                    >
                      {decision.type.replace(/_/g, ' ')}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.decisionTitle}>{decision.title}</ThemedText>
                {decision.description && (
                  <ThemedText style={[styles.decisionDescription, { color: secondaryText }]}>
                    {decision.description}
                  </ThemedText>
                )}
                {decision.madeBy && (
                  <View style={styles.decisionInfo}>
                    <Ionicons name="person-outline" size={14} color={secondaryText} />
                    <ThemedText style={[styles.decisionInfoText, { color: secondaryText }]}>
                      Made by: {decision.madeBy}
                    </ThemedText>
                  </View>
                )}
                {decision.votingResults && (
                  <View style={styles.votingResults}>
                    <ThemedText style={{ fontWeight: '600', marginBottom: 4 }}>
                      Voting:
                    </ThemedText>
                    <ThemedText style={{ color: secondaryText, fontSize: 12 }}>
                      In Favor: {decision.votingResults.inFavor} | Against:{' '}
                      {decision.votingResults.against} | Abstained:{' '}
                      {decision.votingResults.abstained}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}
          </Section>
        )}

        {/* Action Items */}
        {meeting.actionItems && meeting.actionItems.length > 0 && (
          <Section>
            <View style={styles.sectionHeader}>
              <Ionicons name="clipboard-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle">Action Items ({meeting.actionItems.length})</ThemedText>
            </View>
            {meeting.actionItems.map(action => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { backgroundColor: cardBackground, borderColor }]}
                onPress={() => {
                  setSelectedActionItem(action);
                  setActionProgress(action.progress?.toString() || '0');
                  setShowActionModal(true);
                }}
              >
                <View style={styles.actionHeader}>
                  <ThemedText style={styles.actionNumber}>#{action.itemNumber}</ThemedText>
                  <View
                    style={[
                      styles.actionStatusBadge,
                      { backgroundColor: getActionStatusColor(action.status).bg },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.actionStatusText,
                        { color: getActionStatusColor(action.status).text },
                      ]}
                    >
                      {action.status.replace(/_/g, ' ')}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.actionDescription}>{action.description}</ThemedText>
                <View style={styles.actionFooter}>
                  <View style={styles.actionInfo}>
                    <Ionicons name="person-outline" size={14} color={secondaryText} />
                    <ThemedText style={[styles.actionInfoText, { color: secondaryText }]}>
                      {action.assignedTo?.name || 'Unassigned'}
                    </ThemedText>
                  </View>
                  <View style={styles.actionInfo}>
                    <Ionicons name="calendar-outline" size={14} color={secondaryText} />
                    <ThemedText style={[styles.actionInfoText, { color: secondaryText }]}>
                      Due: {action.dueDate ? formatDate(action.dueDate) : 'N/A'}
                    </ThemedText>
                  </View>
                  {action.progress !== undefined && (
                    <View style={styles.actionInfo}>
                      <Ionicons name="stats-chart-outline" size={14} color={secondaryText} />
                      <ThemedText style={[styles.actionInfoText, { color: secondaryText }]}>
                        {action.progress}%
                      </ThemedText>
                    </View>
                  )}
                </View>
                {/* Progress Bar */}
                {action.progress !== undefined && (
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${action.progress}%`,
                          backgroundColor:
                            action.progress === 100
                              ? '#10B981'
                              : action.progress >= 50
                                ? '#3B82F6'
                                : '#F59E0B',
                        },
                      ]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Section>
        )}

        {/* Executive Summary */}
        {meeting.executiveSummary && (
          <Section>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle">Executive Summary</ThemedText>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: cardBackground, borderColor }]}>
              <ThemedText style={{ lineHeight: 22 }}>{meeting.executiveSummary}</ThemedText>
            </View>
          </Section>
        )}

        {/* Key Points */}
        {meeting.keyPoints && meeting.keyPoints.length > 0 && (
          <Section>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle">Key Points</ThemedText>
            </View>
            <View style={[styles.keyPointsCard, { backgroundColor: cardBackground, borderColor }]}>
              {meeting.keyPoints.map((point, index) => (
                <View key={index} style={styles.keyPointRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <ThemedText style={styles.keyPointText}>{point}</ThemedText>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Next Meeting */}
        {meeting.nextMeetingDate && (
          <Section>
            <View style={styles.sectionHeader}>
              <Ionicons name="arrow-forward-circle-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle">Next Meeting</ThemedText>
            </View>
            <View style={[styles.nextMeetingCard, { backgroundColor: cardBackground, borderColor }]}>
              <ThemedText style={{ fontWeight: '600', marginBottom: 4 }}>
                {formatDate(meeting.nextMeetingDate)}
              </ThemedText>
              {meeting.nextMeetingAgenda && (
                <ThemedText style={{ color: secondaryText }}>
                  {meeting.nextMeetingAgenda}
                </ThemedText>
              )}
            </View>
          </Section>
        )}
      </Container>

      {/* Action Item Update Modal */}
      <Modal visible={showActionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBackground }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Update Action Item
            </ThemedText>
            {selectedActionItem && (
              <>
                <ThemedText style={{ marginBottom: 12 }}>
                  {selectedActionItem.description}
                </ThemedText>
                <ThemedText style={{ marginBottom: 4, fontWeight: '600' }}>
                  Progress (%)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor, borderColor, color: secondaryText },
                  ]}
                  value={actionProgress}
                  onChangeText={setActionProgress}
                  keyboardType="numeric"
                  placeholder="0-100"
                  placeholderTextColor={secondaryText}
                />
                <ThemedText style={{ marginTop: 12, marginBottom: 4, fontWeight: '600' }}>
                  Comments
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { backgroundColor, borderColor, color: secondaryText },
                  ]}
                  value={actionComments}
                  onChangeText={setActionComments}
                  multiline
                  numberOfLines={3}
                  placeholder="Add update comments..."
                  placeholderTextColor={secondaryText}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#E5E7EB' }]}
                    onPress={() => {
                      setShowActionModal(false);
                      setSelectedActionItem(null);
                      setActionProgress('0');
                      setActionComments('');
                    }}
                  >
                    <ThemedText style={{ color: '#374151' }}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: primaryColor }]}
                    onPress={handleUpdateActionItem}
                  >
                    <ThemedText style={{ color: '#FFFFFF' }}>Update</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 6,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontWeight: '600',
    minWidth: 90,
  },
  infoValue: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  attendeeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  attendeeLeft: {
    flex: 1,
  },
  attendeeName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  attendeeRole: {
    fontSize: 12,
  },
  attendanceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attendanceStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  agendaCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  agendaHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  agendaNumber: {
    fontWeight: '700',
    marginRight: 6,
  },
  agendaTitle: {
    flex: 1,
    fontWeight: '600',
  },
  agendaDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  agendaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agendaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agendaInfoText: {
    fontSize: 12,
  },
  agendaStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  agendaStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  discussionCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  discussionTopic: {
    fontWeight: '600',
    marginBottom: 6,
  },
  discussionSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  keyPointRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
  },
  decisionCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  decisionNumber: {
    fontWeight: '700',
  },
  decisionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  decisionTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  decisionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  decisionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  decisionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  decisionInfoText: {
    fontSize: 12,
  },
  votingResults: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionNumber: {
    fontWeight: '700',
  },
  actionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  actionDescription: {
    fontWeight: '500',
    marginBottom: 8,
  },
  actionFooter: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionInfoText: {
    fontSize: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  keyPointsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  nextMeetingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});
