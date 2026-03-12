import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export interface AttachmentFile {
  uri: string;
  name: string;
  type: 'image' | 'video' | 'document';
  size: number;
  mimeType?: string;
}

interface AttachmentPickerProps {
  onSelect: (attachments: AttachmentFile[]) => void;
  onCancel?: () => void;
  maxFiles?: number;
}

export function AttachmentPicker({
  onSelect,
  onCancel,
  maxFiles = 5,
}: AttachmentPickerProps) {
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const background = useThemeColor({}, 'background');

  const [modalVisible, setModalVisible] = useState(false);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập',
          'Cần cấp quyền truy cập thư viện ảnh để chọn ảnh/video'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxFiles,
      });

      if (!result.canceled && result.assets.length > 0) {
        const attachments: AttachmentFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type === 'video' ? 'video' : 'image',
          size: asset.fileSize || 0,
          mimeType: asset.mimeType,
        }));

        onSelect(attachments);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh/video');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        if (result.assets.length > maxFiles) {
          Alert.alert(
            'Giới hạn',
            `Chỉ có thể chọn tối đa ${maxFiles} tệp tin`
          );
          return;
        }

        const attachments: AttachmentFile[] = result.assets.map((asset: any) => ({
          uri: asset.uri,
          name: asset.name,
          type: 'document',
          size: asset.size || 0,
          mimeType: asset.mimeType,
        }));

        onSelect(attachments);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Pick document error:', error);
      Alert.alert('Lỗi', 'Không thể chọn tài liệu');
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần cấp quyền sử dụng camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        const attachment: AttachmentFile = {
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: 'image',
          size: asset.fileSize || 0,
          mimeType: asset.mimeType,
        };

        onSelect([attachment]);
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Take photo error:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle-outline" size={24} color={primary} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          onCancel?.();
        }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setModalVisible(false);
            onCancel?.();
          }}
        >
          <View
            style={[
              styles.menuContainer,
              { backgroundColor: surface, borderColor: border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: text }]}>
                Đính kèm tệp tin
              </Text>
              <Pressable
                onPress={() => {
                  setModalVisible(false);
                  onCancel?.();
                }}
              >
                <Ionicons name="close" size={24} color={textMuted} />
              </Pressable>
            </View>

            <View style={styles.menuItems}>
              <Pressable
                style={[styles.menuItem, { borderBottomColor: border }]}
                onPress={takePhoto}
              >
                <View style={[styles.iconContainer, { backgroundColor: primary + '15' }]}>
                  <Ionicons name="camera" size={24} color={primary} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: text }]}>
                    Chụp ảnh
                  </Text>
                  <Text style={[styles.menuItemDesc, { color: textMuted }]}>
                    Sử dụng camera để chụp ảnh mới
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textMuted} />
              </Pressable>

              <Pressable
                style={[styles.menuItem, { borderBottomColor: border }]}
                onPress={pickImage}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#0D9488' + '15' }]}>
                  <Ionicons name="image" size={24} color="#0D9488" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: text }]}>
                    Ảnh/Video
                  </Text>
                  <Text style={[styles.menuItemDesc, { color: textMuted }]}>
                    Chọn từ thư viện ảnh (tối đa {maxFiles} tệp)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textMuted} />
              </Pressable>

              <Pressable
                style={[styles.menuItem]}
                onPress={pickDocument}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#0D9488' + '15' }]}>
                  <Ionicons name="document-text" size={24} color="#0D9488" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, { color: text }]}>
                    Tài liệu
                  </Text>
                  <Text style={[styles.menuItemDesc, { color: textMuted }]}>
                    PDF, Word, Excel, v.v. (tối đa {maxFiles} tệp)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textMuted} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

interface AttachmentPreviewProps {
  attachments: AttachmentFile[];
  onRemove: (index: number) => void;
}

export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');

  if (attachments.length === 0) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: AttachmentFile['type']): string => {
    switch (type) {
      case 'image':
        return 'image';
      case 'video':
        return 'videocam';
      case 'document':
        return 'document-text';
      default:
        return 'document';
    }
  };

  return (
    <ScrollView
      horizontal
      style={styles.previewContainer}
      contentContainerStyle={styles.previewContent}
      showsHorizontalScrollIndicator={false}
    >
      {attachments.map((attachment, index) => (
        <View
          key={index}
          style={[
            styles.previewItem,
            { backgroundColor: surface, borderColor: border },
          ]}
        >
          {attachment.type === 'image' ? (
            <Image
              source={{ uri: attachment.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.previewIconContainer}>
              <Ionicons
                name={getFileIcon(attachment.type) as any}
                size={32}
                color={textMuted}
              />
            </View>
          )}

          <View style={styles.previewInfo}>
            <Text
              style={[styles.previewName, { color: text }]}
              numberOfLines={1}
            >
              {attachment.name}
            </Text>
            <Text style={[styles.previewSize, { color: textMuted }]}>
              {formatFileSize(attachment.size)}
            </Text>
          </View>

          <Pressable
            style={styles.removeButton}
            onPress={() => onRemove(index)}
          >
            <Ionicons name="close-circle" size={20} color="#000000" />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  menuItems: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 13,
  },
  previewContainer: {
    maxHeight: 120,
    marginBottom: 8,
  },
  previewContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  previewItem: {
    width: 200,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 80,
  },
  previewIconContainer: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  previewInfo: {
    padding: 8,
  },
  previewName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  previewSize: {
    fontSize: 11,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
});
