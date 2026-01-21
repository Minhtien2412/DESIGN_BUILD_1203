/**
 * Progress Detail Screen
 * Màn hình chi tiết tiến độ công việc - React Native version
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { CONSTRUCTION_TASKS } from './constants';
import { SubTask, Task, TaskStatus } from './types';

const { width } = Dimensions.get('window');
const imageSize = (width - 48 - 12) / 2;

interface ProgressDetailProps {
  taskId?: string;
  task?: Task;
  onBack?: () => void;
}

const ProgressDetail: React.FC<ProgressDetailProps> = ({
  taskId,
  task: propTask,
  onBack,
}) => {
  // Find task by id or use prop
  const task = propTask || CONSTRUCTION_TASKS.find(t => t.id === taskId) || CONSTRUCTION_TASKS[6];
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  // Parse work items from subTasks or description
  const workItems: SubTask[] = task.subTasks || 
    task.description?.split('-').filter(i => i.trim().length > 0).map((item, idx) => ({
      id: `${task.id}-${idx}`,
      title: item.trim(),
      isCompleted: isCompleted,
    })) || [];

  // Calculate progress
  const completedItems = workItems.filter(w => w.isCompleted).length;
  const progress = workItems.length > 0 
    ? Math.round((completedItems / workItems.length) * 100) 
    : (isCompleted ? 100 : isInProgress ? 65 : 0);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Banner */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={[
              styles.statusBadge,
              isCompleted && styles.statusCompleted,
              isInProgress && styles.statusInProgress,
            ]}>
              <Text style={[
                styles.statusText,
                isCompleted && styles.statusTextCompleted,
                isInProgress && styles.statusTextInProgress,
              ]}>
                {isCompleted ? 'ĐÃ HOÀN THÀNH' : isInProgress ? 'ĐANG THỰC HIỆN' : 'CHỜ TRIỂN KHAI'}
              </Text>
            </View>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>

          {/* Dates */}
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>BẮT ĐẦU</Text>
              <Text style={styles.dateValue}>{task.startDate}</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>KẾT THÚC</Text>
              <Text style={styles.dateValue}>{task.endDate}</Text>
            </View>
          </View>
        </View>

        {/* Work Log Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Nhật ký công việc</Text>
        </View>

        {/* Work Items Timeline */}
        <View style={styles.workTimeline}>
          {workItems.map((item, idx) => (
            <WorkItemLog
              key={item.id}
              item={item}
              index={idx + 1}
              isLast={idx === workItems.length - 1}
              parentTask={task}
            />
          ))}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

// Work Item Log Component
const WorkItemLog: React.FC<{
  item: SubTask;
  index: number;
  isLast: boolean;
  parentTask: Task;
}> = ({ item, index, isLast, parentTask }) => {
  const isDone = item.isCompleted;
  const showMedia = isDone && (index % 2 !== 0);
  const hasVideo = showMedia && index === 1;

  return (
    <View style={styles.workItem}>
      {/* Connector Line */}
      {!isLast && (
        <View style={[
          styles.workConnector,
          isDone && styles.workConnectorActive,
        ]} />
      )}

      {/* Node */}
      <View style={[
        styles.workNode,
        isDone && styles.workNodeDone,
      ]}>
        {isDone ? (
          <Ionicons name="checkmark" size={16} color="#fff" />
        ) : (
          <Text style={styles.workNodeText}>{index}</Text>
        )}
      </View>

      {/* Content Card */}
      <View style={[
        styles.workCard,
        isDone && styles.workCardDone,
      ]}>
        <View style={styles.workCardHeader}>
          <Text style={styles.workCardLabel}>CÔNG VIỆC #{index}</Text>
          <Text style={[
            styles.workCardTitle,
            !isDone && styles.workCardTitlePending,
          ]}>
            {item.title}
          </Text>
        </View>

        {/* Media Preview */}
        {showMedia && (
          <View style={styles.mediaSection}>
            <View style={styles.mediaGrid}>
              <View style={styles.mediaItem}>
                <Image
                  source={{ uri: `https://picsum.photos/seed/img-${parentTask.id}-${index}/300/300` }}
                  style={styles.mediaImage}
                />
              </View>
              {hasVideo ? (
                <View style={styles.mediaItem}>
                  <Image
                    source={{ uri: `https://picsum.photos/seed/vid-${parentTask.id}/300/300` }}
                    style={[styles.mediaImage, styles.videoThumb]}
                  />
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={32} color="#fff" />
                    <Text style={styles.videoDuration}>0:12</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.mediaItem}>
                  <Image
                    source={{ uri: `https://picsum.photos/seed/img2-${parentTask.id}-${index}/300/300` }}
                    style={styles.mediaImage}
                  />
                </View>
              )}
            </View>
            <Text style={styles.updateTime}>Cập nhật: {parentTask.startDate}</Text>
          </View>
        )}

        {/* Pending State */}
        {!isDone && (
          <View style={styles.pendingRow}>
            <Ionicons name="hourglass-outline" size={12} color="#9CA3AF" />
            <Text style={styles.pendingText}>CHỜ TRIỂN KHAI</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },

  // Progress Card
  progressCard: {
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
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  statusCompleted: {
    backgroundColor: '#ECFDF5',
  },
  statusInProgress: {
    backgroundColor: '#DBEAFE',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  statusTextCompleted: {
    color: '#047857',
  },
  statusTextInProgress: {
    color: '#1D4ED8',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '900',
    color: '#10B981',
  },

  // Progress Bar
  progressBarBg: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },

  // Dates
  dateRow: {
    flexDirection: 'row',
    gap: 24,
  },
  dateItem: {},
  dateLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },

  // Work Timeline
  workTimeline: {
    paddingHorizontal: 16,
  },
  workItem: {
    flexDirection: 'row',
    position: 'relative',
  },

  // Work Connector
  workConnector: {
    position: 'absolute',
    left: 19,
    top: 40,
    bottom: -12,
    width: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 0,
  },
  workConnectorActive: {
    backgroundColor: '#10B981',
  },

  // Work Node
  workNode: {
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
  workNodeDone: {
    backgroundColor: '#10B981',
    borderColor: '#fff',
  },
  workNodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  // Work Card
  workCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  workCardDone: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  workCardHeader: {
    marginBottom: 8,
  },
  workCardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  workCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 18,
  },
  workCardTitlePending: {
    color: '#9CA3AF',
  },

  // Media Section
  mediaSection: {
    marginTop: 8,
  },
  mediaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoThumb: {
    opacity: 0.6,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 8,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  updateTime: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Pending State
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
});

export default ProgressDetail;
