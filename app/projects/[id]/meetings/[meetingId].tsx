/**
 * Meeting Note Detail Screen
 * Displays comprehensive meeting information
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import communicationService from '@/services/api/communication.service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface MeetingNoteDetail {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  location: string;
  organizer: {
    id: string;
    name: string;
    role?: string;
  };
  attendees: {
    id: string;
    name: string;
    role: string;
    isPresent: boolean;
  }[];
  agenda: string[];
  decisions: {
    id: string;
    description: string;
    decidedBy: string;
  }[];
  actionItems: {
    id: string;
    task: string;
    assignee: string;
    deadline: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  notes: string;
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
}

export default function MeetingNoteDetailScreen() {
  const { id: projectId, meetingId } = useLocalSearchParams<{
    id: string;
    meetingId: string;
  }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [meeting, setMeeting] = useState<MeetingNoteDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetingDetail();
  }, [meetingId]);

  const loadMeetingDetail = async () => {
    try {
      setLoading(true);
      const response = await communicationService.getMeetingNote(
        parseInt(meetingId)
      );
      
      // Map API response to our interface
      const apiData = response.data;
      const meetingData: MeetingNoteDetail = {
        id: apiData?.id.toString() || meetingId,
        title: apiData?.title || 'Meeting',
        type: 'GENERAL', // Not in API, use default
        date: apiData?.meetingDate || new Date().toISOString(),
        duration: apiData?.duration || 60,
        location: apiData?.location || 'N/A',
        organizer: {
          id: apiData?.createdBy?.toString() || '1',
          name: apiData?.createdByName || 'Unknown',
          role: undefined,
        },
        attendees: apiData?.attendees?.map((att: any) => ({
          id: att.userId.toString(),
          name: att.userName || 'Unknown',
          role: att.role || 'Member',
          isPresent: att.isPresent || false,
        })) || [],
        agenda: apiData?.agenda || [],
        decisions: apiData?.decisions?.map((dec: any) => ({
          id: dec.id.toString(),
          description: dec.description,
          decidedBy: dec.decidedByName || 'Unknown',
        })) || [],
        actionItems: apiData?.actionItems?.map((item: any) => ({
          id: item.id.toString(),
          task: item.description,
          assignee: item.assignedToName || 'Unknown',
          deadline: item.dueDate || '',
          status: 'PENDING',
        })) || [],
        notes: apiData?.notes || '',
        attachments: (apiData?.attachments || []).map((url: string, idx: number) => ({
          name: `Attachment ${idx + 1}`,
          url: url,
          type: url.endsWith('.pdf') ? 'pdf' : 'file',
        })),
      };

      setMeeting(meetingData);
    } catch (error) {
      console.error('Load meeting detail failed:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết cuộc họp');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} - ${hours}:${minutes}`;
  };

  const getMeetingTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      DAILY_STANDUP: 'Họp hằng ngày',
      WEEKLY_PROGRESS: 'Báo cáo tuần',
      TECHNICAL: 'Họp kỹ thuật',
      SAFETY: 'Họp an toàn',
      CLIENT: 'Họp khách hàng',
      COORDINATION: 'Điều phối',
      OTHER: 'Khác',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' };
      case 'IN_PROGRESS':
        return { bg: '#FEF3C7', text: '#92400E', icon: 'time' };
      case 'PENDING':
        return { bg: '#E5E7EB', text: '#374151', icon: 'ellipse-outline' };
      default:
        return { bg: '#E5E7EB', text: '#374151', icon: 'help-circle' };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loadingText, { color: textMuted }]}>
          Đang tải chi tiết cuộc họp...
        </Text>
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <Ionicons name="document-text-outline" size={64} color={textMuted} />
        <Text style={[styles.emptyText, { color: textMuted }]}>
          Không tìm thấy cuộc họp
        </Text>
        <Pressable
          style={[styles.backButton, { backgroundColor: primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]} numberOfLines={1}>
          Chi tiết cuộc họp
        </Text>
        <Pressable style={styles.headerMenuButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Meeting Info Card */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.typeBadge, { backgroundColor: primary + '15' }]}>
              <Text style={[styles.typeBadgeText, { color: primary }]}>
                {getMeetingTypeLabel(meeting.type)}
              </Text>
            </View>
          </View>

          <Text style={[styles.meetingTitle, { color: text }]}>{meeting.title}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={primary} />
              <Text style={[styles.infoText, { color: text }]}>
                {formatDate(meeting.date)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={primary} />
              <Text style={[styles.infoText, { color: text }]}>
                {meeting.duration} phút
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={primary} />
              <Text style={[styles.infoText, { color: text }]}>
                {meeting.location}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color={primary} />
              <Text style={[styles.infoText, { color: text }]}>
                {meeting.organizer.name}
              </Text>
            </View>
          </View>
        </View>

        {/* Attendees */}
        <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="people-outline" size={20} color={primary} />
            <Text style={[styles.sectionTitle, { color: text }]}>
              Người tham gia ({meeting.attendees.length})
            </Text>
          </View>

          <View style={styles.attendeeGrid}>
            {meeting.attendees.map((attendee) => (
              <View key={attendee.id} style={styles.attendeeCard}>
                <View style={[styles.attendeeAvatar, { backgroundColor: primary + '15' }]}>
                  <Text style={[styles.attendeeAvatarText, { color: primary }]}>
                    {attendee.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.attendeeInfo}>
                  <Text style={[styles.attendeeName, { color: text }]} numberOfLines={1}>
                    {attendee.name}
                  </Text>
                  <Text style={[styles.attendeeRole, { color: textMuted }]} numberOfLines={1}>
                    {attendee.role}
                  </Text>
                </View>
                <View
                  style={[
                    styles.attendeeStatus,
                    { backgroundColor: attendee.isPresent ? '#0D9488' : '#000000' },
                  ]}
                >
                  <Ionicons
                    name={attendee.isPresent ? 'checkmark' : 'close'}
                    size={12}
                    color="#fff"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Agenda */}
        {meeting.agenda.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="list-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>
                Chương trình họp
              </Text>
            </View>

            {meeting.agenda.map((item, index) => (
              <View key={index} style={styles.agendaItem}>
                <View style={[styles.agendaNumber, { backgroundColor: primary + '15' }]}>
                  <Text style={[styles.agendaNumberText, { color: primary }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.agendaText, { color: text }]}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Decisions */}
        {meeting.decisions.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="checkmark-done-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>
                Quyết định ({meeting.decisions.length})
              </Text>
            </View>

            {meeting.decisions.map((decision) => (
              <View key={decision.id} style={[styles.decisionCard, { borderLeftColor: primary }]}>
                <Text style={[styles.decisionText, { color: text }]}>
                  {decision.description}
                </Text>
                <Text style={[styles.decisionBy, { color: textMuted }]}>
                  Quyết định bởi: {decision.decidedBy}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Items */}
        {meeting.actionItems.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flash-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>
                Công việc cần làm ({meeting.actionItems.length})
              </Text>
            </View>

            {meeting.actionItems.map((item) => {
              const statusStyle = getStatusColor(item.status);
              return (
                <View key={item.id} style={styles.actionItemCard}>
                  <View style={styles.actionItemHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Ionicons
                        name={statusStyle.icon as any}
                        size={14}
                        color={statusStyle.text}
                      />
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={[styles.actionDeadline, { color: textMuted }]}>
                      {new Date(item.deadline).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>

                  <Text style={[styles.actionTask, { color: text }]}>{item.task}</Text>

                  <View style={styles.actionAssignee}>
                    <Ionicons name="person-outline" size={16} color={textMuted} />
                    <Text style={[styles.assigneeText, { color: textMuted }]}>
                      {item.assignee}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Notes */}
        {meeting.notes && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="document-text-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>Ghi chú</Text>
            </View>

            <Text style={[styles.notesText, { color: text }]}>{meeting.notes}</Text>
          </View>
        )}

        {/* Attachments */}
        {meeting.attachments.length > 0 && (
          <View style={[styles.section, { backgroundColor: surface, borderColor: border }]}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="attach-outline" size={20} color={primary} />
              <Text style={[styles.sectionTitle, { color: text }]}>
                Tài liệu đính kèm ({meeting.attachments.length})
              </Text>
            </View>

            {meeting.attachments.map((attachment, index) => (
              <Pressable
                key={index}
                style={[styles.attachmentItem, { borderColor: border }]}
              >
                <Ionicons name="document-outline" size={24} color={primary} />
                <Text style={[styles.attachmentName, { color: text }]} numberOfLines={1}>
                  {attachment.name}
                </Text>
                <Ionicons name="download-outline" size={20} color={primary} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  headerMenuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  meetingTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  attendeeGrid: {
    gap: 12,
  },
  attendeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendeeAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  attendeeRole: {
    fontSize: 12,
  },
  attendeeStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agendaItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  agendaNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  agendaNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  agendaText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 28,
  },
  decisionCard: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    marginBottom: 12,
  },
  decisionText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  decisionBy: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionItemCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  actionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionDeadline: {
    fontSize: 12,
  },
  actionTask: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  actionAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assigneeText: {
    fontSize: 13,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
  },
});
