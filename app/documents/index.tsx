import {
    useDocumentSummary,
    usePendingReviews,
    useRecentDocuments,
    useStorageStats,
} from '@/hooks/useDocument';
import { DocumentCategory, FileType } from '@/types/document';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const CATEGORY_INFO: Record<
  DocumentCategory,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  [DocumentCategory.DESIGN]: { icon: 'brush', color: '#9C27B0', label: 'Thiết kế' },
  [DocumentCategory.CONTRACT]: { icon: 'document-text', color: '#2196F3', label: 'Hợp đồng' },
  [DocumentCategory.PERMIT]: { icon: 'checkmark-circle', color: '#4CAF50', label: 'Giấy phép' },
  [DocumentCategory.SPECIFICATION]: { icon: 'list', color: '#FF9800', label: 'Đặc tả' },
  [DocumentCategory.REPORT]: { icon: 'bar-chart', color: '#F44336', label: 'Báo cáo' },
  [DocumentCategory.PHOTO]: { icon: 'image', color: '#00BCD4', label: 'Hình ảnh' },
  [DocumentCategory.INVOICE]: { icon: 'receipt', color: '#10B981', label: 'Hóa đơn' },
  [DocumentCategory.SCHEDULE]: { icon: 'calendar', color: '#3F51B5', label: 'Lịch trình' },
  [DocumentCategory.SAFETY]: { icon: 'shield-checkmark', color: '#FF5722', label: 'An toàn' },
  [DocumentCategory.QUALITY]: { icon: 'star', color: '#FFC107', label: 'Chất lượng' },
  [DocumentCategory.MEETING]: { icon: 'people', color: '#795548', label: 'Họp' },
  [DocumentCategory.CORRESPONDENCE]: { icon: 'mail', color: '#4A4A4A', label: 'Thư từ' },
  [DocumentCategory.SUBMITTAL]: { icon: 'send', color: '#0A6847', label: 'Đệ trình' },
  [DocumentCategory.WARRANTY]: { icon: 'shield', color: '#009688', label: 'Bảo hành' },
  [DocumentCategory.MANUAL]: { icon: 'book', color: '#673AB7', label: 'Hướng dẫn' },
  [DocumentCategory.OTHER]: { icon: 'folder', color: '#9E9E9E', label: 'Khác' },
};

export default function DocumentDashboardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { summary, loading: summaryLoading } = useDocumentSummary(projectId);
  const { stats, loading: statsLoading } = useStorageStats(projectId);
  const { documents: recentDocs, loading: recentLoading } = useRecentDocuments(
    projectId,
    5
  );
  const { documents: pendingReviews, loading: reviewsLoading } =
    usePendingReviews(projectId);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getFileTypeIcon = (fileType: FileType): keyof typeof Ionicons.glyphMap => {
    switch (fileType) {
      case FileType.PDF:
        return 'document-text';
      case FileType.IMAGE:
        return 'image';
      case FileType.DOCUMENT:
        return 'document';
      case FileType.SPREADSHEET:
        return 'grid';
      case FileType.PRESENTATION:
        return 'easel';
      case FileType.CAD:
        return 'cube';
      case FileType.VIDEO:
        return 'videocam';
      case FileType.AUDIO:
        return 'musical-notes';
      case FileType.ARCHIVE:
        return 'archive';
      default:
        return 'document-outline';
    }
  };

  if (summaryLoading || statsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="documents" size={28} color="#2196F3" />
            <Text style={styles.summaryValue}>{summary?.totalDocuments || 0}</Text>
            <Text style={styles.summaryLabel}>Tài liệu</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="cloud-upload" size={28} color="#FF9800" />
            <Text style={styles.summaryValue}>{summary?.recentUploads || 0}</Text>
            <Text style={styles.summaryLabel}>Tải lên (7 ngày)</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="time" size={28} color="#9C27B0" />
            <Text style={styles.summaryValue}>{summary?.pendingReviews || 0}</Text>
            <Text style={styles.summaryLabel}>Chờ duyệt</Text>
          </View>
        </View>
      </View>

      {/* Storage Stats */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dung lượng lưu trữ</Text>
          <View style={styles.storageCard}>
            <View style={styles.storageHeader}>
              <View style={styles.storageInfo}>
                <Ionicons name="server-outline" size={20} color="#666" />
                <Text style={styles.storageUsed}>
                  {formatFileSize(stats.totalUsed)} / {formatFileSize(stats.totalLimit)}
                </Text>
              </View>
              <Text style={styles.storagePercent}>{stats.percentUsed.toFixed(1)}%</Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(stats.percentUsed, 100)}%`,
                    backgroundColor:
                      stats.percentUsed >= 90
                        ? '#F44336'
                        : stats.percentUsed >= 75
                        ? '#FF9800'
                        : '#4CAF50',
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* Recent Documents */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tài liệu gần đây</Text>
          <TouchableOpacity
            onPress={() => router.push(`/documents/documents?projectId=${projectId}`)}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        {recentLoading ? (
          <Text style={styles.loadingText}>Đang tải...</Text>
        ) : recentDocs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có tài liệu nào</Text>
          </View>
        ) : (
          <View style={styles.documentList}>
            {recentDocs.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.documentItem}
                onPress={() =>
                  router.push(`/documents/document-detail?id=${doc.id}&projectId=${projectId}`)
                }
              >
                <View
                  style={[
                    styles.fileIcon,
                    {
                      backgroundColor:
                        CATEGORY_INFO[doc.category]?.color + '20' || '#f5f5f5',
                    },
                  ]}
                >
                  <Ionicons
                    name={getFileTypeIcon(doc.fileType)}
                    size={24}
                    color={CATEGORY_INFO[doc.category]?.color || '#666'}
                  />
                </View>

                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <View style={styles.documentMeta}>
                    <Text style={styles.metaText}>{formatFileSize(doc.fileSize)}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{formatDate(doc.createdAt)}</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Pending Reviews */}
      {pendingReviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chờ duyệt ({pendingReviews.length})</Text>

          <View style={styles.documentList}>
            {pendingReviews.slice(0, 3).map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.documentItem}
                onPress={() =>
                  router.push(`/documents/document-detail?id=${doc.id}&projectId=${projectId}`)
                }
              >
                <View
                  style={[
                    styles.fileIcon,
                    { backgroundColor: CATEGORY_INFO[doc.category]?.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={getFileTypeIcon(doc.fileType)}
                    size={24}
                    color={CATEGORY_INFO[doc.category]?.color}
                  />
                </View>

                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  <Text style={styles.metaText}>{doc.uploadedByName || 'N/A'}</Text>
                </View>

                <View style={styles.reviewBadge}>
                  <Text style={styles.reviewBadgeText}>Duyệt</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danh mục tài liệu</Text>

        <View style={styles.categoryGrid}>
          {Object.entries(CATEGORY_INFO).map(([key, info]) => {
            const count = summary?.byCategory[key as DocumentCategory] || 0;

            return (
              <TouchableOpacity
                key={key}
                style={styles.categoryCard}
                onPress={() =>
                  router.push(
                    `/documents/documents?projectId=${projectId}&category=${key}`
                  )
                }
              >
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: info.color + '20' },
                  ]}
                >
                  <Ionicons name={info.icon} size={24} color={info.color} />
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>
                  {info.label}
                </Text>
                <Text style={styles.categoryCount}>{count}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>

        <View style={styles.actionList}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push(`/documents/upload?projectId=${projectId}` as Href)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="cloud-upload" size={22} color="#2196F3" />
            </View>
            <Text style={styles.actionLabel}>Tải lên tài liệu</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push(`/documents/create-folder?projectId=${projectId}`)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="folder" size={22} color="#FF9800" />
            </View>
            <Text style={styles.actionLabel}>Tạo thư mục</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push(`/documents/folders?projectId=${projectId}`)}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="folder-open" size={22} color="#9C27B0" />
            </View>
            <Text style={styles.actionLabel}>Quản lý thư mục</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  storageCard: {
    gap: 12,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storageUsed: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  storagePercent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  documentList: {
    gap: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  fileIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentInfo: {
    flex: 1,
    gap: 4,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  metaDot: {
    fontSize: 12,
    color: '#999',
  },
  reviewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FF9800',
    borderRadius: 12,
  },
  reviewBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: (width - 32 - 30) / 4,
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  actionList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});
