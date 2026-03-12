/**
 * Document Detail Screen
 * Display full document information with metadata, version, comments preview, and actions
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useDocument, useDocumentActivity, useDocumentComments } from '@/hooks/useDocument';
import { downloadDocument } from '@/services/document';
import { AccessLevel, DocumentStatus, FileType } from '@/types/document';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function DocumentDetailScreen() {
  const params = useLocalSearchParams<{ projectId: string; documentId: string }>();
  const { projectId = '1', documentId = '1' } = params;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const { document, loading, deleteDocument } = useDocument(projectId, documentId);
  const { activities } = useDocumentActivity(projectId, documentId);
  const { comments } = useDocumentComments(projectId, documentId);

  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!document) return;
    
    try {
      setDownloading(true);
      await downloadDocument(documentId);
      Alert.alert('Thành công', 'Đã tải xuống tài liệu');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải xuống tài liệu');
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa tài liệu "${document?.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument();
              Alert.alert('Thành công', 'Đã xóa tài liệu');
              router.back();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa tài liệu');
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    router.push({
      pathname: '/documents/share',
      params: { projectId, documentId },
    } as any);
  };

  const handleCreateVersion = () => {
    router.push({
      pathname: '/documents/upload',
      params: { projectId, parentDocumentId: documentId },
    } as any);
  };

  const handleViewVersions = () => {
    router.push({
      pathname: '/documents/versions',
      params: { projectId, documentId },
    } as any);
  };

  if (loading || !document) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: 'Chi tiết tài liệu' }} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>
            Đang tải...
          </Text>
        </View>
      </View>
    );
  }

  const statusColors: Record<DocumentStatus, string> = {
    DRAFT: '#999999',
    UNDER_REVIEW: '#0D9488',
    APPROVED: '#0D9488',
    REJECTED: '#000000',
    SUPERSEDED: '#4A4A4A',
    ARCHIVED: '#757575',
  };

  const statusLabels: Record<DocumentStatus, string> = {
    DRAFT: 'Nháp',
    UNDER_REVIEW: 'Đang duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    SUPERSEDED: 'Đã thay thế',
    ARCHIVED: 'Lưu trữ',
  };

  const accessLevelLabels: Record<AccessLevel, string> = {
    PRIVATE: 'Riêng tư',
    TEAM: 'Nhóm',
    PROJECT: 'Dự án',
    PUBLIC: 'Công khai',
  };

  const fileTypeIcons: Record<FileType, string> = {
    PDF: 'document-text',
    IMAGE: 'image',
    DOCUMENT: 'document',
    SPREADSHEET: 'grid',
    PRESENTATION: 'easel',
    CAD: 'construct',
    VIDEO: 'videocam',
    AUDIO: 'musical-notes',
    ARCHIVE: 'archive',
    OTHER: 'document-attach',
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: document.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={handleDownload}
              disabled={downloading}
              style={styles.headerButton}
            >
              <Ionicons
                name="cloud-download-outline"
                size={24}
                color="#0D9488"
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor }]}>
        {/* File Info Card */}
        <View style={[styles.card, { borderColor }]}>
          <View style={styles.fileHeader}>
            <View style={styles.fileIconContainer}>
              <Ionicons
                name={fileTypeIcons[document.fileType] as any}
                size={40}
                color="#0D9488"
              />
            </View>
            <View style={styles.fileInfo}>
              <Text style={[styles.fileName, { color: textColor }]}>
                {document.fileName}
              </Text>
              <Text style={styles.fileMeta}>
                {formatFileSize(document.fileSize)} • {document.mimeType}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[document.status] + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusColors[document.status] },
                ]}
              >
                {statusLabels[document.status]}
              </Text>
            </View>
          </View>

          {/* Description */}
          {document.description && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Mô tả
              </Text>
              <Text style={[styles.description, { color: textColor }]}>
                {document.description}
              </Text>
            </View>
          )}

          {/* Metadata Table */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Thông tin
            </Text>
            <View style={[styles.metadataTable, { borderColor }]}>
              <MetadataRow
                label="Danh mục"
                value={document.category}
                borderColor={borderColor}
                textColor={textColor}
              />
              <MetadataRow
                label="Quyền truy cập"
                value={accessLevelLabels[document.accessLevel]}
                borderColor={borderColor}
                textColor={textColor}
              />
              <MetadataRow
                label="Loại file"
                value={document.fileType}
                borderColor={borderColor}
                textColor={textColor}
              />
              <MetadataRow
                label="Phiên bản"
                value={`${document.version} ${document.versionLabel ? `(${document.versionLabel})` : ''}`}
                borderColor={borderColor}
                textColor={textColor}
                onPress={document.version > 1 ? handleViewVersions : undefined}
              />
              <MetadataRow
                label="Người tải lên"
                value={document.uploadedByName || 'N/A'}
                borderColor={borderColor}
                textColor={textColor}
              />
              <MetadataRow
                label="Ngày tạo"
                value={formatDate(document.createdAt)}
                borderColor={borderColor}
                textColor={textColor}
              />
              <MetadataRow
                label="Cập nhật cuối"
                value={formatDate(document.updatedAt)}
                borderColor={borderColor}
                textColor={textColor}
                isLast
              />
            </View>
          </View>

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Tags
              </Text>
              <View style={styles.tagsContainer}>
                {document.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Approval Status */}
        {(document.status === 'APPROVED' || document.status === 'REJECTED') && (
          <View style={[styles.card, { borderColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Trạng thái duyệt
            </Text>
            {document.status === 'APPROVED' && document.approvedBy && (
              <View style={styles.approvalInfo}>
                <Ionicons name="checkmark-circle" size={20} color="#0D9488" />
                <Text style={[styles.approvalText, { color: textColor }]}>
                  Đã duyệt bởi {document.approvedByName}
                </Text>
              </View>
            )}
            {document.approvedAt && (
              <Text style={styles.approvalDate}>
                {formatDate(document.approvedAt)}
              </Text>
            )}
            {document.status === 'REJECTED' && document.rejectedBy && (
              <>
                <View style={styles.approvalInfo}>
                  <Ionicons name="close-circle" size={20} color="#000000" />
                  <Text style={[styles.approvalText, { color: textColor }]}>
                    Từ chối bởi {document.rejectedByName}
                  </Text>
                </View>
                {document.rejectedReason && (
                  <Text style={[styles.rejectedReason, { color: textColor }]}>
                    Lý do: {document.rejectedReason}
                  </Text>
                )}
              </>
            )}
          </View>
        )}

        {/* Comments Preview */}
        {comments && comments.length > 0 && (
          <View style={[styles.card, { borderColor }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: textColor }]}>
                Bình luận ({comments.length})
              </Text>
              <TouchableOpacity>
                <Text style={styles.seeAllLink}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            {comments.slice(0, 3).map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <Text style={[styles.commentAuthor, { color: textColor }]}>
                  {comment.author?.name || 'Unknown'}
                </Text>
                <Text style={[styles.commentContent, { color: textColor }]} numberOfLines={2}>
                  {comment.content}
                </Text>
                <Text style={styles.commentDate}>
                  {formatDate(comment.createdAt)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Activity Timeline */}
        {activities && activities.length > 0 && (
          <View style={[styles.card, { borderColor }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              Hoạt động gần đây
            </Text>
            {activities.slice(0, 5).map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityDot} />
                <View style={styles.activityContent}>
                  <Text style={[styles.activityAction, { color: textColor }]}>
                    {activity.action}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {activity.performedByName || 'Unknown'} • {formatDate(activity.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={[styles.card, { borderColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            Hành động
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor }]}
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={24} color="#0D9488" />
              <Text style={[styles.actionLabel, { color: textColor }]}>
                Chia sẻ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor }]}
              onPress={handleCreateVersion}
            >
              <Ionicons name="git-branch-outline" size={24} color="#0D9488" />
              <Text style={[styles.actionLabel, { color: textColor }]}>
                Tạo phiên bản
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={24} color="#000000" />
              <Text style={[styles.actionLabel, { color: textColor }]}>
                Xóa
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

interface MetadataRowProps {
  label: string;
  value: string;
  borderColor: string;
  textColor: string;
  isLast?: boolean;
  onPress?: () => void;
}

function MetadataRow({ label, value, borderColor, textColor, isLast, onPress }: MetadataRowProps) {
  const content = (
    <View
      style={[
        styles.metadataRow,
        { borderBottomColor: borderColor },
        isLast && styles.metadataRowLast,
      ]}
    >
      <Text style={styles.metadataLabel}>{label}</Text>
      <Text
        style={[
          styles.metadataValue,
          { color: textColor },
          onPress && styles.metadataValueLink,
        ]}
      >
        {value}
      </Text>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  headerButton: {
    padding: 8,
  },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  metadataTable: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  metadataRowLast: {
    borderBottomWidth: 0,
  },
  metadataLabel: {
    fontSize: 13,
    color: '#666',
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  metadataValueLink: {
    color: '#0D9488',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#0D9488',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllLink: {
    fontSize: 14,
    color: '#0D9488',
  },
  approvalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  approvalText: {
    fontSize: 14,
  },
  approvalDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 28,
  },
  rejectedReason: {
    fontSize: 13,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  comment: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 13,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 11,
    color: '#999',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0D9488',
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 12,
    color: '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  actionLabel: {
    fontSize: 13,
  },
});
