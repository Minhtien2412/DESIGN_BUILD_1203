/**
 * MilestoneCard Component
 * Displays phase/milestone details with progress tracking
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import {
    formatDateRange,
    getDaysRemaining,
    getPhaseStatusColor,
    getPhaseStatusLabel,
    isPhaseDelayed,
    Phase,
} from '@/services/timeline-api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MilestoneCardProps {
  phase: Phase;
  onPress?: () => void;
}

export function MilestoneCard({ phase, onPress }: MilestoneCardProps) {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const statusColor = phase.color || getPhaseStatusColor(phase.status);
  const statusLabel = getPhaseStatusLabel(phase.status);
  const delayed = isPhaseDelayed(phase);
  const daysRemaining = getDaysRemaining(phase.endDate);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to phase detail
      router.push(`/timeline/phase/${phase.id}` as any);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor, borderColor, borderLeftColor: statusColor },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {phase.icon && (
            <Ionicons
              name={phase.icon as any}
              size={20}
              color={statusColor}
              style={styles.icon}
            />
          )}
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {phase.name}
          </Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      {/* Description */}
      {phase.description && (
        <Text style={[styles.description, { color: textColor }]} numberOfLines={2}>
          {phase.description}
        </Text>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: textColor }]}>Tiến độ</Text>
          <Text style={[styles.progressValue, { color: statusColor }]}>
            {phase.progress}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${phase.progress}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        {/* Date Range */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color={textColor} />
          <Text style={[styles.infoText, { color: textColor }]}>
            {formatDateRange(phase.startDate, phase.endDate)}
          </Text>
        </View>

        {/* Days Remaining or Delayed */}
        {delayed ? (
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text style={[styles.infoText, { color: '#EF4444' }]}>
              Trễ {Math.abs(daysRemaining)} ngày
            </Text>
          </View>
        ) : daysRemaining >= 0 && phase.status !== 'COMPLETED' ? (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={textColor} />
            <Text style={[styles.infoText, { color: textColor }]}>
              Còn {daysRemaining} ngày
            </Text>
          </View>
        ) : null}

        {/* Tasks Count */}
        {phase.tasks && phase.tasks.length > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={14} color={textColor} />
            <Text style={[styles.infoText, { color: textColor }]}>
              {phase.tasks.filter((t) => t.status === 'COMPLETED').length}/{phase.tasks.length} công việc
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.7,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
  },
});
