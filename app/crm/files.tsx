/**
 * Project Files Screen - Perfex CRM Style
 * =========================================
 * 
 * Quản lý tập tin dự án:
 * - Upload/Download files
 * - Xem theo folder
 * - Preview files
 * - Phân quyền truy cập
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProjectFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  downloadUrl?: string;
}

export default function ProjectFilesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      // Mock data với dữ liệu thực từ Perfex CRM
      // Projects: Nhà Anh Khương Q9, Biệt Thự 3 Tầng Anh Tiến Q7
      setFiles([
        {
          id: '1',
          fileName: 'Mat_Bang_Nha_Anh_Khuong_Q9.dwg',
          fileType: 'dwg',
          fileSize: 8192000,
          uploadedAt: '2024-12-30',
          uploadedBy: 'NHÀ XINH Design',
        },
        {
          id: '2',
          fileName: 'Phoi_Canh_3D_Biet_Thu_Anh_Tien_Q7.skp',
          fileType: 'skp',
          fileSize: 25600000,
          uploadedAt: '2024-12-29',
          uploadedBy: 'NHÀ XINH Design',
        },
        {
          id: '3',
          fileName: 'Bao_Gia_Thi_Cong_Q9.pdf',
          fileType: 'pdf',
          fileSize: 2048000,
          uploadedAt: '2024-12-28',
          uploadedBy: 'Admin',
        },
        {
          id: '4',
          fileName: 'Hop_Dong_Anh_Khuong_15Ty.pdf',
          fileType: 'pdf',
          fileSize: 1536000,
          uploadedAt: '2024-12-30',
          uploadedBy: 'Admin',
        },
        {
          id: '5',
          fileName: 'Noi_That_Can_Ho_Chi_Thao.zip',
          fileType: 'zip',
          fileSize: 45000000,
          uploadedAt: '2024-12-28',
          uploadedBy: 'NHÀ XINH Design',
        },
      ]);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFiles();
    setRefreshing(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    const icons: Record<string, string> = {
      pdf: 'document-text',
      doc: 'document',
      docx: 'document',
      xls: 'grid',
      xlsx: 'grid',
      ppt: 'easel',
      pptx: 'easel',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      zip: 'archive',
      rar: 'archive',
      mp4: 'videocam',
      mp3: 'musical-notes',
    };
    return icons[type.toLowerCase()] || 'document-outline';
  };

  const getFileColor = (type: string): string => {
    const colors: Record<string, string> = {
      pdf: '#ef4444',
      doc: '#3b82f6',
      docx: '#3b82f6',
      xls: '#22c55e',
      xlsx: '#22c55e',
      ppt: '#f59e0b',
      pptx: '#f59e0b',
      jpg: '#8b5cf6',
      jpeg: '#8b5cf6',
      png: '#8b5cf6',
      gif: '#8b5cf6',
      zip: '#6b7280',
      rar: '#6b7280',
      mp4: '#ec4899',
      mp3: '#14b8a6',
    };
    return colors[type.toLowerCase()] || '#6b7280';
  };

  const handleDownload = (file: ProjectFile) => {
    Alert.alert('Download', `Đang tải xuống: ${file.fileName}`);
  };

  const handleDelete = (file: ProjectFile) => {
    Alert.alert(
      'Xóa tập tin',
      `Bạn có chắc muốn xóa "${file.fileName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setFiles(files.filter((f) => f.id !== file.id));
          },
        },
      ]
    );
  };

  const renderFileItem = ({ item }: { item: ProjectFile }) => (
    <View style={[styles.fileCard, { backgroundColor: cardBg, borderColor }]}>
      <View style={[styles.fileIcon, { backgroundColor: getFileColor(item.fileType) + '20' }]}>
        <Ionicons
          name={getFileIcon(item.fileType) as any}
          size={24}
          color={getFileColor(item.fileType)}
        />
      </View>
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1}>
          {item.fileName}
        </Text>
        <View style={styles.fileMeta}>
          <Text style={[styles.fileMetaText, { color: textColor }]}>
            {formatFileSize(item.fileSize)}
          </Text>
          <Text style={[styles.fileMetaDot, { color: textColor }]}>•</Text>
          <Text style={[styles.fileMetaText, { color: textColor }]}>
            {new Date(item.uploadedAt).toLocaleDateString('vi-VN')}
          </Text>
          <Text style={[styles.fileMetaDot, { color: textColor }]}>•</Text>
          <Text style={[styles.fileMetaText, { color: textColor }]}>{item.uploadedBy}</Text>
        </View>
      </View>
      <View style={styles.fileActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: primaryColor + '20' }]}
          onPress={() => handleDownload(item)}
        >
          <Ionicons name="download-outline" size={18} color={primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ef444420' }]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Stats summary
  const totalSize = files.reduce((sum, f) => sum + f.fileSize, 0);
  const fileTypes = [...new Set(files.map((f) => f.fileType))];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Tập tin dự án</Text>
        <TouchableOpacity style={[styles.uploadButton, { backgroundColor: primaryColor }]}>
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsBar, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: primaryColor }]}>{files.length}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Tập tin</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: primaryColor }]}>{formatFileSize(totalSize)}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Tổng dung lượng</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: primaryColor }]}>{fileTypes.length}</Text>
          <Text style={[styles.statLabel, { color: textColor }]}>Loại file</Text>
        </View>
      </View>

      {/* File List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item.id}
          renderItem={renderFileItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="#6b7280" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Chưa có tập tin</Text>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Upload tập tin đầu tiên cho dự án này
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: primaryColor }]}
              >
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Upload ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  uploadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  fileIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileMetaText: {
    fontSize: 11,
    opacity: 0.7,
  },
  fileMetaDot: {
    marginHorizontal: 4,
    opacity: 0.3,
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
