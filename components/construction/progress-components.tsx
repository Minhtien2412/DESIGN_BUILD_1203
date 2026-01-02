/**
 * Construction Progress Components
 * Reusable UI components for progress tracking
 */

import {
    ConstructionTask,
    ProgressRole,
    TASK_STATUS_CONFIG,
    TaskConfirmation,
    TaskStatus,
} from '@/types/construction-progress';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Theme colors
const COLORS = {
  primary: '#EE4D2D',
  primaryDark: '#D73211',
  primaryLight: '#FFF0ED',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#222222',
  textSecondary: '#666666',
  textMuted: '#999999',
  border: '#E8E8E8',
  success: '#00C853',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  warningLight: '#FFF3E0',
  error: '#F44336',
  errorLight: '#FFEBEE',
  info: '#2196F3',
  infoLight: '#E3F2FD',
};

// ============================================================================
// Task Card Component
// ============================================================================

interface TaskCardProps {
  task: ConstructionTask;
  onPress?: () => void;
  onConfirm?: () => void;
  onUpdate?: () => void;
  canConfirm?: boolean;
  canEdit?: boolean;
  showTimeline?: boolean;
}

export function TaskCard({
  task,
  onPress,
  onConfirm,
  onUpdate,
  canConfirm = false,
  canEdit = false,
  showTimeline = true,
}: TaskCardProps) {
  const statusConfig = TASK_STATUS_CONFIG[task.status] || {
    label: task.status || 'Unknown',
    color: '#9E9E9E',
    bgColor: '#F5F5F5',
    icon: 'ellipse-outline',
    step: 0,
  };
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Pulse animation for active tasks
  useEffect(() => {
    if (task.status === 'IN_PROGRESS' || task.status === 'PENDING_CHECK') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
    return () => pulseAnim.stopAnimation();
  }, [task.status]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Status indicator */}
      <Animated.View 
        style={[
          styles.taskStatusIndicator,
          { backgroundColor: statusConfig.color },
          task.status === 'IN_PROGRESS' && { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Ionicons name={statusConfig.icon as any} size={16} color="#FFF" />
      </Animated.View>

      {/* Content */}
      <View style={styles.taskCardContent}>
        <View style={styles.taskCardHeader}>
          <Text style={styles.taskCardTitle} numberOfLines={1}>{task.name}</Text>
          <View style={[styles.taskCardBadge, { backgroundColor: `${statusConfig.color}15` }]}>
            <Text style={[styles.taskCardBadgeText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {task.description && (
          <Text style={styles.taskCardDesc} numberOfLines={2}>{task.description}</Text>
        )}

        {/* Progress */}
        <View style={styles.taskCardProgress}>
          <View style={styles.taskCardProgressBar}>
            <View 
              style={[
                styles.taskCardProgressFill,
                { width: `${task.progressPercent}%`, backgroundColor: statusConfig.color }
              ]} 
            />
          </View>
          <Text style={styles.taskCardProgressText}>{task.progressPercent}%</Text>
        </View>

        {/* Meta info */}
        <View style={styles.taskCardMeta}>
          <View style={styles.taskCardMetaItem}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.taskCardMetaText}>
              {formatDate(task.plannedStartDate)} - {formatDate(task.plannedEndDate)}
            </Text>
          </View>
          {task.assignedTo && task.assignedTo.length > 0 && (
            <View style={styles.taskCardMetaItem}>
              <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.taskCardMetaText} numberOfLines={1}>
                {task.assignedTo[0].userName}
              </Text>
            </View>
          )}
        </View>

        {/* Confirmation count */}
        {task.confirmations.length > 0 && (
          <View style={styles.taskCardConfirmations}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.taskCardConfirmText}>
              {task.confirmations.length} xác nhận
            </Text>
          </View>
        )}

        {/* Actions */}
        {(canConfirm || canEdit) && (
          <View style={styles.taskCardActions}>
            {canConfirm && (
              <TouchableOpacity 
                style={styles.taskCardConfirmBtn}
                onPress={onConfirm}
              >
                <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                <Text style={styles.taskCardConfirmBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            )}
            {canEdit && (
              <TouchableOpacity 
                style={styles.taskCardEditBtn}
                onPress={onUpdate}
              >
                <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                <Text style={styles.taskCardEditBtnText}>Cập nhật</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// Task Timeline Component (Shopee order tracking style)
// ============================================================================

interface TaskTimelineProps {
  task: ConstructionTask;
  showAllSteps?: boolean;
}

const CONFIRMATION_STEPS = [
  { role: 'CONTRACTOR' as ProgressRole, label: 'Nhà thầu xác nhận', icon: 'hammer' },
  { role: 'ENGINEER' as ProgressRole, label: 'Kỹ sư kiểm tra', icon: 'shield-checkmark' },
  { role: 'CLIENT' as ProgressRole, label: 'Khách hàng nghiệm thu', icon: 'person-circle' },
];

export function TaskTimeline({ task, showAllSteps = true }: TaskTimelineProps) {
  const getStepStatus = (role: ProgressRole): 'completed' | 'current' | 'pending' => {
    const confirmation = task.confirmations.find(c => c.userRole === role);
    if (confirmation?.status === 'CONFIRMED') return 'completed';
    
    const roleIndex = CONFIRMATION_STEPS.findIndex(s => s.role === role);
    const prevRoles = CONFIRMATION_STEPS.slice(0, roleIndex).map(s => s.role);
    const allPrevCompleted = prevRoles.every(r => 
      task.confirmations.some(c => c.userRole === r && c.status === 'CONFIRMED')
    );
    
    if (allPrevCompleted && task.progressPercent === 100) return 'current';
    return 'pending';
  };

  const getConfirmation = (role: ProgressRole): TaskConfirmation | undefined => {
    return task.confirmations.find(c => c.userRole === role);
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.timeline}>
      {/* Task start */}
      <View style={styles.timelineStep}>
        <View style={styles.timelineStepLine}>
          <View style={[styles.timelineStepDot, styles.timelineStepDotCompleted]}>
            <Ionicons name="flag" size={12} color="#FFF" />
          </View>
          <View style={[styles.timelineStepConnector, styles.timelineStepConnectorCompleted]} />
        </View>
        <View style={styles.timelineStepContent}>
          <Text style={styles.timelineStepTitle}>Bắt đầu công việc</Text>
          <Text style={styles.timelineStepDate}>
            {formatDateTime(task.actualStartDate || task.plannedStartDate)}
          </Text>
        </View>
      </View>

      {/* Progress update */}
      {task.progressPercent > 0 && (
        <View style={styles.timelineStep}>
          <View style={styles.timelineStepLine}>
            <View style={[
              styles.timelineStepDot,
              task.progressPercent === 100 
                ? styles.timelineStepDotCompleted 
                : styles.timelineStepDotActive
            ]}>
              <Ionicons name="trending-up" size={12} color="#FFF" />
            </View>
            <View style={[
              styles.timelineStepConnector,
              task.progressPercent === 100 && styles.timelineStepConnectorCompleted
            ]} />
          </View>
          <View style={styles.timelineStepContent}>
            <Text style={[
              styles.timelineStepTitle,
              task.progressPercent === 100 && styles.timelineStepTitleActive
            ]}>
              Tiến độ: {task.progressPercent}%
            </Text>
            <View style={styles.miniProgressBar}>
              <View 
                style={[styles.miniProgressFill, { width: `${task.progressPercent}%` }]} 
              />
            </View>
          </View>
        </View>
      )}

      {/* Confirmation steps */}
      {showAllSteps && CONFIRMATION_STEPS.map((step, index) => {
        const status = getStepStatus(step.role);
        const confirmation = getConfirmation(step.role);
        
        return (
          <View key={step.role} style={styles.timelineStep}>
            <View style={styles.timelineStepLine}>
              <View style={[
                styles.timelineStepDot,
                status === 'completed' && styles.timelineStepDotCompleted,
                status === 'current' && styles.timelineStepDotActive,
              ]}>
                {status === 'completed' ? (
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                ) : (
                  <Ionicons name={step.icon as any} size={12} color={status === 'current' ? '#FFF' : COLORS.textMuted} />
                )}
              </View>
              {index < CONFIRMATION_STEPS.length - 1 && (
                <View style={[
                  styles.timelineStepConnector,
                  status === 'completed' && styles.timelineStepConnectorCompleted
                ]} />
              )}
            </View>
            <View style={styles.timelineStepContent}>
              <Text style={[
                styles.timelineStepTitle,
                status === 'completed' && styles.timelineStepTitleCompleted,
                status === 'current' && styles.timelineStepTitleActive,
                status === 'pending' && styles.timelineStepTitlePending,
              ]}>
                {step.label}
              </Text>
              {confirmation ? (
                <>
                  <Text style={styles.timelineStepDate}>
                    {confirmation.confirmedAt ? formatDateTime(confirmation.confirmedAt) : ''}
                  </Text>
                  <Text style={styles.timelineStepPerson}>
                    {confirmation.userName}
                  </Text>
                  {confirmation.note && (
                    <Text style={styles.timelineStepNote}>"{confirmation.note}"</Text>
                  )}
                </>
              ) : status === 'current' ? (
                <Text style={styles.timelineStepWaiting}>Đang chờ xác nhận...</Text>
              ) : (
                <Text style={styles.timelineStepPending}>Chưa thực hiện</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ============================================================================
// Confirmation Modal Component
// ============================================================================

interface ConfirmationBadgeProps {
  role: ProgressRole;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  name?: string;
  date?: string;
  note?: string;
  size?: 'small' | 'medium';
}

export function ConfirmationBadge({
  role,
  status,
  name,
  date,
  note,
  size = 'medium',
}: ConfirmationBadgeProps) {
  const roleLabels: Record<ProgressRole, string> = {
    MANAGER: 'Quản lý',
    ENGINEER: 'Kỹ sư',
    CONTRACTOR: 'Nhà thầu',
    CLIENT: 'Khách hàng',
    VIEWER: 'Người xem',
  };

  const statusColors = {
    APPROVED: COLORS.success,
    REJECTED: COLORS.error,
    PENDING: COLORS.warning,
  };

  const statusLabels = {
    APPROVED: 'Đã xác nhận',
    REJECTED: 'Từ chối',
    PENDING: 'Chờ xác nhận',
  };

  return (
    <View style={[
      styles.confirmBadge,
      size === 'small' && styles.confirmBadgeSmall,
    ]}>
      <View style={[styles.confirmBadgeIcon, { backgroundColor: statusColors[status] }]}>
        <Ionicons 
          name={status === 'APPROVED' ? 'checkmark' : status === 'REJECTED' ? 'close' : 'time'} 
          size={size === 'small' ? 10 : 14} 
          color="#FFF" 
        />
      </View>
      <View style={styles.confirmBadgeContent}>
        <Text style={[styles.confirmBadgeRole, size === 'small' && styles.confirmBadgeRoleSmall]}>
          {roleLabels[role]}
        </Text>
        <Text style={[
          styles.confirmBadgeStatus,
          { color: statusColors[status] },
          size === 'small' && styles.confirmBadgeStatusSmall,
        ]}>
          {statusLabels[status]}
        </Text>
        {name && size === 'medium' && (
          <Text style={styles.confirmBadgeName}>{name}</Text>
        )}
        {date && size === 'medium' && (
          <Text style={styles.confirmBadgeDate}>{date}</Text>
        )}
        {note && size === 'medium' && (
          <Text style={styles.confirmBadgeNote}>"{note}"</Text>
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Progress Slider Component
// ============================================================================

interface ProgressSliderProps {
  value: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  showMilestones?: boolean;
}

export function ProgressSlider({
  value,
  onChange,
  disabled = false,
  showMilestones = true,
}: ProgressSliderProps) {
  const milestones = [0, 25, 50, 75, 100];

  const getProgressColor = (percent: number) => {
    if (percent === 100) return COLORS.success;
    if (percent >= 75) return COLORS.info;
    if (percent >= 50) return COLORS.warning;
    return COLORS.primary;
  };

  return (
    <View style={styles.progressSlider}>
      <View style={styles.progressSliderTrack}>
        <View 
          style={[
            styles.progressSliderFill,
            { 
              width: `${value}%`,
              backgroundColor: getProgressColor(value),
            }
          ]} 
        />
        
        {/* Thumb */}
        <View 
          style={[
            styles.progressSliderThumb,
            { 
              left: `${value}%`,
              backgroundColor: getProgressColor(value),
            }
          ]}
        >
          <Text style={styles.progressSliderThumbText}>{value}</Text>
        </View>
      </View>

      {/* Milestones */}
      {showMilestones && (
        <View style={styles.progressSliderMilestones}>
          {milestones.map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.progressSliderMilestone,
                value >= m && styles.progressSliderMilestoneActive,
              ]}
              onPress={() => !disabled && onChange?.(m)}
              disabled={disabled}
            >
              <Text style={[
                styles.progressSliderMilestoneText,
                value >= m && styles.progressSliderMilestoneTextActive,
              ]}>
                {m}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'small' | 'medium' | 'large';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const config = TASK_STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    color: '#9E9E9E',
    bgColor: '#F5F5F5',
    icon: 'ellipse-outline',
    step: 0,
  };
  
  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2 },
    medium: { paddingHorizontal: 10, paddingVertical: 4 },
    large: { paddingHorizontal: 14, paddingVertical: 6 },
  };
  
  const textSizes = {
    small: 10,
    medium: 12,
    large: 14,
  };

  return (
    <View style={[
      styles.statusBadge,
      { backgroundColor: `${config.color}15` },
      sizeStyles[size],
    ]}>
      <Ionicons 
        name={config.icon as any} 
        size={textSizes[size]} 
        color={config.color} 
      />
      <Text style={[
        styles.statusBadgeText,
        { color: config.color, fontSize: textSizes[size] }
      ]}>
        {config.label}
      </Text>
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Task Card
  taskCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  taskStatusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskCardContent: {
    flex: 1,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskCardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  taskCardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  taskCardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  taskCardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  taskCardProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCardProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  taskCardProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskCardProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 36,
    textAlign: 'right',
  },
  taskCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  taskCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskCardMetaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  taskCardConfirmations: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  taskCardConfirmText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  taskCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  taskCardConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  taskCardConfirmBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  taskCardEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  taskCardEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Timeline
  timeline: {
    paddingLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineStepLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineStepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.textMuted,
  },
  timelineStepDotCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  timelineStepDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineStepConnector: {
    width: 2,
    flex: 1,
    minHeight: 20,
    backgroundColor: COLORS.border,
  },
  timelineStepConnectorCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineStepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  timelineStepTitleCompleted: {
    color: COLORS.text,
    fontWeight: '600',
  },
  timelineStepTitleActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  timelineStepTitlePending: {
    color: COLORS.textMuted,
  },
  timelineStepDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timelineStepPerson: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  timelineStepNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timelineStepWaiting: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '500',
  },
  timelineStepPending: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  miniProgressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginTop: 4,
    width: 100,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  // Confirmation Badge
  confirmBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    marginBottom: 8,
  },
  confirmBadgeSmall: {
    padding: 6,
  },
  confirmBadgeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  confirmBadgeContent: {
    flex: 1,
  },
  confirmBadgeRole: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmBadgeRoleSmall: {
    fontSize: 11,
  },
  confirmBadgeStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  confirmBadgeStatusSmall: {
    fontSize: 10,
  },
  confirmBadgeName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  confirmBadgeDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  confirmBadgeNote: {
    fontSize: 11,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  // Progress Slider
  progressSlider: {
    paddingVertical: 10,
  },
  progressSliderTrack: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    position: 'relative',
  },
  progressSliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSliderThumb: {
    position: 'absolute',
    top: -8,
    marginLeft: -16,
    width: 32,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSliderThumbText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  progressSliderMilestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  progressSliderMilestone: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  progressSliderMilestoneActive: {
    backgroundColor: COLORS.primaryLight,
  },
  progressSliderMilestoneText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  progressSliderMilestoneTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
    fontWeight: '600',
  },
});
