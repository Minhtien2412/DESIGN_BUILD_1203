/**
 * Timeline Item Component
 * Item cho timeline view
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface TimelineItemProps {
  title: string;
  description?: string;
  date: string;
  time?: string;
  status?: 'completed' | 'current' | 'pending' | 'failed';
  icon?: keyof typeof Ionicons.glyphMap;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const STATUS_COLORS = {
  completed: '#0066CC',
  current: '#3b82f6',
  pending: '#9ca3af',
  failed: '#000000',
};

export default function TimelineItem({
  title,
  description,
  date,
  time,
  status = 'pending',
  icon = 'checkmark-circle',
  isFirst = false,
  isLast = false,
  onPress,
  style,
}: TimelineItemProps) {
  const color = STATUS_COLORS[status];
  const Content = onPress ? TouchableOpacity : View;

  return (
    <View style={[styles.container, style]}>
      {/* Timeline Line */}
      <View style={styles.timelineColumn}>
        {!isFirst && (
          <View style={[styles.line, styles.lineTop, { backgroundColor: color }]} />
        )}
        <View style={[styles.dot, { borderColor: color, backgroundColor: status === 'completed' ? color : '#fff' }]}>
          <Ionicons name={icon} size={16} color={status === 'completed' ? '#fff' : color} />
        </View>
        {!isLast && (
          <View style={[styles.line, styles.lineBottom, { backgroundColor: color }]} />
        )}
      </View>

      {/* Content */}
      <Content
        style={styles.content}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{date}</Text>
              {time && <Text style={styles.time}>{time}</Text>}
            </View>
          </View>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      </Content>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineColumn: {
    width: 40,
    alignItems: 'center',
    position: 'relative',
  },
  line: {
    width: 2,
    position: 'absolute',
  },
  lineTop: {
    top: 0,
    height: 20,
  },
  lineBottom: {
    bottom: 0,
    top: 32,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  time: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginTop: 4,
  },
});
