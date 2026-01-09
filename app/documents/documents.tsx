import { useDocuments } from '@/hooks/useDocument';
import {
    AccessLevel,
    DocumentCategory,
    DocumentStatus,
    FileType,
} from '@/types/document';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.DESIGN]: 'Thiết kế',
  [DocumentCategory.CONTRACT]: 'Hợp đồng',
  [DocumentCategory.PERMIT]: 'Giấy phép',
  [DocumentCategory.SPECIFICATION]: 'Đặc tả',
  [DocumentCategory.REPORT]: 'Báo cáo',
  [DocumentCategory.PHOTO]: 'Hình ảnh',
  [DocumentCategory.INVOICE]: 'Hóa đơn',
  [DocumentCategory.SCHEDULE]: 'Lịch trình',
  [DocumentCategory.SAFETY]: 'An toàn',
  [DocumentCategory.QUALITY]: 'Chất lượng',
  [DocumentCategory.MEETING]: 'Họp',
  [DocumentCategory.CORRESPONDENCE]: 'Thư từ',
  [DocumentCategory.SUBMITTAL]: 'Đệ trình',
  [DocumentCategory.WARRANTY]: 'Bảo hành',
  [DocumentCategory.MANUAL]: 'Hướng dẫn',
  [DocumentCategory.OTHER]: 'Khác',
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: 'Nháp',
  [DocumentStatus.UNDER_REVIEW]: 'Đang duyệt',
  [DocumentStatus.APPROVED]: 'Đã duyệt',
  [DocumentStatus.REJECTED]: 'Từ chối',
  [DocumentStatus.SUPERSEDED]: 'Đã thay thế',
  [DocumentStatus.ARCHIVED]: 'Lưu trữ',
};

const STATUS_COLORS: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: '#999999',
  [DocumentStatus.UNDER_REVIEW]: '#0066CC',
  [DocumentStatus.APPROVED]: '#0066CC',
  [DocumentStatus.REJECTED]: '#000000',
  [DocumentStatus.SUPERSEDED]: '#4A4A4A',
  [DocumentStatus.ARCHIVED]: '#757575',
};

const ACCESS_LEVEL_ICONS: Record<AccessLevel, keyof typeof Ionicons.glyphMap> = {
  [AccessLevel.PRIVATE]: 'lock-closed',
  [AccessLevel.TEAM]: 'people',
  [AccessLevel.PROJECT]: 'business',
  [AccessLevel.PUBLIC]: 'globe',
};

export default function DocumentsScreen() {
  const { projectId, category } = useLocalSearchParams<{
    projectId: string;
    category?: DocumentCategory;
  }>();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'ALL'>(
    category || 'ALL'
  );

  const { documents, loading, deleteDocument } = useDocuments(projectId, {
    category: categoryFilter === 'ALL' ? undefined : categoryFilter,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    searchTerm: searchTerm.trim() || undefined,
  });

  const handleDelete = async (id: string, name: string) => {
    Alert.alert('Xóa tài liệu', `Xác nhận xóa "${name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDocument(id);
            Alert.alert('Thành công', 'Đã xóa tài liệu');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa tài liệu');
          }
        },
      },
    ]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  const statusCounts = {
    ALL: documents.length,
    ...Object.values(DocumentStatus).reduce(
      (acc, status) => {
        acc[status] = documents.filter((d) => d.status === status).length;
        return acc;
      },
      {} as Record<DocumentStatus, number>
    ),
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tài liệu..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        style={styles.filterBar}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            categoryFilter === 'ALL' && styles.filterChipActive,
          ]}
          onPress={() => setCategoryFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              categoryFilter === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            Tất cả
          </Text>
        </TouchableOpacity>

        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterChip,
              categoryFilter === key && styles.filterChipActive,
            ]}
            onPress={() => setCategoryFilter(key as DocumentCategory)}
          >
            <Text
              style={[
                styles.filterChipText,
                categoryFilter === key && styles.filterChipTextActive,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <ScrollView
        horizontal
        style={styles.filterBar}
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === 'ALL' && styles.filterChipActive,
          ]}
          onPress={() => setStatusFilter('ALL')}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === 'ALL' && styles.filterChipTextActive,
            ]}
          >
            Tất cả ({statusCounts.ALL})
          </Text>
        </TouchableOpacity>

        {Object.values(DocumentStatus).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              statusFilter === status && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === status && styles.filterChipTextActive,
              ]}
            >
              {STATUS_LABELS[status]} ({statusCounts[status]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView}>
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy tài liệu nào</Text>
            {statusFilter === 'ALL' && categoryFilter === 'ALL' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push(`/documents/upload?projectId=${projectId}` as Href)}
              >
                <Text style={styles.emptyButtonText}>Tải lên tài liệu</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          documents.map((doc) => (
            <View key={doc.id} style={styles.documentCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.fileIconContainer}>
                    <Ionicons
                      name={getFileTypeIcon(doc.fileType)}
                      size={28}
                      color="#0066CC"
                    />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.documentName} numberOfLines={2}>
                      {doc.name}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>
                        {CATEGORY_LABELS[doc.category]}
                      </Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.metaText}>
                        {formatFileSize(doc.fileSize)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[doc.status] + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[doc.status] },
                    ]}
                  >
                    {STATUS_LABELS[doc.status]}
                  </Text>
                </View>
              </View>

              {/* Description */}
              {doc.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {doc.description}
                </Text>
              )}

              {/* Info Row */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons
                    name={ACCESS_LEVEL_ICONS[doc.accessLevel]}
                    size={14}
                    color="#666"
                  />
                  <Text style={styles.infoText}>
                    {doc.accessLevel === AccessLevel.PRIVATE && 'Riêng tư'}
                    {doc.accessLevel === AccessLevel.TEAM && 'Nhóm'}
                    {doc.accessLevel === AccessLevel.PROJECT && 'Dự án'}
                    {doc.accessLevel === AccessLevel.PUBLIC && 'Công khai'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="person-outline" size={14} color="#666" />
                  <Text style={styles.infoText}>{doc.uploadedByName || 'N/A'}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.infoText}>{formatDate(doc.createdAt)}</Text>
                </View>
              </View>

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {doc.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                  {doc.tags.length > 3 && (
                    <Text style={styles.moreTagsText}>+{doc.tags.length - 3}</Text>
                  )}
                </View>
              )}

              {/* Version Info */}
              {doc.version > 1 && (
                <View style={styles.versionInfo}>
                  <Ionicons name="git-branch-outline" size={14} color="#999999" />
                  <Text style={styles.versionText}>
                    Phiên bản {doc.version}
                    {doc.versionLabel && ` (${doc.versionLabel})`}
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push(
                      `/documents/document-detail?id=${doc.id}&projectId=${projectId}`
                    )
                  }
                >
                  <Ionicons name="eye-outline" size={18} color="#0066CC" />
                  <Text style={styles.actionButtonText}>Xem</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push(`/documents/share?documentId=${doc.id}&projectId=${projectId}`)
                  }
                >
                  <Ionicons name="share-outline" size={18} color="#0066CC" />
                  <Text style={styles.actionButtonText}>Chia sẻ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(doc.id, doc.name)}
                >
                  <Ionicons name="trash-outline" size={18} color="#000000" />
                  <Text style={[styles.actionButtonText, { color: '#000000' }]}>
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {documents.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push(`/documents/upload?projectId=${projectId}` as Href)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
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
  searchSection: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexGrow: 0,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0066CC',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  documentCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  fileIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E8F4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  metaRow: {
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#E8F4FF',
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#0066CC',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#999',
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F3E5F5',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
