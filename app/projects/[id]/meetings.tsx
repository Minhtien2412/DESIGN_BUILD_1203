/**
 * Meeting Notes Screen
 * Document project meetings with agenda, decisions, and action items
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

type MeetingType = 'DAILY_STANDUP' | 'WEEKLY_PROGRESS' | 'TECHNICAL' | 'SAFETY' | 'CLIENT' | 'OTHER';

interface MeetingNote {
  id: string;
  title: string;
  type: MeetingType;
  date: string;
  duration: number; // minutes
  location: string;
  organizer: { id: string; name: string };
  attendees: { id: string; name: string; attended: boolean }[];
  agenda: string[];
  decisions: { id: string; decision: string; owner: string }[];
  actionItems: {
    id: string;
    task: string;
    assignee: string;
    deadline: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  attachments?: { name: string; url: string }[];
  notes?: string;
}

const MEETING_TYPES: Record<MeetingType, { label: string; icon: string; color: string }> = {
  DAILY_STANDUP: { label: 'Daily Standup', icon: 'calendar', color: '#3B82F6' },
  WEEKLY_PROGRESS: { label: 'Họp tiến độ', icon: 'trending-up', color: '#0066CC' },
  TECHNICAL: { label: 'Họp kỹ thuật', icon: 'construct', color: '#0066CC' },
  SAFETY: { label: 'Họp an toàn', icon: 'shield-checkmark', color: '#000000' },
  CLIENT: { label: 'Họp chủ đầu tư', icon: 'people', color: '#666666' },
  OTHER: { label: 'Khác', icon: 'document-text', color: '#6B7280' },
};

export default function MeetingNotesScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [meetings, setMeetings] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<MeetingType | 'ALL'>('ALL');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockMeetings: MeetingNote[] = [
        {
          id: '1',
          title: 'Họp tiến độ tuần 48',
          type: 'WEEKLY_PROGRESS',
          date: new Date().toISOString(),
          duration: 60,
          location: 'Văn phòng công trường',
          organizer: { id: '1', name: 'Nguyễn Văn A' },
          attendees: [
            { id: '1', name: 'Nguyễn Văn A', attended: true },
            { id: '2', name: 'Trần Thị B', attended: true },
            { id: '3', name: 'Lê Văn C', attended: false },
          ],
          agenda: [
            'Báo cáo tiến độ thi công',
            'Vấn đề phát sinh và giải pháp',
            'Kế hoạch tuần tới',
          ],
          decisions: [
            {
              id: '1',
              decision: 'Tăng cường nhân lực thi công phần móng',
              owner: 'Nguyễn Văn A',
            },
            {
              id: '2',
              decision: 'Đặt mua thêm vật liệu cho tầng 2',
              owner: 'Trần Thị B',
            },
          ],
          actionItems: [
            {
              id: '1',
              task: 'Liên hệ nhà cung cấp vật liệu',
              assignee: 'Trần Thị B',
              deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
              status: 'IN_PROGRESS',
            },
            {
              id: '2',
              task: 'Hoàn thiện báo cáo tiến độ',
              assignee: 'Lê Văn C',
              deadline: new Date(Date.now() + 86400000).toISOString(),
              status: 'PENDING',
            },
          ],
        },
        {
          id: '2',
          title: 'Họp an toàn lao động tháng 12',
          type: 'SAFETY',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          duration: 45,
          location: 'Khu vực tập trung',
          organizer: { id: '4', name: 'Hoàng Văn D' },
          attendees: [
            { id: '4', name: 'Hoàng Văn D', attended: true },
            { id: '5', name: 'Phạm Thị E', attended: true },
          ],
          agenda: ['Đánh giá tình hình an toàn', 'Đào tạo quy trình mới'],
          decisions: [
            {
              id: '3',
              decision: 'Bắt buộc đeo dây đai khi làm việc trên cao',
              owner: 'Hoàng Văn D',
            },
          ],
          actionItems: [
            {
              id: '3',
              task: 'Kiểm tra thiết bị an toàn hàng ngày',
              assignee: 'Phạm Thị E',
              deadline: new Date(Date.now() + 86400000 * 7).toISOString(),
              status: 'COMPLETED',
            },
          ],
        },
      ];

      setMeetings(mockMeetings);
    } catch (error: any) {
      console.error('Load meetings failed:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách cuộc họp');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeetings();
    setRefreshing(false);
  };

  const filteredMeetings =
    selectedType === 'ALL' ? meetings : meetings.filter(m => m.type === selectedType);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMeeting = ({ item }: { item: MeetingNote }) => {
    const typeConfig = MEETING_TYPES[item.type];
    const attendedCount = item.attendees.filter(a => a.attended).length;
    const completedActions = item.actionItems.filter(a => a.status === 'COMPLETED').length;

    return (
      <Pressable
        style={[styles.meetingCard, { backgroundColor: surface, borderColor: border }]}
        onPress={() => router.push(`/projects/${projectId}/meetings/${item.id}` as any)}
      >
        <View style={[styles.typeStripe, { backgroundColor: typeConfig.color }]} />
        <View style={styles.meetingContent}>
          {/* Type Badge */}
          <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
            <Ionicons name={typeConfig.icon as any} size={14} color={typeConfig.color} />
            <Text style={[styles.typeText, { color: typeConfig.color }]}>
              {typeConfig.label}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.meetingTitle, { color: text }]} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={textMuted} />
            <Text style={[styles.metaText, { color: textMuted }]}>
              {formatDate(item.date)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={textMuted} />
            <Text style={[styles.metaText, { color: textMuted }]}>{item.duration} phút</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={textMuted} />
            <Text style={[styles.metaText, { color: textMuted }]}>{item.location}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={primary} />
              <Text style={[styles.statText, { color: text }]}>
                {attendedCount}/{item.attendees.length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="document-text-outline" size={16} color={primary} />
              <Text style={[styles.statText, { color: text }]}>{item.decisions.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color={primary} />
              <Text style={[styles.statText, { color: text }]}>
                {completedActions}/{item.actionItems.length}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>Biên bản họp</Text>
        <Pressable
          onPress={() => router.push(`/projects/${projectId}/create-meeting` as any)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={primary} />
        </Pressable>
      </View>

      {/* Type Filter */}
      <FlatList
        horizontal
        data={['ALL', ...Object.keys(MEETING_TYPES)] as (MeetingType | 'ALL')[]}
        renderItem={({ item }) => {
          const isAll = item === 'ALL';
          const config = isAll ? null : MEETING_TYPES[item];
          const count = isAll ? meetings.length : meetings.filter(m => m.type === item).length;

          return (
            <Pressable
              style={[
                styles.filterChip,
                { borderColor: border },
                selectedType === item && {
                  backgroundColor: isAll ? primary : config!.color,
                  borderColor: isAll ? primary : config!.color,
                },
              ]}
              onPress={() => setSelectedType(item)}
            >
              {!isAll && (
                <Ionicons
                  name={config!.icon as any}
                  size={16}
                  color={selectedType === item ? '#fff' : config!.color}
                />
              )}
              <Text
                style={[styles.filterText, { color: selectedType === item ? '#fff' : text }]}
              >
                {isAll ? 'Tất cả' : config!.label} ({count})
              </Text>
            </Pressable>
          );
        }}
        keyExtractor={item => item}
        contentContainerStyle={styles.filterList}
        showsHorizontalScrollIndicator={false}
      />

      {/* Meeting List */}
      <FlatList
        data={filteredMeetings}
        renderItem={renderMeeting}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.meetingList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={textMuted} />
            <Text style={[styles.emptyText, { color: textMuted }]}>Chưa có biên bản họp</Text>
          </View>
        }
      />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  addButton: {
    padding: 4,
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  meetingList: {
    padding: 16,
    gap: 12,
  },
  meetingCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  typeStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  meetingContent: {
    padding: 16,
    paddingLeft: 20,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 10,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
