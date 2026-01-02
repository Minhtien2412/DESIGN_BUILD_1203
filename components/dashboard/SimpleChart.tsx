/**
 * Chart Component - Revenue/Progress Charts
 * Simple line/bar chart for dashboard analytics
 */

import { Colors } from '@/constants/theme';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 200;

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  type?: 'line' | 'bar';
  color?: string;
  title?: string;
}

export function SimpleChart({ data, type = 'bar', color = Colors.light.primary, title }: SimpleChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = (CHART_WIDTH - 32) / data.length - 8;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.axisLabel}>{formatValue(maxValue)}</Text>
            <Text style={styles.axisLabel}>{formatValue(maxValue / 2)}</Text>
            <Text style={styles.axisLabel}>0</Text>
          </View>

          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((point, index) => {
              const height = (point.value / maxValue) * (CHART_HEIGHT - 60);
              
              return (
                <View key={index} style={[styles.barWrapper, { width: barWidth + 8 }]}>
                  <View style={styles.barContainer}>
                    <Text style={styles.valueLabel}>{formatValue(point.value)}</Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: height || 2,
                          backgroundColor: color,
                          width: barWidth,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.xAxisLabel} numberOfLines={1}>
                    {point.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function formatValue(value: number): string {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingVertical: 10,
  },
  axisLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    textAlign: 'right',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0,
    paddingBottom: 30,
  },
  barWrapper: {
    alignItems: 'center',
  },
  barContainer: {
    height: CHART_HEIGHT - 60,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 2,
  },
  valueLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.text,
  },
  xAxisLabel: {
    fontSize: 11,
    color: Colors.light.textMuted,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 60,
  },
});
