/**
 * Admin Moderation Screen
 * Review and approve/reject pending content
 */

import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    approveContent,
    getModerationStats,
    getPendingSubmissions,
    rejectContent
} from '@/services/moderation.service';
import { ApprovalStatus, ContentSubmission, ContentType } from '@/types/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ModerationScreen() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ApprovalStatus | 'all'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    aiApproved: 0,
    needsReview: 0,
  });

  const primary = useThemeColor({}, 'primary');
  const background = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Check permission
  useEffect(() => {
    if (!user || !user.role || (user.role !== 'admin' && user.role !== 'manager')) {
      Alert.alert('Không có quyền', 'Bạn không có quyền truy cập trang này');
      router.back();
    }
  }, [user]);

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [submissionsData, statsData] = await Promise.all([
        getPendingSubmissions({
          status: selectedFilter === 'all' ? undefined : [selectedFilter],
        }),
        getModerationStats(),
      ]);
      
      setSubmissions(submissionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Load moderation data failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [selectedFilter]);

  const handleApprove = async (submission: ContentSubmission) => {
    if (!user) return;
    
    try {
      await approveContent(submission.id, user as any, reviewNotes);
      Alert.alert('Thành công', 'Đã phê duyệt nội dung');
      setShowReviewModal(false);
      setReviewNotes('');
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phê duyệt nội dung');
    }
  };

  const handleReject = async (submission: ContentSubmission) => {
    if (!user) return;
    
    if (!reviewNotes.trim()) {
      Alert.alert('Lý do từ chối', 'Vui lòng nhập lý do từ chối');
      return;
    }
    
    try {
      await rejectContent(submission.id, user as any, reviewNotes);
      Alert.alert('Thành công', 'Đã từ chối nội dung');
      setShowReviewModal(false);
      setReviewNotes('');
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể từ chối nội dung');
    }
  };

  const openReviewModal = (submission: ContentSubmission) => {
    setSelectedSubmission(submission);
    setShowReviewModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Kiểm duyệt nội dung</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <StatCard
          label="Tổng"
          value={stats.total}
          color="#64748b"
          active={selectedFilter === 'all'}
          onPress={() => setSelectedFilter('all')}
        />
        <StatCard
          label="Chờ duyệt"
          value={stats.pending}
          color="#0066CC"
          active={selectedFilter === ApprovalStatus.PENDING}
          onPress={() => setSelectedFilter(ApprovalStatus.PENDING)}
        />
        <StatCard
          label="AI đã duyệt"
          value={stats.aiApproved}
          color="#0066CC"
          active={selectedFilter === ApprovalStatus.AI_APPROVED}
          onPress={() => setSelectedFilter(ApprovalStatus.AI_APPROVED)}
        />
        <StatCard
          label="Cần xem xét"
          value={stats.needsReview}
          color="#000000"
          active={selectedFilter === ApprovalStatus.NEEDS_ADMIN_REVIEW}
          onPress={() => setSelectedFilter(ApprovalStatus.NEEDS_ADMIN_REVIEW)}
        />
      </ScrollView>

      {/* Submissions List */}
      <FlatList
        data={submissions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <SubmissionCard 
            submission={item} 
            onPress={() => openReviewModal(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có nội dung cần duyệt</Text>
          </View>
        }
      />

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        {selectedSubmission && (
          <ReviewModal
            submission={selectedSubmission}
            notes={reviewNotes}
            onNotesChange={setReviewNotes}
            onApprove={() => handleApprove(selectedSubmission)}
            onReject={() => handleReject(selectedSubmission)}
            onClose={() => {
              setShowReviewModal(false);
              setReviewNotes('');
            }}
          />
        )}
      </Modal>
    </View>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({ 
  label, 
  value, 
  color, 
  active, 
  onPress 
}: { 
  label: string; 
  value: number; 
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={[styles.statCard, active && { borderColor: color, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// SUBMISSION CARD
// ============================================================================

function SubmissionCard({ 
  submission, 
  onPress 
}: { 
  submission: ContentSubmission;
  onPress: () => void;
}) {
  const getStatusColor = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.AI_APPROVED:
        return '#0066CC';
      case ApprovalStatus.NEEDS_ADMIN_REVIEW:
        return '#000000';
      case ApprovalStatus.PENDING:
        return '#0066CC';
      default:
        return '#64748b';
    }
  };

  const getStatusLabel = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.AI_APPROVED:
        return 'AI đã duyệt';
      case ApprovalStatus.NEEDS_ADMIN_REVIEW:
        return 'Cần xem xét';
      case ApprovalStatus.PENDING:
        return 'Chờ duyệt';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: ContentType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case ContentType.POST:
        return 'newspaper';
      case ContentType.PRODUCT:
        return 'cube';
      case ContentType.NEWS:
        return 'megaphone';
      case ContentType.TEMPLATE:
        return 'copy';
      default:
        return 'document';
    }
  };

  return (
    <TouchableOpacity style={styles.submissionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name={getTypeIcon(submission.type)} size={20} color="#64748b" />
          <Text style={styles.cardType}>{submission.type}</Text>
        </View>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(submission.status) + '20' }
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(submission.status) }]}>
            {getStatusLabel(submission.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.cardTitle} numberOfLines={2}>{submission.title}</Text>
      <Text style={styles.cardContent} numberOfLines={3}>{submission.content}</Text>

      {submission.images && submission.images.length > 0 && (
        <View style={styles.imagePreview}>
          {submission.images.slice(0, 3).map((img, idx) => (
            <View key={idx} style={styles.imagePlaceholder}>
              <Ionicons name="image" size={16} color="#999" />
            </View>
          ))}
        </View>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.authorInfo}>
          <Ionicons name="person-circle" size={16} color="#999" />
          <Text style={styles.authorName}>{submission.createdBy.name}</Text>
        </View>
        {submission.aiScore !== undefined && (
          <View style={styles.aiScore}>
            <Ionicons name="sparkles" size={14} color="#666666" />
            <Text style={styles.aiScoreText}>{submission.aiScore}/100</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// REVIEW MODAL
// ============================================================================

function ReviewModal({
  submission,
  notes,
  onNotesChange,
  onApprove,
  onReject,
  onClose,
}: {
  submission: ContentSubmission;
  notes: string;
  onNotesChange: (text: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Chi tiết nội dung</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modalContent}>
        {/* Content Details */}
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Tiêu đề</Text>
          <Text style={styles.modalText}>{submission.title}</Text>
        </View>

        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Nội dung</Text>
          <Text style={styles.modalText}>{submission.content}</Text>
        </View>

        {/* AI Review */}
        {submission.aiScore !== undefined && (
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Đánh giá AI</Text>
            <View style={styles.aiReview}>
              <View style={styles.aiScoreLarge}>
                <Text style={styles.aiScoreLargeText}>{submission.aiScore}</Text>
                <Text style={styles.aiScoreLargeLabel}>/100</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiRecommendation}>
                  {submission.aiRecommendation === 'approve' ? '✅ Đề xuất duyệt' : 
                   submission.aiRecommendation === 'reject' ? '❌ Đề xuất từ chối' :
                   '⚠️ Cần xem xét'}
                </Text>
                {submission.aiReasons && submission.aiReasons.map((reason, idx) => (
                  <Text key={idx} style={styles.aiReason}>• {reason}</Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Review Notes */}
        <View style={styles.modalSection}>
          <Text style={styles.modalSectionTitle}>Ghi chú đánh giá</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Nhập ghi chú hoặc lý do từ chối..."
            value={notes}
            onChangeText={onNotesChange}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.modalActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={onReject}
        >
          <Ionicons name="close-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Từ chối</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={onApprove}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Phê duyệt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  statCard: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  submissionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  imagePreview: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  aiScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiScoreText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 15,
    color: '#111',
    lineHeight: 22,
  },
  aiReview: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  aiScoreLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#666666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiScoreLargeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  aiScoreLargeLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  aiRecommendation: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  aiReason: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#111',
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: '#000000',
  },
  approveButton: {
    backgroundColor: '#0066CC',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
