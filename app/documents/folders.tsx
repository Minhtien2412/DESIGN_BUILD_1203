import { useDocuments, useFolders } from '@/hooks/useDocument';
import { AccessLevel } from '@/types/document';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const ACCESS_LEVEL_ICONS: Record<AccessLevel, keyof typeof Ionicons.glyphMap> = {
  [AccessLevel.PRIVATE]: 'lock-closed',
  [AccessLevel.TEAM]: 'people',
  [AccessLevel.PROJECT]: 'business',
  [AccessLevel.PUBLIC]: 'globe',
};

export default function FoldersScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { folders, loading, deleteFolder } = useFolders(projectId);
  const { documents } = useDocuments(projectId);

  const handleDelete = async (id: string, name: string) => {
    // Check if folder has documents
    const folderDocs = documents.filter((d) => d.folder?.id === id);
    
    if (folderDocs.length > 0) {
      Alert.alert(
        'Không thể xóa',
        `Thư mục "${name}" có ${folderDocs.length} tài liệu. Vui lòng di chuyển hoặc xóa tài liệu trước.`
      );
      return;
    }

    Alert.alert('Xóa thư mục', `Xác nhận xóa thư mục "${name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFolder(id);
            Alert.alert('Thành công', 'Đã xóa thư mục');
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa thư mục');
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {folders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Chưa có thư mục nào</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() =>
                router.push(`/documents/create-folder?projectId=${projectId}`)
              }
            >
              <Text style={styles.emptyButtonText}>Tạo thư mục</Text>
            </TouchableOpacity>
          </View>
        ) : (
          folders.map((folder) => (
            <View key={folder.id} style={styles.folderCard}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.folderIcon}>
                    <Ionicons name="folder" size={32} color="#FF9800" />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.folderName}>{folder.name}</Text>
                    {folder.description && (
                      <Text style={styles.folderDescription} numberOfLines={1}>
                        {folder.description}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.accessIcon}>
                  <Ionicons
                    name={ACCESS_LEVEL_ICONS[folder.accessLevel]}
                    size={20}
                    color="#666"
                  />
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="document-outline" size={16} color="#666" />
                  <Text style={styles.statText}>
                    {folder.documentCount} tài liệu
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="archive-outline" size={16} color="#666" />
                  <Text style={styles.statText}>
                    {formatFileSize(folder.totalSize)}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{formatDate(folder.createdAt)}</Text>
                </View>
              </View>

              {/* Path */}
              {folder.path && folder.path !== '/' && (
                <View style={styles.pathRow}>
                  <Ionicons name="location-outline" size={14} color="#999" />
                  <Text style={styles.pathText} numberOfLines={1}>
                    {folder.path}
                  </Text>
                </View>
              )}

              {/* Creator */}
              <View style={styles.creatorRow}>
                <Ionicons name="person-outline" size={14} color="#666" />
                <Text style={styles.creatorText}>
                  {folder.createdByName || 'N/A'}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push(
                      `/documents/documents?projectId=${projectId}&folderId=${folder.id}`
                    )
                  }
                >
                  <Ionicons name="enter-outline" size={18} color="#2196F3" />
                  <Text style={styles.actionButtonText}>Mở</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    router.push(
                      `/documents/upload?projectId=${projectId}&folderId=${folder.id}` as Href
                    )
                  }
                >
                  <Ionicons name="cloud-upload-outline" size={18} color="#4CAF50" />
                  <Text style={styles.actionButtonText}>Tải lên</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(folder.id, folder.name)}
                >
                  <Ionicons name="trash-outline" size={18} color="#F44336" />
                  <Text style={[styles.actionButtonText, { color: '#F44336' }]}>
                    Xóa
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      {folders.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            router.push(`/documents/create-folder?projectId=${projectId}`)
          }
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
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  folderCard: {
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
  folderIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  folderDescription: {
    fontSize: 13,
    color: '#666',
  },
  accessIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  pathText: {
    fontSize: 11,
    color: '#999',
    flex: 1,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  creatorText: {
    fontSize: 12,
    color: '#666',
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
    color: '#2196F3',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
