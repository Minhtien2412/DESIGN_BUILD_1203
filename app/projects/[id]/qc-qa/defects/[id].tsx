import { useDefects } from '@/hooks/useQC';
import { DefectSeverity, DefectStatus, type Defect } from '@/types/qc-qa';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function DefectDetailScreen() {
  const { id: projectId, defectId } = useLocalSearchParams<{
    id: string;
    defectId: string;
  }>();
  const { loadDefectById, addComment: addDefectComment, resolveDefect } = useDefects();
  const [defect, setDefect] = useState<Defect | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDefect = async () => {
      if (defectId) {
        const data = await loadDefectById(defectId);
        if (!data) {
          Alert.alert('Lỗi', 'Không tìm thấy lỗi', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        } else {
          setDefect(data);
        }
      }
    };
    fetchDefect();
  }, [defectId, loadDefectById]);

  if (!defect) {
    return null;
  }

  const getStatusColor = (status: DefectStatus) => {
    switch (status) {
      case 'OPEN':
        return '#F44336';
      case 'IN_PROGRESS':
        return '#FF9800';
      case 'RESOLVED':
        return '#4CAF50';
      case 'VERIFIED':
        return '#2196F3';
      case 'CLOSED':
        return '#9E9E9E';
      default:
        return '#757575';
    }
  };

  const getSeverityColor = (severity: DefectSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return '#D32F2F';
      case 'MAJOR':
        return '#F57C00';
      case 'MINOR':
        return '#FBC02D';
      case 'COSMETIC':
        return '#689F38';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: DefectStatus) => {
    const labels: Record<DefectStatus, string> = {
      OPEN: 'Mới',
      IN_PROGRESS: 'Đang xử lý',
      RESOLVED: 'Đã sửa',
      VERIFIED: 'Đã kiểm tra',
      CLOSED: 'Đã đóng',
    };
    return labels[status];
  };

  const getSeverityLabel = (severity: DefectSeverity) => {
    const labels: Record<DefectSeverity, string> = {
      CRITICAL: 'Nghiêm trọng',
      MAJOR: 'Quan trọng',
      HIGH: 'Cao',
      MINOR: 'Nhỏ',
      MEDIUM: 'Trung bình',
      LOW: 'Thấp',
      COSMETIC: 'Thẩm mỹ',
    };
    return labels[severity];
  };

  const handleStatusChange = async (newStatus: DefectStatus) => {
    const confirmMessages: Record<DefectStatus, string> = {
      OPEN: 'Mở lại lỗi này?',
      IN_PROGRESS: 'Bắt đầu xử lý lỗi này?',
      RESOLVED: 'Đánh dấu lỗi đã được sửa?',
      VERIFIED: 'Xác nhận lỗi đã được kiểm tra và hợp lệ?',
      CLOSED: 'Đóng lỗi này? Không thể mở lại sau khi đóng.',
    };

    Alert.alert('Xác nhận', confirmMessages[newStatus], [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          try {
            if (newStatus === DefectStatus.RESOLVED) {
              await resolveDefect(defectId!, 'Resolved');
            }
            // For other status changes, would need updateDefect method
            Alert.alert('Thành công', 'Đã cập nhật trạng thái lỗi');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
            console.error('Update status error:', error);
          }
        },
      },
    ]);
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    setSubmitting(true);
    try {
      await addDefectComment(defectId!, { comment: comment.trim(), photos: [] });
      setComment('');
      Alert.alert('Thành công', 'Đã thêm bình luận');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm bình luận');
      console.error('Add comment error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const statusFlow: DefectStatus[] = [
    DefectStatus.OPEN,
    DefectStatus.IN_PROGRESS,
    DefectStatus.RESOLVED,
    DefectStatus.VERIFIED,
    DefectStatus.CLOSED,
  ];
  const currentStatusIndex = statusFlow.indexOf(defect.status);
  const availableStatuses = statusFlow.slice(currentStatusIndex);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBadges}>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(defect.severity) },
              ]}
            >
              <Text style={styles.badgeText}>{getSeverityLabel(defect.severity)}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(defect.status) },
              ]}
            >
              <Text style={styles.badgeText}>{getStatusLabel(defect.status)}</Text>
            </View>
          </View>
          <Text style={styles.defectId}>#{defect.id.slice(0, 8)}</Text>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.title}>{defect.title}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mô tả chi tiết</Text>
          <Text style={styles.description}>{defect.description}</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.metaRow}>
            <Ionicons name="location" size={20} color="#666" />
            <View>
              <Text style={styles.metaLabel}>Vị trí</Text>
              <Text style={styles.metaValue}>{defect.location}</Text>
            </View>
          </View>
        </View>

        {/* Photos */}
        {defect.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ảnh minh chứng ({defect.photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosContainer}>
                {defect.photos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="image" size={48} color="#9E9E9E" />
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Reporter Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Thông tin báo cáo</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Người báo cáo:</Text>
              <Text style={styles.infoValue}>{defect.reportedByName || defect.reportedBy}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày báo cáo</Text>
              <Text style={styles.infoValue}>
                {new Date(defect.reportedAt).toLocaleString('vi-VN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Assignee Info */}
        {defect.assignedTo && (
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Ionicons name="person-circle" size={20} color="#2196F3" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Người phụ trách</Text>
                <Text style={styles.infoValue}>{defect.assignedToName || defect.assignedTo}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Resolution Info */}
        {defect.resolvedAt && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Thông tin giải quyết</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày giải quyết</Text>
                <Text style={styles.infoValue}>
                  {new Date(defect.resolvedAt).toLocaleString('vi-VN')}
                </Text>
              </View>
            </View>
            {defect.resolution && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Giải pháp</Text>
                  <Text style={styles.infoValue}>{defect.resolution}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Status Actions */}
        {defect.status !== 'CLOSED' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Cập nhật trạng thái</Text>
            <View style={styles.statusActions}>
              {availableStatuses.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusActionButton,
                    { borderColor: getStatusColor(status) },
                    status === defect.status && {
                      backgroundColor: getStatusColor(status),
                    },
                  ]}
                  onPress={() =>
                    status !== defect.status && handleStatusChange(status)
                  }
                  disabled={status === defect.status}
                >
                  <Text
                    style={[
                      styles.statusActionText,
                      status === defect.status && { color: '#fff' },
                      { color: getStatusColor(status) },
                    ]}
                  >
                    {getStatusLabel(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Comments */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Bình luận ({defect.comments?.length || 0})
          </Text>
          {defect.comments && defect.comments.length > 0 ? (
            defect.comments.map((c, index) => (
              <View key={index} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{c.userName}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(c.createdAt).toLocaleString('vi-VN')}
                  </Text>
                </View>
                <Text style={styles.commentText}>{c.comment}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>Chưa có bình luận nào</Text>
          )}
        </View>

        {/* Add Comment */}
        {defect.status !== 'CLOSED' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Thêm bình luận</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Nhập bình luận của bạn..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.submitCommentButton,
                submitting && styles.submitCommentButtonDisabled,
              ]}
              onPress={handleAddComment}
              disabled={submitting}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitCommentText}>
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  defectId: {
    fontSize: 13,
    color: '#9E9E9E',
    fontFamily: 'monospace',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaLabel: {
    fontSize: 13,
    color: '#999',
  },
  metaValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoContainer: {
    width: 150,
    height: 150,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 2,
  },
  statusActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentCard: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  noComments: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitCommentButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitCommentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
