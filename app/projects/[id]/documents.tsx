import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'dwg' | 'doc' | 'xls';
  category: 'design' | 'contract' | 'permit' | 'report' | 'other';
  size: number;
  uploadDate: string;
  uploadedBy: string;
  url?: string;
}

const DOCUMENT_TYPES = {
  pdf: { icon: 'document-text', color: '#EF4444' },
  image: { icon: 'image', color: '#10B981' },
  dwg: { icon: 'cube', color: '#007AFF' },
  doc: { icon: 'document', color: '#007AFF' },
  xls: { icon: 'grid', color: '#34C759' },
};

const CATEGORIES = [
  { value: 'all', label: 'Tất cả', icon: 'folder-open' },
  { value: 'design', label: 'Thiết kế', icon: 'color-palette' },
  { value: 'contract', label: 'Hợp đồng', icon: 'document-attach' },
  { value: 'permit', label: 'Giấy phép', icon: 'shield-checkmark' },
  { value: 'report', label: 'Báo cáo', icon: 'bar-chart' },
  { value: 'other', label: 'Khác', icon: 'folder' },
];

export default function ProjectDocumentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = params.id as string;

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Bản vẽ kiến trúc tầng 1.pdf',
      type: 'pdf',
      category: 'design',
      size: 5242880,
      uploadDate: '2025-02-01',
      uploadedBy: 'Nguyễn Văn A',
    },
    {
      id: '2',
      name: 'Hợp đồng thi công.pdf',
      type: 'pdf',
      category: 'contract',
      size: 2097152,
      uploadDate: '2025-02-05',
      uploadedBy: 'Trần Thị B',
    },
    {
      id: '3',
      name: 'Giấy phép xây dựng.jpg',
      type: 'image',
      category: 'permit',
      size: 1048576,
      uploadDate: '2025-02-10',
      uploadedBy: 'Lê Văn C',
    },
    {
      id: '4',
      name: 'Báo cáo tiến độ tháng 2.doc',
      type: 'doc',
      category: 'report',
      size: 524288,
      uploadDate: '2025-02-15',
      uploadedBy: 'Phạm Thị D',
    },
    {
      id: '5',
      name: 'Dự toán chi tiết.xls',
      type: 'xls',
      category: 'design',
      size: 786432,
      uploadDate: '2025-02-20',
      uploadedBy: 'Hoàng Văn E',
    },
  ]);

  const [category, setCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredDocs =
    category === 'all'
      ? documents
      : documents.filter(d => d.category === category);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = (doc: Document) => {
    Alert.alert('Tải xuống', `Tải file: ${doc.name}`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Tải', onPress: () => console.log('Download:', doc.id) },
    ]);
  };

  const handleShare = (doc: Document) => {
    Alert.alert('Chia sẻ', `Chia sẻ file: ${doc.name}`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Chia sẻ', onPress: () => console.log('Share:', doc.id) },
    ]);
  };

  const handleDelete = (docId: string, name: string) => {
    Alert.alert('Xóa tài liệu', `Bạn có chắc muốn xóa "${name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => setDocuments(prev => prev.filter(d => d.id !== docId)),
      },
    ]);
  };

  const renderDocumentItem = ({ item }: { item: Document }) => {
    const typeConfig = DOCUMENT_TYPES[item.type];

    return (
      <TouchableOpacity
        style={styles.docCard}
        onPress={() => handleDownload(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.docIcon, { backgroundColor: typeConfig.color + '20' }]}>
          <Ionicons name={typeConfig.icon as any} size={32} color={typeConfig.color} />
        </View>

        <View style={styles.docInfo}>
          <Text style={styles.docName} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.docMeta}>
            <Text style={styles.docSize}>{formatFileSize(item.size)}</Text>
            <Text style={styles.docDivider}>•</Text>
            <Text style={styles.docDate}>
              {new Date(item.uploadDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          <View style={styles.docUploader}>
            <Ionicons name="person" size={12} color="#999" />
            <Text style={styles.docUploaderText}>{item.uploadedBy}</Text>
          </View>
        </View>

        <View style={styles.docActions}>
          <TouchableOpacity
            style={styles.docActionBtn}
            onPress={() => handleShare(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.docActionBtn}
            onPress={() => handleDelete(item.id, item.name)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryChip = (cat: typeof CATEGORIES[0]) => (
    <TouchableOpacity
      key={cat.value}
      style={[
        styles.categoryChip,
        category === cat.value && styles.categoryChipActive,
      ]}
      onPress={() => setCategory(cat.value)}
    >
      <Ionicons
        name={cat.icon as any}
        size={16}
        color={category === cat.value ? '#fff' : '#666'}
      />
      <Text
        style={[
          styles.categoryText,
          category === cat.value && styles.categoryTextActive,
        ]}
      >
        {cat.label}
      </Text>
      {cat.value !== 'all' && (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {documents.filter(d => d.category === cat.value).length}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Tài liệu dự án</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowUploadModal(true)}
          style={styles.uploadBtn}
        >
          <Ionicons name="cloud-upload" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map(renderCategoryChip)}
        </ScrollView>
      </View>

      {/* Document Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="documents" size={24} color="#FF6B35" />
          <Text style={styles.statValue}>{documents.length}</Text>
          <Text style={styles.statLabel}>Tổng tài liệu</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cloud-done" size={24} color="#34C759" />
          <Text style={styles.statValue}>
            {(
              documents.reduce((sum, d) => sum + d.size, 0) /
              (1024 * 1024)
            ).toFixed(1)}
            MB
          </Text>
          <Text style={styles.statLabel}>Dung lượng</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#007AFF" />
          <Text style={styles.statValue}>
            {documents.length > 0
              ? new Date(
                  Math.max(...documents.map(d => new Date(d.uploadDate).getTime()))
                ).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
              : '--'}
          </Text>
          <Text style={styles.statLabel}>Mới nhất</Text>
        </View>
      </View>

      {/* Document List */}
      <FlatList
        data={filteredDocs}
        renderItem={renderDocumentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Chưa có tài liệu</Text>
            <Text style={styles.emptyDesc}>Tải lên tài liệu cho dự án</Text>
          </View>
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  uploadBtn: {
    padding: 8,
  },
  categoryContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryChipActive: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  categoryBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 1,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  docCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  docIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  docSize: {
    fontSize: 12,
    color: '#999',
  },
  docDivider: {
    fontSize: 12,
    color: '#ccc',
    marginHorizontal: 6,
  },
  docDate: {
    fontSize: 12,
    color: '#999',
  },
  docUploader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docUploaderText: {
    fontSize: 12,
    color: '#999',
  },
  docActions: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
  },
  docActionBtn: {
    padding: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
