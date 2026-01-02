/**
 * Photo Grid Component
 * Hiển thị grid ảnh cho diary entries, QC reports
 */

import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface Photo {
  id: string;
  uri: string;
  caption?: string;
}

interface PhotoGridProps {
  photos: Photo[];
  onPhotoPress?: (photo: Photo, index: number) => void;
  onAddPress?: () => void;
  maxPhotos?: number;
  columns?: number;
  style?: ViewStyle;
}

export default function PhotoGrid({
  photos,
  onPhotoPress,
  onAddPress,
  maxPhotos = 10,
  columns = 3,
  style,
}: PhotoGridProps) {
  const canAddMore = photos.length < maxPhotos && onAddPress;
  const displayPhotos = photos.slice(0, maxPhotos);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.grid}>
        {displayPhotos.map((photo, index) => (
          <TouchableOpacity
            key={photo.id}
            style={[styles.photoWrapper, { width: `${100 / columns - 2}%` }]}
            onPress={() => onPhotoPress?.(photo, index)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: photo.uri }} style={styles.photo} />
            {photo.caption && (
              <View style={styles.captionOverlay}>
                <Text style={styles.caption} numberOfLines={2}>
                  {photo.caption}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {canAddMore && (
          <TouchableOpacity
            style={[styles.photoWrapper, styles.addButton, { width: `${100 / columns - 2}%` }]}
            onPress={onAddPress}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={32} color="#3b82f6" />
            <Text style={styles.addText}>Thêm ảnh</Text>
          </TouchableOpacity>
        )}
      </View>

      {photos.length > maxPhotos && (
        <Text style={styles.moreText}>+{photos.length - maxPhotos} ảnh khác</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  photoWrapper: {
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
  },
  caption: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
