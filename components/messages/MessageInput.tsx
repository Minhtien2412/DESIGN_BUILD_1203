/**
 * MessageInput Component
 * Advanced input bar with emoji, media, and voice recording
 */

import {
    pickAndUploadImage,
    pickAndUploadVideo,
    takePhotoAndUpload,
    UploadedMedia
} from '@/services/media-upload';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onMediaSend?: (media: UploadedMedia) => void;
  onVoiceRecord?: () => void;
  sending?: boolean;
  disabled?: boolean;
}

export default function MessageInput({
  value,
  onChangeText,
  onSend,
  onMediaSend,
  onVoiceRecord,
  sending = false,
  disabled = false,
}: MessageInputProps) {
  const [uploading, setUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      setUploading(true);
      const media = await pickAndUploadImage();
      
      if (media) {
        onMediaSend?.(media);
      }
    } catch (error) {
      console.error('Error picking and uploading image:', error);
      Alert.alert('Lỗi', 'Không thể tải lên hình ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handlePickVideo = async () => {
    try {
      setUploading(true);
      const media = await pickAndUploadVideo();
      
      if (media) {
        onMediaSend?.(media);
      }
    } catch (error) {
      console.error('Error picking and uploading video:', error);
      Alert.alert('Lỗi', 'Không thể tải lên video. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      setUploading(true);
      const media = await takePhotoAndUpload();
      
      if (media) {
        onMediaSend?.(media);
      }
    } catch (error) {
      console.error('Error taking and uploading photo:', error);
      Alert.alert('Lỗi', 'Không thể tải lên ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const showAttachOptions = () => {
    Alert.alert(
      'Đính kèm',
      'Chọn loại file bạn muốn gửi',
      [
        { text: 'Chụp ảnh', onPress: handleTakePhoto },
        { text: 'Chọn ảnh', onPress: handlePickImage },
        { text: 'Chọn video', onPress: handlePickVideo },
        { text: 'Hủy', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.inputBar}>
      {/* Emoji button */}
      <TouchableOpacity 
        style={styles.inputButton}
        onPress={() => {
          Alert.alert('Chức năng đang phát triển', 'Emoji picker sẽ được cập nhật sớm!');
        }}
        disabled={disabled}
      >
        <Ionicons name="happy-outline" size={24} color={disabled ? '#ccc' : '#999'} />
      </TouchableOpacity>

      {/* Text input */}
      <TextInput
        style={styles.input}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        multiline
        maxLength={2000}
        editable={!disabled}
      />

      {/* Media attach button */}
      <TouchableOpacity 
        style={styles.inputButton}
        onPress={showAttachOptions}
        disabled={disabled}
      >
        <Ionicons name="image-outline" size={24} color={disabled ? '#ccc' : '#999'} />
      </TouchableOpacity>

      {/* Send or voice button */}
      {value.trim() ? (
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (disabled || sending || uploading) && styles.sendButtonDisabled
          ]}
          onPress={onSend}
          disabled={disabled || sending || uploading}
        >
          {sending || uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.inputButton}
          onPress={() => {
            if (onVoiceRecord) {
              onVoiceRecord();
            } else {
              Alert.alert('Chức năng đang phát triển', 'Ghi âm tin nhắn sẽ được cập nhật sớm!');
            }
          }}
          disabled={disabled}
        >
          <Ionicons name="mic-outline" size={24} color={disabled ? '#ccc' : '#0D9488'} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  inputButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#111',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
