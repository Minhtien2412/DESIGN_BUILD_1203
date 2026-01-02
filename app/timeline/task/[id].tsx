/**
 * Timeline - Task Detail
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_TASK = {
  id: '1',
  title: 'Thiết kế kiến trúc',
  description: 'Hoàn thành bản vẽ thiết kế kiến trúc chi tiết',
  status: 'in_progress',
  progress: 75,
  startDate: '2024-01-01',
  endDate: '2024-01-15',
  assignee: 'KTS. Nguyễn Văn A',
  phase: 'Giai đoạn 1: Thiết kế',
  dependencies: ['Khảo sát hiện trạng', 'Lập hồ sơ yêu cầu'],
  isCritical: true,
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task] = useState(MOCK_TASK);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết công việc</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Card */}
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            {task.isCritical && (
              <View style={styles.criticalBadge}>
                <Text style={styles.criticalText}>Critical Path</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.taskDesc}>{task.description}</Text>
          
          <View style={styles.phaseTag}>
            <Ionicons name="folder-outline" size={14} color="#666" />
            <Text style={styles.phaseText}>{task.phase}</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ</Text>
              <Text style={styles.progressValue}>{task.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${task.progress}%`, backgroundColor: getStatusColor(task.status) }]} />
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Người phụ trách</Text>
            <Text style={styles.infoValue}>{task.assignee}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Bắt đầu</Text>
            <Text style={styles.infoValue}>{task.startDate}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="flag-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Kết thúc</Text>
            <Text style={styles.infoValue}>{task.endDate}</Text>
          </View>
        </View>

        {/* Dependencies */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Công việc phụ thuộc</Text>
          {task.dependencies.map((dep, index) => (
            <View key={index} style={styles.depItem}>
              <Ionicons name="git-branch-outline" size={16} color="#666" />
              <Text style={styles.depText}>{dep}</Text>
              <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            </View>
          ))}
        </View>

        {/* Update Progress */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cập nhật tiến độ</Text>
          <View style={styles.progressButtons}>
            {[25, 50, 75, 100].map((value) => (
              <TouchableOpacity 
                key={value} 
                style={[styles.progressBtn, task.progress === value && styles.progressBtnActive]}
              >
                <Text style={[styles.progressBtnText, task.progress === value && styles.progressBtnTextActive]}>
                  {value}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.noteInput}
            placeholder="Ghi chú cập nhật..."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="create-outline" size={20} color="#EE4D2D" />
          <Text style={styles.actionBtnText}>Chỉnh sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={[styles.actionBtnText, { color: '#fff' }]}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  moreBtn: { padding: 4 },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  taskTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#000' },
  criticalBadge: { 
    backgroundColor: '#fef2f2', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  criticalText: { fontSize: 10, fontWeight: '700', color: '#ef4444' },
  taskDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  phaseTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 16,
  },
  phaseText: { fontSize: 12, color: '#666' },
  progressSection: {},
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#666' },
  progressValue: { fontSize: 16, fontWeight: '700', color: '#000' },
  progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoLabel: { fontSize: 14, color: '#666', marginLeft: 10, flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#000' },
  depItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  depText: { flex: 1, fontSize: 14, color: '#333' },
  progressButtons: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  progressBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  progressBtnActive: { backgroundColor: '#EE4D2D', borderColor: '#EE4D2D' },
  progressBtnText: { fontSize: 14, fontWeight: '600', color: '#666' },
  progressBtnTextActive: { color: '#fff' },
  noteInput: { 
    backgroundColor: '#f5f5f5', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 14, 
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bottomBar: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderTopColor: '#eee', 
    gap: 12 
  },
  actionBtn: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 14, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#EE4D2D', 
    gap: 6 
  },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#EE4D2D' },
  primaryBtn: { backgroundColor: '#EE4D2D', borderColor: '#EE4D2D' },
});
