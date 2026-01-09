import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Task } from '../../services/api/constructionMapApi';

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onPress?: () => void;
  onUpdate?: (task: Partial<Task>) => void;
  onDelete?: () => void;
  compact?: boolean;
}

/**
 * Task Card Component
 * Displays task information with status, progress, and actions
 */
export default function TaskCard({
  task,
  isSelected = false,
  onPress,
  onUpdate,
  onDelete,
  compact = false,
}: TaskCardProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '#0066CC';
      case 'in-progress':
        return '#0066CC';
      case 'pending':
        return '#0066CC';
      case 'blocked':
        return '#000000';
      default:
        return '#999999';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🔄';
      case 'pending':
        return '⏳';
      case 'blocked':
        return '🚫';
      default:
        return '📝';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
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
          <Text style={styles.statusIcon}>{getStatusIcon(task.status)}</Text>
          <Text style={styles.compactTitle} numberOfLines={1}>
            {task.label}
          </Text>
        </View>
        {task.priority && (
          <Text style={styles.priorityIcon}>{getPriorityIcon(task.priority)}</Text>
        )}
      </View>
      {task.progress !== undefined && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${task.progress}%`, backgroundColor: getStatusColor(task.status) },
            ]}
          />
        </View>
      )}
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
          <Text style={styles.statusIcon}>{getStatusIcon(task.status)}</Text>
          <Text style={styles.title}>{task.label}</Text>
          {task.priority && (
            <Text style={styles.priorityIcon}>{getPriorityIcon(task.priority)}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{task.status}</Text>
        </View>
      </View>

      {/* Description */}
      {task.description && (
        <Text style={styles.description} numberOfLines={2}>
          {task.description}
        </Text>
      )}

      {/* Progress Bar */}
      {task.progress !== undefined && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressPercent}>{task.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${task.progress}%`, backgroundColor: getStatusColor(task.status) },
              ]}
            />
          </View>
        </View>
      )}

      {/* Metadata */}
      <View style={styles.metadata}>
        {task.startDate && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Start:</Text>
            <Text style={styles.metaValue}>{formatDate(task.startDate)}</Text>
          </View>
        )}
        {task.endDate && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>End:</Text>
            <Text style={styles.metaValue}>{formatDate(task.endDate)}</Text>
          </View>
        )}
        {task.assignedTo && (
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>👤</Text>
            <Text style={styles.metaValue}>{task.assignedTo}</Text>
          </View>
        )}
      </View>

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
    borderColor: '#0066CC',
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
  priorityIcon: {
    fontSize: 14,
    marginLeft: 6,
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
  dependencies: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dependencyLabel: {
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
    backgroundColor: '#E8F4FF',
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
});
