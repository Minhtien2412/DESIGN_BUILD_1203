/**
 * Create Story Screen
 * Allows users to create and share new stories
 * @route /stories/create
 */

import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateStoryScreen() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!image) {
      Alert.alert('Thiếu ảnh', 'Vui lòng chọn hoặc chụp một ảnh');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual story posting API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Thành công', 'Story của bạn đã được đăng!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể đăng story. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Tạo Story</Text>
          <TouchableOpacity 
            style={[styles.postButton, (!image || loading) && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={!image || loading}
          >
            <Text style={[styles.postButtonText, (!image || loading) && styles.postButtonTextDisabled]}>
              {loading ? 'Đang đăng...' : 'Đăng'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Preview */}
          <View style={styles.previewContainer}>
            {image ? (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="close-circle" size={32} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={64} color="#CCC" />
                <Text style={styles.placeholderText}>Chọn ảnh cho Story của bạn</Text>
              </View>
            )}
          </View>

          {/* Image Picker Buttons */}
          <View style={styles.pickerButtons}>
            <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
              <Ionicons name="images-outline" size={24} color="#FFF" />
              <Text style={styles.pickerButtonText}>Thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.pickerButton, styles.cameraButton]} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color="#FFF" />
              <Text style={styles.pickerButtonText}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>

          {/* Caption Input */}
          <View style={styles.captionContainer}>
            <Text style={styles.captionLabel}>Chú thích (không bắt buộc)</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Viết gì đó..."
              placeholderTextColor="#999"
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={150}
            />
            <Text style={styles.charCount}>{caption.length}/150</Text>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
            <View style={styles.userText}>
              <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
              <Text style={styles.userNote}>Story sẽ hiển thị trong 24 giờ</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  postButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  postButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  previewContainer: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imageWrapper: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  pickerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 12,
  },
  cameraButton: {
    backgroundColor: '#0080FF',
  },
  pickerButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  captionContainer: {
    marginBottom: 24,
  },
  captionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  userNote: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});
