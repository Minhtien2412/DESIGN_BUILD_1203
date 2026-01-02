/**
 * Document Manager Component
 * Upload, download, preview project documents (contracts, designs, reports)
 */
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type DocumentType = 'contract' | 'design' | 'report' | 'permit' | 'invoice' | 'other';

export type ProjectDocument = {
  id: string;
  name: string;
  type: DocumentType;
  size: number; // bytes
  mimeType: string;
  url: string;
  uploadedBy?: string;
  uploadedAt: string;
  tags?: string[];
};

type DocumentManagerProps = {
  documents: ProjectDocument[];
  onUpload?: () => void;
  onDownload?: (doc: ProjectDocument) => void;
  onPreview?: (doc: ProjectDocument) => void;
  onDelete?: (doc: ProjectDocument) => void;
  editable?: boolean;
};

const DOC_TYPE_CONFIG: Record<DocumentType, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  contract: { label: 'Hợp đồng', icon: 'document-text', color: '#2196F3' },
  design: { label: 'Thiết kế', icon: 'color-palette', color: '#0A6847' },
  report: { label: 'Báo cáo', icon: 'newspaper', color: '#FF9800' },
  permit: { label: 'Giấy phép', icon: 'shield-checkmark', color: '#4CAF50' },
  invoice: { label: 'Hóa đơn', icon: 'receipt', color: '#F44336' },
  other: { label: 'Khác', icon: 'document', color: '#757575' },
};

const FILE_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  pdf: { icon: 'document-text', color: '#F44336' },
  doc: { icon: 'document', color: '#2196F3' },
  docx: { icon: 'document', color: '#2196F3' },
  xls: { icon: 'grid', color: '#4CAF50' },
  xlsx: { icon: 'grid', color: '#4CAF50' },
  jpg: { icon: 'image', color: '#FF9800' },
  jpeg: { icon: 'image', color: '#FF9800' },
  png: { icon: 'image', color: '#FF9800' },
  dwg: { icon: 'construct', color: '#0A6847' },
  zip: { icon: 'archive', color: '#4A4A4A' },
  default: { icon: 'document-outline', color: '#757575' },
};

export default function DocumentManager({
  documents,
  onUpload,
  onDownload,
  onPreview,
  onDelete,
  editable = false,
}: DocumentManagerProps) {
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ProjectDocument | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (filename: string) => {
    const ext = getFileExtension(filename);
    return FILE_ICONS[ext] || FILE_ICONS.default;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredDocs = selectedType === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === selectedType);

  const docsByType = documents.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<DocumentType, number>);

  const handlePreview = (doc: ProjectDocument) => {
    setPreviewDoc(doc);
    setShowPreview(true);
    onPreview?.(doc);
  };

  const handleDelete = (doc: ProjectDocument) => {
    Alert.alert(
      'Xóa tài liệu',
      `Bạn có chắc muốn xóa "${doc.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDelete?.(doc),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tài liệu dự án</Text>
          <Text style={styles.subtitle}>{documents.length} tài liệu</Text>
        </View>

        {editable && onUpload && (
          <TouchableOpacity style={styles.uploadButton} onPress={onUpload}>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Tải lên</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabs}
      >
        <TouchableOpacity
          style={[styles.filterTab, selectedType === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedType('all')}
        >
          <Text style={[styles.filterTabText, selectedType === 'all' && styles.filterTabTextActive]}>
            Tất cả ({documents.length})
          </Text>
        </TouchableOpacity>

        {Object.entries(DOC_TYPE_CONFIG).map(([type, config]) => {
          const count = docsByType[type as DocumentType] || 0;
          if (count === 0) return null;
          
          return (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterTab,
                selectedType === type && [styles.filterTabActive, { borderBottomColor: config.color }],
              ]}
              onPress={() => setSelectedType(type as DocumentType)}
            >
              <Ionicons name={config.icon} size={16} color={selectedType === type ? config.color : '#666'} />
              <Text 
                style={[
                  styles.filterTabText, 
                  selectedType === type && [styles.filterTabTextActive, { color: config.color }]
                ]}
              >
                {config.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Documents List */}
      <View style={styles.documentsList}>
        {filteredDocs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có tài liệu</Text>
          </View>
        ) : (
          filteredDocs.map((doc, index) => {
            const fileIcon = getFileIcon(doc.name);
            const typeConfig = DOC_TYPE_CONFIG[doc.type];

            return (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.docItem,
                  index < filteredDocs.length - 1 && styles.docItemBorder,
                ]}
                onPress={() => handlePreview(doc)}
                activeOpacity={0.7}
              >
                {/* File Icon */}
                <View style={[styles.fileIconContainer, { backgroundColor: `${fileIcon.color}15` }]}>
                  <Ionicons name={fileIcon.icon} size={28} color={fileIcon.color} />
                </View>

                {/* Document Info */}
                <View style={styles.docInfo}>
                  <Text style={styles.docName} numberOfLines={1}>
                    {doc.name}
                  </Text>
                  
                  <View style={styles.docMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: `${typeConfig.color}20` }]}>
                      <Text style={[styles.typeText, { color: typeConfig.color }]}>
                        {typeConfig.label}
                      </Text>
                    </View>
                    <Text style={styles.docMetaText}>{formatFileSize(doc.size)}</Text>
                    <Text style={styles.docDot}>•</Text>
                    <Text style={styles.docMetaText}>{formatDate(doc.uploadedAt)}</Text>
                  </View>

                  {doc.uploadedBy && (
                    <Text style={styles.uploadedBy}>Bởi {doc.uploadedBy}</Text>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.docActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      onDownload?.(doc);
                    }}
                  >
                    <Ionicons name="download-outline" size={20} color="#4CAF50" />
                  </TouchableOpacity>

                  {editable && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDelete(doc);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Preview Modal */}
      {previewDoc && (
        <Modal
          visible={showPreview}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPreview(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowPreview(false)}>
            <View style={styles.modalContent}>
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {previewDoc.name}
                  </Text>
                  <TouchableOpacity onPress={() => setShowPreview(false)}>
                    <Ionicons name="close" size={28} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.previewContainer}>
                  <Ionicons name="document-text-outline" size={80} color="#0A6847" />
                  <Text style={styles.previewText}>Xem trước tài liệu</Text>
                  <Text style={styles.previewSubtext}>
                    {formatFileSize(previewDoc.size)} • {getFileExtension(previewDoc.name).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => {
                      setShowPreview(false);
                      onDownload?.(previewDoc);
                    }}
                  >
                    <Ionicons name="download" size={20} color="#fff" />
                    <Text style={styles.modalButtonText}>Tải xuống</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0A6847',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  filterTabs: {
    gap: 12,
    marginBottom: 20,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: '#E8F5E9',
    borderBottomColor: '#0A6847',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTabTextActive: {
    fontWeight: '700',
    color: '#0A6847',
  },
  documentsList: {
    gap: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  docItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fileIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 6,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  docMetaText: {
    fontSize: 12,
    color: '#666',
  },
  docDot: {
    fontSize: 12,
    color: '#ccc',
  },
  uploadedBy: {
    fontSize: 12,
    color: '#999',
  },
  docActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginRight: 16,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginTop: 20,
  },
  previewSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  modalActions: {
    padding: 20,
    paddingTop: 0,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#0A6847',
    paddingVertical: 16,
    borderRadius: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
