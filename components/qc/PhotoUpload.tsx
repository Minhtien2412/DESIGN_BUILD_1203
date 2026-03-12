import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  quality?: number;
  allowCamera?: boolean;
  allowGallery?: boolean;
}

export default function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  quality = 0.8,
  allowCamera = true,
  allowGallery = true,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleAddPhoto = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Giới hạn ảnh', `Bạn chỉ có thể tải lên tối đa ${maxPhotos} ảnh`, [
        { text: 'OK' },
      ]);
      return;
    }

    const options = [];
    if (allowCamera) options.push({ text: 'Chụp ảnh', onPress: () => openCamera() });
    if (allowGallery) options.push({ text: 'Chọn từ thư viện', onPress: () => openGallery() });
    options.push({ text: 'Hủy', style: 'cancel' });

    Alert.alert('Thêm ảnh', 'Chọn nguồn ảnh', options as any);
  };

  const openCamera = async () => {
    // Placeholder - will be implemented in Task #44
    Alert.alert(
      'Tính năng đang phát triển',
      'Camera upload sẽ được triển khai trong Task #44 - File Upload Integration',
      [{ text: 'OK' }]
    );
  };

  const openGallery = async () => {
    // Placeholder - will be implemented in Task #44
    Alert.alert(
      'Tính năng đang phát triển',
      'Gallery picker sẽ được triển khai trong Task #44 - File Upload Integration',
      [{ text: 'OK' }]
    );
  };

  const handleRemovePhoto = (index: number) => {
    Alert.alert('Xóa ảnh', 'Bạn có chắc chắn muốn xóa ảnh này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const newPhotos = photos.filter((_, i) => i !== index);
          onPhotosChange(newPhotos);
        },
      },
    ]);
  };

  const handleViewPhoto = (index: number) => {
    Alert.alert(
      'Xem ảnh',
      'Tính năng xem ảnh toàn màn hình sẽ được triển khai sau',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ảnh minh chứng</Text>
        <Text style={styles.count}>
          {photos.length} / {maxPhotos}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoItem}>
            <TouchableOpacity onPress={() => handleViewPhoto(index)}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemovePhoto(index)}
            >
              <Ionicons name="close-circle" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <View style={styles.photoIndex}>
              <Text style={styles.photoIndexText}>{index + 1}</Text>
            </View>
          </View>
        ))}

        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#999" />
            ) : (
              <>
                <Ionicons name="add" size={32} color="#999" />
                <Text style={styles.addButtonText}>Thêm ảnh</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {photos.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="images-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có ảnh nào</Text>
          <Text style={styles.emptySubtext}>Nhấn &quot;Thêm ảnh&quot; để tải lên</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  count: {
    fontSize: 13,
    color: '#999',
  },
  scrollContent: {
    gap: 12,
  },
  photoItem: {
    position: 'relative',
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoIndex: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoIndexText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  addButtonText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 4,
  },
});
