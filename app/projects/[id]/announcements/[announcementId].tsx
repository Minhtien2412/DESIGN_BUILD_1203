/**
 * Announcement Detail Screen
 * View full announcement with metadata, attachments, and read receipts
 */

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import communicationService from '@/services/api/communication.service';

type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

// Extended Announcement type for UI with createdBy info
interface Announcement {
  id: string;
  projectId: number;
  title: string;
  content: string;
  priority: Priority;
  createdBy?: { id: string; name: string };
  publishedBy?: number;
  publishedByName?: string;
  createdAt: string;
  expiresAt?: string;
  readBy?: Array<{ userId: number; readAt: string; userName?: string }>;
  attachments?: Array<{ name: string; url: string; type: string; size: number }>;
  isPinned?: boolean;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  URGENT: { label: 'Khẩn cấp', color: '#000000', icon: 'alert-circle' },
  HIGH: { label: 'Cao', color: '#0066CC', icon: 'warning' },
  NORMAL: { label: 'Bình thường', color: '#3B82F6', icon: 'information-circle' },
  LOW: { label: 'Thấp', color: '#6B7280', icon: 'chatbubble' },
};

export default function AnnouncementDetailScreen() {
  const { id: projectId, announcementId } = useLocalSearchParams<{ id: string; announcementId: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncement();
  }, [announcementId]);

  const loadAnnouncement = async () => {
    if (!announcementId) return;

    setLoading(true);
    try {
      const response = await communicationService.getAnnouncement(Number(announcementId));
      const data = response.data;
      if (data) {
        // Transform service type to UI type
        const uiAnnouncement: Announcement = {
          id: String(data.id),
          projectId: data.projectId,
          title: data.title,
          content: data.content,
          priority: data.priority,
          publishedBy: data.publishedBy,
          publishedByName: data.publishedByName,
          createdAt: data.createdAt,
          expiresAt: data.expiresAt,
          attachments: data.attachments?.map(a => ({
            name: a.fileName,
            url: a.fileUrl,
            type: a.fileType,
            size: a.fileSize,
          })),
          isPinned: data.isPinned,
        };
        setAnnouncement(uiAnnouncement);
      } else {
        setAnnouncement(null);
      }
    } catch (error: any) {
      console.error('Load failed:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAttachment = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Lỗi', 'Không thể mở tệp này');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể mở tệp');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isExpired = announcement?.expiresAt && new Date(announcement.expiresAt) < new Date();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (!announcement) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={textMuted} />
        <Text style={[styles.emptyText, { color: textMuted }]}>Không tìm thấy thông báo</Text>
      </View>
    );
  }

  const priorityConfig = PRIORITY_CONFIG[announcement.priority];

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text }]}>Chi tiết thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Priority Badge */}
          <View style={[styles.priorityBadge, { backgroundColor: priorityConfig.color + '20' }]}>
            <Ionicons name={priorityConfig.icon as any} size={18} color={priorityConfig.color} />
            <Text style={[styles.priorityLabel, { color: priorityConfig.color }]}>
              {priorityConfig.label}
            </Text>
          </View>

          {/* Pinned Badge */}
          {announcement.isPinned && (
            <View style={[styles.pinnedBadge, { backgroundColor: primary + '20' }]}>
              <Ionicons name="pin" size={16} color={primary} />
              <Text style={[styles.pinnedText, { color: primary }]}>Đã ghim</Text>
            </View>
          )}

          {/* Title */}
          <Text style={[styles.title, { color: text }]}>{announcement.title}</Text>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color={textMuted} />
              <Text style={[styles.metaText, { color: textMuted }]}>
                {announcement.createdBy?.name || announcement.publishedByName || 'N/A'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color={textMuted} />
              <Text style={[styles.metaText, { color: textMuted }]}>
                {formatDate(announcement.createdAt)}
              </Text>
            </View>
          </View>

          {/* Expiration */}
          {announcement.expiresAt && (
            <View
              style={[
                styles.expirationBox,
                {
                  backgroundColor: isExpired ? '#00000020' : primary + '10',
                  borderColor: isExpired ? '#000000' : primary,
                },
              ]}
            >
              <Ionicons
                name={isExpired ? 'close-circle-outline' : 'time-outline'}
                size={18}
                color={isExpired ? '#000000' : primary}
              />
              <Text style={[styles.expirationText, { color: isExpired ? '#000000' : primary }]}>
                {isExpired
                  ? `Đã hết hạn vào ${formatDate(announcement.expiresAt)}`
                  : `Hết hạn vào ${formatDate(announcement.expiresAt)}`}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: border }]} />

          {/* Content */}
          <Text style={[styles.contentText, { color: text }]}>{announcement.content}</Text>

          {/* Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: text }]}>
                Tệp đính kèm ({announcement.attachments.length})
              </Text>
              <View style={styles.attachmentList}>
                {announcement.attachments.map((attachment, index) => (
                  <Pressable
                    key={index}
                    style={[styles.attachmentCard, { backgroundColor: surface, borderColor: border }]}
                    onPress={() => handleOpenAttachment(attachment.url)}
                  >
                    <View style={[styles.attachmentIcon, { backgroundColor: primary + '20' }]}>
                      <Ionicons name="document-outline" size={24} color={primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.attachmentName, { color: text }]} numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text style={[styles.attachmentMeta, { color: textMuted }]}>
                        {formatFileSize(attachment.size)}
                      </Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color={primary} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Read Receipts */}
          {announcement.readBy && announcement.readBy.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: text }]}>
                  Đã đọc ({announcement.readBy.length})
                </Text>
                <Ionicons name="checkmark-done-outline" size={20} color={primary} />
              </View>
              <View style={styles.readList}>
                {announcement.readBy.map((receipt, index) => (
                  <View
                    key={index}
                    style={[styles.readItem, { backgroundColor: surface, borderColor: border }]}
                  >
                    <View style={[styles.avatar, { backgroundColor: primary + '20' }]}>
                      <Ionicons name="person" size={16} color={primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.readName, { color: text }]}>
                        {receipt.userName || `Người dùng ${receipt.userId}`}
                      </Text>
                      <Text style={[styles.readTime, { color: textMuted }]}>
                        {formatDate(receipt.readAt)}
                      </Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color="#0066CC" />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
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
  content: {
    padding: 16,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  priorityLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 12,
  },
  pinnedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
  },
  expirationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  expirationText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  attachmentList: {
    gap: 10,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  attachmentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  attachmentMeta: {
    fontSize: 12,
  },
  readList: {
    gap: 8,
  },
  readItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  readTime: {
    fontSize: 12,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
});
