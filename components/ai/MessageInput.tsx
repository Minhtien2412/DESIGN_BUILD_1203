/**
 * Message Input Component
 * Input field with send button and image upload
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface MessageInputProps {
  onSend: (message: string, imageUrls?: string[]) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
  onImagePick?: () => Promise<string[] | undefined>;
}

export function MessageInput({
  onSend,
  loading = false,
  placeholder = 'Nhắn tin với AI...',
  onImagePick,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleSend = async () => {
    if (!message.trim() && imageUrls.length === 0) return;

    await onSend(message.trim(), imageUrls.length > 0 ? imageUrls : undefined);
    setMessage('');
    setImageUrls([]);
  };

  const handleImagePick = async () => {
    if (onImagePick) {
      const urls = await onImagePick();
      if (urls) {
        setImageUrls((prev) => [...prev, ...urls]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const canSend = (message.trim().length > 0 || imageUrls.length > 0) && !loading;

  return (
    <View style={styles.container}>
      {/* Image Preview */}
      {imageUrls.length > 0 && (
        <ScrollView
          horizontal
          style={styles.imagePreview}
          showsHorizontalScrollIndicator={false}
        >
          {imageUrls.map((url, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: url }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Input Row */}
      <View style={[styles.inputRow, { backgroundColor: backgroundColor + 'ee' }]}>
        {/* Image Picker Button */}
        {onImagePick && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleImagePick}
            disabled={loading}
          >
            <Ionicons name="image-outline" size={24} color={tintColor} />
          </TouchableOpacity>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            { color: textColor, backgroundColor: backgroundColor },
          ]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          editable={!loading}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? tintColor : '#ccc' },
          ]}
          onPress={handleSend}
          disabled={!canSend}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  imagePreview: {
    maxHeight: 100,
    marginBottom: 8,
  },
  imageWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
