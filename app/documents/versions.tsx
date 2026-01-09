/**
 * Document Versions Screen
 * Display version history with restore and compare functionality
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useDocumentVersions } from '@/hooks/useDocument';
import { downloadDocument } from '@/services/document';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function DocumentVersionsScreen() {
  const params = useLocalSearchParams<{ projectId: string; documentId: string }>();
  const { projectId = '1', documentId = '1' } = params;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const { versions, loading, restoreVersion } = useDocumentVersions(projectId, documentId);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleRestore = (versionId: string, versionNumber: number) => {
    Alert.alert(
      'Xác nhận khôi phục',
      `Bạn có chắc muốn khôi phục phiên bản ${versionNumber}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          onPress: async () => {
            try {
              await restoreVersion(versionId);
              Alert.alert('Thành công', 'Đã khôi phục phiên bản');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể khôi phục phiên bản');
            }
          },
        },
      ]
    );
  };

  const handleDownload = async (versionId: string) => {
    try {
      setDownloading(versionId);
      await downloadDocument(versionId);
      Alert.alert('Thành công', 'Đã tải xuống phiên bản');
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tải xuống');
    } finally {
      setDownloading(null);
    }
  };

  const handleCompare = (versionId: string) => {
    Alert.alert('Thông báo', 'Tính năng so sánh phiên bản đang được phát triển');
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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="git-branch-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có phiên bản nào</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Stack.Screen options={{ title: 'Lịch sử phiên bản' }} />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>
            Đang tải...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Lịch sử phiên bản' }} />
      <View style={[styles.container, { backgroundColor }]}>
        <FlatList
          data={versions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.versionCard, { borderColor }]}>
              {/* Header */}
              <View style={styles.versionHeader}>
                <View style={styles.versionInfo}>
                  <View style={styles.versionNumberContainer}>
                    <Ionicons name="git-commit-outline" size={20} color="#0066CC" />
                    <Text style={[styles.versionNumber, { color: textColor }]}>
                      Phiên bản {item.versionNumber}
                    </Text>
                  </View>
                  {item.versionLabel && (
                    <View style={styles.versionLabelBadge}>
                      <Text style={styles.versionLabelText}>{item.versionLabel}</Text>
                    </View>
                  )}
                  {item.isLatestVersion && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Hiện tại</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* File Info */}
              <View style={styles.fileInfoRow}>
                <Ionicons name="document-outline" size={16} color="#666" />
                <Text style={styles.fileName}>{item.fileName}</Text>
              </View>

              <View style={styles.fileInfoRow}>
                <Ionicons name="folder-outline" size={16} color="#666" />
                <Text style={styles.fileSize}>{formatFileSize(item.fileSize)}</Text>
              </View>

              {/* Changes */}
              {item.changes && (
                <View style={styles.changesContainer}>
                  <Text style={styles.changesLabel}>Thay đổi:</Text>
                  <Text style={[styles.changesText, { color: textColor }]}>
                    {item.changes}
                  </Text>
                </View>
              )}

              {/* Meta Info */}
              <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>
                    {item.uploadedByName || 'Unknown'}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                {!item.isLatestVersion && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.restoreButton]}
                    onPress={() => handleRestore(item.id, item.versionNumber)}
                  >
                    <Ionicons name="refresh-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Khôi phục</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={() => handleDownload(item.id)}
                  disabled={downloading === item.id}
                >
                  <Ionicons name="cloud-download-outline" size={18} color="#0066CC" />
                  <Text style={[styles.actionButtonTextSecondary, { color: '#0066CC' }]}>
                    {downloading === item.id ? 'Đang tải...' : 'Tải xuống'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.compareButton]}
                  onPress={() => handleCompare(item.id)}
                >
                  <Ionicons name="git-compare-outline" size={18} color="#666" />
                  <Text style={[styles.actionButtonTextSecondary, { color: '#666' }]}>
                    So sánh
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </>
  );
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
  listContent: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  versionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  versionHeader: {
    marginBottom: 12,
  },
  versionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  versionNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  versionNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionLabelBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionLabelText: {
    fontSize: 11,
    color: '#0066CC',
    fontWeight: '600',
  },
  currentBadge: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  fileName: {
    fontSize: 14,
    color: '#666',
  },
  fileSize: {
    fontSize: 13,
    color: '#999',
  },
  changesContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  changesLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  changesText: {
    fontSize: 13,
    lineHeight: 18,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  restoreButton: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  downloadButton: {
    backgroundColor: '#fff',
    borderColor: '#0066CC',
  },
  compareButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtonTextSecondary: {
    fontSize: 13,
    fontWeight: '600',
  },
});
