import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { getScreenOptions } from '@/constants/navigation-theme';
import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

type Task = {
  label: string;
  code: string;
};

type VillaStage = {
  id: string;
  title: string;
  area: string;
  description: string;
  accent: string;
  tasks: Task[];
};

const LEGEND_TAGS = [
  { label: 'Sơn', color: '#FFA84D' },
  { label: 'ME - Hoà', color: '#4DA6FF' },
  { label: 'Đóng trần thạch cao', color: '#FFD301' },
  { label: 'Máy lạnh', color: '#BBE7F0' },
];

const VILLA_STAGES: VillaStage[] = [
  {
    id: '01',
    title: 'Tường ngăn',
    area: 'Lầu 2',
    description: 'Thi công khối phòng ngủ phía trước',
    accent: '#0A6847',
    tasks: [
      { code: '1.1', label: 'Laser - Thả dọi (lẻo)' },
      { code: '1.2', label: 'Xây tường - ghém' },
      { code: '1.3', label: 'Bảo dưỡng' },
      { code: '1.4', label: 'Tô tường' },
      { code: '1.5', label: 'Lát gạch' },
    ],
  },
  {
    id: '02',
    title: 'Tường ngăn',
    area: 'WC Lầu 2',
    description: 'Khu vệ sinh & chống thấm',
    accent: '#10B981',
    tasks: [
      { code: '2.1', label: 'Bắn mực Laser' },
      { code: '2.2', label: 'Khoan cấy thép râu' },
      { code: '2.3', label: 'Thả dọi (lẻo)' },
      { code: '2.4', label: 'Xây tường - ghém' },
      { code: '2.5', label: 'Bảo dưỡng' },
      { code: '2.6', label: 'Chống thấm' },
      { code: '2.7', label: 'Tô tường' },
      { code: '2.8', label: 'Lát gạch' },
    ],
  },
  {
    id: '03',
    title: 'Tường ngăn',
    area: 'Lầu 1',
    description: 'Không gian sinh hoạt chung',
    accent: '#0A6847',
    tasks: [
      { code: '3.1', label: 'Bắn mực Laser' },
      { code: '3.2', label: 'Khoan cấy thép râu' },
      { code: '3.3', label: 'Thả dọi (lẻo)' },
      { code: '3.4', label: 'Xây tường - ghém' },
      { code: '3.5', label: 'Bảo dưỡng' },
      { code: '3.6', label: 'Tô tường' },
      { code: '3.7', label: 'Chống thấm' },
      { code: '3.8', label: 'Lát gạch' },
    ],
  },
  {
    id: '04',
    title: 'WC trung tâm',
    area: 'WC Lầu 1',
    description: 'Kết cấu phòng tắm & đường ống',
    accent: '#10B981',
    tasks: [
      { code: '4.1', label: 'Bắn mực Laser' },
      { code: '4.2', label: 'Khoan cấy thép râu' },
      { code: '4.3', label: 'Thả dọi (lẻo)' },
      { code: '4.4', label: 'Xây tường - ghém' },
      { code: '4.5', label: 'Bảo dưỡng' },
      { code: '4.6', label: 'Tô tường' },
      { code: '4.7', label: 'Chống thấm' },
      { code: '4.8', label: 'Lát gạch' },
    ],
  },
  {
    id: '05',
    title: 'Tường ngăn',
    area: 'Tầng trệt',
    description: 'Không gian phòng khách',
    accent: '#0A6847',
    tasks: [
      { code: '5.1', label: 'Bắn mực Laser' },
      { code: '5.2', label: 'Khoan cấy thép râu' },
      { code: '5.3', label: 'Thả dọi (lẻo)' },
      { code: '5.4', label: 'Xây tường - ghém' },
      { code: '5.5', label: 'Bảo dưỡng' },
      { code: '5.6', label: 'Tô tường' },
      { code: '5.7', label: 'Chống thấm' },
      { code: '5.8', label: 'Lát gạch' },
    ],
  },
  {
    id: '06',
    title: 'WC sân vườn',
    area: 'WC Trệt',
    description: 'Khu chức năng ngoài trời',
    accent: '#10B981',
    tasks: [
      { code: '6.1', label: 'Bắn mực Laser' },
      { code: '6.2', label: 'Khoan cấy thép râu' },
      { code: '6.3', label: 'Thả dọi (lẻo)' },
      { code: '6.4', label: 'Xây tường - ghém' },
      { code: '6.5', label: 'Bảo dưỡng' },
      { code: '6.6', label: 'Tô tường' },
      { code: '6.7', label: 'Chống thấm' },
      { code: '6.8', label: 'Lát gạch' },
    ],
  },
];

export default function VillaProgressScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];

  const overallProgress = 0.68;

  return (
    <>
      <Stack.Screen options={getScreenOptions('Tiến độ biệt thự')} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Container contentContainerStyle={styles.container}>
          <Section>
            <View style={[styles.heroCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}> 
              <Text style={[styles.heroTitle, { color: theme.text }]}>Tiến độ thiết kế biệt thự</Text>
              <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>Hạng mục Tường ngăn & Hoàn thiện</Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Hoàn thành</Text>
                  <Text style={styles.progressValue}>{Math.round(overallProgress * 100)}%</Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: theme.surfaceMuted }]}> 
                  <View
                    style={[styles.progressFill, {
                      width: `${overallProgress * 100}%`,
                      backgroundColor: theme.primary,
                    }]}
                  />
                </View>
                <View style={styles.progressMetaRow}>
                  <Text style={[styles.progressMeta, { color: theme.textMuted }]}>Bắt đầu: 12/09</Text>
                  <Text style={[styles.progressMeta, { color: theme.textMuted }]}>Kết thúc dự kiến: 30/11</Text>
                </View>
              </View>

              <View style={styles.legendRow}>
                {LEGEND_TAGS.map((tag) => (
                  <View key={tag.label} style={[styles.legendChip, { borderColor: tag.color, backgroundColor: theme.surface }]}> 
                    <View style={[styles.legendDot, { backgroundColor: tag.color }]} />
                    <Text style={[styles.legendText, { color: theme.text }]}>{tag.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Section>

          <Section title="Tiến độ từng khu vực">
            <View style={styles.timelineWrapper}>
              {VILLA_STAGES.map((stage, index) => {
                const align = index % 2 === 0 ? 'right' : 'left';
                return (
                  <View key={stage.id} style={styles.timelineRow}>
                    {align === 'right' ? (
                      <>
                        <View style={styles.stageColumn}>
                          <StageCard stage={stage} align="right" themeColors={theme} />
                        </View>
                        <TimelineNode
                          stage={stage}
                          isFirst={index === 0}
                          isLast={index === VILLA_STAGES.length - 1}
                        />
                        <View style={styles.stageColumn} />
                      </>
                    ) : (
                      <>
                        <View style={styles.stageColumn} />
                        <TimelineNode
                          stage={stage}
                          isFirst={index === 0}
                          isLast={index === VILLA_STAGES.length - 1}
                        />
                        <View style={styles.stageColumn}>
                          <StageCard stage={stage} align="left" themeColors={theme} />
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </View>
          </Section>
        </Container>
      </SafeAreaView>
    </>
  );
}

function StageCard({ stage, align, themeColors }: { stage: VillaStage; align: 'left' | 'right'; themeColors: typeof Colors.light }) {
  return (
    <View
      style={[
        styles.stageCard,
        {
          backgroundColor: themeColors.surface,
          borderColor: stage.accent + '40',
          shadowColor: themeColors.shadow,
        },
        align === 'right' ? { marginRight: 8, alignSelf: 'flex-end' } : { marginLeft: 8, alignSelf: 'flex-start' },
      ]}
    >
      <View style={styles.stageHeader}>
        <View style={[styles.stageBadge, { backgroundColor: stage.accent }]}> 
          <Text style={styles.stageBadgeText}>{stage.id}</Text>
        </View>
        <View style={styles.stageHeaderText}>
          <Text style={[styles.stageTitle, { color: themeColors.text }]}>{stage.title}</Text>
          <Text style={[styles.stageArea, { color: themeColors.textMuted }]}>{stage.area}</Text>
        </View>
      </View>
      <Text style={[styles.stageDescription, { color: themeColors.textMuted }]}>{stage.description}</Text>
      <View style={styles.stageDivider} />
      {stage.tasks.map((task) => (
        <View key={task.code} style={styles.taskRow}>
          <Text style={[styles.taskLabel, { color: themeColors.text }]}>{task.label}</Text>
          <View style={[styles.taskCode, { backgroundColor: stage.accent }]}> 
            <Text style={styles.taskCodeText}>{task.code}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function TimelineNode({
  stage,
  isFirst,
  isLast,
}: {
  stage?: VillaStage;
  isFirst: boolean;
  isLast: boolean;
}) {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  return (
    <View style={styles.timelineNodeContainer}>
      {isFirst && (
        <Text style={[styles.timelineMarker, { marginBottom: 6 }]}>Bắt đầu</Text>
      )}
      {!isFirst && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
      <View style={[styles.timelineNode, { borderColor: stage?.accent || theme.primary }]}> 
        <Text style={styles.timelineNodeText}>{stage?.id.padStart(2, '0')}</Text>
      </View>
      {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
      <Text style={styles.timelineNodeLabel}>{stage?.area}</Text>
      {isLast && (
        <Text style={[styles.timelineMarker, { marginTop: 6 }]}>Kết thúc</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 48,
    gap: 24,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    gap: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B3B2E',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#4B5563',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  progressBar: {
    height: 14,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '500',
  },
  timelineWrapper: {
    gap: 32,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stageColumn: {
    flex: 1,
  },
  stageCard: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: 8,
    width: '95%',
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stageBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageBadgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  stageHeaderText: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  stageArea: {
    fontSize: 12,
    color: '#4B5563',
  },
  stageDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  stageDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 118, 110, 0.15)',
    marginVertical: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  taskLabel: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
  },
  taskCode: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  taskCodeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  timelineNodeContainer: {
    width: 70,
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  timelineNode: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 6,
  },
  timelineNodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  timelineNodeLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  timelineMarker: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00B14F',
    textTransform: 'uppercase',
  },
});
