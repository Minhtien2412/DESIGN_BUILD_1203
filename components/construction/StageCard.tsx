import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stage } from '../../services/api/constructionMapApi';

interface StageCardProps {
  stage: Stage;
  taskCount?: number;
  completedTasks?: number;
  isSelected?: boolean;
  onPress?: () => void;
  onUpdate?: (stage: Partial<Stage>) => void;
  onDelete?: () => void;
  compact?: boolean;
}

/**
 * Stage Card Component
 * Displays stage information with task count, progress, and actions
 */
export default function StageCard({
  stage,
  taskCount = 0,
  completedTasks = 0,
  isSelected = false,
  onPress,
  onUpdate,
  onDelete,
  compact = false,
}: StageCardProps) {
  const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;
  const isCompleted = stage.status === 'completed';
  const isActive = stage.status === 'active';

  const getStatusColor = () => {
    if (isCompleted) return '#4CAF50';
    if (isActive) return '#2196F3';
    return '#9E9E9E';
  };

  const getStatusIcon = () => {
    if (isCompleted) return '✅';
    if (isActive) return '🔄';
    return '⏸️';
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
  };

  const renderCompactCard = () => (
    <TouchableOpacity
      style={[styles.compactCard, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.compactHeader}>
        <View style={styles.compactStatus}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {stage.label}
          </Text>
        </View>
        <Text style={styles.taskBadge}>{taskCount}</Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: getStatusColor() },
          ]}
        />
      </View>
    </TouchableOpacity>
  );

  const renderFullCard = () => (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={styles.title}>{stage.label}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{stage.status}</Text>
        </View>
      </View>

      {/* Description */}
      {stage.description && (
        <Text style={styles.description} numberOfLines={2}>
          {stage.description}
        </Text>
      )}

      {/* Task Summary */}
      <View style={styles.taskSummary}>
        <View style={styles.taskStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{taskCount}</Text>
            <Text style={styles.statLabel}>Total Tasks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#2196F3' }]}>
              {taskCount - completedTasks}
            </Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Stage Progress</Text>
          <Text style={styles.progressPercent}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: getStatusColor() },
            ]}
          />
        </View>
      </View>

      {/* Metadata */}
      <View style={styles.metadata}>
        {stage.order !== undefined && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Order:</Text>
            <Text style={styles.metaValue}>#{stage.order}</Text>
          </View>
        )}
      </View>

      {/* Color Indicator */}
      {stage.color && (
        <View style={styles.colorSection}>
          <View style={[styles.colorSwatch, { backgroundColor: stage.color }]} />
          <Text style={styles.colorLabel}>Stage Color</Text>
        </View>
      )}

      {/* Actions */}
      {(onUpdate || onDelete) && (
        <View style={styles.actions}>
          {onUpdate && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onUpdate({})}
            >
              <Text style={styles.actionText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <Text style={styles.actionText}>🗑️ Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return compact ? renderCompactCard() : renderFullCard();
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginVertical: 3,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  taskSummary: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
  },
  taskStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  progressSection: {
    marginVertical: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginVertical: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: '#999',
    marginRight: 4,
  },
  metaValue: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  colorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  colorLabel: {
    fontSize: 11,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  compactStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  taskBadge: {
    backgroundColor: '#2196F3',
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    minWidth: 24,
    textAlign: 'center',
  },
});
