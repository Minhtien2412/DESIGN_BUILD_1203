import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { useNotifications } from '@/context/NotificationsContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    loading,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');

  // Toggle selection
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Handle mark as read
  const handleMarkRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteNotification(id)));
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'task':
        return 'checkmark-circle-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'project':
        return 'briefcase-outline';
      case 'meeting':
        return 'videocam-outline';
      case 'payment':
        return 'card-outline';
      case 'document':
        return 'document-text-outline';
      default:
        return 'notifications-outline';
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // Render notification item
  const renderNotificationItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.includes(item.id);
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          { borderBottomColor: borderColor },
          !item.read && styles.unreadItem,
          isSelected && { backgroundColor: `${primaryColor}20` },
        ]}
        onPress={() => {
          if (selectionMode) {
            toggleSelection(item.id);
          } else {
            handleMarkRead(item.id);
            // Navigation handled by context
          }
        }}
        onLongPress={() => {
          setSelectionMode(true);
          toggleSelection(item.id);
        }}
      >
        {selectionMode && (
          <View style={styles.checkbox}>
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={24}
              color={isSelected ? primaryColor : borderColor}
            />
          </View>
        )}

        <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}15` }]}>
          <Ionicons name={icon} size={24} color={primaryColor} />
        </View>

        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: textColor }, !item.read && styles.boldText]}>
            {item.title}
          </Text>
          <Text style={[styles.body, { color: textColor }]} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={[styles.time, { color: `${textColor}80` }]}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>

        {!selectionMode && (
          <View style={styles.actions}>
            {!item.read && (
              <TouchableOpacity onPress={() => handleMarkRead(item.id)} style={styles.actionButton}>
                <Ionicons name="checkmark-circle" size={20} color={primaryColor} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <Container>
        <Loader size={40} />
      </Container>
    );
  }

  return (
    <Container fullWidth>
      {/* Header */}
      <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: primaryColor }]}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
          {!isConnected && (
            <Ionicons name="cloud-offline-outline" size={20} color="#666666" style={styles.offlineIcon} />
          )}
        </View>

        <View style={styles.headerActions}>
          {selectionMode ? (
            <>
              <TouchableOpacity onPress={() => setSelectionMode(false)} style={styles.headerButton}>
                <Text style={[styles.headerButtonText, { color: textColor }]}>Cancel</Text>
              </TouchableOpacity>
              {selectedIds.length > 0 && (
                <TouchableOpacity onPress={handleBulkDelete} style={styles.headerButton}>
                  <Text style={[styles.headerButtonText, { color: '#FF3B30' }]}>Delete ({selectedIds.length})</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead} style={styles.headerButton}>
                  <Text style={[styles.headerButtonText, { color: primaryColor }]}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={refreshNotifications} style={styles.headerButton}>
                <Ionicons name="refresh" size={20} color={primaryColor} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={80} color={borderColor} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>No notifications</Text>
          <Text style={[styles.emptySubtitle, { color: `${textColor}80` }]}>
            You're all caught up! Notifications will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={refreshNotifications}
          contentContainerStyle={styles.listContent}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  offlineIcon: {
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: '#0066CC10',
  },
  checkbox: {
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
