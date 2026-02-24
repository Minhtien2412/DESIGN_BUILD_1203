/**
 * Progress Estimator Component
 * Visual progress indicator with color-coded status
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface ProgressEstimatorProps {
  percentage: number;
  completedTasks: number;
  totalTasks: number;
  showDetails?: boolean;
}

export function ProgressEstimator({
  percentage,
  completedTasks,
  totalTasks,
  showDetails = true,
}: ProgressEstimatorProps) {
  const getProgressColor = (percent: number): string => {
    if (percent >= 90) return '#0D9488';
    if (percent >= 70) return '#0D9488';
    if (percent >= 50) return '#0D9488';
    if (percent >= 30) return '#0D9488';
    return '#000000';
  };

  const getProgressIcon = (percent: number): string => {
    if (percent >= 90) return 'checkmark-circle';
    if (percent >= 70) return 'trending-up';
    if (percent >= 50) return 'time';
    return 'alert-circle';
  };

  const getProgressStatus = (percent: number): string => {
    if (percent >= 90) return 'Gần hoàn thành';
    if (percent >= 70) return 'Đúng tiến độ';
    if (percent >= 50) return 'Cần đẩy nhanh';
    if (percent >= 30) return 'Chậm tiến độ';
    return 'Rất chậm';
  };

  const color = getProgressColor(percentage);

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.barContainer}>
        <View style={[styles.barBackground]}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={[styles.percentageText, { color }]}>
          {Math.round(percentage)}%
        </Text>
      </View>

      {/* Details */}
      {showDetails && (
        <View style={styles.details}>
          <View style={styles.statusRow}>
            <Ionicons name={getProgressIcon(percentage) as any} size={20} color={color} />
            <Text style={[styles.statusText, { color }]}>
              {getProgressStatus(percentage)}
            </Text>
          </View>
          <Text style={styles.tasksText}>
            {completedTasks}/{totalTasks} công việc hoàn thành
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barBackground: {
    flex: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
    minWidth: 24,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  details: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  tasksText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
});
