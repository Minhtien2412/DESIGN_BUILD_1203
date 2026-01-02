import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, color }: StatCardProps) {
  const primaryColor = color || useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');

  const trendColor = trend?.direction === 'up' ? '#34C759' : '#FF3B30';
  const trendIcon = trend?.direction === 'up' ? 'trending-up' : 'trending-down';

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      {icon && (
        <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
          <Ionicons name={icon} size={24} color={primaryColor} />
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: `${textColor}99` }]}>{title}</Text>
        
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color: textColor }]}>{value}</Text>
          
          {trend && (
            <View style={[styles.trendBadge, { backgroundColor: `${trendColor}20` }]}>
              <Ionicons name={trendIcon} size={14} color={trendColor} />
              <Text style={[styles.trendText, { color: trendColor }]}>
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>

        {subtitle && (
          <Text style={[styles.subtitle, { color: `${textColor}80` }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
});
