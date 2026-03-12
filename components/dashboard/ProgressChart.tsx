import { useThemeColor } from '@/hooks/use-theme-color';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart, ProgressChart as CircularProgress, LineChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface BaseChartProps {
  title?: string;
}

interface LineChartProps extends BaseChartProps {
  type: 'line';
  data: {
    labels: string[];
    datasets: { data: number[]; color?: (opacity: number) => string }[];
  };
}

interface BarChartProps extends BaseChartProps {
  type: 'bar';
  data: {
    labels: string[];
    datasets: { data: number[] }[];
  };
}

interface PieChartProps extends BaseChartProps {
  type: 'pie';
  data: {
    name: string;
    value: number;
    color: string;
    legendFontColor?: string;
  }[];
}

interface CircularProgressProps extends BaseChartProps {
  type: 'circular';
  data: {
    labels: string[];
    data: number[];
  };
}

type ChartProps = LineChartProps | BarChartProps | PieChartProps | CircularProgressProps;

export function ProgressChart(props: ChartProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const chartConfig = {
    backgroundColor: backgroundColor,
    backgroundGradientFrom: backgroundColor,
    backgroundGradientTo: backgroundColor,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(238, 77, 45, ${opacity})`,
    labelColor: (opacity = 1) => `${textColor}${Math.round(opacity * 255).toString(16)}`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: primaryColor,
    },
  };

  const chartWidth = width - 48;

  return (
    <View style={styles.container}>
      {props.title && (
        <Text style={[styles.title, { color: textColor }]}>{props.title}</Text>
      )}

      {props.type === 'line' && (
        <LineChart
          data={props.data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
        />
      )}

      {props.type === 'bar' && (
        <BarChart
          data={props.data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
          withInnerLines={false}
          yAxisLabel=""
          yAxisSuffix=""
        />
      )}

      {props.type === 'pie' && (
        <PieChart
          data={props.data.map(item => ({
            ...item,
            legendFontColor: textColor,
          }))}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      )}

      {props.type === 'circular' && (
        <CircularProgress
          data={props.data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          strokeWidth={16}
          radius={32}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
});
