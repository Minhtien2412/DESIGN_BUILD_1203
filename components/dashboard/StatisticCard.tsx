/**
 * Enhanced Statistics Card Component
 * Reusable card for dashboard metrics with trend indicators
 */

import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  gradientColors?: [string, string];
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function StatisticCard({
  title,
  value,
  icon,
  color = Colors.light.primary,
  gradientColors,
  trend,
  subtitle,
}: StatisticCardProps) {
  const colors = gradientColors || [color, `${color}dd`];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconBg}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          
          {/* Trend & Subtitle */}
          <View style={styles.footer}>
            {trend && (
              <View style={styles.trendContainer}>
                <Ionicons
                  name={trend.isPositive ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={trend.isPositive ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.trendText,
                    { color: trend.isPositive ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {trend.value}
                </Text>
              </View>
            )}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 160,
    marginBottom: 12,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
