/**
 * Simple Chart Components
 * Biểu đồ đơn giản, hiện đại không dùng thư viện nặng
 */

import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

// ============ BAR CHART ============
interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  maxValue?: number;
  height?: number;
  showValues?: boolean;
  style?: ViewStyle;
}

export function BarChart({
  data,
  maxValue,
  height = 200,
  showValues = true,
  style,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <View style={[styles.chartContainer, { height }, style]}>
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * (height - 40);
          const color = item.color || '#3b82f6';

          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barColumn}>
                {showValues && (
                  <Text style={styles.barValue}>{item.value}</Text>
                )}
                <View style={[styles.bar, { height: barHeight }]}>
                  <LinearGradient
                    colors={[color, color + 'CC']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.barGradient}
                  />
                </View>
              </View>
              <Text style={styles.barLabel} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ============ LINE CHART ============
interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  height?: number;
  lineColor?: string;
  gradientColors?: [string, string];
  style?: ViewStyle;
}

export function LineChart({
  data,
  height = 200,
  lineColor = '#3b82f6',
  gradientColors = ['#3b82f6', '#E8F4FF'],
  style,
}: LineChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - min) / range) * 80;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M 0,100 L ${points} L 100,100 Z`;

  return (
    <View style={[styles.chartContainer, { height }, style]}>
      <View style={styles.lineChartContainer}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Gradient fill */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[0]} stopOpacity="0.3" />
              <stop offset="100%" stopColor={gradientColors[1]} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={pathData} fill="url(#lineGradient)" />
          <polyline
            points={points}
            fill="none"
            stroke={lineColor}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {/* Points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - min) / range) * 80;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={lineColor}
              />
            );
          })}
        </svg>
      </View>
      <View style={styles.lineChartLabels}>
        {data.map((item, index) => (
          <Text key={index} style={styles.lineLabel} numberOfLines={1}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ============ DONUT CHART ============
interface DonutChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  size?: number;
  thickness?: number;
  centerText?: string;
  centerSubtext?: string;
  style?: ViewStyle;
}

export function DonutChart({
  data,
  size = 200,
  thickness = 30,
  centerText,
  centerSubtext,
  style,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = -90;

  return (
    <View style={[styles.donutContainer, { width: size, height: size }, style]}>
      <svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = item.value / total;
          const angle = percentage * 360;
          const endAngle = currentAngle + angle;

          const x1 = size / 2 + radius * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = size / 2 + radius * Math.sin((currentAngle * Math.PI) / 180);
          const x2 = size / 2 + radius * Math.cos((endAngle * Math.PI) / 180);
          const y2 = size / 2 + radius * Math.sin((endAngle * Math.PI) / 180);

          const largeArcFlag = angle > 180 ? 1 : 0;
          const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          ].join(' ');

          currentAngle = endAngle;

          return (
            <path
              key={index}
              d={pathData}
              stroke={item.color}
              strokeWidth={thickness}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Center Text */}
      {(centerText || centerSubtext) && (
        <View style={styles.donutCenter}>
          {centerText && <Text style={styles.donutCenterText}>{centerText}</Text>}
          {centerSubtext && <Text style={styles.donutCenterSubtext}>{centerSubtext}</Text>}
        </View>
      )}

      {/* Legend */}
      <View style={styles.donutLegend}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>
              {item.label} ({((item.value / total) * 100).toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    width: '100%',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    minHeight: 4,
  },
  barGradient: {
    flex: 1,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  lineChartContainer: {
    flex: 1,
    paddingVertical: 8,
  },
  lineChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  lineLabel: {
    fontSize: 11,
    color: '#6b7280',
    flex: 1,
    textAlign: 'center',
  },
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  donutCenterSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  donutLegend: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 13,
    color: '#374151',
  },
});
