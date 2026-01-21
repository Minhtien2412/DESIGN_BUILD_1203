/**
 * Checklist Item Component
 * Item cho QC checklists
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ChecklistItemProps {
  title: string;
  description?: string;
  status: 'pending' | 'passed' | 'failed' | 'na';
  onStatusChange?: (status: 'pending' | 'passed' | 'failed' | 'na') => void;
  onPress?: () => void;
  notes?: string;
  photos?: number;
  style?: ViewStyle;
}

const STATUS_CONFIG = {
  pending: {
    icon: 'time-outline' as const,
    color: '#0066CC',
    bg: '#fef3c7',
    label: 'Chờ',
  },
  passed: {
    icon: 'checkmark-circle' as const,
    color: '#0066CC',
    bg: '#dcfce7',
    label: 'Đạt',
  },
  failed: {
    icon: 'close-circle' as const,
    color: '#000000',
    bg: '#fee2e2',
    label: 'Không đạt',
  },
  na: {
    icon: 'remove-circle-outline' as const,
    color: '#6b7280',
    bg: '#f3f4f6',
    label: 'N/A',
  },
};

export default function ChecklistItem({
  title,
  description,
  status,
  onStatusChange,
  onPress,
  notes,
  photos,
  style,
}: ChecklistItemProps) {
  const config = STATUS_CONFIG[status];
  const Content = onPress ? TouchableOpacity : View;

  const statuses: ('passed' | 'failed' | 'na' | 'pending')[] = ['passed', 'failed', 'na', 'pending'];

  return (
    <View style={[styles.container, style]}>
      <Content
        style={styles.content}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.main}>
          <View style={[styles.statusIcon, { backgroundColor: config.bg }]}>
            <Ionicons name={config.icon} size={20} color={config.color} />
          </View>

          <View style={styles.info}>
            <Text style={styles.title}>{title}</Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}

            {(notes || photos) && (
              <View style={styles.meta}>
                {notes && (
                  <View style={styles.metaItem}>
                    <Ionicons name="document-text-outline" size={12} color="#6b7280" />
                    <Text style={styles.metaText}>Ghi chú</Text>
                  </View>
                )}
                {photos && photos > 0 && (
                  <View style={styles.metaItem}>
                    <Ionicons name="images-outline" size={12} color="#6b7280" />
                    <Text style={styles.metaText}>{photos} ảnh</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {onStatusChange && (
          <View style={styles.statusButtons}>
            {statuses.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const isActive = s === status;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusButton,
                    isActive && { backgroundColor: cfg.bg },
                  ]}
                  onPress={() => onStatusChange(s)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={cfg.icon}
                    size={18}
                    color={isActive ? cfg.color : '#d1d5db'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Content>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 12,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
