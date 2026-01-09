/**
 * Villa Construction Progress Screen
 * ===================================
 * Hiển thị tiến độ thi công biệt thự theo dạng roadmap/flowchart
 * Tích hợp dữ liệu từ Perfex CRM: https://thietkeresort.com.vn/perfex_crm/admin/projects/view/2?group=project_gantt
 * 
 * @updated 2026-01-05 - Integrate with CRM Gantt data
 */

import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { getScreenOptions } from '@/constants/navigation-theme';
import { Colors } from '@/constants/theme';
import { PerfexApiIntegration, ProjectPhase } from '@/services/apiIntegration';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

// ============================================================================
// DESIGN TOKENS - Blue-White-Black Theme
// ============================================================================
const THEME_COLORS = {
  primary: '#0066CC',
  primaryDark: '#004499',
  primaryLight: '#E8F4FF',
  accent: '#0080FF',
  
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  
  success: '#0066CC',
  warning: '#666666',
  error: '#000000',
  
  background: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E8E8E8',
  divider: '#F0F0F0',
};

// Legend tags for construction phases
const LEGEND_TAGS = [
  { label: 'Sơn', color: '#0066CC' },
  { label: 'ME - Hoà', color: '#0080FF' },
  { label: 'Đóng trần thạch cao', color: '#666666' },
  { label: 'Máy lạnh', color: '#999999' },
];

// ============================================================================
// TYPES
// ============================================================================
interface VillaStage {
  id: string;
  title: string;
  area: string;
  description: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'pending';
  accent: string;
  tasks: { code: string; label: string; progress: number }[];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function VillaProgressScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = Colors[scheme];
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [projectData, setProjectData] = useState<{
    name: string;
    progress: number;
    startDate: string;
    endDate: string;
    phases: ProjectPhase[];
    stages: VillaStage[];
  }>({
    name: 'Biệt Thự 3 Tầng Anh Tiến Quận 7',
    progress: 0.45,
    startDate: '01/2026',
    endDate: '12/2026',
    phases: [],
    stages: [],
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch data from CRM
  const fetchCRMData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch project phases from CRM (Project ID: 2)
      const phasesResponse = await PerfexApiIntegration.getProjectPhases('2');
      
      if (phasesResponse.success && phasesResponse.data) {
        const phases = phasesResponse.data;
        
        // Calculate overall progress
        const totalProgress = phases.reduce((sum, p) => sum + p.progress, 0);
        const overallProgress = phases.length > 0 ? totalProgress / phases.length / 100 : 0;
        
        // Transform phases to stages for display
        const stages: VillaStage[] = phases.map((phase, index) => ({
          id: String(index + 1).padStart(2, '0'),
          title: phase.name,
          area: getPhaseArea(phase.name),
          description: getPhaseDescription(phase.name),
          progress: phase.progress,
          status: phase.status,
          accent: getStatusColor(phase.status),
          tasks: phase.tasks.map((task, taskIndex) => ({
            code: `${index + 1}.${taskIndex + 1}`,
            label: task.name,
            progress: task.progress,
          })),
        }));
        
        setProjectData(prev => ({
          ...prev,
          progress: overallProgress,
          phases,
          stages,
        }));
      }
    } catch (err: any) {
      console.error('[VillaProgress] Error fetching CRM data:', err);
      setError('Không thể tải dữ liệu từ CRM. Đang sử dụng dữ liệu mẫu.');
      
      // Use fallback static data
      setProjectData(prev => ({
        ...prev,
        stages: getStaticStages(),
      }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCRMData();
  }, [fetchCRMData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCRMData();
  }, [fetchCRMData]);

  // Navigate to CRM Gantt view
  const openCRMGantt = () => {
    // Open CRM Gantt in external browser or webview
    router.push('/crm/projects/2' as any);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={getScreenOptions('Tiến độ biệt thự')} />
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            <Text style={styles.loadingText}>Đang tải dữ liệu từ CRM...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={getScreenOptions('Tiến độ biệt thự')} />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[THEME_COLORS.primary]}
              tintColor={THEME_COLORS.primary}
            />
          }
        >
          <Container contentContainerStyle={styles.container}>
            {/* CRM Source Banner */}
            <TouchableOpacity style={styles.crmBanner} onPress={openCRMGantt}>
              <View style={styles.crmBannerContent}>
                <Ionicons name="link-outline" size={16} color={THEME_COLORS.primary} />
                <Text style={styles.crmBannerText}>Dữ liệu từ Perfex CRM</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={THEME_COLORS.textMuted} />
            </TouchableOpacity>

            {error && (
              <View style={styles.errorBanner}>
                <Ionicons name="warning-outline" size={16} color={THEME_COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Section>
              <View style={[styles.heroCard, { backgroundColor: theme.surface, shadowColor: theme.shadow }]}>
                <Text style={[styles.heroTitle, { color: theme.text }]}>{projectData.name}</Text>
                <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
                  Tiến độ thi công - Gantt Chart
                </Text>

                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Hoàn thành</Text>
                    <Text style={[styles.progressValue, { color: THEME_COLORS.primary }]}>
                      {Math.round(projectData.progress * 100)}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.surfaceMuted }]}>
                    <View
                      style={[styles.progressFill, {
                        width: `${projectData.progress * 100}%`,
                        backgroundColor: THEME_COLORS.primary,
                      }]}
                    />
                  </View>
                  <View style={styles.progressMetaRow}>
                    <Text style={[styles.progressMeta, { color: theme.textMuted }]}>
                      Bắt đầu: {projectData.startDate}
                    </Text>
                    <Text style={[styles.progressMeta, { color: theme.textMuted }]}>
                      Kết thúc: {projectData.endDate}
                    </Text>
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

            <Section title="Tiến độ từng giai đoạn">
              <View style={styles.timelineWrapper}>
                {projectData.stages.map((stage, index) => {
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
                            isLast={index === projectData.stages.length - 1}
                          />
                          <View style={styles.stageColumn} />
                        </>
                      ) : (
                        <>
                          <View style={styles.stageColumn} />
                          <TimelineNode
                            stage={stage}
                            isFirst={index === 0}
                            isLast={index === projectData.stages.length - 1}
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
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return THEME_COLORS.primary;
    case 'in_progress': return THEME_COLORS.accent;
    case 'pending': return THEME_COLORS.textMuted;
    default: return THEME_COLORS.textMuted;
  }
}

function getPhaseArea(phaseName: string): string {
  if (phaseName.includes('móng') || phaseName.includes('Móng')) return 'Móng';
  if (phaseName.includes('sàn') || phaseName.includes('Sàn')) return 'Sàn';
  if (phaseName.includes('cột') || phaseName.includes('Cột')) return 'Kết cấu';
  if (phaseName.includes('cọc') || phaseName.includes('Cọc')) return 'Móng cọc';
  if (phaseName.includes('san lấp') || phaseName.includes('San lấp')) return 'Nền';
  return 'Thi công';
}

function getPhaseDescription(phaseName: string): string {
  if (phaseName.includes('móng')) return 'Thi công phần móng công trình';
  if (phaseName.includes('sàn')) return 'Thi công sàn bê tông cốt thép';
  if (phaseName.includes('cột')) return 'Thi công cột và dầm';
  if (phaseName.includes('cọc')) return 'Ép cọc bê tông ly tâm';
  return 'Giai đoạn thi công';
}

function getStaticStages(): VillaStage[] {
  return [
    {
      id: '01',
      title: 'Khởi công',
      area: 'Dự án',
      description: 'Khởi công dự án xây dựng',
      progress: 100,
      status: 'completed',
      accent: THEME_COLORS.primary,
      tasks: [
        { code: '1.1', label: 'Khởi công dự án', progress: 100 },
        { code: '1.2', label: 'Khởi công dự án CT', progress: 100 },
      ],
    },
    {
      id: '02',
      title: 'Ép cọc',
      area: 'Móng',
      description: 'Ép cọc bê tông ly tâm',
      progress: 100,
      status: 'completed',
      accent: THEME_COLORS.primary,
      tasks: [
        { code: '2.1', label: 'Ép cọc', progress: 100 },
        { code: '2.2', label: 'Ép cọc CT', progress: 100 },
      ],
    },
    {
      id: '03',
      title: 'Đào móng',
      area: 'Móng',
      description: 'Đào móng và xử lý nền',
      progress: 100,
      status: 'completed',
      accent: THEME_COLORS.primary,
      tasks: [
        { code: '3.1', label: 'Đào móng', progress: 100 },
        { code: '3.2', label: 'Đào móng CT', progress: 100 },
      ],
    },
    {
      id: '04',
      title: 'Làm thép móng',
      area: 'Móng',
      description: 'Làm thép móng và giằng móng',
      progress: 80,
      status: 'in_progress',
      accent: THEME_COLORS.accent,
      tasks: [
        { code: '4.1', label: 'Làm thép móng - giằng móng', progress: 80 },
        { code: '4.2', label: 'Làm thép móng - giằng móng CT', progress: 80 },
      ],
    },
    {
      id: '05',
      title: 'Đổ bê tông móng',
      area: 'Móng',
      description: 'Đổ bê tông móng công trình',
      progress: 0,
      status: 'pending',
      accent: THEME_COLORS.textMuted,
      tasks: [
        { code: '5.1', label: 'Đổ bê tông móng', progress: 0 },
        { code: '5.2', label: 'Đổ bê tông móng CT', progress: 0 },
      ],
    },
    {
      id: '06',
      title: 'San lấp - Đệm nền',
      area: 'Nền',
      description: 'San lấp đệm nền, hố ga, thoát nước',
      progress: 0,
      status: 'pending',
      accent: THEME_COLORS.textMuted,
      tasks: [
        { code: '6.1', label: 'San lấp - đệm nền (hố ga, thoát trệt)', progress: 0 },
        { code: '6.2', label: 'San lấp - đệm nền CT', progress: 0 },
      ],
    },
  ];
}

// ============================================================================
// SUB COMPONENTS
// ============================================================================
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
        {/* Progress indicator */}
        <View style={[styles.progressBadge, { backgroundColor: stage.accent + '20' }]}>
          <Text style={[styles.progressBadgeText, { color: stage.accent }]}>{stage.progress}%</Text>
        </View>
      </View>
      <Text style={[styles.stageDescription, { color: themeColors.textMuted }]}>{stage.description}</Text>
      
      {/* Mini progress bar */}
      <View style={styles.miniProgressBar}>
        <View style={[styles.miniProgressFill, { width: `${stage.progress}%`, backgroundColor: stage.accent }]} />
      </View>
      
      <View style={styles.stageDivider} />
      {stage.tasks.slice(0, 4).map((task) => (
        <View key={task.code} style={styles.taskRow}>
          <Text style={[styles.taskLabel, { color: themeColors.text }]} numberOfLines={1}>{task.label}</Text>
          <View style={[styles.taskCode, { backgroundColor: stage.accent }]}>
            <Text style={styles.taskCodeText}>{task.code}</Text>
          </View>
        </View>
      ))}
      {stage.tasks.length > 4 && (
        <Text style={styles.moreTasksText}>+{stage.tasks.length - 4} công việc khác</Text>
      )}
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
  
  const nodeColor = stage?.status === 'completed' 
    ? THEME_COLORS.primary 
    : stage?.status === 'in_progress' 
      ? THEME_COLORS.accent 
      : THEME_COLORS.textMuted;
  
  return (
    <View style={styles.timelineNodeContainer}>
      {isFirst && (
        <Text style={[styles.timelineMarker, { color: THEME_COLORS.primary }]}>Bắt đầu</Text>
      )}
      {!isFirst && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
      <View style={[styles.timelineNode, { borderColor: nodeColor, backgroundColor: stage?.status === 'completed' ? nodeColor : '#fff' }]}>
        {stage?.status === 'completed' ? (
          <Ionicons name="checkmark" size={24} color="#fff" />
        ) : (
          <Text style={[styles.timelineNodeText, { color: nodeColor }]}>{stage?.id}</Text>
        )}
      </View>
      {!isLast && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
      <Text style={[styles.timelineNodeLabel, { color: theme.textMuted }]}>{stage?.area}</Text>
      {isLast && (
        <Text style={[styles.timelineMarker, { color: THEME_COLORS.primary, marginTop: 6 }]}>Kết thúc</Text>
      )}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    paddingBottom: 48,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: THEME_COLORS.textSecondary,
  },
  crmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  crmBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crmBannerText: {
    fontSize: 13,
    color: THEME_COLORS.primary,
    fontWeight: '500',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: THEME_COLORS.error,
    flex: 1,
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
  },
  heroSubtitle: {
    fontSize: 13,
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
    color: THEME_COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBar: {
    height: 14,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: THEME_COLORS.divider,
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
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
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
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    width: '95%',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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
    fontSize: 14,
  },
  stageHeaderText: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  stageArea: {
    fontSize: 12,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stageDescription: {
    fontSize: 12,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: THEME_COLORS.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stageDivider: {
    height: 1,
    backgroundColor: THEME_COLORS.divider,
    marginVertical: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 8,
  },
  taskLabel: {
    flex: 1,
    fontSize: 12,
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
  moreTasksText: {
    fontSize: 11,
    color: THEME_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  timelineNodeContainer: {
    width: 70,
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 30,
  },
  timelineNode: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  timelineNodeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  timelineNodeLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  timelineMarker: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
});
