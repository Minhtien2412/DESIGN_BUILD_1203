/**
 * Metric Card Component
 * Card hiển thị metric với icon, label, value
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradientColors?: [string, string];
  style?: ViewStyle;
}

const DEFAULT_GRADIENTS: Record<string, [string, string]> = {
  blue: ['#3b82f6', '#0066CC'],
  green: ['#0066CC', '#0066CC'],
  orange: ['#0066CC', '#d97706'],
  purple: ['#666666', '#666666'],
  red: ['#000000', '#000000'],
};

export default function MetricCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  trendValue,
  gradientColors = DEFAULT_GRADIENTS.blue,
  style,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return null;
    return trend === 'up' ? 'trending-up' : 'trending-down';
  };

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return '#6b7280';
    return trend === 'up' ? '#0066CC' : '#000000';
  };

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        
        {(subtitle || trend) && (
          <View style={styles.footer}>
            {trend && trendValue && (
              <View style={styles.trend}>
                {getTrendIcon() && (
                  <Ionicons 
                    name={getTrendIcon()!} 
                    size={14} 
                    color={getTrendColor()} 
                  />
                )}
                <Text style={[styles.trendText, { color: getTrendColor() }]}>
                  {trendValue}
                </Text>
              </View>
            )}
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
});
