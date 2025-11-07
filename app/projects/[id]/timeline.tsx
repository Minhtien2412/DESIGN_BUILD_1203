import Badge from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/list-item';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type TimelinePhase = {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
  startDate: string;
  endDate: string;
  progress: number;
  tasks: string[];
  icon: string;
  color: string;
};

const MOCK_TIMELINE: TimelinePhase[] = [
  {
    id: '1',
    name: 'Khởi công',
    status: 'completed',
    startDate: '01/10/2024',
    endDate: '05/10/2024',
    progress: 100,
    tasks: ['Khảo sát mặt bằng', 'Chuẩn bị vật tư', 'Làm móng'],
    icon: 'flag',
    color: '#10B981',
  },
  {
    id: '2',
    name: 'Đổ móng',
    status: 'completed',
    startDate: '06/10/2024',
    endDate: '15/10/2024',
    progress: 100,
    tasks: ['Đào đất', 'Đổ bê tông móng', 'Kiểm tra chất lượng'],
    icon: 'foundation',
    color: '#10B981',
  },
  {
    id: '3',
    name: 'Xây tường',
    status: 'active',
    startDate: '16/10/2024',
    endDate: '30/10/2024',
    progress: 65,
    tasks: ['Xây tường tầng 1', 'Xây tường tầng 2', 'Tô trát'],
    icon: 'wall',
    color: '#3B82F6',
  },
  {
    id: '4',
    name: 'Đổ mái',
    status: 'pending',
    startDate: '01/11/2024',
    endDate: '10/11/2024',
    progress: 0,
    tasks: ['Dựng dàn giáo', 'Đổ bê tông sàn mái', 'Hoàn thiện mái'],
    icon: 'home-roof',
    color: '#6B7280',
  },
  {
    id: '5',
    name: 'Hoàn thiện',
    status: 'pending',
    startDate: '11/11/2024',
    endDate: '30/11/2024',
    progress: 0,
    tasks: ['Lát gạch', 'Sơn tường', 'Lắp đặt điện nước', 'Hoàn thiện nội thất'],
    icon: 'hammer-wrench',
    color: '#6B7280',
  },
];

const TimelineItem = ({ phase, isLast }: { phase: TimelinePhase; isLast: boolean }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceMuted = useThemeColor({}, 'surfaceMuted');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const inverseText = useThemeColor({}, 'textInverse');
  const getStatusIcon = () => {
    switch (phase.status) {
      case 'completed':
        return 'checkmark-circle';
      case 'active':
        return 'ellipse';
      case 'pending':
        return 'ellipse-outline';
    }
  };

  return (
    <View style={styles.timelineItem}>
      {/* Timeline Line */}
      <View style={styles.timelineIndicator}>
        <Ionicons
          name={getStatusIcon()}
          size={24}
          color={phase.color}
        />
        {!isLast && (
          <View style={[styles.timelineLine, { backgroundColor: phase.color }]} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.timelineContent, { backgroundColor: surfaceColor }]}>
        <View style={styles.phaseHeader}>
          <View style={[styles.phaseIcon, { backgroundColor: surfaceMuted }]}>
            <MaterialCommunityIcons
              name={phase.icon as any}
              size={24}
              color={phase.color}
            />
          </View>
          
          <View style={styles.phaseInfo}>
            <Text style={[styles.phaseName, { color: textColor }]}>{phase.name}</Text>
            <Text style={[styles.phaseDate, { color: mutedColor }]}>
              {phase.startDate} - {phase.endDate}
            </Text>
          </View>

          <Badge
            variant="primary"
            style={{ backgroundColor: phase.color }}
          >
            <Text style={{ color: inverseText, fontSize: 12 }}>
              {phase.status === 'completed' ? 'Hoàn thành' :
               phase.status === 'active' ? 'Đang làm' :
               'Chưa bắt đầu'}
            </Text>
          </Badge>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: mutedColor + '33' }]}>
            <View style={[styles.progressFill, { width: `${phase.progress}%`, backgroundColor: phase.color }]} />
          </View>
          <Text style={[styles.progressText, { color: textColor }]}>{phase.progress}%</Text>
        </View>

        {/* Tasks */}
        <View style={styles.tasksContainer}>
          {phase.tasks.map((task, index) => (
            <View key={index} style={styles.task}>
              <Ionicons
                name={phase.status === 'completed' ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={phase.status === 'completed' ? phase.color : mutedColor}
              />
              <Text style={[
                styles.taskText,
                { color: textColor },
                phase.status === 'completed' && { color: mutedColor, textDecorationLine: 'line-through' }
              ]}>
                {task}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function ProjectTimelineScreen() {
  const params = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'textMuted');
  const borderColor = useThemeColor({}, 'border');
  const infoColor = useThemeColor({}, 'info');
  
  const completedPhases = MOCK_TIMELINE.filter(p => p.status === 'completed').length;
  const totalPhases = MOCK_TIMELINE.length;
  const overallProgress = Math.round((completedPhases / totalPhases) * 100);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tiến độ dự án',
          headerBackTitle: 'Quay lại',
        }}
      />

      <ScrollView style={[styles.container, { backgroundColor }]}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: surfaceColor }] }>
          <Text style={[styles.summaryTitle, { color: textColor }]}>Tổng quan tiến độ</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: infoColor }]}>{completedPhases}/{totalPhases}</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Giai đoạn hoàn thành</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
            
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: infoColor }]}>{overallProgress}%</Text>
              <Text style={[styles.statLabel, { color: mutedColor }]}>Tiến độ tổng thể</Text>
            </View>
          </View>

          <View style={styles.overallProgress}>
            <View style={[styles.progressBar, { backgroundColor: mutedColor + '33' }]}>
              <View style={[styles.progressFill, { width: `${overallProgress}%`, backgroundColor: infoColor }]} />
            </View>
          </View>
        </View>

        {/* Timeline */}
        <SectionHeader title="Các giai đoạn" />
        
        <View style={styles.timeline}>
          {MOCK_TIMELINE.map((phase, index) => (
            <TimelineItem
              key={phase.id}
              phase={phase}
              isLast={index === MOCK_TIMELINE.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  overallProgress: {
    marginTop: 8,
  },
  timeline: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineIndicator: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  phaseDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    width: 45,
    textAlign: 'right',
  },
  tasksContainer: {
    gap: 8,
  },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  taskCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
});
