/**
 * Activity Log Component
 * Displays login history and security events
 */

import { Colors } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

export interface ActivityEvent {
  id: string;
  type: 'login' | 'logout' | 'security' | 'action';
  title: string;
  description: string;
  timestamp: string; // ISO date string
  metadata?: {
    ipAddress?: string;
    device?: string;
    location?: string;
    browser?: string;
  };
}

interface ActivityLogItemProps {
  event: ActivityEvent;
}

export const ActivityLogItem = ({ event }: ActivityLogItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIcon = () => {
    switch (event.type) {
      case 'login': return 'log-in-outline';
      case 'logout': return 'log-out-outline';
      case 'security': return 'shield-checkmark-outline';
      case 'action': return 'flash-outline';
      default: return 'ellipse';
    }
  };

  const getIconColor = () => {
    switch (event.type) {
      case 'login': return '#34C759'; // Green
      case 'logout': return '#FF9500'; // Orange
      case 'security': return '#007AFF'; // Blue
      case 'action': return '#AF52DE'; // Purple
      default: return colors.textMuted;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  return (
    <View style={styles.activityItem}>
      {/* Timeline dot */}
      <View style={[styles.timelineDot, { backgroundColor: getIconColor() }]}>
        <Ionicons name={getIcon()} size={16} color="#FFF" />
      </View>

      {/* Content */}
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={[styles.activityTitle, { color: colors.text }]}>
            {event.title}
          </Text>
          <Text style={[styles.activityTime, { color: colors.textMuted }]}>
            {formatTime(event.timestamp)}
          </Text>
        </View>

        <Text style={[styles.activityDescription, { color: colors.textMuted }]}>
          {event.description}
        </Text>

        {/* Metadata (device, IP, location) */}
        {event.metadata && (
          <View style={styles.metadataContainer}>
            {event.metadata.device && (
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons name="cellphone" size={12} color={colors.textMuted} />
                <Text style={[styles.metadataText, { color: colors.textMuted }]}>
                  {event.metadata.device}
                </Text>
              </View>
            )}
            {event.metadata.ipAddress && (
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons name="ip-network" size={12} color={colors.textMuted} />
                <Text style={[styles.metadataText, { color: colors.textMuted }]}>
                  {event.metadata.ipAddress}
                </Text>
              </View>
            )}
            {event.metadata.location && (
              <View style={styles.metadataItem}>
                <MaterialCommunityIcons name="map-marker" size={12} color={colors.textMuted} />
                <Text style={[styles.metadataText, { color: colors.textMuted }]}>
                  {event.metadata.location}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activityItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: 'relative',
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  activityDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metadataText: {
    fontSize: 11,
  },
});
