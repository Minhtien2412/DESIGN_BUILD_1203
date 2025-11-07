/**
 * Project Quick Actions Menu
 * Bottom sheet with Edit, Share, Archive, Delete actions
 */
import { Ionicons } from '@expo/vector-icons';
import {
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ActionType = 'edit' | 'share' | 'archive' | 'delete';

type QuickAction = {
  type: ActionType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  destructive?: boolean;
};

const ACTIONS: QuickAction[] = [
  { type: 'edit', label: 'Chỉnh sửa', icon: 'create-outline', color: '#2196F3' },
  { type: 'share', label: 'Chia sẻ', icon: 'share-social-outline', color: '#FF9800' },
  { type: 'archive', label: 'Lưu trữ', icon: 'archive-outline', color: '#9E9E9E' },
  { type: 'delete', label: 'Xóa dự án', icon: 'trash-outline', color: '#F44336', destructive: true },
];

type ProjectQuickActionsProps = {
  visible: boolean;
  projectName: string;
  onClose: () => void;
  onAction: (action: ActionType) => void;
};

export default function ProjectQuickActions({
  visible,
  projectName,
  onClose,
  onAction,
}: ProjectQuickActionsProps) {
  const handleAction = (action: ActionType) => {
    if (action === 'delete') {
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc muốn xóa dự án "${projectName}"? Hành động này không thể hoàn tác.`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: () => {
              onClose();
              setTimeout(() => onAction(action), 300);
            },
          },
        ]
      );
    } else if (action === 'archive') {
      Alert.alert(
        'Lưu trữ dự án',
        `Lưu trữ dự án "${projectName}"? Bạn có thể khôi phục sau.`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Lưu trữ',
            onPress: () => {
              onClose();
              setTimeout(() => onAction(action), 300);
            },
          },
        ]
      );
    } else {
      onClose();
      setTimeout(() => onAction(action), 300);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.projectName} numberOfLines={1}>
                {projectName}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {ACTIONS.map((action, index) => (
                <TouchableOpacity
                  key={action.type}
                  style={[
                    styles.actionItem,
                    index < ACTIONS.length - 1 && styles.actionItemBorder,
                  ]}
                  onPress={() => handleAction(action.type)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: `${action.color}15` }]}>
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text
                    style={[
                      styles.actionLabel,
                      action.destructive && styles.actionLabelDestructive,
                    ]}
                  >
                    {action.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  projectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginRight: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    paddingTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  actionLabelDestructive: {
    color: '#F44336',
  },
});
