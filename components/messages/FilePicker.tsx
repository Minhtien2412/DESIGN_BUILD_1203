/**
 * File Attachment Picker Component
 * Allows selecting and uploading various file types
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

interface FileAttachment {
  uri: string;
  name: string;
  type: string;
  size: number;
  mimeType?: string;
}

interface FilePickerProps {
  onFilePicked: (file: FileAttachment) => void;
  onCancel: () => void;
  maxSize?: number; // in MB, default 10MB
}

export function FilePicker({ onFilePicked, onCancel, maxSize = 10 }: FilePickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const primary = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  const maxSizeBytes = maxSize * 1024 * 1024;

  /**
   * Pick image from gallery
   */
  const pickImage = async () => {
    try {
      setIsLoading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh');
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size (estimate)
        if (asset.fileSize && asset.fileSize > maxSizeBytes) {
          Alert.alert('Lỗi', `Kích thước file vượt quá ${maxSize}MB`);
          setIsLoading(false);
          return;
        }

        const file: FileAttachment = {
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: 'image',
          size: asset.fileSize || 0,
          mimeType: asset.type || 'image/jpeg',
        };

        onFilePicked(file);
      }

      setIsLoading(false);

    } catch (error) {
      console.error('[FilePicker] Image pick error:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
      setIsLoading(false);
    }
  };

  /**
   * Take photo with camera
   */
  const takePhoto = async () => {
    try {
      setIsLoading(true);

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera');
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        const file: FileAttachment = {
          uri: asset.uri,
          name: `photo_${Date.now()}.jpg`,
          type: 'image',
          size: asset.fileSize || 0,
          mimeType: 'image/jpeg',
        };

        onFilePicked(file);
      }

      setIsLoading(false);

    } catch (error) {
      console.error('[FilePicker] Camera error:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
      setIsLoading(false);
    }
  };

  /**
   * Pick document
   */
  const pickDocument = async () => {
    try {
      setIsLoading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size
        if (asset.size && asset.size > maxSizeBytes) {
          Alert.alert('Lỗi', `Kích thước file vượt quá ${maxSize}MB`);
          setIsLoading(false);
          return;
        }

        const file: FileAttachment = {
          uri: asset.uri,
          name: asset.name,
          type: 'file',
          size: asset.size || 0,
          mimeType: asset.mimeType,
        };

        onFilePicked(file);
      }

      setIsLoading(false);

    } catch (error) {
      console.error('[FilePicker] Document pick error:', error);
      Alert.alert('Lỗi', 'Không thể chọn file');
      setIsLoading(false);
    }
  };

  /**
   * Pick video
   */
  const pickVideo = async () => {
    try {
      setIsLoading(true);

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện');
        setIsLoading(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size
        if (asset.fileSize && asset.fileSize > maxSizeBytes) {
          Alert.alert('Lỗi', `Kích thước file vượt quá ${maxSize}MB`);
          setIsLoading(false);
          return;
        }

        const file: FileAttachment = {
          uri: asset.uri,
          name: asset.fileName || `video_${Date.now()}.mp4`,
          type: 'video',
          size: asset.fileSize || 0,
          mimeType: 'video/mp4',
        };

        onFilePicked(file);
      }

      setIsLoading(false);

    } catch (error) {
      console.error('[FilePicker] Video pick error:', error);
      Alert.alert('Lỗi', 'Không thể chọn video');
      setIsLoading(false);
    }
  };

  const options = [
    {
      id: 'image',
      label: 'Thư viện ảnh',
      icon: 'image-outline' as const,
      color: '#3b82f6',
      onPress: pickImage,
    },
    {
      id: 'camera',
      label: 'Chụp ảnh',
      icon: 'camera-outline' as const,
      color: '#0066CC',
      onPress: takePhoto,
    },
    {
      id: 'video',
      label: 'Video',
      icon: 'videocam-outline' as const,
      color: '#0066CC',
      onPress: pickVideo,
    },
    {
      id: 'document',
      label: 'File tài liệu',
      icon: 'document-outline' as const,
      color: '#666666',
      onPress: pickDocument,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Chọn file đính kèm
        </Text>
        <Pressable onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={textColor} />
        </Pressable>
      </View>

      <View style={styles.options}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            onPress={option.onPress}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.option,
              { borderColor },
              pressed && styles.optionPressed,
            ]}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: option.color + '20' },
              ]}
            >
              <Ionicons
                name={option.icon}
                size={32}
                color={option.color}
              />
            </View>
            <Text style={[styles.optionLabel, { color: textColor }]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.hint, { color: textColor + '80' }]}>
        Dung lượng tối đa: {maxSize}MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  option: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  optionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
