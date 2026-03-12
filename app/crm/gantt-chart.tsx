/**
 * Gantt Chart Screen - Perfex CRM Style
 * =======================================
 * 
 * Biểu đồ Gantt hiển thị timeline các task trong dự án
 * - Timeline dạng thanh ngang
 * - Màu sắc theo trạng thái task
 * - Zoom level (ngày/tuần/tháng)
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useMilestones, useTasks } from '@/hooks/usePerfex';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const DAY_WIDTH = 40;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 50;

type ZoomLevel = 'day' | 'week' | 'month';

interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: string;
  type: 'task' | 'milestone';
}

export default function GanttChartScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [scrollX, setScrollX] = useState(0);

  const { loading: tasksLoading, getTasks } = useTasks();
  const { loading: milestonesLoading, getMilestones } = useMilestones();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Calculate date range
  const { startDate, endDate, totalDays, columns } = useMemo(() => {
    if (ganttTasks.length === 0) {
      const today = new Date();
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      const end = new Date(today);
      end.setDate(end.getDate() + 30);
      return {
        startDate: start,
        endDate: end,
        totalDays: 37,
        columns: generateColumns(start, end, zoomLevel),
      };
    }

    let minDate = new Date(ganttTasks[0].startDate);
    let maxDate = new Date(ganttTasks[0].endDate);

    ganttTasks.forEach((task) => {
      if (task.startDate < minDate) minDate = new Date(task.startDate);
      if (task.endDate > maxDate) maxDate = new Date(task.endDate);
    });

    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 14);

    const days = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      startDate: minDate,
      endDate: maxDate,
      totalDays: days,
      columns: generateColumns(minDate, maxDate, zoomLevel),
    };
  }, [ganttTasks, zoomLevel]);

  function generateColumns(start: Date, end: Date, zoom: ZoomLevel) {
    const cols: { date: Date; label: string; isToday: boolean }[] = [];
    const current = new Date(start);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current <= end) {
      const isToday =
        current.getDate() === today.getDate() &&
        current.getMonth() === today.getMonth() &&
        current.getFullYear() === today.getFullYear();

      let label = '';
      if (zoom === 'day') {
        label = current.getDate().toString();
      } else if (zoom === 'week') {
        label = `${current.getDate()}/${current.getMonth() + 1}`;
      } else {
        label = `T${current.getMonth() + 1}`;
      }

      cols.push({
        date: new Date(current),
        label,
        isToday,
      });

      if (zoom === 'month') {
        current.setMonth(current.getMonth() + 1);
      } else {
        current.setDate(current.getDate() + 1);
      }
    }

    return cols;
  }

  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  const loadData = async () => {
    if (!projectId) return;

    const [tasksData, milestonesData] = await Promise.all([
      getTasks(projectId),
      getMilestones(projectId),
    ]);

    const tasks: GanttTask[] = [];

    // Convert tasks
    tasksData.forEach((task: any) => {
      const start = task.startDate ? new Date(task.startDate) : new Date();
      const end = task.dueDate ? new Date(task.dueDate) : new Date(start);
      end.setDate(end.getDate() + 1);

      tasks.push({
        id: task.id,
        name: task.name,
        startDate: start,
        endDate: end,
        progress: task.status === 'complete' ? 100 : 50,
        status: task.status,
        type: 'task',
      });
    });

    // Convert milestones
    milestonesData.forEach((m: any) => {
      const date = new Date(m.dueDate);
      tasks.push({
        id: m.id!,
        name: m.name,
        startDate: date,
        endDate: date,
        progress: m.isCompleted ? 100 : 0,
        status: m.isCompleted ? 'complete' : 'pending',
        type: 'milestone',
      });
    });

    setGanttTasks(tasks);
  };

  const getTaskColor = (status: string): string => {
    const colors: Record<string, string> = {
      not_started: '#6b7280',
      in_progress: '#0D9488',
      testing: '#8b5cf6',
      awaiting_feedback: '#f59e0b',
      complete: '#22c55e',
      pending: '#f59e0b',
    };
    return colors[status] || '#6b7280';
  };

  const getBarPosition = (task: GanttTask) => {
    const startDiff = Math.max(
      0,
      Math.floor((task.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    );
    const duration = Math.max(
      1,
      Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      left: startDiff * DAY_WIDTH,
      width: duration * DAY_WIDTH - 4,
    };
  };

  const getColumnWidth = () => {
    switch (zoomLevel) {
      case 'day':
        return DAY_WIDTH;
      case 'week':
        return DAY_WIDTH;
      case 'month':
        return DAY_WIDTH * 4;
    }
  };

  const loading = tasksLoading || milestonesLoading;

  if (loading && ganttTasks.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải biểu đồ Gantt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Biểu đồ Gantt</Text>
        <View style={styles.zoomControls}>
          {(['day', 'week', 'month'] as ZoomLevel[]).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.zoomButton,
                zoomLevel === level && { backgroundColor: primaryColor },
              ]}
              onPress={() => setZoomLevel(level)}
            >
              <Text
                style={[
                  styles.zoomText,
                  { color: zoomLevel === level ? '#fff' : textColor },
                ]}
              >
                {level === 'day' ? 'Ngày' : level === 'week' ? 'Tuần' : 'Tháng'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gantt Chart */}
      <View style={styles.ganttContainer}>
        {/* Left Panel - Task Names */}
        <View style={[styles.leftPanel, { backgroundColor: cardBg, borderRightColor: borderColor }]}>
          <View style={[styles.cornerCell, { borderBottomColor: borderColor }]}>
            <Text style={[styles.cornerText, { color: textColor }]}>Task</Text>
          </View>
          {ganttTasks.map((task) => (
            <View
              key={task.id}
              style={[styles.taskNameCell, { borderBottomColor: borderColor }]}
            >
              <Ionicons
                name={task.type === 'milestone' ? 'flag' : 'checkbox-outline'}
                size={14}
                color={task.type === 'milestone' ? '#f59e0b' : primaryColor}
              />
              <Text style={[styles.taskName, { color: textColor }]} numberOfLines={1}>
                {task.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Right Panel - Timeline */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
          scrollEventThrottle={16}
        >
          <View>
            {/* Timeline Header */}
            <View style={[styles.timelineHeader, { borderBottomColor: borderColor }]}>
              {columns.map((col, index) => (
                <View
                  key={index}
                  style={[
                    styles.timelineCell,
                    { width: getColumnWidth(), borderRightColor: borderColor },
                    col.isToday && { backgroundColor: primaryColor + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.timelineLabel,
                      { color: col.isToday ? primaryColor : textColor },
                    ]}
                  >
                    {col.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Task Bars */}
            <View style={styles.barsContainer}>
              {/* Grid Lines */}
              <View style={styles.gridLines}>
                {columns.map((col, index) => (
                  <View
                    key={index}
                    style={[
                      styles.gridLine,
                      {
                        width: getColumnWidth(),
                        borderRightColor: borderColor,
                      },
                      col.isToday && { backgroundColor: primaryColor + '10' },
                    ]}
                  />
                ))}
              </View>

              {/* Task Rows */}
              {ganttTasks.map((task) => {
                const pos = getBarPosition(task);
                return (
                  <View key={task.id} style={[styles.taskRow, { height: ROW_HEIGHT }]}>
                    {task.type === 'milestone' ? (
                      <View
                        style={[
                          styles.milestone,
                          {
                            left: pos.left,
                            backgroundColor: getTaskColor(task.status),
                          },
                        ]}
                      >
                        <Ionicons name="flag" size={12} color="#fff" />
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.taskBar,
                          {
                            left: pos.left,
                            width: pos.width,
                            backgroundColor: getTaskColor(task.status) + '40',
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.taskBarFill,
                            {
                              width: `${task.progress}%`,
                              backgroundColor: getTaskColor(task.status),
                            },
                          ]}
                        />
                        <Text style={styles.taskBarLabel} numberOfLines={1}>
                          {task.name}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6b7280' }]} />
          <Text style={[styles.legendText, { color: textColor }]}>Chưa bắt đầu</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0D9488' }]} />
          <Text style={[styles.legendText, { color: textColor }]}>Đang làm</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
          <Text style={[styles.legendText, { color: textColor }]}>Hoàn thành</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="flag" size={14} color="#f59e0b" />
          <Text style={[styles.legendText, { color: textColor }]}>Cột mốc</Text>
        </View>
      </View>

      {/* Empty State */}
      {ganttTasks.length === 0 && (
        <View style={styles.emptyOverlay}>
          <View style={[styles.emptyCard, { backgroundColor: cardBg }]}>
            <Ionicons name="bar-chart-outline" size={48} color="#6b7280" />
            <Text style={[styles.emptyTitle, { color: textColor }]}>Chưa có dữ liệu</Text>
            <Text style={[styles.emptyText, { color: textColor }]}>
              Thêm task vào dự án để xem biểu đồ Gantt
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  zoomControls: {
    flexDirection: 'row',
    gap: 4,
  },
  zoomButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  zoomText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ganttContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    width: 150,
    borderRightWidth: 1,
  },
  cornerCell: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  cornerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  taskNameCell: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  taskName: {
    flex: 1,
    fontSize: 12,
  },
  timelineHeader: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  timelineCell: {
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  barsContainer: {
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    flexDirection: 'row',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  taskRow: {
    position: 'relative',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb20',
  },
  taskBar: {
    position: 'absolute',
    top: 8,
    height: ROW_HEIGHT - 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  taskBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 4,
  },
  taskBarLabel: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    bottom: 0,
    color: '#fff',
    fontSize: 10,
    lineHeight: ROW_HEIGHT - 16,
  },
  milestone: {
    position: 'absolute',
    top: 8,
    width: 24,
    height: 24,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
});
