/**
 * Construction Progress - Task Detail
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
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
  title: 'Đổ móng nhà',
  description: 'Tiến hành đổ bê tông móng theo thiết kế đã phê duyệt',
  status: 'in_progress',
  progress: 65,
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  assignee: 'Nguyễn Văn A',
  priority: 'high',
  comments: [
    { id: '1', author: 'Trần B', text: 'Đã hoàn thành 50%', time: '2 giờ trước' },
    { id: '2', author: 'Lê C', text: 'Cần thêm xi măng', time: '1 giờ trước' },
  ],
  photos: [
    'https://picsum.photos/200/150?random=1',
    'https://picsum.photos/200/150?random=2',
  ],
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [task] = useState(MOCK_TASK);
  const [newComment, setNewComment] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#0066CC';
      case 'in_progress': return '#0066CC';
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
        {/* Task Info */}
        <View style={styles.card}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskDesc}>{task.description}</Text>

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(task.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                {getStatusText(task.status)}
              </Text>
            </View>
            <Text style={styles.progressText}>{task.progress}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
          </View>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={18} color="#666" />
            <Text style={styles.infoLabel}>Người thực hiện:</Text>
            <Text style={styles.infoValue}>{task.assignee}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color="#666" />
            <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
            <Text style={styles.infoValue}>{task.startDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
            <Text style={styles.infoValue}>{task.endDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="flag" size={18} color="#666" />
            <Text style={styles.infoLabel}>Độ ưu tiên:</Text>
            <Text style={[styles.infoValue, { color: task.priority === 'high' ? '#000000' : '#666' }]}>
              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
            </Text>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hình ảnh</Text>
            <TouchableOpacity style={styles.addPhotoBtn}>
              <Ionicons name="camera" size={16} color="#0066CC" />
              <Text style={styles.addPhotoText}>Thêm ảnh</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {task.photos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.photo} />
            ))}
          </ScrollView>
        </View>

        {/* Comments */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bình luận ({task.comments.length})</Text>
          {task.comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{comment.author[0]}</Text>
              </View>
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentTime}>{comment.time}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}

          {/* Add comment */}
          <View style={styles.addCommentRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Thêm bình luận..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity style={styles.sendBtn}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="create-outline" size={20} color="#0066CC" />
          <Text style={styles.actionBtnText}>Chỉnh sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={[styles.actionBtnText, { color: '#fff' }]}>Cập nhật tiến độ</Text>
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
  taskTitle: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 8 },
  taskDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  progressText: { fontSize: 16, fontWeight: '700', color: '#000' },
  progressBar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0066CC', borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  infoLabel: { fontSize: 14, color: '#666', marginLeft: 8, marginRight: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#000' },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addPhotoText: { fontSize: 13, color: '#0066CC', fontWeight: '600' },
  photo: { width: 120, height: 90, borderRadius: 12, marginRight: 8 },
  commentItem: { flexDirection: 'row', marginBottom: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0066CC', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  commentAvatarText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  commentContent: { flex: 1 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: '#000' },
  commentTime: { fontSize: 11, color: '#999' },
  commentText: { fontSize: 13, color: '#333', lineHeight: 18 },
  addCommentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  commentInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0066CC', alignItems: 'center', justifyContent: 'center' },
  bottomActions: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#0066CC', gap: 6 },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#0066CC' },
  primaryBtn: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
});
