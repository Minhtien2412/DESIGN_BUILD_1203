import { StyleSheet, Text, View } from 'react-native';

interface ChecklistProgressProps {
  completed: number;
  total: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  showLabel?: boolean;
}

export default function ChecklistProgress({
  completed,
  total,
  color = '#0D9488',
  height = 8,
  showPercentage = true,
  showLabel = false,
}: ChecklistProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>Tiến độ</Text>
          {showPercentage && <Text style={styles.percentage}>{percentage.toFixed(0)}%</Text>}
        </View>
      )}
      <View style={[styles.progressBar, { height }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {!showLabel && showPercentage && (
        <Text style={styles.percentageOnly}>{percentage.toFixed(0)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
  percentage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  percentageOnly: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
