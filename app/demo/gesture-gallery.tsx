/**
 * Gesture Gallery Demo
 * Showcase real-world use cases
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotificationItem } from '../../components/notifications/NotificationItem';
import { ImageZoomViewer } from '../../components/ui/ImageZoomViewer';
import { useThemeColor } from '../../hooks/use-theme-color';

export default function GestureGalleryDemo() {
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');
  const border = useThemeColor({}, 'border');

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Project Update',
      message: 'Your project "Villa Resort" has been updated by the contractor.',
      time: '2 minutes ago',
      icon: 'hammer-outline' as keyof typeof Ionicons.glyphMap,
      read: false,
    },
    {
      id: '2',
      title: 'Payment Received',
      message: 'Payment of 50,000,000 VND has been confirmed for project #1234.',
      time: '1 hour ago',
      icon: 'card-outline' as keyof typeof Ionicons.glyphMap,
      read: false,
    },
    {
      id: '3',
      title: 'Material Delivery',
      message: 'Your cement order (50 bags) will be delivered tomorrow at 9 AM.',
      time: '3 hours ago',
      icon: 'cube-outline' as keyof typeof Ionicons.glyphMap,
      read: true,
    },
  ]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: !notif.read } : notif
      )
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    Alert.alert('Deleted', 'Notification removed');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={primary} />
          </Pressable>
          <Text style={[styles.title, { color: text }]}>Gesture Gallery</Text>
        </View>

        {/* Section 1: Image Zoom Viewer */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>
            📸 Image Zoom Viewer
          </Text>
          <Text style={[styles.sectionDesc, { color: text, opacity: 0.7 }]}>
            Tap to fullscreen, pinch or double-tap to zoom
          </Text>

          <View style={styles.imageGrid}>
            <ImageZoomViewer
              source={require('../../assets/images/react-logo.webp')}
              thumbnailStyle={styles.thumbnail}
            />
            <ImageZoomViewer
              source={require('../../assets/images/partial-react-logo.webp')}
              thumbnailStyle={styles.thumbnail}
            />
          </View>
        </View>

        {/* Section 2: Notification Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: text }]}>
            🔔 Smart Notifications
          </Text>
          <Text style={[styles.sectionDesc, { color: text, opacity: 0.7 }]}>
            Swipe left/right or long press for actions
          </Text>

          <View style={[styles.notificationList, { backgroundColor: surface, borderColor: border }]}>
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                {...notif}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                onTap={(id) => Alert.alert('Tapped', `Notification ${id}`)}
              />
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: surface, borderColor: border }]}>
          <Ionicons name="information-circle" size={24} color={primary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[styles.instructionTitle, { color: text }]}>
              How to Use Gestures
            </Text>
            <Text style={[styles.instructionText, { color: text, opacity: 0.7 }]}>
              • Swipe left → Delete{'\n'}
              • Swipe right → Mark read/unread{'\n'}
              • Long press → Show menu{'\n'}
              • Tap image → Fullscreen{'\n'}
              • Pinch/Double-tap → Zoom
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnail: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  notificationList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  instructions: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
