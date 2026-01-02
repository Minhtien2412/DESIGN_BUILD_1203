/**
 * Project Photo Gallery
 * Upload, view, and manage construction progress photos
 */

import { Container } from '@/components/ui/container';
import { Loader } from '@/components/ui/loader';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 48) / 3; // 3 columns with 16px padding

interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Mock data
const MOCK_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://picsum.photos/800/600?random=1',
    thumbnail: 'https://picsum.photos/200/200?random=1',
    caption: 'Đào móng ngày 1',
    uploadedAt: '2025-01-05T09:00:00Z',
    uploadedBy: 'Nguyễn Văn A',
  },
  {
    id: '2',
    url: 'https://picsum.photos/800/600?random=2',
    thumbnail: 'https://picsum.photos/200/200?random=2',
    caption: 'Đổ bê tông móng',
    uploadedAt: '2025-01-08T14:30:00Z',
    uploadedBy: 'Trần Thị B',
  },
  {
    id: '3',
    url: 'https://picsum.photos/800/600?random=3',
    thumbnail: 'https://picsum.photos/200/200?random=3',
    caption: 'Dựng cốt thép',
    uploadedAt: '2025-01-10T11:15:00Z',
    uploadedBy: 'Lê Văn C',
  },
  {
    id: '4',
    url: 'https://picsum.photos/800/600?random=4',
    thumbnail: 'https://picsum.photos/200/200?random=4',
    uploadedAt: '2025-01-12T16:45:00Z',
    uploadedBy: 'Phạm Văn D',
  },
  {
    id: '5',
    url: 'https://picsum.photos/800/600?random=5',
    thumbnail: 'https://picsum.photos/200/200?random=5',
    caption: 'Tường tầng 1 hoàn thành',
    uploadedAt: '2025-01-15T10:00:00Z',
    uploadedBy: 'Nguyễn Văn A',
  },
  {
    id: '6',
    url: 'https://picsum.photos/800/600?random=6',
    thumbnail: 'https://picsum.photos/200/200?random=6',
    uploadedAt: '2025-01-17T13:20:00Z',
    uploadedBy: 'Hoàng Thị E',
  },
];

export default function ProjectGalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');

  const [photos, setPhotos] = useState<Photo[]>(MOCK_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUploadPhoto = async () => {
    // TODO: Integrate with ImagePicker
    Alert.alert(
      'Upload ảnh',
      'Chọn nguồn ảnh',
      [
        {
          text: 'Chụp ảnh',
          onPress: () => Alert.alert('Camera', 'Tính năng camera đang phát triển'),
        },
        {
          text: 'Chọn từ thư viện',
          onPress: () => Alert.alert('Thư viện', 'Tính năng chọn ảnh đang phát triển'),
        },
        { text: 'Huỷ', style: 'cancel' },
      ]
    );
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(
      'Xoá ảnh',
      'Bạn có chắc muốn xoá ảnh này?',
      [
        {
          text: 'Huỷ',
          style: 'cancel',
        },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => {
            setPhotos((prev) => prev.filter((p) => p.id !== photoId));
            Alert.alert('Thành công', 'Đã xoá ảnh');
          },
        },
      ]
    );
  };

  const renderPhoto = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => setSelectedPhoto(item)}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      {item.caption && (
        <View style={[styles.captionBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <Text style={styles.captionText} numberOfLines={1}>
            {item.caption}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return <Loader text="Đang tải ảnh..." />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Thư viện ảnh',
          headerRight: () => (
            <TouchableOpacity onPress={handleUploadPhoto} style={{ marginRight: 16 }}>
              <Ionicons name="cloud-upload-outline" size={24} color={primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Container fullWidth>
        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: surface, borderBottomColor: border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: primary }]}>{photos.length}</Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>Ảnh</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: primary }]}>
              {new Set(photos.map((p) => p.uploadedBy)).size}
            </Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>Người đóng góp</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: primary }]}>
              {Math.ceil((photos.length * 2.5))} MB
            </Text>
            <Text style={[styles.statLabel, { color: textMuted }]}>Dung lượng</Text>
          </View>
        </View>

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={64} color={textMuted} />
            <Text style={[styles.emptyText, { color: textMuted }]}>
              Chưa có ảnh nào
            </Text>
            <TouchableOpacity
              onPress={handleUploadPhoto}
              style={[styles.uploadButton, { backgroundColor: primary }]}
            >
              <Text style={styles.uploadButtonText}>Upload ảnh đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Lightbox Modal */}
        {selectedPhoto && (
          <Modal
            visible={!!selectedPhoto}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedPhoto(null)}
          >
            <Pressable style={styles.lightbox} onPress={() => setSelectedPhoto(null)}>
              <View style={styles.lightboxHeader}>
                <TouchableOpacity
                  onPress={() => setSelectedPhoto(null)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePhoto(selectedPhoto.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Image
                source={{ uri: selectedPhoto.url }}
                style={styles.lightboxImage}
                resizeMode="contain"
              />

              {selectedPhoto.caption && (
                <View style={styles.lightboxCaption}>
                  <Text style={styles.lightboxCaptionText}>{selectedPhoto.caption}</Text>
                </View>
              )}

              <View style={styles.lightboxFooter}>
                <View style={styles.lightboxInfo}>
                  <Ionicons name="person-outline" size={16} color="#fff" />
                  <Text style={styles.lightboxInfoText}>{selectedPhoto.uploadedBy}</Text>
                </View>
                <View style={styles.lightboxInfo}>
                  <Ionicons name="calendar-outline" size={16} color="#fff" />
                  <Text style={styles.lightboxInfoText}>
                    {new Date(selectedPhoto.uploadedAt).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              </View>
            </Pressable>
          </Modal>
        )}
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  grid: {
    padding: 8,
  },
  photoContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  captionBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
  },
  captionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  uploadButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  lightbox: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  lightboxHeader: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  closeButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  lightboxImage: {
    width: '100%',
    height: '70%',
  },
  lightboxCaption: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  lightboxCaptionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  lightboxFooter: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  lightboxInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lightboxInfoText: {
    color: '#fff',
    fontSize: 14,
  },
});
