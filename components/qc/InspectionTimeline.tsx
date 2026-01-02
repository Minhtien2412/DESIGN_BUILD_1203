import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export interface TimelineEvent {
  id: string;
  type: 'created' | 'status_change' | 'comment' | 'photo' | 'resolved';
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

interface InspectionTimelineProps {
  events: TimelineEvent[];
}

const EVENT_CONFIG = {
  created: {
    icon: 'add-circle',
    color: '#0A6847',
    bgColor: '#E3F2FD',
  },
  status_change: {
    icon: 'swap-horizontal',
    color: '#FF9800',
    bgColor: '#FFF3E0',
  },
  comment: {
    icon: 'chatbox',
    color: '#0A6847',
    bgColor: '#F3E5F5',
  },
  photo: {
    icon: 'camera',
    color: '#0A6847',
    bgColor: '#E0F7FA',
  },
  resolved: {
    icon: 'checkmark-circle',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
};

export default function InspectionTimeline({ events }: InspectionTimelineProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    }

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.timeline}>
        {events.map((event, index) => {
          const config = EVENT_CONFIG[event.type];
          const isLast = index === events.length - 1;

          return (
            <View key={event.id} style={styles.eventContainer}>
              <View style={styles.eventLeft}>
                <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
                  <Ionicons name={config.icon as any} size={20} color={config.color} />
                </View>
                {!isLast && <View style={styles.line} />}
              </View>

              <View style={[styles.eventRight, isLast && styles.eventRightLast]}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>{formatTimestamp(event.timestamp)}</Text>
                </View>

                {event.description && (
                  <Text style={styles.eventDescription}>{event.description}</Text>
                )}

                {event.user && (
                  <View style={styles.userRow}>
                    <Ionicons name="person-circle" size={16} color="#999" />
                    <Text style={styles.userName}>{event.user.name}</Text>
                  </View>
                )}

                {event.metadata && (
                  <View style={styles.metadata}>
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <Text key={key} style={styles.metadataText}>
                        {key}: <Text style={styles.metadataValue}>{String(value)}</Text>
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeline: {
    paddingVertical: 8,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  eventLeft: {
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  eventRight: {
    flex: 1,
    paddingBottom: 20,
  },
  eventRightLast: {
    paddingBottom: 0,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  eventTime: {
    fontSize: 12,
    color: '#999',
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  userName: {
    fontSize: 13,
    color: '#999',
  },
  metadata: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metadataValue: {
    fontWeight: '600',
    color: '#333',
  },
});
