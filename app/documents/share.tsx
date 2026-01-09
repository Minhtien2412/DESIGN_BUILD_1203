/**
 * Document Share Screen
 * Create and manage document shares with permissions and expiry
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useDocumentShares } from '@/hooks/useDocument';
import { AccessLevel } from '@/types/document';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function DocumentShareScreen() {
  const params = useLocalSearchParams<{ projectId: string; documentId: string }>();
  const { projectId = '1', documentId = '1' } = params;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const { shares, loading, createShare, deleteShare } = useDocumentShares(projectId, documentId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [shareType, setShareType] = useState<'user' | 'public'>('user');
  const [selectedUser, setSelectedUser] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(AccessLevel.PROJECT);
  const [canDownload, setCanDownload] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreateShare = async () => {
    if (shareType === 'user' && !selectedUser.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email người dùng');
      return;
    }

    try {
      setCreating(true);
      await createShare({
        documentId,
        sharedWith: shareType === 'user' ? selectedUser : undefined,
        accessLevel,
        permissions: {
          canDownload,
          canEdit,
          canShare,
        },
        expiresAt: hasExpiry ? expiryDate.toISOString() : undefined,
      });
      Alert.alert('Thành công', 'Đã tạo chia sẻ');
      setShowCreateModal(false);
      resetForm();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể tạo chia sẻ');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteShare = (shareId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn thu hồi quyền chia sẻ này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteShare(shareId);
              Alert.alert('Thành công', 'Đã thu hồi chia sẻ');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể thu hồi chia sẻ');
            }
          },
        },
      ]
    );
  };

  const handleCopyLink = (shareUrl: string) => {
    // TODO: Implement clipboard copy
    Alert.alert('Thành công', 'Đã sao chép liên kết');
  };

  const resetForm = () => {
    setShareType('user');
    setSelectedUser('');
    setAccessLevel(AccessLevel.PROJECT);
    setCanDownload(true);
    setCanEdit(false);
    setCanShare(false);
    setHasExpiry(false);
    setExpiryDate(new Date());
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

  const accessLevelLabels: Record<AccessLevel, string> = {
    PRIVATE: 'Riêng tư',
    TEAM: 'Nhóm',
    PROJECT: 'Dự án',
    PUBLIC: 'Công khai',
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="share-social-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có chia sẻ nào</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.emptyButtonText}>Tạo chia sẻ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chia sẻ tài liệu',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              style={styles.headerButton}
            >
              <Ionicons name="add" size={28} color="#0066CC" />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={[styles.container, { backgroundColor }]}>
        <FlatList
          data={shares}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.shareCard, { borderColor }]}>
              {/* Header */}
              <View style={styles.shareHeader}>
                <View style={styles.shareInfo}>
                  <Ionicons
                    name={item.sharedWith ? 'person' : 'link'}
                    size={20}
                    color="#0066CC"
                  />
                  <Text style={[styles.shareTitle, { color: textColor }]}>
                    {item.sharedWithName || 'Liên kết công khai'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteShare(item.id)}>
                  <Ionicons name="close-circle" size={24} color="#000000" />
                </TouchableOpacity>
              </View>

              {/* Access Level */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quyền truy cập:</Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {accessLevelLabels[item.accessLevel]}
                </Text>
              </View>

              {/* Permissions */}
              <View style={styles.permissionsContainer}>
                {item.permissions.canDownload && (
                  <View style={styles.permissionBadge}>
                    <Ionicons name="cloud-download-outline" size={14} color="#0066CC" />
                    <Text style={styles.permissionText}>Tải xuống</Text>
                  </View>
                )}
                {item.permissions.canEdit && (
                  <View style={styles.permissionBadge}>
                    <Ionicons name="create-outline" size={14} color="#0066CC" />
                    <Text style={styles.permissionText}>Chỉnh sửa</Text>
                  </View>
                )}
                {item.permissions.canShare && (
                  <View style={styles.permissionBadge}>
                    <Ionicons name="share-social-outline" size={14} color="#0066CC" />
                    <Text style={styles.permissionText}>Chia sẻ</Text>
                  </View>
                )}
              </View>

              {/* Expiry */}
              {item.expiresAt && (
                <View style={styles.expiryContainer}>
                  <Ionicons name="time-outline" size={16} color="#0066CC" />
                  <Text style={styles.expiryText}>
                    Hết hạn: {formatDate(item.expiresAt)}
                  </Text>
                </View>
              )}

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Ionicons name="eye-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{item.viewCount} lượt xem</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="cloud-download-outline" size={16} color="#666" />
                  <Text style={styles.statText}>{item.downloadCount} tải xuống</Text>
                </View>
              </View>

              {/* Share Link (for public shares) */}
              {item.shareUrl && (
                <TouchableOpacity
                  style={styles.copyLinkButton}
                  onPress={() => handleCopyLink(item.shareUrl!)}
                >
                  <Ionicons name="copy-outline" size={18} color="#0066CC" />
                  <Text style={styles.copyLinkText}>Sao chép liên kết</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
        />

        {/* Create Share Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  Tạo chia sẻ
                </Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close" size={28} color={textColor} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Share Type */}
                <View style={styles.formSection}>
                  <Text style={[styles.formLabel, { color: textColor }]}>
                    Loại chia sẻ
                  </Text>
                  <View style={styles.shareTypeContainer}>
                    <TouchableOpacity
                      style={[
                        styles.shareTypeButton,
                        shareType === 'user' && styles.shareTypeButtonActive,
                        { borderColor },
                      ]}
                      onPress={() => setShareType('user')}
                    >
                      <Ionicons
                        name="person"
                        size={20}
                        color={shareType === 'user' ? '#0066CC' : '#666'}
                      />
                      <Text
                        style={[
                          styles.shareTypeText,
                          shareType === 'user' && styles.shareTypeTextActive,
                        ]}
                      >
                        Người dùng cụ thể
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.shareTypeButton,
                        shareType === 'public' && styles.shareTypeButtonActive,
                        { borderColor },
                      ]}
                      onPress={() => setShareType('public')}
                    >
                      <Ionicons
                        name="link"
                        size={20}
                        color={shareType === 'public' ? '#0066CC' : '#666'}
                      />
                      <Text
                        style={[
                          styles.shareTypeText,
                          shareType === 'public' && styles.shareTypeTextActive,
                        ]}
                      >
                        Liên kết công khai
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* User Email (for user share) */}
                {shareType === 'user' && (
                  <View style={styles.formSection}>
                    <Text style={[styles.formLabel, { color: textColor }]}>
                      Email người dùng
                    </Text>
                    <TextInput
                      style={[styles.input, { borderColor, color: textColor }]}
                      placeholder="Nhập email..."
                      placeholderTextColor="#999"
                      value={selectedUser}
                      onChangeText={setSelectedUser}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                )}

                {/* Access Level */}
                <View style={styles.formSection}>
                  <Text style={[styles.formLabel, { color: textColor }]}>
                    Quyền truy cập
                  </Text>
                  <View style={styles.accessLevelContainer}>
                    {Object.values(AccessLevel).map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.accessLevelButton,
                          accessLevel === level && styles.accessLevelButtonActive,
                          { borderColor },
                        ]}
                        onPress={() => setAccessLevel(level)}
                      >
                        <Text
                          style={[
                            styles.accessLevelText,
                            accessLevel === level && styles.accessLevelTextActive,
                          ]}
                        >
                          {accessLevelLabels[level]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Permissions */}
                <View style={styles.formSection}>
                  <Text style={[styles.formLabel, { color: textColor }]}>
                    Quyền hạn
                  </Text>
                  <View style={styles.permissionRow}>
                    <View style={styles.permissionInfo}>
                      <Ionicons name="cloud-download-outline" size={20} color="#666" />
                      <Text style={[styles.permissionLabel, { color: textColor }]}>
                        Tải xuống
                      </Text>
                    </View>
                    <Switch
                      value={canDownload}
                      onValueChange={setCanDownload}
                      trackColor={{ false: '#ccc', true: '#0066CC' }}
                    />
                  </View>
                  <View style={styles.permissionRow}>
                    <View style={styles.permissionInfo}>
                      <Ionicons name="create-outline" size={20} color="#666" />
                      <Text style={[styles.permissionLabel, { color: textColor }]}>
                        Chỉnh sửa
                      </Text>
                    </View>
                    <Switch
                      value={canEdit}
                      onValueChange={setCanEdit}
                      trackColor={{ false: '#ccc', true: '#0066CC' }}
                    />
                  </View>
                  <View style={styles.permissionRow}>
                    <View style={styles.permissionInfo}>
                      <Ionicons name="share-social-outline" size={20} color="#666" />
                      <Text style={[styles.permissionLabel, { color: textColor }]}>
                        Chia sẻ lại
                      </Text>
                    </View>
                    <Switch
                      value={canShare}
                      onValueChange={setCanShare}
                      trackColor={{ false: '#ccc', true: '#0066CC' }}
                    />
                  </View>
                </View>

                {/* Expiry */}
                <View style={styles.formSection}>
                  <View style={styles.expiryHeader}>
                    <Text style={[styles.formLabel, { color: textColor }]}>
                      Ngày hết hạn
                    </Text>
                    <Switch
                      value={hasExpiry}
                      onValueChange={setHasExpiry}
                      trackColor={{ false: '#ccc', true: '#0066CC' }}
                    />
                  </View>
                  {hasExpiry && (
                    <TouchableOpacity
                      style={[styles.dateButton, { borderColor }]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                      <Text style={[styles.dateText, { color: textColor }]}>
                        {expiryDate.toLocaleDateString('vi-VN')}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { borderColor }]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreateShare}
                  disabled={creating}
                >
                  <Text style={styles.createButtonText}>
                    {creating ? 'Đang tạo...' : 'Tạo chia sẻ'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={expiryDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setExpiryDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: 4,
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
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  shareCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  permissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  permissionText: {
    fontSize: 12,
    color: '#666',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#E8F4FF',
    borderRadius: 6,
  },
  expiryText: {
    fontSize: 12,
    color: '#0066CC',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
  },
  copyLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  shareTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  shareTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  shareTypeButtonActive: {
    borderColor: '#0066CC',
    backgroundColor: '#E8F4FF',
  },
  shareTypeText: {
    fontSize: 13,
    color: '#666',
  },
  shareTypeTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  accessLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  accessLevelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  accessLevelButtonActive: {
    borderColor: '#0066CC',
    backgroundColor: '#E8F4FF',
  },
  accessLevelText: {
    fontSize: 13,
    color: '#666',
  },
  accessLevelTextActive: {
    color: '#0066CC',
    fontWeight: '600',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionLabel: {
    fontSize: 14,
  },
  expiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    backgroundColor: '#0066CC',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
