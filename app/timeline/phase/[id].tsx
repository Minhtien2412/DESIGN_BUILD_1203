/**
 * Timeline - Phase Detail
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MOCK_PHASE = {
  id: '1',
  name: 'Giai đoạn 1: Thiết kế',
  description: 'Hoàn thành toàn bộ hồ sơ thiết kế',
  startDate: '2024-01-01',
  endDate: '2024-02-15',
  progress: 65,
  status: 'in_progress',
  tasks: [
    { id: '1', title: 'Thiết kế kiến trúc', progress: 100, status: 'completed' },
    { id: '2', title: 'Thiết kế kết cấu', progress: 80, status: 'in_progress' },
    { id: '3', title: 'Thiết kế MEP', progress: 50, status: 'in_progress' },
    { id: '4', title: 'Dự toán chi phí', progress: 20, status: 'pending' },
  ],
};

export default function PhaseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [phase] = useState(MOCK_PHASE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in_progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in_progress': return 'Đang thực hiện';
      case 'pending': return 'Chờ xử lý';
      default: return status;
    }
  };

  const renderTask = ({ item, index }: { item: typeof MOCK_PHASE.tasks[0]; index: number }) => (
    <TouchableOpacity 
      style={styles.taskCard}
      onPress={() => router.push(`/timeline/task/${item.id}` as any)}
    >
      <View style={styles.taskLeft}>
        <View style={[styles.taskDot, { backgroundColor: getStatusColor(item.status) }]} />
        <View>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskStatus}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.taskRight}>
        <Text style={styles.taskProgress}>{item.progress}%</Text>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết giai đoạn</Text>
        <TouchableOpacity style={styles.moreBtn}>
          <Ionicons name="create-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Phase Info */}
        <View style={styles.card}>
          <Text style={styles.phaseName}>{phase.name}</Text>
          <Text style={styles.phaseDesc}>{phase.description}</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.dateLabel}>Bắt đầu</Text>
              <Text style={styles.dateValue}>{phase.startDate}</Text>
            </View>
            <View style={styles.dateItem}>
              <Ionicons name="flag-outline" size={16} color="#666" />
              <Text style={styles.dateLabel}>Kết thúc</Text>
              <Text style={styles.dateValue}>{phase.endDate}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Tiến độ tổng thể</Text>
              <Text style={styles.progressValue}>{phase.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${phase.progress}%` }]} />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{phase.tasks.filter(t => t.status === 'completed').length}</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#f59e0b' }]}>{phase.tasks.filter(t => t.status === 'in_progress').length}</Text>
            <Text style={styles.statLabel}>Đang làm</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#6b7280' }]}>{phase.tasks.filter(t => t.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Chờ xử lý</Text>
          </View>
        </View>

        {/* Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Công việc ({phase.tasks.length})</Text>
            <TouchableOpacity>
              <Ionicons name="add-circle" size={24} color="#EE4D2D" />
            </TouchableOpacity>
          </View>
          
          {phase.tasks.map((task, index) => (
            <View key={task.id}>
              {renderTask({ item: task, index })}
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  phaseName: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  phaseDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },
  dateRow: { flexDirection: 'row', marginBottom: 16 },
  dateItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateLabel: { fontSize: 12, color: '#999' },
  dateValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  progressSection: {},
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#666' },
  progressValue: { fontSize: 18, fontWeight: '700', color: '#000' },
  progressBar: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#EE4D2D', borderRadius: 5 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#22c55e' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  taskDot: { width: 10, height: 10, borderRadius: 5 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: '#000' },
  taskStatus: { fontSize: 12, color: '#666', marginTop: 2 },
  taskRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskProgress: { fontSize: 14, fontWeight: '700', color: '#333' },
});
