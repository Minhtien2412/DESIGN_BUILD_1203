import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ChecklistItem, { ChecklistItemData } from './ChecklistItem';
import ChecklistProgress from './ChecklistProgress';

interface ChecklistFormProps {
  title: string;
  description?: string;
  items: ChecklistItemData[];
  onSubmit: (items: ChecklistItemData[]) => void;
  onSaveDraft?: (items: ChecklistItemData[]) => void;
  submitLabel?: string;
  draftLabel?: string;
  color?: string;
}

export default function ChecklistForm({
  title,
  description,
  items: initialItems,
  onSubmit,
  onSaveDraft,
  submitLabel = 'Gửi duyệt',
  draftLabel = 'Lưu nháp',
  color = '#0066CC',
}: ChecklistFormProps) {
  const [items, setItems] = useState<ChecklistItemData[]>(initialItems);

  const handleItemChange = (id: string, updates: Partial<ChecklistItemData>) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const getCompletedCount = () => {
    return items.filter((item) => item.result !== null).length;
  };

  const getPassCount = () => {
    return items.filter((item) => item.result === 'PASS').length;
  };

  const getFailCount = () => {
    return items.filter((item) => item.result === 'FAIL').length;
  };

  const validateForm = (): boolean => {
    const incompleteItems = items.filter((item) => item.result === null);
    if (incompleteItems.length > 0) {
      Alert.alert(
        'Chưa hoàn thành',
        `Còn ${incompleteItems.length} mục chưa kiểm tra. Vui lòng hoàn thành tất cả các mục trước khi gửi duyệt.`,
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    Alert.alert(
      'Xác nhận gửi duyệt',
      'Bạn có chắc chắn muốn gửi checklist này để phê duyệt?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gửi',
          onPress: () => onSubmit(items),
        },
      ]
    );
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(items);
      Alert.alert('Đã lưu', 'Checklist đã được lưu dưới dạng nháp', [{ text: 'OK' }]);
    }
  };

  const completedCount = getCompletedCount();
  const passCount = getPassCount();
  const failCount = getFailCount();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedCount}/{items.length}</Text>
              <Text style={styles.statLabel}>Đã kiểm tra</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#0066CC' }]}>{passCount}</Text>
              <Text style={styles.statLabel}>Đạt</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#1A1A1A' }]}>{failCount}</Text>
              <Text style={styles.statLabel}>Không đạt</Text>
            </View>
          </View>
          <ChecklistProgress
            completed={completedCount}
            total={items.length}
            color={color}
            showPercentage
            showLabel
          />
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          {items.map((item, index) => (
            <ChecklistItem
              key={item.id}
              item={item}
              index={index}
              onChange={handleItemChange}
              required
            />
          ))}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {onSaveDraft && (
          <TouchableOpacity
            style={[styles.button, styles.draftButton]}
            onPress={handleSaveDraft}
          >
            <Ionicons name="save-outline" size={20} color="#666" />
            <Text style={styles.draftButtonText}>{draftLabel}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.submitButton, { backgroundColor: color }]}
          onPress={handleSubmit}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>{submitLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  itemsSection: {
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
  },
  draftButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
