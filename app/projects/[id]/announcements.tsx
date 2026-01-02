/**
 * Team Announcements Screen
 * View and manage project announcements
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
import communicationService, { Announcement } from '@/services/api/communication.service';

export default function AnnouncementsScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const loadAnnouncements = async (silent = false) => {
    if (!projectId) return;

    try {
      if (!silent) setLoading(true);

      const response = await communicationService.getAnnouncements(
        parseInt(projectId),
        showPast
      );

      if (response.data) {
        setAnnouncements(response.data);
      }
    } catch (error) {
      console.error('Failed to load announcements:', error);
      if (!silent) {
        Alert.alert('Lỗi', 'Không thể tải thông báo');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [projectId, showPast]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnnouncements(true);
  };

  const handleCreateAnnouncement = () => {
    router.push(`/projects/${projectId}/create-announcement`);
  };

  const handleAnnouncementPress = (announcement: Announcement) => {
    router.push(`/projects/${projectId}/announcements/${announcement.id}`);
  };

  const handleMarkAsRead = async (announcementId: number) => {
    try {
      // TODO: Implement mark as read when backend supports it
      console.log('Mark as read:', announcementId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#EF4444';
      case 'HIGH':
        return '#F97316';
      case 'NORMAL':
        return primary;
      case 'LOW':
        return '#6B7280';
      default:
        return textMuted;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'alert-circle';
      case 'HIGH':
        return 'warning';
      case 'NORMAL':
        return 'information-circle';
      case 'LOW':
        return 'chatbubble';
      default:
        return 'megaphone';
    }
  };

  const renderAnnouncementCard = ({ item }: { item: Announcement }) => {
    const priorityColor = getPriorityColor(item.priority);
    const read = false; // TODO: Implement read tracking when backend supports it
    const isActive = item.expiresAt ? new Date(item.expiresAt) > new Date() : true;

    return (
      <Pressable
        style={[
          styles.announcementCard,
          { backgroundColor: surface, borderColor: border },
          !read && styles.unreadCard,
        ]}
        onPress={() => handleAnnouncementPress(item)}
      >
        {/* Priority Indicator */}
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />

        <View style={styles.cardContent}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons
                name={getPriorityIcon(item.priority) as any}
                size={20}
                color={priorityColor}
              />
              <Text
                style={[
                  styles.announcementTitle,
                  { color: text },
                  !read && styles.unreadTitle,
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
            </View>

            {!read && <View style={[styles.unreadDot, { backgroundColor: primary }]} />}
          </View>

          {/* Content Preview */}
          <Text style={[styles.announcementContent, { color: textMuted }]} numberOfLines={2}>
            {item.content}
          </Text>

          {/* Meta Info */}
          <View style={styles.cardMeta}>
            <View style={styles.metaLeft}>
              <Ionicons name="person-outline" size={14} color={textMuted} />
              <Text style={[styles.metaText, { color: textMuted }]}>
                {item.publishedByName || 'Admin'}
              </Text>

              <Ionicons name="time-outline" size={14} color={textMuted} style={{ marginLeft: 12 }} />
              <Text style={[styles.metaText, { color: textMuted }]}>
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>

            {!isActive && (
              <View style={[styles.expiredBadge, { backgroundColor: textMuted + '20' }]}>
                <Text style={[styles.expiredText, { color: textMuted }]}>Đã hết hạn</Text>
              </View>
            )}
          </View>

          {/* Attachments */}
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachments}>
              <Ionicons name="attach-outline" size={14} color={primary} />
              <Text style={[styles.attachmentText, { color: primary }]}>
                {item.attachments.length} tệp đính kèm
              </Text>
            </View>
          )}

          {/* Read Receipts - TODO: Implement when backend supports it */}
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loadingText, { color: textMuted }]}>Đang tải thông báo...</Text>
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
        <Text style={[styles.headerTitle, { color: text }]}>Thông báo</Text>
        <Pressable onPress={handleCreateAnnouncement} style={styles.createButton}>
          <Ionicons name="add-circle-outline" size={24} color={primary} />
        </Pressable>
      </View>

      {/* Filter Toggle */}
      <View style={[styles.filterBar, { backgroundColor: surface, borderBottomColor: border }]}>
        <Pressable
          style={[
            styles.filterButton,
            !showPast && { backgroundColor: primary + '20', borderColor: primary },
          ]}
          onPress={() => setShowPast(false)}
        >
          <Text style={[styles.filterButtonText, { color: !showPast ? primary : text }]}>
            Đang hoạt động
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            showPast && { backgroundColor: primary + '20', borderColor: primary },
          ]}
          onPress={() => setShowPast(true)}
        >
          <Text style={[styles.filterButtonText, { color: showPast ? primary : text }]}>
            Tất cả
          </Text>
        </Pressable>
      </View>

      {/* Announcements List */}
      <FlatList
        data={announcements}
        renderItem={renderAnnouncementCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={64} color={textMuted} />
            <Text style={[styles.emptyText, { color: textMuted }]}>
              {showPast ? 'Chưa có thông báo nào' : 'Không có thông báo đang hoạt động'}
            </Text>
            <Pressable
              style={[styles.emptyButton, { backgroundColor: primary }]}
              onPress={handleCreateAnnouncement}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Tạo thông báo</Text>
            </Pressable>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
  createButton: {
    padding: 4,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  announcementCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  unreadCard: {
    borderWidth: 2,
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    padding: 16,
    paddingLeft: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  announcementTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  announcementContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  expiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expiredText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  attachments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  attachmentText: {
    fontSize: 12,
    fontWeight: '500',
  },
  readReceipts: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  readReceiptText: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
