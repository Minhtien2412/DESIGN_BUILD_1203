import { useThemeColor } from '@/hooks/use-theme-color';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Types cho dữ liệu
export type ConstructionPhase = {
  id: string;
  number: string; // "01", "02", "03", "04"
  status: 'started' | 'completed' | 'upcoming';
};

export type WorkItem = {
  id: string;
  name: string; // "Bắn Laser", "Ván khuôn", "Làm thép", etc.
  location: string; // "F1", "F1C1", "W1", etc.
  originalStart: string; // "20/06"
  originalEnd: string; // "20/12"
  progressStart: string;
  progressEnd: string;
  duration: string; // "3 Month", "1 Day", etc.
  status: 'completed' | 'in-progress' | 'not-started';
  phase: string; // "01", "02", "03", "04"
  category?: 'paint' | 'gypsum' | 'mechanical' | 'aircon'; // For color coding
};

export type LegendItem = {
  id: string;
  label: string;
  color: string;
};

type Props = {
  phases: ConstructionPhase[];
  workItems: WorkItem[];
  legends: LegendItem[];
};

const COLORS = {
  phaseMarker: '#0066CC',
  originalBar: '#FFA84D',
  progressBar: '#14B159',
  notStarted: '#E82A34',
  inProgress: '#D39878',
  completed: '#14B159',
  paint: '#FFA84D',
  gypsum: '#FFD301',
  mechanical: '#4DA6FF',
  aircon: '#BBE7F0',
  textWhite: '#FFFFFF',
  textBlack: '#000000',
  border: '#D39878',
};

export default function ConstructionGanttChart({ phases, workItems, legends }: Props) {
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');

  const getBorderColor = (status: WorkItem['status']) => {
    switch (status) {
      case 'not-started':
        return COLORS.notStarted;
      case 'in-progress':
        return COLORS.inProgress;
      case 'completed':
        return COLORS.completed;
      default:
        return COLORS.border;
    }
  };

  const getCategoryColor = (category?: WorkItem['category']) => {
    if (!category) return COLORS.originalBar;
    switch (category) {
      case 'paint':
        return COLORS.paint;
      case 'gypsum':
        return COLORS.gypsum;
      case 'mechanical':
        return COLORS.mechanical;
      case 'aircon':
        return COLORS.aircon;
      default:
        return COLORS.originalBar;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <Text style={[styles.title, { color: textColor }]}>
        TIẾN ĐỘ THI CÔNG BIỆT THỰ
      </Text>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {legends.map((legend) => (
          <View key={legend.id} style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: legend.color }]} />
            <Text style={[styles.legendText, { color: textColor }]}>{legend.label}</Text>
          </View>
        ))}
      </View>

      {/* Phase Markers */}
      <View style={styles.phasesRow}>
        <View style={styles.phaseMarker}>
          <View style={[styles.phaseCircle, { backgroundColor: COLORS.phaseMarker }]}>
            <Text style={styles.phaseNumber}>01</Text>
          </View>
          <Text style={[styles.phaseLabel, { color: mutedColor }]}>Bắt đầu</Text>
        </View>

        {phases.slice(1, -1).map((phase) => (
          <View key={phase.id} style={styles.phaseMarker}>
            <View style={[styles.phaseCircle, { backgroundColor: COLORS.phaseMarker }]}>
              <Text style={styles.phaseNumber}>{phase.number}</Text>
            </View>
          </View>
        ))}

        <View style={styles.phaseMarker}>
          <View style={[styles.phaseCircle, { backgroundColor: COLORS.phaseMarker }]}>
            <Text style={styles.phaseNumber}>
              {phases[phases.length - 1]?.number || '04'}
            </Text>
          </View>
          <Text style={[styles.phaseLabel, { color: mutedColor }]}>Kết thúc</Text>
        </View>
      </View>

      {/* Work Items - Scrollable */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ganttScrollContent}
      >
        <View style={styles.ganttContainer}>
          {/* Timeline Bars Legend */}
          <View style={styles.barLegendRow}>
            <View style={styles.barLegend}>
              <View style={[styles.barLegendColor, { backgroundColor: COLORS.originalBar }]} />
              <Text style={[styles.barLegendText, { color: textColor }]}>Bản vẽ gốc</Text>
            </View>
            <View style={styles.barLegend}>
              <View style={[styles.barLegendColor, { backgroundColor: COLORS.progressBar }]} />
              <Text style={[styles.barLegendText, { color: textColor }]}>Báo cáo tiến độ</Text>
            </View>
          </View>

          {/* Work Items List */}
          {workItems.map((item) => (
            <View key={item.id} style={styles.workItemRow}>
              {/* Left Info */}
              <View style={styles.workItemInfo}>
                <View style={[
                  styles.workItemCard,
                  { borderColor: getBorderColor(item.status) }
                ]}>
                  <Text style={[styles.workItemName, { color: textColor }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.workItemLocation, { color: mutedColor }]}>
                    {item.location}
                  </Text>
                  <Text style={[styles.workItemDuration, { color: mutedColor }]}>
                    {item.duration}
                  </Text>
                  <Text style={[styles.workItemDates, { color: mutedColor }]}>
                    {item.originalStart} to {item.originalEnd}
                  </Text>
                </View>
              </View>

              {/* Timeline Bars */}
              <View style={styles.timelineBars}>
                {/* Original Bar */}
                <View style={[
                  styles.timelineBar,
                  { 
                    backgroundColor: getCategoryColor(item.category),
                    width: '60%', // Simplified - calculate based on dates
                  }
                ]} />
                
                {/* Progress Bar */}
                <View style={[
                  styles.timelineBar,
                  { 
                    backgroundColor: COLORS.progressBar,
                    width: item.status === 'completed' ? '60%' : 
                           item.status === 'in-progress' ? '40%' : '0%',
                    marginTop: 4,
                  }
                ]} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Phase Indicator */}
      <View style={styles.bottomPhaseRow}>
        <Text style={[styles.phaseText, { color: mutedColor }]}>
          Giai đoạn: {phases.find(p => p.status === 'started')?.number || '01'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  
  // Legend
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 20,
    height: 12,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#00000020',
  },
  legendText: {
    fontSize: 11,
    color: '#374151',
  },

  // Phases
  phasesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  phaseMarker: {
    alignItems: 'center',
    gap: 4,
  },
  phaseCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.phaseMarker,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textWhite,
  },
  phaseLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },

  // Gantt Chart
  ganttScrollContent: {
    paddingHorizontal: 8,
  },
  ganttContainer: {
    minWidth: '100%',
  },
  
  // Bar Legend
  barLegendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingVertical: 8,
  },
  barLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barLegendColor: {
    width: 24,
    height: 12,
    borderRadius: 2,
  },
  barLegendText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },

  // Work Items
  workItemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    minHeight: 80,
  },
  workItemInfo: {
    width: 140,
    marginRight: 12,
  },
  workItemCard: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  workItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  workItemLocation: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  workItemDuration: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  workItemDates: {
    fontSize: 10,
    color: '#9CA3AF',
  },

  // Timeline Bars
  timelineBars: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineBar: {
    height: 14,
    borderRadius: 4,
    minWidth: 40,
  },

  // Bottom
  bottomPhaseRow: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
});
