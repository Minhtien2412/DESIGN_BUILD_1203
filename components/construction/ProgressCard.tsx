/**
 * Progress Card Component  
 * Card hiển thị tiến độ với progress bar
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface ProgressCardProps {
  title: string;
  progress: number; // 0-100
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  showPercentage?: boolean;
  gradientColors?: [string, string];
  style?: ViewStyle;
}

export default function ProgressCard({
  title,
  progress,
  subtitle,
  icon,
  showPercentage = true,
  gradientColors,
  style,
}: ProgressCardProps) {
  const getProgressColor = (): [string, string] => {
    if (gradientColors) return gradientColors;
    if (progress >= 80) return ['#10b981', '#059669'];
    if (progress >= 50) return ['#3b82f6', '#2563eb'];
    if (progress >= 25) return ['#f59e0b', '#d97706'];
    return ['#ef4444', '#dc2626'];
  };

  const colors = getProgressColor();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {icon && (
            <View style={styles.iconWrapper}>
              <Ionicons name={icon} size={20} color="#374151" />
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        {showPercentage && (
          <View style={[styles.badge, { backgroundColor: colors[0] + '15' }]}>
            <Text style={[styles.percentage, { color: colors[0] }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
