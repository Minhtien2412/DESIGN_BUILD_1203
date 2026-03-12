/**
 * Progress Overview Screen
 * Màn hình tổng quan tiến độ dự án - React Native version
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CONSTRUCTION_TASKS } from './constants';
import { Task, TaskStatus } from './types';

interface ProgressOverviewProps {
  projectName?: string;
  projectCode?: string;
  onTaskPress?: (task: Task) => void;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  projectName = 'Biệt thự phố - Q2',
  projectCode = 'BTP-Q2-2026',
  onTaskPress,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);
  
  const completedCount = CONSTRUCTION_TASKS.filter(t => t.status === TaskStatus.COMPLETED).length;
  const progressPercent = Math.round((completedCount / CONSTRUCTION_TASKS.length) * 100);
  const currentTask = CONSTRUCTION_TASKS.find(t => t.status === TaskStatus.IN_PROGRESS);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleTaskPress = (task: Task) => {
    if (onTaskPress) {
      onTaskPress(task);
    } else {
      // Navigate to detail screen
      router.push({
        pathname: '/(tabs)/menu7' as any,
        params: { taskId: task.id },
      });
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
      }
    >
      {/* Progress Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryDecor} />
        
        <View style={styles.summaryHeader}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>TIẾN ĐỘ TỔNG QUÁT</Text>
            <Text style={styles.summaryPercent}>{progressPercent}%</Text>
            {currentTask && (
              <View style={styles.currentTaskBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.currentTaskText} numberOfLines={1}>
                  {currentTask.title}
                </Text>
              </View>
            )}
          </View>
          
          {/* Circular Progress */}
          <View style={styles.circularProgress}>
            <View style={styles.circularBg} />
            <View style={[styles.circularFill, { 
              transform: [{ rotate: `${(progressPercent / 100) * 360}deg` }] 
            }]} />
            <View style={styles.circularCenter}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            </View>
          </View>
        </View>

        <View style={styles.summaryDates}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>BẮT ĐẦU</Text>
            <Text style={styles.dateValue}>01/01/2026</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>DỰ KIẾN XONG</Text>
            <Text style={styles.dateValue}>31/05/2026</Text>
          </View>
        </View>
      </View>

      {/* Tasks Header */}
      <View style={styles.tasksHeader}>
        <Text style={styles.tasksTitle}>Hạng mục chi tiết</Text>
        <View style={styles.tasksBadge}>
          <Text style={styles.tasksBadgeText}>{CONSTRUCTION_TASKS.length} Task</Text>
        </View>
      </View>

      {/* Timeline Tasks */}
      <View style={styles.timeline}>
        {CONSTRUCTION_TASKS.map((task, idx) => (
          <TimelineItem
            key={task.id}
            task={task}
            isLast={idx === CONSTRUCTION_TASKS.length - 1}
            onPress={() => handleTaskPress(task)}
          />
        ))}
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// Timeline Item Component
const TimelineItem: React.FC<{
  task: Task;
  isLast: boolean;
  onPress: () => void;
}> = ({ task, isLast, onPress }) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  return (
    <TouchableOpacity 
      style={styles.timelineItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Connector Line */}
      {!isLast && (
        <View style={[
          styles.connector,
          isCompleted && styles.connectorActive
        ]} />
      )}

      {/* Node */}
      <View style={[
        styles.node,
        isCompleted && styles.nodeCompleted,
        isInProgress && styles.nodeInProgress,
      ]}>
        {isCompleted ? (
          <Ionicons name="checkmark" size={18} color="#fff" />
        ) : (
          <Text style={[
            styles.nodeText,
            isInProgress && styles.nodeTextActive
          ]}>
            {task.index}
          </Text>
        )}
      </View>

      {/* Card */}
      <View style={[
        styles.taskCard,
        isInProgress && styles.taskCardActive,
      ]}>
        <View style={styles.taskCardHeader}>
          <Text style={[
            styles.taskTitle,
            isInProgress && styles.taskTitleActive
          ]} numberOfLines={2}>
            {task.title}
          </Text>
          {isInProgress && (
            <View style={styles.inProgressBadge}>
              <Text style={styles.inProgressText}>ĐANG LÀM</Text>
            </View>
          )}
        </View>

        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={1}>
            {task.description}
          </Text>
        )}

        <View style={styles.taskFooter}>
          <View style={styles.taskDate}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text style={styles.taskDateText}>
              {task.startDate}{task.startDate !== task.endDate ? ` – ${task.endDate}` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
            <Text style={styles.detailBtnText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={14} color="#10B981" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // Summary Card
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    margin: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  summaryDecor: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 128,
    height: 128,
    backgroundColor: '#ECFDF5',
    borderRadius: 64,
    opacity: 0.5,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summaryPercent: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 8,
  },
  currentTaskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  currentTaskText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
    maxWidth: 150,
  },
  
  // Circular Progress
  circularProgress: {
    width: 64,
    height: 64,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularBg: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#F3F4F6',
  },
  circularFill: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#10B981',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  circularCenter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Summary Dates
  summaryDates: {
    flexDirection: 'row',
    gap: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateItem: {},
  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  // Tasks Header
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tasksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  tasksBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tasksBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },

  // Timeline
  timeline: {
    paddingHorizontal: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  
  // Connector
  connector: {
    position: 'absolute',
    left: 19,
    top: 40,
    bottom: -8,
    width: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 0,
  },
  connectorActive: {
    backgroundColor: '#10B981',
  },

  // Node
  node: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginRight: 12,
  },
  nodeCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#fff',
  },
  nodeInProgress: {
    backgroundColor: '#059669',
    borderColor: '#fff',
    transform: [{ scale: 1.05 }],
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  nodeTextActive: {
    color: '#fff',
  },

  // Task Card
  taskCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  taskCardActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#D1FAE5',
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    lineHeight: 20,
  },
  taskTitleActive: {
    color: '#047857',
    fontSize: 15,
  },
  inProgressBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inProgressText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  taskDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 16,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  taskDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDateText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
});

export default ProgressOverview;
