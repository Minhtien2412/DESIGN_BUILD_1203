import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { ThemedText } from '../themed-text';
import { Button } from '../ui/button';
import { Loader } from '../ui/loader';

const MODERN_COLORS = Colors.light;
const MODERN_SHADOWS = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
};

export type DocumentType = 'folder' | 'report' | 'rfi' | 'submittal';

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'folder';
  size?: number;
  uploadedAt: string;
  uploadedBy: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface DocumentManagementTemplateProps {
  documentType: DocumentType;
  title?: string;
  allowUpload?: boolean;
  allowDownload?: boolean;
  requireApproval?: boolean;
  onUpload?: () => void;
  onDownload?: (doc: Document) => void;
  onApprove?: (docId: string) => void;
  onReject?: (docId: string) => void;
}

const ICON_MAP = {
  pdf: 'document-text',
  doc: 'document',
  image: 'image',
  folder: 'folder',
};

const COLOR_MAP = {
  pdf: '#000000',
  doc: '#3B82F6',
  image: '#0066CC',
  folder: '#0066CC',
};

export default function DocumentManagementTemplate({
  documentType,
  title,
  allowUpload = true,
  allowDownload = true,
  requireApproval = false,
  onUpload,
  onDownload,
  onApprove,
  onReject,
}: DocumentManagementTemplateProps) {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Bản vẽ thi công tầng 1.pdf',
      type: 'pdf',
      size: 2.5 * 1024 * 1024,
      uploadedAt: '2025-12-15',
      uploadedBy: 'Nguyễn Văn A',
      status: 'approved',
    },
    {
      id: '2',
      name: 'Báo cáo tiến độ tuần 1.doc',
      type: 'doc',
      size: 1.2 * 1024 * 1024,
      uploadedAt: '2025-12-14',
      uploadedBy: 'Trần Thị B',
      status: 'pending',
    },
    {
      id: '3',
      name: 'Hình ảnh hiện trường',
      type: 'folder',
      uploadedAt: '2025-12-10',
      uploadedBy: 'Lê Văn C',
    },
  ]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleUpload = () => {
    if (onUpload) {
      onUpload();
    } else {
      // Default upload logic
      console.log('Upload document');
    }
  };

  const handleDownload = (doc: Document) => {
    if (onDownload) {
      onDownload(doc);
    } else {
      console.log('Download:', doc.name);
    }
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <Pressable
      style={styles.documentCard}
      onPress={() => handleDownload(item)}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: COLOR_MAP[item.type] + '20' },
        ]}
      >
        <Ionicons
          name={ICON_MAP[item.type] as any}
          size={24}
          color={COLOR_MAP[item.type]}
        />
      </View>

      {/* Info */}
      <View style={styles.documentInfo}>
        <Text style={styles.documentName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {item.uploadedBy} • {item.uploadedAt}
          </Text>
          {item.size && (
            <Text style={styles.metaText}> • {formatFileSize(item.size)}</Text>
          )}
        </View>

        {/* Status Badge */}
        {requireApproval && item.status && (
          <View
            style={[
              styles.statusBadge,
              item.status === 'approved' && styles.statusApproved,
              item.status === 'pending' && styles.statusPending,
              item.status === 'rejected' && styles.statusRejected,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === 'approved' && styles.statusTextApproved,
                item.status === 'pending' && styles.statusTextPending,
                item.status === 'rejected' && styles.statusTextRejected,
              ]}
            >
              {item.status === 'approved' && 'Đã duyệt'}
              {item.status === 'pending' && 'Chờ duyệt'}
              {item.status === 'rejected' && 'Từ chối'}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {allowDownload && item.type !== 'folder' && (
          <Pressable
            style={styles.actionButton}
            onPress={() => handleDownload(item)}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color={MODERN_COLORS.primary}
            />
          </Pressable>
        )}

        {requireApproval && item.status === 'pending' && (
          <>
            <Pressable
              style={styles.actionButton}
              onPress={() => onApprove?.(item.id)}
            >
              <Ionicons name="checkmark" size={20} color="#0066CC" />
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => onReject?.(item.id)}
            >
              <Ionicons name="close" size={20} color="#000000" />
            </Pressable>
          </>
        )}
      </View>
    </Pressable>
  );

  const getTitle = () => {
    if (title) return title;
    switch (documentType) {
      case 'folder':
        return 'Tài liệu';
      case 'report':
        return 'Báo cáo';
      case 'rfi':
        return 'RFI';
      case 'submittal':
        return 'Submittal';
      default:
        return 'Documents';
    }
  };

  if (loading) {
    return <Loader text="Đang tải tài liệu..." />;
  }

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      {allowUpload && (
        <View style={styles.uploadSection}>
          <Button
            title="Tải lên tài liệu"
            onPress={handleUpload}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <ThemedText style={{ color: '#fff' }}>Tải lên tài liệu</ThemedText>
            </View>
          </Button>
        </View>
      )}

      {/* Documents List */}
      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="folder-open-outline"
              size={64}
              color={MODERN_COLORS.textMuted}
            />
            <Text style={styles.emptyText}>Chưa có tài liệu nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  uploadSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  listContent: {
    padding: 16,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    ...MODERN_SHADOWS.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: MODERN_COLORS.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 13,
    color: MODERN_COLORS.textMuted,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusApproved: {
    backgroundColor: '#0066CC20',
  },
  statusPending: {
    backgroundColor: '#0066CC20',
  },
  statusRejected: {
    backgroundColor: '#00000020',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusTextApproved: {
    color: '#0066CC',
  },
  statusTextPending: {
    color: '#0066CC',
  },
  statusTextRejected: {
    color: '#000000',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MODERN_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: MODERN_COLORS.textMuted,
    marginTop: 16,
  },
});
